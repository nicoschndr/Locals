import {
	View,
	Text,
	KeyboardAvoidingView,
	StyleSheet,
	Image,
} from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import LocalsTextInput from "../../components/LocalsTextInput";
import LocalsImagePicker from "../../components/LocalsImagePicker";

const Register = () => {
	const [email, setEmail] = useState("");
	const [imageUri, setImageUri] = useState("");

	return (
		<KeyboardAvoidingView style={styles.container} behavior="padding">
			<View style={styles.inputContainer}>
				<LocalsTextInput
					placeholder="Email"
					autoFocus
					inputMode="email"
					value={email}
					onChangeText={(text) => setEmail(text)}
					style={styles.email}
				/>
				<LocalsTextInput
					placeholder="Password"
					secureTextEntry
					value={""}
					onChangeText={function (text: string): void {
						throw new Error("Function not implemented.");
					}}
					style={styles.password}
				/>
				<LocalsTextInput
					placeholder="Name"
					value={""}
					onChangeText={function (text: string): void {
						throw new Error("Function not implemented.");
					}}
					style={styles.password}
				/>
				<LocalsTextInput
					placeholder="Alter"
					value={""}
					onChangeText={function (text: string): void {
						throw new Error("Function not implemented.");
					}}
					style={styles.password}
				/>
				<LocalsTextInput
					placeholder="Telefonnummer"
					value={""}
					onChangeText={function (text: string): void {
						throw new Error("Function not implemented.");
					}}
					style={styles.password}
				/>
				<LocalsTextInput
					placeholder="Stadt/Geolocation"
					value={""}
					onChangeText={function (text: string): void {
						throw new Error("Function not implemented.");
					}}
					style={styles.password}
				/>
				<LocalsImagePicker onImageTaken={(uri) => setImageUri(uri)} />
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
	inputContainer: {
		width: "80%",
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
