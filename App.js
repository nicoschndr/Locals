import { Dimensions, StyleSheet, Text, View, LogBox } from "react-native";
import AppNavigation from "./screens/AppNavigation";
import React, { useEffect, useState } from "react";
LogBox.ignoreAllLogs();
export default function App() {
	navigationOptions = {
		headerShown: true,
		style: {
			backgroundColor: "transparent",
		},
	};

	return <AppNavigation />;
}

const styles = StyleSheet.create({});
