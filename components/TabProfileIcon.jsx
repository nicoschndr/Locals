import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ImageBackground,
	Image,
	Pressable,
	SafeAreaView,
	TouchableOpacity,
} from "react-native";
import { DrawerItemList } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { auth, firebase, firestore } from "../firebase";
import { Badge } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";

const TabProfileIcon = (navigation) => {
	const [currentUser, setCurrentUser] = useState([]);
	const [friendRequests, setFriendRequests] = useState(0);
	const [number, setNumber] = useState(0);
	const [followerDiff, setFollowerDiff] = useState(0);

	let messages = [];
	const [unreadMessages, setUnreadMessages] = useState([]);

	const getChats = async (username) => {
		try {
			const chatRef = firebase.firestore().collection("chatRooms");

			const userChats = chatRef
				.where(`${username}_isTyping`, "==", false)
				.onSnapshot((snapshot) => {
					const chats = snapshot.docs.map((doc) => ({
						...doc.data(),
					}));
					chats.forEach((c) => c.messages.map((e) => messages.push(e)));
					setUnreadMessages(
						messages.filter(
							(e) => e.sender !== username && e.readStatus === false
						)
					);
					messages.splice(0, messages.length);
				});
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		getCurrentUserData();
	}, []);

	function getCurrentUserData() {
		firestore
			.collection("users")
			.doc(auth.currentUser.uid)
			.onSnapshot((doc) => {
				const currentUserData = doc.data();
				setNumber(
					Object.keys(currentUserData.friendRequests).length +
						unreadMessages.length
				);
				console.log(number);
				setCurrentUser(currentUserData);
				getChats(currentUserData.username);
				setFriendRequests(Object.keys(currentUserData.friendRequests).length);
				checkFollowerDiff(currentUserData);
				//getChats(currentUserData.username);
			});
	}

	function checkFollowerDiff(userData) {
		setFollowerDiff(userData.follower.length - userData.followerWhenClicked);
	}

	function getOpenFriendRequests() {
		firestore
			.collection("users")
			.doc(auth.currentUser.uid)
			.get()
			.then((snapshot) => {
				const userData = snapshot.data();
				const friendRequests = Object.keys(userData.friendRequests || {});
				setFriendRequests(friendRequests); // Aktualisiere den Zustand mit den offenen Freundesanfragen
			})
			.catch((error) => {
				console.error("Fehler beim Abrufen der Freundschaftsanfragen:", error);
			});
	}

	return (
		<SafeAreaView>
			<View style={{ flexDirection: "row" }}>
				{/* <Text>Me</Text> */}
				{(friendRequests > 0 ||
					unreadMessages.length > 0 ||
					followerDiff > 0) && (
					<Badge
						containerStyle={{ marginLeft: 5 }}
						value={friendRequests + unreadMessages.length + followerDiff}
						status="error"
					></Badge>
				)}
			</View>
		</SafeAreaView>
	);
};

export default TabProfileIcon;
