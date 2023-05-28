import {
	View,
	Text,
	Button,
	StyleSheet,
	Alert,
	TextInput,
	Modal,
} from "react-native";
import React, { useState } from "react";
import { auth, firebase } from "../../firebase";
import LocalsButton from "../../components/LocalsButton";
import { useNavigation } from "@react-navigation/native";
import LocalsTextInput from "../../components/LocalsTextInput";

const Template = () => {
	const navigation = useNavigation();
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [modalVisible, setModalVisible] = useState(false);

	const changePassword = async () => {
		// Überprüfen Sie, ob das neue Passwort und das Bestätigungspasswort gleich sind
		if (newPassword !== confirmPassword) {
			Alert.alert("Die Passwörter stimmen nicht überein");
			return;
		}

		// Reauthenticate the user
		const user = auth.currentUser;
		const credential = firebase.auth.EmailAuthProvider.credential(
			user.email,
			oldPassword
		);

		try {
			await user.reauthenticateWithCredential(credential);

			// Passwort ändern
			await user.updatePassword(newPassword);
			Alert.alert("Passwort wurde erfolgreich geändert");
		} catch (error) {
			console.log(error);
			Alert.alert("Fehler beim Ändern des Passworts");
		}
	};

	const logout = () => {
		auth
			.signOut()
			.then(() => {
				alert("Logged out!");
			})
			.then(() => {
				navigation.navigate("Home");
			});
	};

	const deleteAccount = async () => {
		const imageUrl = await firebase
			.firestore()
			.collection("users")
			.doc(auth.currentUser.uid)
			.get()
			.then((documentSnapshot) => {
				return documentSnapshot.data().imageUrl;
			});

		await firebase
			.firestore()
			.collection("users")
			.doc(auth.currentUser.uid)
			.delete()
			.then(() => {
				firebase.storage().refFromURL(imageUrl).delete();

				auth.currentUser
					.delete()
					.then(() => {
						alert("Account deleted!");
					})
					.then(() => {
						navigation.navigate("Home");
					});
			});
	};

	const DeleteAccountPrompt = () => {
		Alert.alert(
			"Account löschen",
			"Möchten Sie Ihren Account wirklich löschen?",
			[
				{
					text: "Abbrechen",
					onPress: () => console.log("Cancel Pressed"),
					style: "cancel",
				},
				{
					text: "Löschen",
					onPress: () => deleteAccount(),
					style: "destructive",
				},
			],
			{ cancelable: false }
		);
	};

	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<LocalsButton
				title="Sign Out"
				onPress={logout}
				style={{ marginBottom: 10 }} // Added some styling
			/>
			<LocalsButton
				title={"Passwort ändern"}
				onPress={() => setModalVisible(true)}
				style={{ marginBottom: 10 }} // Added some styling
			/>

			<LocalsButton
				title="Account löschen"
				onPress={DeleteAccountPrompt}
				style={{ marginTop: 10 }} // Added some styling
			/>

			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View
					style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
				>
					<View
						style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}
					>
						<LocalsTextInput
							placeholder="Altes Passwort"
							value={oldPassword}
							onChangeText={setOldPassword}
							secureTextEntry={true}
							style={{ width: "100%", marginBottom: 10 }} // Added some styling
						/>
						<LocalsTextInput
							placeholder="Neues Passwort"
							value={newPassword}
							onChangeText={setNewPassword}
							secureTextEntry={true}
							style={{ width: "100%", marginBottom: 10 }} // Added some styling
						/>
						<LocalsTextInput
							placeholder="Passwort bestätigen"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							secureTextEntry={true}
							style={{ marginBottom: 10 }} // Added some styling
						/>
						<LocalsButton
							title="Bestätigen"
							onPress={changePassword}
							style={{ marginBottom: 10 }} // Added some styling
						/>
						<LocalsButton
							title="Schließen"
							onPress={() => setModalVisible(false)}
						/>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default Template;

// use styles (styles.textContainer for example) to extract and separate the styling from the render function
const styles = StyleSheet.create({
	textContainer: {
		margin: 16,
		fontWeight: "bold",
		color: "green",
		fontSize: 24,
	},
	iBtn: {
		margin: 16,
		borderWidth: 3,
		borderColor: "green",
		borderRadius: 8,
	},
	dBtn: {
		margin: 16,
		borderWidth: 3,
		borderColor: "red",
		borderRadius: 8,
	},
});
