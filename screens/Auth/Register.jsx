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
import { auth, firestore, storage } from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { uploadBytes } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";

const Register = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [imageUri, setImageUri] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [password, setPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [age, setAge] = useState("");
	const [mobile, setMobile] = useState("");
	const [address, setAddress] = useState("");
	const [username, setUsername] = useState("");
	const [uploading, setUploading] = useState(false);
	const [transferred, setTransferred] = useState(0);

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

	const register = async () => {
		const imageUrl = await uploadImage(imageUri);

		const isUsernameAvailable = await checkUsernameAvailability();

		if (!isUsernameAvailable) {
			alert("Der Benutzername ist bereits vergeben. Bitte wählen Sie einen anderen.");
			return;
		}

		auth.createUserWithEmailAndPassword(email, password).then(() => {
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
					imageUrl: imageUrl,
					username: username, // Fügen Sie den Benutzernamen zur Dokumentdaten hinzu
					friends: {},
					friendRequests: {},
					follower: [],
					following : [],
				})
				.then(() => {
					setUploading(false);
					alert("Konto erfolgreich erstellt");
					navigation.navigate("Home");
				});
		});
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior="padding">
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
				<LocalsTextInput
					placeholder="Benutzername"
					value={username}
					onChangeText={(username) => setUsername(username)}
					style={styles.username}
				/>
				{!uploading && (
					<LocalsButton
						title="Register"
						onPress={register}
						style={styles.loginBtn}
					/>
				)}
			</View>
		</KeyboardAvoidingView>
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
	username: {
		marginTop: 10,
	},
});
