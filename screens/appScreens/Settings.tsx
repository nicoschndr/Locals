import { View, Text, Button, StyleSheet } from "react-native";
import React, { useState } from "react";

const Template = () => {

	// render related stuff is displayed here after the return statement
	return (
		<View>
			<Text>Settings Screen</Text>
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
