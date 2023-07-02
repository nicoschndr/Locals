import { Dimensions, StyleSheet, Text, View, LogBox } from "react-native";
import AppNavigation from "./screens/AppNavigation";
import React, { useEffect, useState } from "react";
import FirestoreProvider from "./context/FirestoreProvider";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseConfig } from "./firebase";
LogBox.ignoreAllLogs();

export default function App() {
	//navigationOptions = {
	//	headerShown: true,
	//	style: {
	//		backgroundColor: "transparent",
	//	},
	//};
	// useEffect(async () => {
	// 	const defaultApp = initializeApp(firebaseConfig);
	// 	initializeAuth(defaultApp, {
	// 		persistence: getReactNativePersistence(AsyncStorage),
	// 	});
	// }, []);

	return (
		<FirestoreProvider>
			<AppNavigation />
		</FirestoreProvider>
	);
}

const styles = StyleSheet.create({});
