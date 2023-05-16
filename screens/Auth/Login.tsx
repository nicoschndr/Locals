// create a login screen with a form

import { View, Text, KeyboardAvoidingView, StyleSheet } from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import LocalsTextInput from "../../components/LocalsTextInput";
import LocalsButton from "../../components/LocalsButton";
import { auth } from "../../firebase";
import { useNavigation } from "@react-navigation/native";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const navigation = useNavigation();

	const login = () => {
		auth
			.signInWithEmailAndPassword(email, password)
			.then(() => {})
			.then(() => {
				alert("Logged in!");
				// setEmail("");
				// setPassword("");
				navigation.navigate("Home");
			})
			.catch((error) => {
				alert(error.message);
			});
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior="padding">
			<Text style={styles.title}>Login</Text>
			<View style={styles.inputContainer}>
				<LocalsTextInput
					placeholder="Email"
					autoFocus
					autoCapitalize="none"
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
				<LocalsButton title="Login" onPress={login} style={styles.loginBtn} />
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
	loginBtn: {
		marginTop: 10,
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
