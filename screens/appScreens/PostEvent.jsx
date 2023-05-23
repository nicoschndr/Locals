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
	TextBase,
	KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
	DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";

import { auth, firestore, storage } from "../../firebase";
import LocalsImagePicker from "../../components/LocalsImagePicker";
import LocalsButton from "../../components/LocalsButton";

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
	const [category, setCategory] = useState("");
	const [location, setLocation] = useState(null);

	useEffect(() => {
		getLocation();
	}, []);

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

	const uploadPost = async () => {
		const imageUrl = await uploadImage(imageUri);
		auth;
		firestore
			.collection("events")
			.doc()
			.set({
				creator: auth.currentUser.uid,
				title: title,
				address: address,
				groupSize: groupSize,
				description: description,
				gender: gender,
				category: category,
				date: date,
				imageUrl: imageUrl,
			})
			.then(() => {
				setUploading(false);
				// setEmail("");
				// setPassword("");
				alert("Post created successfully");
				setTimeout(() => {
					navigation.navigate("Profile");
				}, 1000);
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
					></TextInput>
				</View>
				<View style={styles.inputContainer}>
					<Text>
						Address
						{/* <Text style={{ fontWeight: "bold" }}> or Set Marker*</Text> */}
					</Text>
					<GooglePlacesAutocomplete
						fetchDetails={true}
						currentLocation={true}
						currentLocationLabel="Current location"
						onPress={(data, details = null) => {
							setAddress(details.formatted_address);
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
					<Text>Category</Text>
					<TextInput
						style={styles.inputText}
						value={category}
						onChangeText={(category) => setCategory(category)}
					></TextInput>
				</View>
				<View style={styles.inputContainer}>
					<Text>Date</Text>
					<View style={{ flexDirection: "row", marginTop: 12 }}>
						<Ionicons
							name={"calendar-outline"}
							onPress={showDatePicker}
							size={30}
						></Ionicons>
						<DateTimePicker
							value={date}
							locale="de-DE"
							onChange={onDateSelected}
						/>

						{/* <Text style={styles.date} onPress={showDatePicker}>
							{date.toString()}
						</Text> */}
					</View>
				</View>
				<View
					style={{
						// flexDirection: "row",
						flexDirection: "center",
						marginTop: 40,
						justifyContent: "space-between",
					}}
				>
					{/* <Ionicons name={"camera-outline"} size={30}></Ionicons> */}
					<LocalsButton
						title="Post Event"
						style={styles.button}
						onPress={uploadPost}
					/>
					{/* <Ionicons name={"images-outline"} size={30}></Ionicons> */}
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
	date: {
		marginLeft: 10,
		marginTop: 10,
		fontWeight: "bold",
	},
	button: {
		alignSelf: "center",
		width: 200,
	},
	image: {
		width: "100%",
		marginBottom: 40,
	},
});
