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
	Platform,
	PermissionsAndroid,
	FlatList,
	BackgroundImage,
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

/**
 * Renders the PostEvent page with the provided props.
 * @param navigation The navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered PostEvent page.
 * @constructor
 */
const PostEvent = ({ navigation }) => {

    /**
     * The width of the current device.
     * @type {number}
     */
	const windowWidth = Dimensions.get("window").width;

    /**
     * indicates if the date picker is shown or not.
     */
	const [showDatePicker, setShowDatePicker] = useState(false);

    /**
     * The height of the current device.
     * @type {number}
     */
	const windowHeight = Dimensions.get("window").height;
	const [datePicker, setDatePicker] = useState(false);

    /**
     * The date that was picked in the date picker.
     */
    const [date, setDate] = useState(new Date());

    /**
     * The link to the picture the user picked from his gallery.
     */
	const [imageUri, setImageUri] = useState("");

    /**
     * If true the picked picture is uploaded into firestore.
     */
	const [uploading, setUploading] = useState(false);
	const [transferred, setTransferred] = useState(0);

    /**
     * The title of the event the user entered into specific input field.
     */
	const [title, setTitle] = useState("");

    /**
     * The address of the event the user entered into specific input field.
     */
	const [address, setAddress] = useState("");

    /**
     * The group size of the event the user entered into specific input field.
     */
	const [groupSize, setGroupSize] = useState("");

    /**
     * The description of the event the user entered into specific input field.
     */
	const [description, setDescription] = useState("");

    /**
     * The gender of the event the user entered into specific input field.
     */
	const [gender, setGender] = useState("");

    /**
     * The latitude of the event
     */
	const [latitude, setLatitude] = useState(0);

    /**
     * The longitude of the event
     */
	const [longitude, setLongitude] = useState(0);
	const [showMap, setShowMap] = useState(false);

    /**
     * indicates if an event is advertised
     */
	const [advertised, setAdvertised] = useState(false);

    /**
     * indicates if the selection of the event category is visible.
     */
	const [open, setOpen] = useState(false);

    /**
     * The category of the event the user picked (can be multiple)
     */
	const [category, setCategory] = useState(null);
	const [location, setLocation] = useState(null);
    /**
     * The user tha is currently logged in.
     */
    const [currentUser, setCurrentUser] = useState({});

    /**
     * The event that is being created.
     */
    const [createdEvent, setCreatedEvent] = useState({});

    /**
     * used to cache the recent activities of the current user.
     * @type {*[]}
     */
    let rA = [];

    /**
     * represents a list of items with their corresponding labels and values. The setItems function is used to
     * update the items state.
     */
	const [items, setItems] = useState([
		{ label: "Sport", value: "sport" },
		{ label: "Culture", value: "culture" },
		{ label: "Concert", value: "concert" },
		{ label: "Test", value: "test" },
		{ label: "Party", value: "party" },
	]);

    /**
     * Executes functions once when the component mounts.
     */
	useEffect(() => {
		requestLocationPermission();
		getCurrentUserData();
	}, []);


    /**
     * requesting the user's permission to access their fine location and, if granted, calling the getCurrentLocation
     * function to retrieve the current location.
     * @returns {Promise<void>}
     */
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


    /**
     * Gets the current location of the user.
     * @returns {Promise<void>}
     */
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


    /**
     * Upload image to firebase storage and return the image url.
     * @param uri The URI of the image to be uploaded.
     */
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

    /**
     * used to upload a post to the "events" collection in Firestore.
     * @returns {Promise<void>}
     */
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
				attendees: [],
				likedBy: [],
				userId: auth.currentUser.uid,
			})
			.then(() => {
				getEventByTitle(title);
				alert("Post created successfully");
				setTimeout(() => {
					navigation.navigate("Profile");
				}, 1000);
			})
			.catch((error) => {
				console.log(error);
			});
	};

    /**
     * This function  retrieves and updates the current user's data from Firestore in real-time. It listens for changes
     * to the user's document and performs various operations based on the retrieved data.
     */
	function getCurrentUserData() {
		firestore
			.collection("users")
			.doc(auth.currentUser.uid)
			.onSnapshot((doc) => {
				const currentUserData = doc.data();
				setCurrentUser(currentUserData);
			});
	}

    /**
     * used to get a specific event by searching for its title.
     * @param title the title of the event
     */
	function getEventByTitle(title) {
		firestore
			.collection("events")
			.where("title", "==", title)
			.get()
			.then((snapshot) => {
				const singleEvent = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				const event = singleEvent[0];
				recentActivity("event", "create", event.id, event.title);
			});
	}


    /**
     * responsible for adding a recent activity of the user. If there would be more than three, the oldest is removed
     * from the list.
     * @param category The category of the activity (event or user)
     * @param action The action the user took (in case of the postEvent page: create)
     * @param uid The uid of the event
     * @param title the title of the event
     */
	function recentActivity(category, action, uid, title) {
		console.log(title);
		currentUser.recentActivities.forEach((a) => rA.push(a));
		if (rA.length === 3) {
			rA.splice(0, 1);
			rA.push({
				category: category,
				action: action,
				title: title,
				uid: uid,
			});
			firestore.collection("users").doc(auth.currentUser.uid).update({
				recentActivities: rA,
			});
		} else {
			rA.push({
				category: category,
				action: action,
				title: title,
				uid: uid,
			});
			firestore.collection("users").doc(auth.currentUser.uid).update({
				recentActivities: rA,
			});
		}
		setCreatedEvent({});
	}

    /**
     * if called the date picker is shown
     */
	const openDatePicker = () => {
		setShowDatePicker(true);
	};

    /**
     * if called the date picker is closed
     */
	const closeDatePicker = () => {
		setShowDatePicker(false);
	};

    /**
     * updates the date when the user selected one and then closes the date pciker.
     * @param date the selected date of the event
     */
	const onDateSelected = (date) => {
		setDate(date);
		closeDatePicker();
	};

    /**
     * renders the date picker
     * @returns {JSX.Element|null}
     */
	const renderDatePicker = () => {
		if (showDatePicker) {
			return (
				<View>
					<DateTimePicker
						value={date}
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
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="always"
			>
				{uploading && <ActivityIndicator size="large" color="#fff" />}

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

				<FlatList
					data={[{ key: "uniqueKey" }]} // Pass an array of objects to `data`, it could be your state or prop
					renderItem={({ item }) => (
						<View style={styles.inputContainer}>
							<Text>Address</Text>
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
							</View>
						</View>
					)}
				/>

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
							size={30}
							onPress={openDatePicker}
						/>

						<View>{renderDatePicker()}</View>
					</View>
				</View>
				<KeyboardAvoidingView
					style={styles.inputContainer}
					behavior={Platform.OS === "ios" ? "padding" : ""}
				>
					<Text>Category</Text>
					<DropDownPicker
						open={open}
						value={category}
						items={items}
						setOpen={setOpen}
						setValue={setCategory}
						setItems={setItems}
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

				<TouchableOpacity style={styles.button} onPress={uploadPost}>
					<Text style={{ color: "#FFFFFF" }}>Post Event</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default PostEvent;

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
const styles = StyleSheet.create({
	addressInput: {
		backgroundColor: "transparent",
		borderBottomColor: "#000000",
		borderBottomWidth: 1,
	},
	container: {
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 85,
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
		marginTop: 20,
	},
	image: {
		width: "100%",
		marginBottom: 40,
	},
});
