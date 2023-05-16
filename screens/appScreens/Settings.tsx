import { View, Text, Button, StyleSheet } from "react-native";
import React, { useState } from "react";
import { auth } from "../../firebase";
import LocalsButton from "../../components/LocalsButton";
import { useNavigation } from "@react-navigation/native";

const Template = () => {
	const navigation = useNavigation();
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

	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<LocalsButton title="Sign Out" onPress={logout} />
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
