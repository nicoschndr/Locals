import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Dimensions,
	Image,
	TextInput,
	Button,
	Pressable,
	TouchableOpacity,
	KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
	DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import firebase from "firebase/compat";
import { auth, firestore, storage } from "../../firebase";
import LocalsImagePicker from "../../components/LocalsImagePicker";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import LocalsButton from "../../components/LocalsButton";
import DropDownPicker from "react-native-dropdown-picker";

import { set } from "react-native-reanimated";

const EditPost = ({ navigation, route }) => {
	const windowWidth = Dimensions.get("window").width;
	const windowHeight = Dimensions.get("window").height;
	const [datePicker, setDatePicker] = useState(false);
	const [date, setDate] = useState("");
	const [imageUri, setImageUri] = useState("");
	const [uploading, setUploading] = useState(false);
	const [transferred, setTransferred] = useState(0);
	const [title, setTitle] = useState("");
	const [address, setAddress] = useState("");
	const [groupSize, setGroupSize] = useState("");
	const [description, setDescription] = useState("");
	const [gender, setGender] = useState("");
	const [category, setCategory] = useState([""]);

	const [open, setOpen] = useState(false);
	const [items, setItems] = useState([
		{ label: "Sport", value: "sport" },
		{ label: "Culture", value: "culture" },
		{ label: "Concert", value: "concert" },
		{ label: "Test", value: "test" },
		{ label: "Party", value: "party" },
	]);

	// Extract the event data from the route
	const { event } = route.params;

	useEffect(() => {
		setDate(event.date);
		setImageUri(event.imageUrl);
		setTitle(event.title);
		setAddress(event.address);
		setGroupSize(event.groupSize);
		setDescription(event.description);
		setGender(event.gender);
		setCategory(event.category);
	}, [event]);

	const uploadImage = async (uri) => {
		setUploading(true);
		const response = await fetch(uri);
		const blob = await response.blob();

		let filename = event.imageUrl;
		// update image from url in firebase storage from the imagUrl
		var ref = storage.refFromURL(filename);
		const snapshot = await ref.put(blob);

		// Get the download URL after upload completes
		const url = await snapshot.ref.getDownloadURL();
		return url;
	};

	const updatePost = async () => {
		// Upload image only if imageUri has been changed

		const imageUrl = await uploadImage(imageUri);
		setImageUri(imageUrl);
		// Get the current user's document
		const userDoc = await firestore
			.collection("users")
			.doc(auth.currentUser.uid)
			.get();
		const username = userDoc.data().username;

		firestore
			.collection("events")
			.doc(event.id)
			.update({
				creator: username,
				title: title,
				address: address,
				groupSize: groupSize,
				category: category,
				// latitude: latitude,
				// longitude: longitude,
				imageUrl: imageUrl,
				// advertised: advertised,
			})
			.then(() => {
				alert("Post created successfully");
				setTimeout(() => {
					navigation.goBack();
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

	return (
		<KeyboardAvoidingView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<TouchableOpacity
					style={[styles.titleBar, { marginTop: windowHeight * 0.05 }]}
					onPress={() => navigation.goBack()}
				>
					<Ionicons
						style={{ marginRight: windowWidth - 90 }}
						name={"arrow-back-circle-outline"}
						size={40}
					>
						{" "}
					</Ionicons>
				</TouchableOpacity>

				<View style={{ alignSelf: "center" }}>
					<View style={styles.postImage}>
						<LocalsImagePicker
							placeholder={event.imageUrl}
							onImageTaken={(imageUri) => setImageUri(imageUri)}
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
					></TextInput>
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
								setGeopoint({
									longitude: details.geometry.location.lng,
									latitude: details.geometry.location.lat,
								});
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
				<View style={styles.inputContainer}>
					<Text>Group Size</Text>
					<TextInput
						style={styles.inputText}
						value={groupSize}
						onChangeText={(groupSize) => setGroupSize(groupSize)}
					></TextInput>
				</View>
				<View style={styles.inputContainer}>
					<Text>Description</Text>
					<TextInput
						style={styles.inputText}
						value={description}
						onChangeText={(description) => setDescription(description)}
					></TextInput>
				</View>
				<View style={styles.inputContainer}>
					<Text>Gender</Text>
					<TextInput
						style={styles.inputText}
						value={gender}
						onChangeText={(gender) => setGender(gender)}
					></TextInput>
				</View>
				<View style={styles.inputContainer}>
					<Text>Date</Text>
					<View style={{ flexDirection: "row" }}>
						<Ionicons
							name={"calendar-outline"}
							onPress={showDatePicker}
							size={30}
						/>
						{/* <DateTimePicker
							value={date}
							locale="de-DE"
							onChange={onDateSelected}
						/> */}
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
						flexDirection: "row",
						marginTop: 40,
						justifyContent: "space-between",
					}}
				>
					<Ionicons name={"camera-outline"} size={30}></Ionicons>
					{/* {!uploading && ( */}
					<TouchableOpacity style={styles.button} onPress={updatePost}>
						<Text style={{ color: "#FFFFFF" }}>Update Event</Text>
					</TouchableOpacity>
					{/* )} */}
					<Ionicons name={"images-outline"} size={30}></Ionicons>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default EditPost;

const styles = StyleSheet.create({
	addressInput: {
		backgroundColor: "transparent",
		borderBottomColor: "#000000",
		borderBottomWidth: 1,
	},
	container: {
		flex: 1,
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
	date: {
		marginLeft: 10,
		marginTop: 10,
		fontWeight: "bold",
	},
	button: {
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 50,
		backgroundColor: "#E63F3F",
		width: 200,
	},
	image: {
		width: "100%",
		marginBottom: 40,
	},
});
