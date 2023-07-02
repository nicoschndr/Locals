import { Dimensions, StyleSheet, Text, View, LogBox } from "react-native";
import AppNavigation from "./screens/AppNavigation";
import React, { useEffect, useState } from "react";
import FirestoreProvider from "./context/FirestoreProvider";
LogBox.ignoreAllLogs();
export default function App() {
	return (
		<FirestoreProvider>
			<AppNavigation />
		</FirestoreProvider>
	);
}

const styles = StyleSheet.create({});
