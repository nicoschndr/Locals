import React, { useEffect, useState } from "react";
import {
	View,
	Alert,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Dimensions,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { CheckBox } from "react-native-elements";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { auth, firestore, storage } from "../../firebase";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import LocalsImagePicker from "../../components/LocalsImagePicker";
import DropDownPicker from "react-native-dropdown-picker";
import { set } from "react-native-reanimated";

const PostEvent = ({ navigation }) => {
	const windowWidth = Dimensions.get("window").width;
	const windowHeight = Dimensions.get("window").height;
	const [datePicker, setDatePicker] = useState(false);
	const [date, setDate] = useState(new Date());
	const [imageUri, setImageUri] = useState("");
	const [uploading, setUploading] = useState(false);
	const [transferred, setTransferred] = useState(0);
	const [title, setTitle] = useState("");
	const [address, setAddress] = useState("");
	const [groupSize, setGroupSize] = useState("");
	const [description, setDescription] = useState("");
	const [gender, setGender] = useState("");
	const [latitude, setLatitude] = useState(0);
	const [longitude, setLongitude] = useState(0);
	const [showMap, setShowMap] = useState(false);
	const [advertised, setAdvertised] = useState(false);
	const [open, setOpen] = useState(false);
	const [category, setCategory] = useState([""]);

	const [items, setItems] = useState([
		{ label: "Sport", value: "sport" },
		{ label: "Culture", value: "culture" },
		{ label: "Concert", value: "concert" },
		{ label: "Test", value: "test" },
		{ label: "Party", value: "party" },
	]);

	useEffect(() => {
		requestLocationPermission();
	}, []);

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

	const openMap = () => {
		setShowMap(true);
	};

	const closeMap = () => {
		setShowMap(false);
	};

	const uploadImage = async (uri) => {
		setUploading(true);
		const response = await fetch(uri);
		const blob = await response.blob();

		let filename = new Date().getTime().toString();
		var ref = storage.ref().child("Images/events/" + filename);
		const snapshot = await ref.put(blob);

		// Get the download URL after upload completes
		const url = await snapshot.ref.getDownloadURL();
		return url;
	};

	const checkInputs = () => {
		if (
			title === "" ||
			address === "" ||
			imageUri === "" ||
			groupSize === "" ||
			category === ""
		) {
			Alert.alert("Input Check", "Please fill in all mandatory fields", [
				{
					text: "Cancel",
				},
			]);
			return false;
		}
	};
	const uploadPost = async () => {
		const imageUrl = await uploadImage(imageUri);

		// Get the current user's document
		const userDoc = await firestore
			.collection("users")
			.doc(auth.currentUser.uid)
			.get();
		const username = userDoc.data().username;

		firestore
			.collection("events")
			.add({
				creator: username,
				title: title,
				description: description,
				address: address,
				groupSize: groupSize,
				latitude: latitude,
				longitude: longitude,
				imageUrl: imageUrl,
				advertised: advertised,
				category: category,
				date: date,
				userId: auth.currentUser.uid,
			})
			.then(() => {
				alert("Post created successfully");
				setTimeout(() => {
					navigation.navigate("Profile");
				}, 1000);
			})
			.catch((error) => {
				console.log(error);
			});
	};
	function showDatePicker() {
		setDatePicker(true);
	}

	function onDateSelected(event, value) {
		setDate(value);
		setDatePicker(false);
	}

	async function getLocation() {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			alert("Permission to access location was denied");
			return;
		}

		let location = await Location.getCurrentPositionAsync({});
		setLocation(location);
	}

	return (
		<KeyboardAvoidingView style={styles.container} behavior="padding">
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="always"
			>
				<TouchableOpacity
					style={[styles.titleBar, { marginTop: windowHeight * 0.05 }]}
					onPress={() => navigation.goBack()}
				>
					<Ionicons
						style={{ marginRight: windowWidth - 90 }}
						name={"arrow-back-circle-outline"}
						size={40}
					/>
				</TouchableOpacity>

				<View style={{ alignSelf: "center", marginBottom: 50 }}>
					<View style={styles.postImage}>
						<LocalsImagePicker
							onImageTaken={(uri) => setImageUri(uri)}
							style={styles.image}
						/>
					</View>
				</View>

				<View style={[styles.inputContainer, { marginTop: 70 }]}>
					<Text>Title</Text>
					<TextInput
						style={styles.inputText}
						value={title}
						onChangeText={(title) => setTitle(title)}
						// is mendatory
					/>
				</View>

				<View style={styles.inputContainer}>
					<Text>
						Address
						{/* <Text style={{ fontWeight: "bold" }}> or Set Marker*</Text> */}
					</Text>
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
							query={{
								key: "AIzaSyAyviffxI6ZlWwof4_vA6S1LjmLrYkjxMI",
								language: "de",
								components: "country:de",
							}}
							styles={{
								textInput: styles.addressInput,
								listView: {
									width: "90%", // Set the width of the suggestions list
								},
								container: {
									width: "100%", // Set the width of the container
								},
							}}
						/>
						{/* <Ionicons
							name={"locate-outline"}
							size={30}
							onPress={getCurrentLocation}
							style={{ marginLeft: 10 }}
						/> */}
					</View>
				</View>

				{/* 				<View>
					{showMap ? (
						<View style={{ flex: 1 }}>
							<MapView
								style={styles.map}
								initialRegion={{
									latitude: latitude,
									longitude: longitude,
									latitudeDelta: 0.0922,
									longitudeDelta: 0.0421,
								}}
							>
								<Marker
									coordinate={{
										latitude: latitude,
										longitude: longitude,
									}}
									draggable
									onDragEnd={(e) => {
										const { latitude, longitude } = e.nativeEvent.coordinate;
										setLatitude(latitude);
										setLongitude(longitude);
										setAddress(`${latitude}, ${longitude}`);
									}}
								/>
							</MapView>

							<TouchableOpacity style={styles.button} onPress={closeMap}>
								<Text style={{ color: "#FFFFFF" }}>Karte schließen</Text>
							</TouchableOpacity>
						</View>
					) : (
						<TouchableOpacity style={styles.button} onPress={openMap}>
							<Text style={{ color: "#FFFFFF" }}>Karte öffnen</Text>
						</TouchableOpacity>
					)}
				</View> */}

				<View style={styles.inputContainer}>
					<Text>Group Size</Text>
					<TextInput
						style={styles.inputText}
						value={groupSize.toString()}
						onChangeText={(groupSize) => setGroupSize(parseInt(groupSize))}
						keyboardType="numeric"
					/>
				</View>

				<View style={styles.inputContainer}>
					<Text>Description</Text>
					<TextInput
						style={styles.inputText}
						value={description}
						onChangeText={(description) => setDescription(description)}
					/>
				</View>

				<View style={styles.inputContainer}>
					<Text>Gender</Text>
					<TextInput
						style={styles.inputText}
						value={gender}
						onChangeText={(gender) => setGender(gender)}
					/>
				</View>

				<View style={styles.inputContainer}>
					<Text>Date</Text>
					<View
						style={{
							flexDirection: "row",
							marginTop: 12,
							alignItems: "center",
						}}
					>
						<Ionicons
							name={"calendar-outline"}
							onPress={showDatePicker}
							size={30}
						/>
						<DateTimePicker
							value={date}
							locale="de-DE"
							onChange={onDateSelected}
						/>
						<View style={{ flexDirection: "row", alignItems: "center" }}>
							<CheckBox
								title="Advertised"
								checked={advertised}
								onPress={() => setAdvertised(!advertised)}
							/>
						</View>
					</View>
				</View>
				<KeyboardAvoidingView style={styles.inputContainer}>
					<Text>Category</Text>
					<DropDownPicker
						open={open}
						value={category}
						items={items}
						setOpen={setOpen}
						setValue={setCategory}
						setItems={setItems}
						multiple
						mode="BADGE"
						badgeDotColors={[
							"#e76f51",
							"#00b4d8",
							"#e9c46a",
							"#e76f51",
							"#8ac926",
							"#00b4d8",
							"#e9c46a",
						]}
						style={{ marginTop: 10, width: 300 }}
					/>
				</KeyboardAvoidingView>
				<View
					style={{
						// flexDirection: "row",
						flexDirection: "center",
						justifyContent: "space-between",
					}}
				>
					{!uploading && (
						<TouchableOpacity style={styles.button} onPress={uploadPost}>
							<Text style={{ color: "#FFFFFF" }}>Post Event</Text>
						</TouchableOpacity>
					)}
					{uploading && <ActivityIndicator size="large" color="#fff" />}
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default PostEvent;

const styles = StyleSheet.create({
	addressInput: {
		backgroundColor: "transparent",
		borderBottomColor: "#000000",
		borderBottomWidth: 1,
	},
	container: {
		alignItems: "center",
		justifyContent: "center",
	},
	titleBar: {
		flexDirection: "row",
		justifyContent: "flex-start",
	},
	postImage: {
		width: 100,
		height: 100,
		borderRadius: 100,
	},
	inputContainer: {
		textAlign: "left",
		marginTop: 10,
	},
	inputText: {
		fontWeight: "bold",
		borderBottomColor: "#000000",
		borderBottomWidth: 1,
		marginTop: 10,
	},
	map: {
		width: "100%",
		height: 300,
		marginTop: 20,
	},
	button: {
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 50,
		backgroundColor: "#E63F3F",
		marginVertical: 20,
	},
	image: {
		width: "100%",
		marginBottom: 40,
	},
});
