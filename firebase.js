// import firebase from "firebase/compat/app";
// import "firebase/compat/auth";
// import "firebase/compat/firestore";
// import "firebase/compat/storage";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { initializeAuth } from "firebase/auth";
// import { getReactNativePersistence } from "firebase/auth";

// Your web app's Firebase configuration
// const firebaseConfig = {
// 	apiKey: "AIzaSyAWl2xAw-XB8kyLnLcquMoImngwknLxuDU",
// 	authDomain: "locals-ip2.firebaseapp.com",
// 	projectId: "locals-ip2",
// 	storageBucket: "locals-ip2.appspot.com",
// 	messagingSenderId: "1084632086573",
// 	appId: "1:1084632086573:web:e8c66555ddf0e4216ea0a4",
// 	measurementId: "G-YHP8Z98445",
// };
// // Initialize Firebase
// let app;
// if (firebase.apps.length === 0) {
// 	app = firebase.initializeApp(firebaseConfig);
// } else {
// 	app = firebase.app();
// }

// const auth = initializeAuth(app, {
// 	persistence: getReactNativePersistence(AsyncStorage),
// });

// const firestore = firebase.firestore();

// const storage = firebase.storage();

// export { firebase, auth, firestore, storage };

// BUILD VERSION

const firebase = require("firebase/compat/app");
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

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

const storage = firebase.storage();

export { firebase, auth, firestore, storage };
