import {
	View,
	Text,
	Button,
	StyleSheet,
	Alert,
	TextInput,
	Dimensions,
	Modal,
	TouchableOpacity
} from "react-native";
import React, { useState } from "react";
import { auth, firebase } from "../../firebase";
import LocalsButton from "../../components/LocalsButton";
import { useNavigation } from "@react-navigation/native";
import LocalsTextInput from "../../components/LocalsTextInput";
import { Ionicons } from "@expo/vector-icons";

/**
 * Renders the Settings page.
 * @returns {JSX.Element} The rendered settings page.
 * @constructor
 */
const Settings = () => {

	/**
	 * navigation prop provided by React Navigation that allows navigating between screens and accessing
	 * navigation-related functionality.
	 * @type {NavigationProp<ReactNavigation.RootParamList>}
	 */
	const navigation = useNavigation();

	/**
	 * old password of the user.
	 */
	const [oldPassword, setOldPassword] = useState("");

	/**
	 * new password of the user.
	 */
	const [newPassword, setNewPassword] = useState("");

	/**
	 * confirmation of the new password.
	 */
	const [confirmPassword, setConfirmPassword] = useState("");

	/**
	 * indicates if the modal is visible or not.
	 */
	const [modalVisible, setModalVisible] = useState(false);

	/**
	 * Width of the current device in px.
	 * @type {number}
	 */
	const windowWidth = Dimensions.get("window").width;

	/**
	 * Height of the current device in px.
	 * @type {number}
	 */
	const windowHeight = Dimensions.get("window").height;

	/**
	 * responsible for changing the user's password by reauthenticating the user and updating their password with a
	 * new one.
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Responsible for logging out the user by signing them out of the current session.
	 */
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

	/**
	 * Responsible for deleting the user's account, including their data and associated image.
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Responsible for displaying a prompt to confirm the deletion of the user's account.
	 * @constructor
	 */
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

	/**
	 * renders the Settings page.
	 */
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
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
			<LocalsButton title="Sign Out" onPress={logout}
				style={{ marginBottom: 10 }} // Added some styling
			/>
			<LocalsButton title={"Passwort ändern"}
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
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
						<LocalsTextInput
							placeholder="Altes Passwort"
							value={oldPassword}
							onChangeText={setOldPassword}
							secureTextEntry={true}
							style={{ width: '100%', marginBottom: 10 }} // Added some styling

						/>
						<LocalsTextInput
							placeholder="Neues Passwort"
							value={newPassword}
							onChangeText={setNewPassword}
							secureTextEntry={true}
							style={{ width: '100%', marginBottom: 10 }} // Added some styling

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

export default Settings;

// use styles (styles.textContainer for example) to extract and separate the styling from the render function
/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
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
