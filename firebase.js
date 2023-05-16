// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { getStorage } from "firebase/storage";

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
let app;
if (firebase.apps.length === 0) {
	app = firebase.initializeApp(firebaseConfig);
} else {
	app = firebase.app();
}

const auth = firebase.auth();

const firestore = firebase.firestore();

const storage = getStorage(app);

export { auth, firestore, firebase };
