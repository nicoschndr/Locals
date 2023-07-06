import { Dimensions, StyleSheet, Text, View, LogBox } from "react-native";
import AppNavigation from "./screens/AppNavigation";
import React, { useEffect, useState } from "react";
import FirestoreProvider from "./context/FirestoreProvider";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseConfig } from "./firebase";
import { FirestoreContext } from "./context/FirestoreContext";
import { useContext } from "react";

LogBox.ignoreAllLogs();

export default function App() {
	return (
		<FirestoreProvider>
			<AppNavigation />
		</FirestoreProvider>
	);
}
