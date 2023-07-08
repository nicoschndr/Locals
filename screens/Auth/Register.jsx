import {
	View,
	Text,
	KeyboardAvoidingView,
	StyleSheet,
	Image,
	TouchableOpacity,
	Platform,
	ImageBackground,
	ActivityIndicator,
	ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import LocalsTextInput from "../../components/LocalsTextInput";
import LocalsImagePicker from "../../components/LocalsImagePicker";
import LocalsButton from "../../components/LocalsButton";
import LocalsPlacesAutocomplete from "../../components/LocalsPlacesAutocomplete";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import DatePicker from "@react-native-community/datetimepicker";

import { auth, firestore, storage } from "../../firebase";
import { CheckBox, Divider } from "react-native-elements";

import { Ionicons } from "@expo/vector-icons";
import { set } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";

const Register = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [imageUri, setImageUri] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [password, setPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [birthday, setBirthday] = useState(new Date());

	const [mobile, setMobile] = useState("");
	const [address, setAddress] = useState("");
	const [username, setUsername] = useState("");
	const [uploading, setUploading] = useState(false);
	const [transferred, setTransferred] = useState(0);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const [showPassword, setShowPassword] = useState(false);

	// upload image to firebase storage and return the image url
	const uploadImage = async (uri) => {
		setUploading(true);
		const response = await fetch(uri);
		const blob = await response.blob();

		let filename = new Date().getTime().toString();
		var ref = storage.ref().child("Images/user/" + filename);
		const snapshot = await ref.put(blob);

		// Get the download URL after upload completes
		const url = await snapshot.ref.getDownloadURL();
		return url;
	};

	const checkUsernameAvailability = async () => {
		const snapshot = await firestore
			.collection("users")
			.where("username", "==", username)
			.get();

		if (snapshot.empty) {
			// Der Benutzername ist verfügbar
			return true;
		} else {
			// Der Benutzername ist bereits vergeben
			return false;
		}
	};

	const requestLocationPermission = async () => {
		if (Platform.OS === "android") {
			try {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
				);
				if (granted === PermissionsAndroid.RESULTS.GRANTED) {
					await getCurrentLocation();
				} else {
					console.log("Location permission denied");
				}
			} catch (error) {
				console.log(error);
			}
		} else {
			await getCurrentLocation();
		}
	};

	const getCurrentLocation = async () => {
		try {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				alert("Permission to access location was denied");
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			const { latitude, longitude } = location.coords;
			// setLatitude(latitude);
			// setLongitude(longitude);
			// setAddress(`${latitude}, ${longitude}`);
		} catch (error) {
			console.log(error);
		}
	};

	const register = async () => {
		try {
			const isUsernameAvailable = await checkUsernameAvailability();
			const imageUrl = await uploadImage(imageUri);

			if (!isUsernameAvailable) {
				alert(
					"Der Benutzername ist bereits vergeben. Bitte wählen Sie einen anderen."
				);
				return;
			}

			await auth.createUserWithEmailAndPassword(email, password);

			await firestore.collection("users").doc(auth.currentUser?.uid).set({
				email: email,
				firstName: firstName,
				lastName: lastName,
				birthday: birthday,
				mobile: mobile,
				address: address,
				imageUrl: imageUrl,
				username: username, // Fügen Sie den Benutzernamen zur Dokumentdaten hinzu
				friends: {},
				friendRequests: {},
				follower: [],
				following: [],
				blockedUsers: [],
				reportedBy: {},
				followerWhenClicked: 0,
			});
			alert("Konto erfolgreich erstellt");
			navigation.navigate("Home");
		} catch (error) {
			console.log(error);
			alert(error);
		} finally {
			setUploading(false);
		}
	};

	const handleDateChange = (birthday) => {
		setBirthday(birthday);
	};

	useEffect(() => {
		requestLocationPermission();
	}, []);

	const openDatePicker = () => {
		setShowDatePicker(true);
	};

	const closeDatePicker = () => {
		setShowDatePicker(false);
	};

	const onDateSelected = (birthdate) => {
		setBirthday(birthdate);
		closeDatePicker();
	};

	const renderDatePicker = () => {
		if (showDatePicker) {
			return (
				<View>
					<DateTimePicker
						value={birthday}
						locale="de-DE"
						mode="date"
						onChange={(event, date) => onDateSelected(date)}
					/>
				</View>
			);
		}
		return null;
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "position" : ""}
		>
			<ScrollView>
				<ImageBackground
					source={require("../../assets/BackGround(h).png")}
					style={{ alignItems: "center", flex: 1, width: "100%" }}
				>
					<TouchableOpacity
						style={styles.back}
						onPress={() => navigation.goBack()}
					>
						<Ionicons name="chevron-back" size={24} color="white" />
					</TouchableOpacity>
					<View style={styles.inputContainer}>
						<LocalsImagePicker
							onImageTaken={(uri) => setImageUri(uri)}
							style={styles.image}
						/>

						<View style={{ marginTop: 12 }}>
							<Text style={styles.inputTitle}>E-Mail</Text>
							<LocalsTextInput
								autoCapitalize="none"
								autoFocus
								inputMode="email"
								value={email}
								onChangeText={(email) => setEmail(email)}
								style={styles.input}
							/>
							<Divider style={styles.divider} />
						</View>
						<View style={{ marginTop: 12 }}>
							<Text style={styles.inputTitle}>Passwort</Text>

							<LocalsTextInput
								secureTextEntry={!showPassword}
								value={password}
								onChangeText={(password) => setPassword(password)}
								style={styles.input}
							/>
						</View>
						<Divider style={styles.divider} />
						<CheckBox
							title="Passwort anzeigen"
							checked={showPassword}
							onPress={() => setShowPassword(!showPassword)}
							containerStyle={{
								backgroundColor: "transparent",
								borderWidth: 0,
								marginLeft: 0,
								padding: 0,
								marginBottom: 12,
							}}
							textStyle={{
								color: "#fff",
								fontSize: 10,
								fontWeight: "normal",
								marginLeft: 4,
							}}
							checkedColor="#ec404b"
							size={20}
						/>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginTop: 12,
							}}
						>
							<View style={{ width: "48%" }}>
								<Text style={styles.inputTitle}>Vorname</Text>
								<LocalsTextInput
									autoCapitalize
									value={firstName}
									onChangeText={(firstName) => setFirstName(firstName)}
									style={styles.input}
								/>
								<Divider style={styles.divider} />
							</View>
							<View style={{ width: "48%" }}>
								<Text style={styles.inputTitle}>Nachname</Text>
								<LocalsTextInput
									value={lastName}
									autoCapitalize
									onChangeText={(lastName) => setLastName(lastName)}
									style={styles.input}
								/>
								<Divider style={styles.divider} />
							</View>
						</View>
						<View style={{ marginTop: 12 }}>
							<Text style={styles.inputTitle}>Addresse</Text>
							<View style={{ flexDirection: "row", alignItems: "center" }}>
								<GooglePlacesAutocomplete
									fetchDetails={true}
									currentLocation={true}
									currentLocationLabel="Current location"
									listViewDisplayed={false}
									onPress={(data, details = null) => {
										setAddress(details.formatted_address);
										setLongitude(details.geometry.location.lng);
										setLatitude(details.geometry.location.lat);
									}}
									// limit number of results

									query={{
										key: "AIzaSyAyviffxI6ZlWwof4_vA6S1LjmLrYkjxMI",
										language: "de",
										components: "country:de",
									}}
									styles={{
										textInput: styles.addressInput,
										listView: {
											width: "100%",
										},
										container: {
											width: "100%", // Set the width of the container
										},
									}}
									// input fontcolor white
								/>
							</View>
							<Divider style={styles.divider} />
						</View>
						<View style={{ marginTop: 12 }}>
							<Text style={styles.inputTitle}>Alter</Text>
							<View
								style={{
									flexDirection: "row",
									marginTop: 12,
									alignItems: "center",
								}}
							>
								<Ionicons
									name={"calendar-outline"}
									size={30}
									onPress={openDatePicker}
								/>

								<View>{renderDatePicker()}</View>
							</View>

							<Divider style={styles.divider} />
						</View>
						{/* <View style={{ marginTop: 12 }}>
						<Text style={styles.inputTitle}>Mobil-Nr.</Text>
						<LocalsTextInput
							inputMode="numeric"
							value={mobile}
							onChangeText={(mobile) => setMobile(mobile)}
							style={styles.input}
						/>
						<Divider style={styles.divider} />
					</View> */}
						<View style={{ marginTop: 12 }}>
							<Text style={styles.inputTitle}>Username</Text>
							<LocalsTextInput
								autoCapitalize="none"
								value={username}
								onChangeText={(username) => setUsername(username)}
								style={styles.input}
							/>
							<Divider style={styles.divider} />
						</View>
						{!uploading && (
							<LocalsButton
								title="Registrieren"
								onPress={register}
								style={styles.loginBtn}
							/>
						)}
						{uploading && <ActivityIndicator size="large" color="#fff" />}
					</View>
				</ImageBackground>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default Register;

const styles = StyleSheet.create({
	container: { height: "100%", width: "100%" },
	image: {
		width: "100%",
		marginBottom: 20,
	},
	addressInput: {
		backgroundColor: "transparent",
		color: "white",
	},
	inputContainer: {
		width: "80%",
		marginTop: 48,
	},
	name: {
		marginTop: 10,
		width: "48%",
		borderBottomColor: "white",
		borderBottomWidth: StyleSheet.hairlineWidth,
		height: 40,
		fontSize: 15,
		color: "white",
		backgroundColor: "transparent",
	},
	loginBtn: {
		marginTop: 40,
	},
	password: {
		marginTop: 10,
		backgroundColor: "transparent",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
		backgroundColor: "transparent",
	},
	username: {
		marginTop: 10,
		color: "#fff",
		backgroundColor: "transparent",
	},
	google: {
		justifyContent: "center",
		alignItems: "center",
		marginTop: 20,
	},
	email: {
		backgroundColor: "transparent",
	},
	form: {
		marginBottom: 24,
		marginHorizontal: 30,
	},
	input: {
		height: 48,
		fontSize: 12,
		color: "white",
		backgroundColor: "transparent",
		borderWidth: 0,
	},
	inputTitle: {
		color: "white",
		fontSize: 10,
		textTransform: "uppercase",
	},
	divider: {
		backgroundColor: "#fff",
		height: StyleSheet.hairlineWidth,
	},
	back: {
		position: "absolute",
		top: 68,
		left: 32,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(21, 22, 48, 0.1)",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 999,
	},
	datePicker: {
		width: "100%",
		marginTop: 10,
		borderWidth: 0,
	},
	datePickerPlaceholder: {
		color: "#C8C8C8",
	},
	datePickerText: {
		color: "white",
	},
});
