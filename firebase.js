import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { initializeAuth, getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import "firebase/compat/storage";
import { getReactNativePersistence } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAWl2xAw-XB8kyLnLcquMoImngwknLxuDU",
	authDomain: "locals-ip2.firebaseapp.com",
	projectId: "locals-ip2",
	storageBucket: "locals-ip2.appspot.com",
	messagingSenderId: "1084632086573",
	appId: "1:1084632086573:web:e8c66555ddf0e4216ea0a4",
	measurementId: "G-YHP8Z98445",
};

// Initialize Firebase
if (!firebase.apps.length) {
	const defaultApp = initializeApp(firebaseConfig);
	initializeAuth(defaultApp, {
		persistence: getReactNativePersistence(AsyncStorage),
	});
} else {
	firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();

const firestore = firebase.firestore();

const storage = firebase.storage();

export { firebase, auth, firestore, storage };
