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
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
	DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { render } from "react-dom";
import firebase from "firebase/compat";
import { auth, firestore, storage } from "../../firebase";
import LocalsImagePicker from "../../components/LocalsImagePicker";
import LocalsButton from "../../components/LocalsButton";

const Template = ({ navigation }) => {
	const windowWidth = Dimensions.get("window").width;
	const windowHeight = Dimensions.get("window").height;
	const [datePicker, setDatePicker] = useState(false);
	const [date, setDate] = useState(new Date());
	const [imageUri, setImageUri] = useState("");
	const [uploading, setUploading] = useState(false);
	const [transferred, setTransferred] = useState(0);
	const [imageUrl, setImageUrl] = useState("");
	const [title, setTitle] = useState("");
	const [address, setAddress] = useState("");
	const [groupSize, setGroupSize] = useState("");
	const [description, setDescription] = useState("");
	const [gender, setGender] = useState("");
	const [category, setCategory] = useState("");

	const uploadImage = async (uri) => {
		setUploading(true);
		const response = await fetch(uri);
		const blob = await response.blob();

		let filename = new Date().getTime().toString();
		var ref = storage.ref().child("Images/posts/" + filename);
		const snapshot = await ref.put(blob);

		// Get the download URL after upload completes
		const url = await snapshot.ref.getDownloadURL();
		return url;
	};

	const uploadPost = async () => {
		/*const imageUrl = await uploadImage(imageUri);*/
		auth;
		firestore
			.collection("events")
			.doc(auth.currentUser?.uid)
			.set({
				creator: auth.currentUser.uid,
				title: title,
				address: address,
				groupSize: groupSize,
				description: description,
				gender: gender,
				category: category,
				date: date,
				/*imageUrl: imageUrl,*/
			})
			.then(() => {
				setUploading(false);
				// setEmail("");
				// setPassword("");
				alert("Post created successfully");
				navigation.navigate("Home");
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
		<SafeAreaView style={styles.container}>
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
						Address<Text style={{ fontWeight: "bold" }}> or Set Marker*</Text>
					</Text>
					<TextInput
						style={styles.inputText}
						value={address}
						onChangeText={(address) => setAddress(address)}
					></TextInput>
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
					<View style={{ flexDirection: "row" }}>
						<Ionicons
							name={"calendar-outline"}
							onPress={showDatePicker}
							size={30}
						></Ionicons>
						{datePicker && (
							<DateTimePicker
								value={date}
								mode={"date"}
								is24Hour={true}
								onChange={onDateSelected}
							/>
						)}
						<Text style={styles.date} onPress={showDatePicker}>
							{date.toString()}
						</Text>
					</View>
				</View>
				<View
					style={{
						flexDirection: "row",
						marginTop: 40,
						justifyContent: "space-between",
					}}
				>
					<Ionicons name={"camera-outline"} size={30}></Ionicons>
					<TouchableOpacity style={styles.button} onPress={uploadPost}>
						<Text style={{ color: "#FFFFFF" }}>Post Event</Text>
					</TouchableOpacity>
					<Ionicons name={"images-outline"} size={30}></Ionicons>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Template;

const styles = StyleSheet.create({
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
