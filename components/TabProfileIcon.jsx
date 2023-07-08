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

/**
 * Renders a TabProfileIcon component with the provided props.
 * @param navigation The navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered TabProfileIcon component.
 * @constructor
 */
const TabProfileIcon = (navigation) => {

	/**
	 * The user that is logged in.
	 */
	const [currentUser, setCurrentUser] = useState([]);

	/**
	 * The amount of friend requests from the current user.
	 */
	const [friendRequests, setFriendRequests] = useState(0);

	/**
	 * The amount of notifications from the current user.
	 */
	const [number, setNumber] = useState(0);

	/**
	 * The difference in the number of followers since the last time the user was on the follower page.
	 */
	const [followerDiff, setFollowerDiff] = useState(0);

	/**
	 * This variable is used to cache all messages the User that is logged in has received or sent.
	 * @type {*[]}
	 */
	let messages = [];

	/**
	 * This state variable represents all unread messages from the User that is logged in.
	 */
	const [unreadMessages, setUnreadMessages] = useState([]);

	/**
	 * This function  retrieves chat data for the User that is logged in from a Firebase Firestore collection.
	 * It filters the chats based on the provided username and retrieves the chats where the user is not typing (Which
	 * is every Chat where the user is part of). It also calculates the unread messages for the user.
	 * @param username The username of the user for whom chat data is being retrieved
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {
		getCurrentUserData();
	}, []);

	/**
	 * This function  retrieves and updates the current user's data from Firestore in real-time. It listens for changes
	 * to the user's document and performs various operations based on the retrieved data.
	 */
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

	/**
	 *  Calculates the difference in the number of followers since the last time the user was on the follower page.
	 *  Updates the "followerDiff" state with the calculated difference.
	 * @param userData The user data object containing follower information.
	 */
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

	/**
	 * renders the TabProfileIcon component.
	 */
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
