import { Dimensions, StyleSheet, Text, View, LogBox } from "react-native";
import AppNavigation from "./screens/AppNavigation";
import React, { useEffect, useState } from "react";
import FirestoreProvider from "./context/FirestoreProvider";
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
