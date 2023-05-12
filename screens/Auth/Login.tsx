// create a login screen with a form

import { View, Text, KeyboardAvoidingView, StyleSheet } from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import LocalsTextInput from "../../components/LocalsTextInput";

const Login = () => {
	const [email, setEmail] = useState("");

	return (
		<KeyboardAvoidingView style={styles.container} behavior="padding">
			<Text style={styles.title}>Login</Text>
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
			</View>
		</KeyboardAvoidingView>
	);
};

export default Login;

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
