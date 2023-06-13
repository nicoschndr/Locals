import { View, Text, KeyboardAvoidingView, StyleSheet, Image, ImageBackground } from "react-native";
import React, { useState, useEffect } from "react";
import LocalsTextInput from "../../components/LocalsTextInput";
import LocalsButton from "../../components/LocalsButton";
import { auth, firestore } from "../../firebase";
import { useNavigation } from "@react-navigation/native";

const Login = () => {
	const [emailOrUsername, setEmailOrUsername] = useState("");
	const [password, setPassword] = useState("");

	const login = () => {
		// Überprüfen, ob die Eingabe eine E-Mail-Adresse ist
		const isEmail = /\S+@\S+\.\S+/.test(emailOrUsername);

		if (isEmail) {
			// Anmeldung mit E-Mail-Adresse
			auth
				.signInWithEmailAndPassword(emailOrUsername, password)
				.then(() => {
					alert("Erfolgreich angemeldet!");
					setEmailOrUsername("");
					setPassword("");
				})
				.catch((error) => {
					alert(error.message);
				});
		} else {
			// Anmeldung mit Benutzernamen
			const usersRef = firestore.collection("users");
			usersRef
				.where("username", "==", emailOrUsername)
				.get()
				.then((querySnapshot) => {
					if (!querySnapshot.empty) {
						const user = querySnapshot.docs[0];
						const email = user.data().email;
						return auth.signInWithEmailAndPassword(email, password);
					} else {
						throw new Error("Ungültiger Benutzername oder E-Mail-Adresse");
					}
				})
				.then(() => {
					alert("Erfolgreich angemeldet!");
					setEmailOrUsername("");
					setPassword("");
				})
				.catch((error) => {
					alert(error.message);
				});
		}
	};

	return (
		<KeyboardAvoidingView behavior="padding">
			<ImageBackground
				source={require("../../assets/BackGround(h).png")}
				style={{ width: '100%', height: '100%' }}
			>
				<View style={styles.container}>
					<Image
						// assets/Logo.png
						source={require("../../assets/Logo(White).png")}
						style={styles.logo}
					/>
					<View style={styles.inputContainer}>
						<LocalsTextInput
							placeholder="E-Mail oder Benutzername"
							autoFocus
							autoCapitalize="none"
							value={emailOrUsername}
							onChangeText={(text) => setEmailOrUsername(text)}
							style={styles.email}
						/>
						<LocalsTextInput
							placeholder="Passwort"
							secureTextEntry
							value={password}
							onChangeText={(password) => setPassword(password)}
							style={styles.password}
						/>
						<LocalsButton
							title="Sign In"
							onPress={login}
							style={styles.loginBtn}
						/>
						<LocalsButton
							title="Sign Up"
							variant="secondary"
							onPress={() => navigation.navigate("Register")}
							style={styles.signUpBtn}
							fontStyle={{ color: "#ec404b" }}
						/>
					</View>
				</View>
			</ImageBackground>
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
		marginTop: 20,
	},
	signUpBtn: {
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
	logo: {
		height: 120,
		marginVertical: 40,
		resizeMode: "contain",
	},
});
