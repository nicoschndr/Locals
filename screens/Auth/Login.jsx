import {
	View,
	Text,
	KeyboardAvoidingView,
	StyleSheet,
	Image,
	ImageBackground,
	TouchableOpacity,
	Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import LocalsTextInput from "../../components/LocalsTextInput";
import LocalsButton from "../../components/LocalsButton";
import { auth, firestore } from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import { CheckBox, Divider } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";

/**
 * Renders a TabProfileIcon component with the provided props.
 * @param navigation The navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered Login Page.
 * @constructor
 */
const Login = ({ navigation }) => {

	/**
	 * The email or the username that is entered in the specific input field.
	 */
	const [emailOrUsername, setEmailOrUsername] = useState("");

	/**
	 * The password that is entered in the specific input field.
	 */
	const [password, setPassword] = useState("");

	/**
	 * If true the password is shown to the user.
	 */
	const [showPassword, setShowPassword] = useState(false);

	/**
	 * Handles user authentication and signing in a user based on their email or username.
	 */
	const login = () => {
		// Check if input is an email address
		const isEmail = /\S+@\S+\.\S+/.test(emailOrUsername);

		if (isEmail) {
			// Login with email
			auth
				.signInWithEmailAndPassword(emailOrUsername, password)
				.then(() => {
					setEmailOrUsername("");
					setPassword("");
				})
				.catch((error) => {
					alert(error.message);
				});
		} else {
			// Login with username
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
					setEmailOrUsername("");
					setPassword("");
				})
				.catch((error) => {
					alert(error.message);
				});
		}
	};

	/**
	 * Handles the process of resetting a user's password based on their email or username.
	 */
	const forgotPassword = () => {
		// Check if input is an email address.
		const isEmail = /\S+@\S+\.\S+/.test(emailOrUsername);

		if (isEmail) {
			// reset password
			auth
				.sendPasswordResetEmail(JSON.stringify(emailOrUsername))
				.then(() => {
					Alert.alert(
						"Geschaft!",
						"Wir haben dir eine E-Mail zum Zurücksetzen deines Passworts gesendet."
					);
					setEmailOrUsername("");
				})
				.catch((error) => {
					Alert.alert("Upsii", error.message);
				});
		} else {
			// reset username
			const usersRef = firestore.collection("users");
			usersRef
				.where("username", "==", emailOrUsername)
				.get()
				.then((querySnapshot) => {
					if (!querySnapshot.empty) {
						const user = querySnapshot.docs[0];
						const email = user.data().email;
						return auth.sendPasswordResetEmail(JSON.stringify(email));
					} else {
						throw new Error("Ungültiger Benutzername oder E-Mail-Adresse");
					}
				})
				.then(() => {
					Alert.alert(
						"Geschaft!",
						"Wir haben dir eine E-Mail zum Zurücksetzen deines Passworts gesendet."
					);
					setEmailOrUsername("");
				})
				.catch((error) => {
					Alert.alert("Upsii", error.message);
				});
		}
	};

	// alert window for reset password with two options
	/**
	 * Responsible for displaying a confirmation alert to the user, asking if they want to reset their password.
	 */
	const resetPassword = () => {
		Alert.alert(
			"Passwort zurücksetzen",
			"Willst du dein Passwort wirklich zurücksetzen?",
			[
				{
					text: "Abbrechen",
					style: "cancel",
				},
				{
					text: "Zurücksetzen",
					onPress: () => forgotPassword(),
				},
			],
			{ cancelable: false }
		);
	};

	/**
	 * renders the Login Page.
	 */
	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : ""}
		>
			<ImageBackground
				source={require("../../assets/BackGround(h).png")}
				style={{ width: "100%", height: "100%" }}
			>
				<View style={styles.container}>
					<Image
						source={require("../../assets/Logo(White).png")}
						style={styles.logo}
					/>
					<View style={styles.inputContainer}>
						<Text style={styles.inputTitle}>E-Mail</Text>
						<LocalsTextInput
							autoCapitalize="none"
							value={emailOrUsername}
							onChangeText={(text) => setEmailOrUsername(text)}
							style={styles.email}
						/>
						<Divider style={styles.divider} />
						<Text style={[styles.inputTitle, { marginTop: 12 }]}>Passwort</Text>
						<LocalsTextInput
							secureTextEntry={!showPassword}
							value={password}
							onChangeText={(password) => setPassword(password)}
							style={styles.password}
						/>
						<Divider style={styles.divider} />
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginBottom: 20,
							}}
						>
							<CheckBox
								title="Passwort anzeigen"
								checked={showPassword}
								onPress={() => setShowPassword(!showPassword)}
								containerStyle={{
									backgroundColor: "transparent",
									borderWidth: 0,
									marginLeft: 0,
									padding: 0,
								}}
								textStyle={{
									color: "#fff",
									fontSize: 10,
									fontWeight: "normal",
									marginLeft: 4,
								}}
								checkedColor="#ec404b"
								size={20}
							/>
							<TouchableOpacity
								style={styles.forgotPassword}
								onPress={() => resetPassword()}
							>
								<Text style={styles.forgotPasswordText}>
									Passwort vergessen?
								</Text>
							</TouchableOpacity>
						</View>
						<LocalsButton
							title="Anmelden"
							onPress={login}
							style={styles.loginBtn}
						/>
						<LocalsButton
							title="Registrieren"
							variant="secondary"
							onPress={() => navigation.navigate("Register")}
							style={styles.signUpBtn}
							fontStyle={{ color: "#ec404b" }}
						/>
						{/* <View style={styles.google}>
							<Text style={{ color: "#fff" }}>oder</Text>
							
							<TouchableOpacity
								style={styles.googleIcon}
								onPress={() => navigation.navigate("Register")}
							>
								<Ionicons name="logo-google" size={24} color="#ec404b" />
							</TouchableOpacity>
						</View> 
						*/}
					</View>
				</View>
			</ImageBackground>
		</KeyboardAvoidingView>
	);
};

export default Login;

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	email: {
		backgroundColor: "transparent",
		color: "#fff",
	},
	inputContainer: {
		width: "80%",
		marginTop: 20,
	},
	loginBtn: {
		marginTop: 20,
	},
	signUpBtn: {
		marginTop: 20,
	},
	password: {
		backgroundColor: "transparent",
		color: "#fff",
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
	passwordLabel: {
		marginTop: 20,
		color: "#fff",
	},
	google: {
		justifyContent: "center",
		alignItems: "center",
		marginTop: 38,
	},
	googleIcon: {
		backgroundColor: "#fff",
		width: 50,
		height: 50,
		borderRadius: 50,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 38,
	},
	inputTitle: {
		color: "white",
		fontSize: 10,
		textTransform: "uppercase",
	},
	divider: {
		backgroundColor: "#fff",
		height: StyleSheet.hairlineWidth,
	},
	forgotPassword: {
		alignSelf: "center",
	},
	forgotPasswordText: {
		color: "white",
		fontSize: 10,
	},
});
