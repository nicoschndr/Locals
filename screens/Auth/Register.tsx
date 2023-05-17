import {
	View,
	Text,
	KeyboardAvoidingView,
	StyleSheet,
	Image,
	Platform,
} from "react-native";
import React, { useState } from "react";
import LocalsTextInput from "../../components/LocalsTextInput";
import LocalsImagePicker from "../../components/LocalsImagePicker";
import LocalsButton from "../../components/LocalsButton";
import { auth, firestore } from "../../firebase";
import firebase from "firebase/compat/app";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";

const Register = ({navigation}) => {
	const [email, setEmail] = useState("");
	const [imageUri, setImageUri] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [password, setPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [age, setAge] = useState("");
	const [mobile, setMobile] = useState("");
	const [address, setAddress] = useState("");
	const [uploading, setUploading] = useState(false);
	const [transferred, setTransferred] = useState(0);


	// upload image to firebase storage and return the image url
	const uploadImage = async () => {
		const uri = imageUri;
		const response = await fetch(uri);
		const blob = await response.blob();
		const filename = uri.substring(uri.lastIndexOf("/") + 1);

		const storageRef = firebase.storage().ref(`images/${filename}`);
		const task = storageRef.put(blob);

		// set uploading to true
		setUploading(true);

		// set progress state
		task.on("state_changed", (snapshot) => {
			setTransferred(
				Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
			);
		});

		try {
			await task;

			const url = await storageRef.getDownloadURL();

			setImageUrl(url);
			setUploading(false);
			alert("Image uploaded successfully");
		} catch (e) {
			console.log(e);
			return null;
		}
	};

	const register = () => {
		auth
			.createUserWithEmailAndPassword(email, password)
			// await uploadImage();
			.then(() => {
				uploadImage();
			})
			.then(() => {
				firestore
					.collection("users")
					.doc(auth.currentUser?.uid)
					.set({
						email: email,
						firstName: firstName,
						lastName: lastName,
						age: age,
						mobile: mobile,
						address: address,
						imageUri: imageUri,
					})
					.then(() => {
						auth.currentUser.updateProfile({displayName: firstName + " " + lastName})
						// setEmail("");
						// setPassword("");
						alert("Account created successfully");
						navigation.navigate("Home");
					});
			});
	};

	// create a new register function and await uploadImage() before firestore
	// const register = async () => {
	// 	await uploadImage();
	// 	auth.createUserWithEmailAndPassword(email, password).then(() => {
	// 		firestore
	// 			.collection("users")
	// 			.doc(auth.currentUser?.uid)
	// 			.set({
	// 				email: email,
	// 				firstName: firstName,
	// 				lastName: lastName,
	// 				age: age,
	// 				mobile: mobile,
	// 				address: address,
	// 				imageUrl: imageUrl,
	// 			})
	// 			.then(() => {
	// 				// setEmail("");
	// 				// setPassword("");
	// 				alert("Account created successfully");
	// 				// navigation.navigate("Home");
	// 			});
	// 	});
	// };

	return (
		// <KeyboardAvoidingView style={styles.container} behavior="padding">
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.inputContainer}>
				<LocalsImagePicker
					onImageTaken={(uri) => setImageUri(uri)}
					style={styles.image}
				/>
				<LocalsTextInput
					placeholder="E-Mail"
					autoCapitalize="none"
					autoFocus
					inputMode="email"
					value={email}
					onChangeText={(email) => setEmail(email)}
					style={styles.email}
				/>
				<LocalsTextInput
					placeholder="Password"
					secureTextEntry
					value={password}
					onChangeText={(password) => setPassword(password)}
					style={styles.password}
				/>
				<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
					<LocalsTextInput
						placeholder="First Name"
						value={firstName}
						onChangeText={(firstName) => setFirstName(firstName)}
						style={styles.name}
					/>
					<LocalsTextInput
						placeholder="Last Name"
						value={lastName}
						onChangeText={(lastName) => setLastName(lastName)}
						style={styles.name}
					/>
				</View>

				<LocalsTextInput
					placeholder="Age"
					inputMode="numeric"
					value={age}
					onChangeText={(age) => setAge(age)}
					style={styles.password}
				/>
				<LocalsTextInput
					placeholder="Mobile Number"
					inputMode="numeric"
					value={mobile}
					onChangeText={(mobile) => setMobile(mobile)}
					style={styles.password}
				/>
				<LocalsTextInput
					placeholder="Address"
					value={address}
					onChangeText={(address) => setAddress(address)}
					style={styles.password}
				/>
				<LocalsButton
					title="Register"
					onPress={register}
					style={styles.loginBtn}
				/>
			</View>
		</ScrollView>
	);
};

export default Register;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	email: {},
	image: {
		width: "100%",
		marginBottom: 40,
	},
	inputContainer: {
		width: "80%",
	},
	name: {
		marginTop: 10,
		width: "48%",
	},
	loginBtn: {
		marginTop: 20,
	},
	password: {
		marginTop: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
	},
});
