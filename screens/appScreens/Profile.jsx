import {
	View,
	Image,
	Text,
	StyleSheet,
	Dimensions,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	StatusBar,
	Alert,
	Modal,
	Pressable,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
	RefreshControl,
	ImageBackground,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { auth, firebase, firestore, storage } from "../../firebase";
import LocalsButton from "../../components/LocalsButton";
import { useFocusEffect } from "@react-navigation/native";
import { Badge } from "react-native-elements";
import LocalsEventCard from "../../components/LocalsEventCard";
import FastImage from "react-native-fast-image";

import FirestoreContext from "../../context/FirestoreContext";
import { BackgroundImage } from "react-native-elements/dist/config";

/**
 * Renders the Profile page with the provided props.
 * @param route An object representing the current route information provided by the React Navigation library or similar
 * navigation framework.
 * @param navigation The navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered Profile page.
 * @constructor
 */
const Profile = ({ route, navigation }) => {
	const goToFriendList = () => {
		navigation.navigate("FriendList");
	};

	/**
	 * Used to cache the users the current user is following.
	 * @type {*[]}
	 */
	let flwng = [];

	/**
	 * Used to cache the users that are following the current user.
	 * @type {*[]}
	 */
	let flw = [];

	/**
	 * Used to cache the users the current user has blocked.
	 * @type {*[]}
	 */
	let blockedUsers = [];
	let friends = [];

	/**
	 * Used to cache all messages from all chats where the current user is part of.
	 * @type {*[]}
	 */
	let messages = [];

	/**
	 * Used to cache the recent Activities of the user.
	 * @type {*[]}
	 */
	let rA = [];

	/**
	 * The width of the current device in px.
	 * @type {number}
	 */
	const windowWidth = Dimensions.get("window").width;

	/**
	 * The height of the current device in px.
	 * @type {number}
	 */
	const platform = Platform.OS;

	/**
	 * Either the uid of a user that is not the current user if you navigate to another profile, or the uid of the
	 * current user if you navigate to your own profile.
	 * @type {*|string}
	 */
	const uid = route.params?.uid || auth.currentUser.uid;

	/**
	 * The user that belongs to the profile that is shown.
	 */
	const [user, setUser] = useState({});

	/**
	 * The user that is currently logged in.
	 */
	const [currentUser, setCurrentUser] = useState({});
	//const [events, setEvents] = useState([]);

	/**
	 * The username of the user that is currently logged in.
	 */
	const [currentUsername, setCurrentUsername] = useState("");

	/**
	 * The friends of the current user.
	 */
	const [currentFriends, setCurrentFriends] = useState({});

	/**
	 * The friend requests of the current user.
	 */
	const [friendRequests, setFriendRequests] = useState([]);
	const [chats, setChats] = useState([]);

	/**
	 * If true the block user modal is shown, if false it is not shown.
	 */
	const [modalVisible, setModalVisible] = useState(false);

	/**
	 * If true the report user modal is shown, if false it is not shown.
	 */
	const [reportModal, setReportModal] = useState(false);
	const [followerSize, setFollowerSize] = useState("");
	const [followingSize, setFollowingSize] = useState("");

	/**
	 * The message the user wants to add to his report of another user.
	 */
	const [text, onChangeText] = React.useState("");

	/**
	 * The amount of notifications from the current user.
	 */
	const [number, onChangeNumber] = React.useState("");

	/**
	 * The category for which the current user wants to report another user for.
	 */
	const [reportCategory, setReportCategory] = useState([]);
	const [shouldHide, setShouldHide] = React.useState(false);

	/**
	 * The difference in the number of followers since the last time the user was on the follower page.
	 */
	const [followerDiff, setFollowerDiff] = useState(0);

	/**
	 * This state variable represents all unread messages from the User that is logged in.
	 */
	const [unreadMessages, setUnreadMessages] = useState(null);
	// const [events, setEvents] = useState([]);
	const [fullStorage, setFullStorage] = useState(false);
	// const [events, setEvents] = useState([]);

	/**
	 * Context of all events to lower firebase traffic.
	 */
	const { events } = useContext(FirestoreContext);

	/**
	 * Only the events that the current user created, which are displayed on the profile.
	 */
	const currentUserEvents = events.filter(
		(event) => event.creator === user.username
	);

	/**
	 * Used to perform side effects after the component has been rendered and the layout has been updated.
	 */
	React.useLayoutEffect(() => {
		if (uid === firebase.auth().currentUser.uid) {
			navigation.setOptions({
				headerRight: () => (
					<TouchableOpacity onPress={goToFriendList}>
						<Ionicons name={"people"} size={25} style={{ marginRight: 15 }} />
					</TouchableOpacity>
				),
			});
		} else {
			navigation.setOptions({
				headerRight: null,
			});
		}
	}, [navigation, uid]);
	const handleFriendClick = (friendUsername) => {
		navigation.navigate("Chat", {
			friendUsername: friendUsername,
			currentUsername: currentUsername,
		});
	};
	const checkTrafficAvailability = async () => {
		try {
			// Verwende die Firebase Storage API, um Informationen über den verbleibenden Traffic abzurufen
			const storageRef = firebase.storage().ref();

			// Rufe die Nutzungsinformationen des Storage ab
			const { usage } = await storageRef.child("/").getMetadata();

			// Überprüfe, ob noch ausreichend Traffic vorhanden ist
			const remainingTraffic = usage.limit - usage.size;
			const threshold = 100000; // Schwellenwert für verbleibenden Traffic

			if (remainingTraffic < threshold) {
				setFullStorage(true);
			}

			return remainingTraffic > threshold;
		} catch (error) {
			console.error("Error checking traffic availability:", error);
			return false;
		}
	};

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {
		checkTrafficAvailability();
		getUserData();
		getCurrentUserData();
	}, []);

	/**
	 * This function retrieves and updates the user's data from Firestore in real-time. It listens for changes
	 * to the user's document and performs various operations based on the retrieved data.
	 */
	function getUserData() {
		setUser([]);
		firestore
			.collection("users")
			.doc(uid)
			.onSnapshot((doc) => {
				const userData = doc.data();
				setUser(userData);
				//getUserPosts(userData.username)
			});
	}

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
				setCurrentUser(currentUserData);
				checkFollowerDiff(currentUserData);
				setCurrentFriends(currentUserData.friends);
				setFriendRequests(Object.keys(currentUserData.friendRequests));
				getChats(currentUserData.username);
			});
	}

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
						).length
					);
					messages.splice(0, messages.length);
				});
		} catch (e) {
			console.log(e);
		}
	};

	function getCurrentUserFriends(username) {
		firestore
			.collection("users")
			.doc(firebase.auth().currentUser.uid)
			.onSnapshot((snapshot) => {
				setCurrentFriends(snapshot.data().friends);
				setFriendRequests(Object.keys(snapshot.data().friendRequests || {}));
				checkFriendship(username, snapshot.data().friends);
				getOpenFriendRequests();
			});
	}

	/**
	 * Retrieves data about how much friend requests the user has.
	 */
	function getOpenFriendRequests() {
		firestore
			.collection("users")
			.doc(uid)
			.onSnapshot((snapshot) => {
				const userData = snapshot.data();
				const friendRequests = Object.keys(userData.friendRequests || {});
				setFriendRequests(friendRequests); // Aktualisiere den Zustand mit den offenen Freundesanfragen
			});
	}

	/**
	 * Checks if the current user and the one that belongs to the profile that is shown, are friends.
	 * @param username the username of the user that belongs to the profile
	 * @param friends all friends of the current user
	 */
	function checkFriendship(username, friends) {
		if (friends && friends[username]) {
			// Der Benutzer ist ein Freund
			console.log(`Der Benutzer ${username} ist ein Freund.`);
		} else {
			// Der Benutzer ist kein Freund
			console.log(`Der Benutzer ${username} ist kein Freund.`);
		}
	}

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {
		const user = firebase.auth().currentUser;

		if (user) {
			const userDocRef = firebase.firestore().collection("users").doc(user.uid);
		}
	}, [friendRequests]);

	/**
	 * Responsible for sending a friend request from the sender to the receiver.
	 * @param senderUsername The username of the sender.
	 * @param receiverUsername The username of the receiver.
	 * @returns {Promise<void>}
	 */
	async function sendFriendRequest(senderUsername, receiverUsername) {
		const usersRef = firebase.firestore().collection("users");

		// Suchen des Dokuments mit dem gegebenen Benutzernamen
		const receiverQuerySnapshot = await usersRef
			.where("username", "==", receiverUsername)
			.get();
		if (!receiverQuerySnapshot.empty) {
			// Das Dokument wurde gefunden, nehmen Sie das erste Ergebnis
			const receiverDoc = receiverQuerySnapshot.docs[0];
			const receiverId = receiverDoc.id;

			// Update für das Dokument mit der ID durchführen
			await usersRef.doc(receiverId).update({
				[`friendRequests.${senderUsername}`]: true,
			});
		} else {
			// Das Dokument wurde nicht gefunden, handle den Fehler
			console.error(`No document found with username: ${receiverUsername}`);
		}
	}

	function handleSendFriendRequest() {
		const senderUsername = firebase.auth().currentUser.displayName; // Benutzernamen aus Firebase Auth holen
		const receiverUsername = user.username;
		sendFriendRequest(senderUsername, receiverUsername);
	}

	function getUserPosts() {
		firestore
			.collection("events")
			//where("creator", "==", uid  or user.username
			.where("creator", "==", user.username || "userId", "==", uid)
			.onSnapshot((snapshot) => {
				const posts = snapshot.docs.map((doc) => ({
					...doc.data(),
					id: doc.id,
				}));
				setEvents(posts);
			});
	}

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {
		const user = firebase.auth().currentUser;
		if (user) {
			const userDocRef = firebase.firestore().collection("users").doc(user.uid);

			userDocRef.onSnapshot((doc) => {
				if (doc.exists) {
					const userData = doc.data();
					setCurrentUsername(userData.username);
				}
			});
		}
	}, [friendRequests]);

	/**
	 * Responsible for adding the current user to the follower list of a user.
	 */
	function setFollower() {
		user.follower.forEach((r) => flw.push(r));
		flw.push(auth.currentUser.uid.toString());
		firestore
			.collection("users")
			.doc(uid)
			.update({
				follower: flw,
			})
			.then(setFollowing);
		flw = [];
	}

	/**
	 * Responsible for adding a user to the current user's following list.
	 */
	function setFollowing() {
		currentUser.following.forEach((r) => flwng.push(r));
		flwng.push(uid.toString());
		firestore.collection("users").doc(auth.currentUser.uid).update({
			following: flwng,
		});
		recentActivity("user", "follow", uid);
		flwng = [];
	}

	/**
	 * Responsible for removing the current user from the follower list of a user.
	 */
	function setUnfollow() {
		user.follower.forEach((r) => flw.push(r));
		const index = flw.indexOf(auth.currentUser.uid.toString());
		flw.splice(index, 1);
		firestore
			.collection("users")
			.doc(uid)
			.update({
				follower: flw,
			})
			.then(setUnfollowing);
		flw = [];
	}

	/**
	 * Responsible for removing a user from the current user's following list.
	 */
	function setUnfollowing() {
		currentUser.following.forEach((r) => flwng.push(r));
		const index = flwng.indexOf(uid.toString());
		flwng.splice(index, 1);
		firestore.collection("users").doc(auth.currentUser.uid).update({
			following: flwng,
		});
		flwng = [];
	}

	/**
	 * responsible for adding a recent activity of the user. If there would be more than three, the oldest is removed
	 * from the list.
	 * @param category The category of the activity (event or user)
	 * @param action The action the user took (in case of the profile page it is follow)
	 * @param uid The firebase uid of the user that is followed.
	 */
	function recentActivity(category, action, uid) {
		currentUser.recentActivities.forEach((a) => rA.push(a));
		if (rA.length === 3) {
			rA.splice(0, 1);
			rA.push({
				category: category,
				action: action,
				username: user.username,
				uid: uid,
			});
			firestore.collection("users").doc(auth.currentUser.uid).update({
				recentActivities: rA,
			});
		} else {
			rA.push({
				category: category,
				action: action,
				username: user.username,
				uid: uid,
			});
			firestore.collection("users").doc(auth.currentUser.uid).update({
				recentActivities: rA,
			});
		}
	}

	/**
	 * Retrieves a specific event from firebase by its title and then navigates to its details page.
	 * @param title the title of the event.
	 * @returns {Promise<void>}
	 */
	async function getEventByTitle(title) {
		await firestore
			.collection("events")
			.where("title", "==", title)
			.get()
			.then((snapshot) => {
				const singleEvent = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				const event = singleEvent[0];
				navigation.navigate("EventDetails", { event });
			});
	}

	function changeModal() {
		setModalVisible(false);
		setReportModal(true);
	}

	/**
	 * Adds a report of a user with the selected report data to firebase.
	 */
	function reportUser() {
		if (reportCategory.includes("Nutzer blockieren")) {
			blockUser();
		}
		firestore
			.collection("users")
			.doc(uid)
			.update({
				[`reportedBy.${currentUsername}`]: {
					Time: new Date(),
					Category: reportCategory,
					Text: text,
				},
			})
			.then();
		setReportModal(false);
		setReportCategory([]);
		onChangeText("");
	}

	/**
	 * Responsible for adding a user to the list of blocked users from the current user.
	 */
	function blockUser() {
		setUnfollow();
		unFriendCurrentUser().then();
		currentUser.blockedUsers.forEach((e) => blockedUsers.push(e));
		blockedUsers.push(user.username);
		firestore.collection("users").doc(auth.currentUser.uid).update({
			blockedUsers: blockedUsers,
		});
		firestore
			.collection("chatRooms")
			.doc(currentUser.username + "_" + user.username)
			.update({
				messages: [],
			});
		setModalVisible(false);
		getCurrentUserData();
		blockedUsers = [];
	}

	/**
	 * Responsible for removing a user from the list of blocked users from the current user.
	 */
	function unblockUser() {
		currentUser.blockedUsers.forEach((e) => blockedUsers.push(e));
		const index = blockedUsers.indexOf(user.username);
		blockedUsers.splice(index, 1);
		firestore.collection("users").doc(auth.currentUser.uid).update({
			blockedUsers: blockedUsers,
		});
		setModalVisible(false);
		getCurrentUserData();
		blockedUsers = [];
	}

	/**
	 * Responsible for removing the current user from the friend list of another user.
	 * @returns {Promise<void>}
	 */
	async function unFriendCurrentUser() {
		const usersRef = firebase.firestore().collection("users");

		// Suchen des Dokuments mit dem gegebenen Benutzernamen
		const friendQuerySnapshot = await usersRef
			.where("username", "==", user.username)
			.get();
		let friendId;
		if (!friendQuerySnapshot.empty) {
			const friendDoc = friendQuerySnapshot.docs[0];
			friendId = friendDoc.id;
		}

		if (friendId) {
			// Das Dokument wurde gefunden, aktualisiere das friendRequests-Objekt
			const rejectUpdateData = {
				[`friends.${currentUsername}`]: firebase.firestore.FieldValue.delete(),
			};

			await usersRef.doc(friendId).update(rejectUpdateData);
		} else {
			// Das Dokument wurde nicht gefunden, handle den Fehler
			console.error(`No document found with username: ${user.username}`);
		}
		await unFriendUser();
	}

	/**
	 * Responsible for removing a user from the friend list of the current user.
	 * @returns {Promise<void>}
	 */
	async function unFriendUser() {
		const usersRef = firebase.firestore().collection("users");

		// Suchen des Dokuments mit dem gegebenen Benutzernamen
		const friendQuerySnapshot = await usersRef
			.where("username", "==", currentUsername)
			.get();
		let friendId;
		if (!friendQuerySnapshot.empty) {
			const friendDoc = friendQuerySnapshot.docs[0];
			friendId = friendDoc.id;
		}

		if (friendId) {
			// Das Dokument wurde gefunden, aktualisiere das friendRequests-Objekt
			const rejectUpdateData = {
				[`friends.${user.username}`]: firebase.firestore.FieldValue.delete(),
			};

			await usersRef.doc(friendId).update(rejectUpdateData);
		} else {
			// Das Dokument wurde nicht gefunden, handle den Fehler
			console.error(`No document found with username: ${currentUsername}`);
		}
	}

	/**
	 * Calculates the difference in the number of followers since the last time the user was on the follower page.
	 * Updates the "followerDiff" state with the calculated difference.
	 * @param userData The user data object containing follower information.
	 */
	function checkFollowerDiff(userData) {
		setFollowerDiff(userData.follower.length - userData.followerWhenClicked);
	}

	/**
	 * updates the amount of followers the current user has when he navigates to the follower page to later calculate
	 * the follower diff.
	 * @param fwc
	 */
	function pushFollowerWhenClicked(fwc) {
		firestore.collection("users").doc(auth.currentUser.uid).update({
			followerWhenClicked: fwc,
		});
	}

	/**
	 * Used to specify the date format for displaying short dates.
	 * @type {{month: string, year: string, day: string}}
	 */
	const shortDate = {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	};

	/**
	 * renders the Profile page.
	 */
	return (
		<View style={[styles.container, {marginTop: Platform.OS === "android" ? -40 : null}]}>
			<BackgroundImage
				source={require("../../assets/BackGround(h).png")}
				style={{ flex: 1, resizeMode: "cover", justifyContent: "center" }}
			>
				<View style={{ marginTop: 48, paddingBottom: 80 }}>
					<StatusBar barStyle="dark-content" />
					<ScrollView showsVerticalScrollIndicator={false}>
						{uid === firebase.auth().currentUser.uid && (
							<TouchableOpacity
								style={styles.titleBar}
								onPress={navigation.openDrawer}
							>
								<Ionicons
									style={{ marginLeft: windowWidth - 50 }}
									name={"reorder-three-outline"}
									color={"#f3f3f3"}
									size={40}
								>
									{" "}
								</Ionicons>
								{(friendRequests.length > 0 || unreadMessages > 0) && (
									<Badge
										value={friendRequests.length + unreadMessages}
										status="error"
										containerStyle={{
											position: "absolute",
											top: 0,
											right: 5,
										}}
									></Badge>
								)}
							</TouchableOpacity>
						)}

						{uid !== firebase.auth().currentUser.uid && (
							<TouchableOpacity
								style={[styles.titleBar, { marginTop: 40 }]}
								onPress={() => setModalVisible(true)}
							>
								<Ionicons
									style={{ marginLeft: windowWidth - 50 }}
									name={"ellipsis-vertical"}
									size={24}
								>
									{" "}
								</Ionicons>
								<Ionicons
									name="chevron-back"
									size={24}
									color="black"
									style={{ position: "absolute", top: 0, left: 20 }}
									onPress={() => navigation.goBack()}
								/>
							</TouchableOpacity>
						)}

						<Modal
							animationType="slide"
							transparent={true}
							visible={modalVisible}
						>
							<TouchableOpacity
								style={{ width: windowWidth, height: 40 }}
								onPress={() => setModalVisible(false)}
							></TouchableOpacity>
							<View style={styles.centeredView}>
								<View style={styles.modalView}>
									<TouchableOpacity
										onPress={() => changeModal()}
										style={{ marginLeft: 20, marginTop: 20 }}
									>
										<Text>melden ...</Text>
									</TouchableOpacity>
									{currentUser.blockedUsers &&
										!currentUser.blockedUsers.includes(user.username) && (
											<TouchableOpacity
												onPress={() => blockUser()}
												style={{ marginLeft: 20, marginTop: 20 }}
											>
												<Text style={{ color: "rgba(255, 0, 0, .87)" }}>
													blockieren
												</Text>
											</TouchableOpacity>
										)}
									{currentUser.blockedUsers &&
										currentUser.blockedUsers.includes(user.username) && (
											<TouchableOpacity
												onPress={() => unblockUser()}
												style={{ marginLeft: 20, marginTop: 20 }}
											>
												<Text style={{ color: "rgba(255, 0, 0, .87)" }}>
													nicht mehr blockieren
												</Text>
											</TouchableOpacity>
										)}
								</View>
							</View>
						</Modal>
						<Modal
							animationType="slide"
							transparent={true}
							visible={reportModal}
						>
							<KeyboardAvoidingView
								style={{
									flex: 1,
									flexDirection: "column",
									justifyContent: "center",
								}}
								behavior={
									Platform.OS === "ios"
										? "padding"
										: "height" || Platform.OS === "android"
										? "padding"
										: "height"
								}
								keyboardVerticalOffset={150}
								enabled
							>
								<TouchableOpacity
									style={{ width: windowWidth, height: 40 }}
									onPress={() => setReportModal(false)}
								></TouchableOpacity>
								<View style={styles.centeredView}>
									<View style={styles.reportModalView}>
										<Text
											style={{
												alignSelf: "center",
												fontWeight: "bold",
												fontSize: 20,
												borderBottomWidth: 1,
												flexDirection: "row",
											}}
										>
											melden
										</Text>

										{reportCategory.includes("Belästigung") && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf("Belästigung"),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>
													Belästigung <Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes("Belästigung") && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([...reportCategory, "Belästigung"])
												}
												style={{
													marginLeft: 20,
													marginTop: 15,
												}}
											>
												<Text>Belästigung</Text>
											</TouchableOpacity>
										)}

										{reportCategory.includes("Hassrede") && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf("Hassrede"),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>
													Hassrede <Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes("Hassrede") && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([...reportCategory, "Hassrede"])
												}
												style={{
													marginLeft: 20,
													marginTop: 15,
												}}
											>
												<Text>Hassrede</Text>
											</TouchableOpacity>
										)}

										{reportCategory.includes("Gewalt") && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf("Gewalt"),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>
													Gewalt <Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes("Gewalt") && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([...reportCategory, "Gewalt"])
												}
												style={{
													marginLeft: 20,
													marginTop: 15,
												}}
											>
												<Text>Gewalt</Text>
											</TouchableOpacity>
										)}

										{reportCategory.includes("Spam") && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf("Spam"),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>
													Spam <Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes("Spam") && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([...reportCategory, "Spam"])
												}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>Spam</Text>
											</TouchableOpacity>
										)}

										{reportCategory.includes("Betrug") && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf("Betrug"),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>
													Betrug <Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes("Betrug") && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([...reportCategory, "Betrug"])
												}
												style={{
													marginLeft: 20,
													marginTop: 15,
												}}
											>
												<Text>Betrug</Text>
											</TouchableOpacity>
										)}

										{reportCategory.includes("Identitätsdiebstahl") && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf("Identitätsdiebstahl"),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{
													marginLeft: 20,
													marginTop: 15,
												}}
											>
												<Text>
													Identitätsdiebstahl{" "}
													<Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes("Identitätsdiebstahl") && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([
														...reportCategory,
														"Identitätsdiebstahl",
													])
												}
												style={{
													marginLeft: 20,
													marginTop: 15,
												}}
											>
												<Text>Identitätsdiebstahl</Text>
											</TouchableOpacity>
										)}

										{reportCategory.includes(
											"Nacktheit oder sexuelle Inhalte"
										) && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf(
															"Nacktheit oder sexuelle Inhalte"
														),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>
													Nacktheit oder sexuelle Inhalte{" "}
													<Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes(
											"Nacktheit oder sexuelle Inhalte"
										) && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([
														...reportCategory,
														"Nacktheit oder sexuelle Inhalte",
													])
												}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>Nacktheit oder sexuelle Inhalte</Text>
											</TouchableOpacity>
										)}

										{reportCategory.includes("Urheberrechtsverletzung") && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf("Urheberrechtsverletzung"),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{
													marginLeft: 20,
													marginTop: 15,
												}}
											>
												<Text>
													Urheberrechtsverletzung{" "}
													<Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes("Urheberrechtsverletzung") && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([
														...reportCategory,
														"Urheberrechtsverletzung",
													])
												}
												style={{
													marginLeft: 20,
													marginTop: 15,
												}}
											>
												<Text>Urheberrechtsverletzung</Text>
											</TouchableOpacity>
										)}

										{reportCategory.includes("Falsche Informationen") && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf("Falsche Informationen"),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>
													Falsche Informationen{" "}
													<Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes("Falsche Informationen") && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([
														...reportCategory,
														"Falsche Informationen",
													])
												}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>Falsche Informationen</Text>
											</TouchableOpacity>
										)}

										{reportCategory.includes("Verletzung der Privatsphäre") && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf(
															"Verletzung der Privatsphäre"
														),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>
													Verletzung der Privatsphäre{" "}
													<Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes(
											"Verletzung der Privatsphäre"
										) && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([
														...reportCategory,
														"Verletzung der Privatsphäre",
													])
												}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text>Verletzung der Privatsphäre</Text>
											</TouchableOpacity>
										)}

										{reportCategory.includes("Nutzer blockieren") && (
											<TouchableOpacity
												onPress={() => {
													reportCategory.splice(
														reportCategory.indexOf("Nutzer blockieren"),
														1
													);
													setReportCategory([...reportCategory]);
												}}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text style={{ color: "rgba(255, 0, 0, .87)" }}>
													Nutzer blockieren{" "}
													<Ionicons name="checkmark"></Ionicons>
												</Text>
											</TouchableOpacity>
										)}
										{!reportCategory.includes("Nutzer blockieren") && (
											<TouchableOpacity
												onPress={() =>
													setReportCategory([
														...reportCategory,
														"Nutzer blockieren",
													])
												}
												style={{ marginLeft: 20, marginTop: 15 }}
											>
												<Text style={{ color: "rgba(255, 0, 0, .87)" }}>
													Nutzer blockieren
												</Text>
											</TouchableOpacity>
										)}

										<TouchableOpacity
											style={{
												marginLeft: 20,
												marginTop: 15,
											}}
										>
											<Text>Sonstiges:</Text>
										</TouchableOpacity>
										<TextInput
											editable
											multiline
											onChangeText={onChangeText}
											value={text}
											style={styles.input}
										></TextInput>
										<LocalsButton
											style={{ marginTop: 20, alignSelf: "center" }}
											title={"absenden"}
											onPress={reportUser}
										></LocalsButton>
									</View>
								</View>
							</KeyboardAvoidingView>
						</Modal>

						<View style={{ alignSelf: "center" }}>
							{currentUser.blockedUsers &&
								user.blockedUsers &&
								!currentUser.blockedUsers.includes(user.username) &&
								!user.blockedUsers.includes(currentUsername) && (
									<View style={styles.profileImage}>
										<Image
											source={
												{uri: user.imageUrl}
											}
											style={styles.image}
											resizeMode="center"
										 />
									</View>
								)}
							{currentUser.blockedUsers &&
								user.blockedUsers &&
								(currentUser.blockedUsers.includes(user.username) ||
									user.blockedUsers.includes(currentUsername)) && (
									<View style={styles.profileImage}>
										<Image
											source={require("../../assets/blank_profile.png")}
											style={styles.image}
											resizeMode="center"
										/>
									</View>
								)}
							{uid !== firebase.auth().currentUser.uid &&
								currentUser.blockedUsers &&
								user.blockedUsers &&
								!currentUser.blockedUsers.includes(user.username) &&
								!user.blockedUsers.includes(currentUsername) && (
									<>
										<TouchableOpacity
											style={styles.chat}
											onPress={() => handleFriendClick(user.username)}
										>
											<MaterialIcons
												name={"chat"}
												size={20}
												color={"#f3f3f3"}
											/>
										</TouchableOpacity>
										{!currentFriends[user.username] &&
											user.username !== currentUsername && (
												<TouchableOpacity
													style={styles.add}
													onPress={() =>
														sendFriendRequest(currentUsername, user.username)
													}
												>
													{friendRequests.includes(currentUsername) ? (
														<MaterialIcons
															name={"schedule"}
															size={60}
															color={"#f3f3f3"}
														/>
													) : (
														<MaterialIcons
															name={"add"}
															size={60}
															color={"#f3f3f3"}
														/>
													)}
												</TouchableOpacity>
											)}
									</>
								)}
						</View>

						{user.follower &&
							user.following &&
							currentUser.follower &&
							currentUser.following &&
							user.username &&
							currentUser.blockedUsers &&
							user.blockedUsers && (
								<View style={[styles.infoContainer, { marginTop: 40 }]}>
									<Text
										style={[styles.text, { fontWeight: "200", fontSize: 36 }]}
									>
										{user.firstName} {user.lastName}
									</Text>
									<Text
										style={[styles.text, { fontWeight: "200", fontSize: 14 }]}
									>
										@{user.username}
									</Text>
									{uid !== firebase.auth().currentUser.uid &&
										currentUser.following.includes(uid) === false &&
										!currentUser.blockedUsers.includes(user.username) &&
										!user.blockedUsers.includes(currentUsername) && (
											<TouchableOpacity
												style={{ marginTop: 10 }}
												onPress={setFollower}
											>
												<Text style={styles.followButton}>Folgen</Text>
											</TouchableOpacity>
										)}
									{currentUser.following.includes(uid) === true &&
										!currentUser.blockedUsers.includes(user.username) && (
											<TouchableOpacity
												style={{ marginTop: 10 }}
												onPress={setUnfollow}
											>
												<Text style={styles.followButton}>
													Nicht mehr Folgen
												</Text>
											</TouchableOpacity>
										)}
									{currentUser.blockedUsers.includes(user.username) && (
										<TouchableOpacity
											style={{ marginTop: 10 }}
											onPress={unblockUser}
										>
											<Text style={styles.followButton}>
												Nicht mehr blockieren
											</Text>
										</TouchableOpacity>
									)}
									{user.blockedUsers.includes(currentUsername) && <Text></Text>}
								</View>
							)}

						{user.follower &&
							user.following &&
							currentUser.follower &&
							currentUser.following &&
							currentUser.blockedUsers &&
							user.blockedUsers && (
								<View style={[styles.statsContainer, { marginTop: 40 }]}>
									<View style={styles.statsBox}>
										<Text style={{ color: "#f3f3f3" }}>Events</Text>
										{!currentUser.blockedUsers.includes(user.username) &&
											!user.blockedUsers.includes(currentUsername) && (
												<Text style={{ color: "#f3f3f3" }}>
													{events.length}
												</Text>
											)}
										{(currentUser.blockedUsers.includes(user.username) ||
											user.blockedUsers.includes(currentUsername)) && (
											<Text style={{ color: "#f3f3f3" }}>0</Text>
										)}
									</View>
									<View
										style={[
											styles.statsBox,
											{
												borderColor: "#f3f3f3",
												borderLeftWidth: 1,
												borderRightWidth: 1,
											},
										]}
									>
										{auth.currentUser.uid === uid && (
											<TouchableOpacity
												style={styles.statsBox}
												onPress={() => {
													pushFollowerWhenClicked(user.follower.length);
													navigation.goBack();
													navigation.navigate("Follower", {
														uid: uid,
														follower: currentUser.follower,
														diff: followerDiff,
													});
												}}
											>
												<Text style={{ color: "#f3f3f3" }}>Follower </Text>
												<Text style={{ color: "#f3f3f3" }}>
													{user.follower.length}
												</Text>
												{followerDiff > 0 && followerDiff && (
													<Badge
														containerStyle={{
															position: "absolute",
															top: -5,
															right: -15,
														}}
														status="error"
														value={followerDiff}
													></Badge>
												)}
											</TouchableOpacity>
										)}
										{auth.currentUser.uid !== uid && (
											<TouchableOpacity
												style={styles.statsBox}
												onPress={() => {
													navigation.goBack();
													navigation.navigate("Follower", {
														uid: uid,
														follower: user.follower,
													});
												}}
											>
												<Text style={{ color: "#f3f3f3" }}>Follower</Text>
												{!currentUser.blockedUsers.includes(user.username) &&
													!user.blockedUsers.includes(currentUsername) && (
														<Text style={{ color: "#f3f3f3" }}>{user.follower.length}</Text>
													)}
												{(currentUser.blockedUsers.includes(user.username) ||
													user.blockedUsers.includes(currentUsername)) && (
													<Text style={{ color: "#f3f3f3" }}>0</Text>
												)}
											</TouchableOpacity>
										)}
									</View>
									{auth.currentUser.uid === uid && (
										<TouchableOpacity
											style={styles.statsBox}
											onPress={() => {
												navigation.goBack();
												navigation.navigate("Following", {
													uid: uid,
													following: currentUser.following,
												});
											}}
										>
											<View style={styles.statsBox}>
												<Text style={{ color: "#f3f3f3" }}>Following</Text>
												<Text style={{ color: "#f3f3f3" }}>
													{user.following.length}
												</Text>
											</View>
										</TouchableOpacity>
									)}
									{auth.currentUser.uid !== uid && (
										<TouchableOpacity
											style={styles.statsBox}
											onPress={() => {
												navigation.goBack();
												navigation.navigate("Following", {
													uid: uid,
													following: user.following,
												});
											}}
										>
											<View style={styles.statsBox}>
												<Text style={{ color: "#f3f3f3" }}>Following</Text>
												{!currentUser.blockedUsers.includes(user.username) &&
													!user.blockedUsers.includes(currentUsername) && (
														<Text style={{ color: "#f3f3f3" }}>
															{user.following.length}
														</Text>
													)}
												{(currentUser.blockedUsers.includes(user.username) ||
													user.blockedUsers.includes(currentUsername)) && (
													<Text style={{ color: "#f3f3f3" }}>0</Text>
												)}
											</View>
										</TouchableOpacity>
									)}
								</View>
							)}
						{currentUser.blockedUsers && user.blockedUsers && (
							<View style={{ marginTop: 40 }}>
								{events.length > 0 &&
									!currentUser.blockedUsers.includes(user.username) &&
									!user.blockedUsers.includes(currentUsername) && (
										<ScrollView
											horizontal={true}
											showsVerticalScrollIndicator={false}
											showsHorizontalScrollIndicator={false}
											style={{
												paddingHorizontal: 24,
											}}
										>
											{currentUserEvents.map((event) => (
												<LocalsEventCard
													key={event.id}
													title={event.title}
													date={event.date
														?.toDate()
														?.toLocaleDateString("de-DE", shortDate)}
													location={event.address}
													// image={event.imageUrl}
													category={event.title}
													onPress={() =>
														navigation.navigate("EventDetails", { event })
													}
													image={
															event.imageUrl
													}
													style={{ marginRight: 24 }}
													profile
												/>
											))}
										</ScrollView>
									)}
								{(currentUser.blockedUsers.includes(user.username) ||
									user.blockedUsers.includes(currentUsername)) && <View></View>}
								{user.recentActivities &&
									currentUser.recentActivities &&
									user.recentActivities.length > 0 && (
										<Text
											style={[
												styles.text,
												styles.recent,

												{
													marginLeft: windowWidth * 0.15,
													marginTop: 40,
													color: "#f3f3f3",
												},
											]}
										>
											Recent Activity
										</Text>
									)}
								<View
									style={[
										styles.recentItem,
										{
											marginBottom: 40,
											marginLeft: windowWidth * 0.15,
										},
									]}
								>
									{auth.currentUser.uid === uid &&
										currentUser.recentActivities &&
										currentUser.recentActivities.length > 0 && (
											<View>
												{currentUser.recentActivities.map((recent) => (
													<View style={{ flexDirection: "row" }}>
														<View style={styles.recentItemIndicator}></View>
														{recent.category === "user" &&
															recent.action === "follow" && (
																<View style={{ flexDirection: "row" }}>
																	<Text style={{ color: "#f3f3f3" }}>
																		folgt jetzt{" "}
																	</Text>
																	<TouchableOpacity
																		onPress={() => {
																			navigation.navigate("Following", {
																				ruid: recent.uid,
																			});
																		}}
																	>
																		<Text
																			style={{
																				fontWeight: "bold",
																				color: "#f3f3f3",
																			}}
																		>
																			@{recent.username}
																		</Text>
																	</TouchableOpacity>
																</View>
															)}
														{recent.category === "event" &&
															recent.action === "create" && (
																<View style={{ flexDirection: "row" }}>
																	<Text style={{ color: "#f3f3f3" }}>hat </Text>
																	<TouchableOpacity
																		onPress={() => {
																			getEventByTitle(recent.title);
																		}}
																	>
																		<Text
																			style={{
																				fontWeight: "bold",
																				color: "#f3f3f3",
																			}}
																		>
																			{recent.title}{" "}
																		</Text>
																	</TouchableOpacity>
																	<Text style={{ color: "#f3f3f3" }}>
																		erstellt
																	</Text>
																</View>
															)}
														{recent.category === "event" &&
															recent.action === "participate" && (
																<View style={{ flexDirection: "row" }}>
																	<Text style={{ color: "#f3f3f3" }}>
																		nimmt an{" "}
																	</Text>
																	<TouchableOpacity
																		onPress={() => {
																			getEventByTitle(recent.title);
																		}}
																	>
																		<Text
																			style={{
																				fontWeight: "bold",
																				color: "#f3f3f3",
																			}}
																		>
																			{recent.title}{" "}
																		</Text>
																	</TouchableOpacity>
																	<Text style={{ color: "#f3f3f3" }}>teil</Text>
																</View>
															)}
													</View>
												))}
											</View>
										)}

									{auth.currentUser.uid !== uid &&
										user.recentActivities &&
										user.recentActivities.length > 0 && (
											<View>
												{user.recentActivities.map((recent) => (
													<View style={{ flexDirection: "row" }}>
														<View style={styles.recentItemIndicator}></View>
														{recent.category === "user" &&
															recent.action === "follow" && (
																<View style={{ flexDirection: "row" }}>
																	<Text style={{ color: "#f3f3f3" }}>
																		folgt jetzt{" "}
																	</Text>
																	<TouchableOpacity
																		onPress={() => {
																			navigation.navigate("Following", {
																				ruid: recent.uid,
																			});
																		}}
																	>
																		<Text
																			style={{
																				fontWeight: "bold",
																				color: "#f3f3f3",
																			}}
																		>
																			@{recent.username}
																		</Text>
																	</TouchableOpacity>
																</View>
															)}
														{recent.category === "event" &&
															recent.action === "create" && (
																<View style={{ flexDirection: "row" }}>
																	<Text style={{ color: "#f3f3f3" }}>hat </Text>
																	<TouchableOpacity
																		onPress={() => {
																			getEventByTitle(recent.title);
																		}}
																	>
																		<Text
																			style={{
																				fontWeight: "bold",
																				color: "#f3f3f3",
																			}}
																		>
																			{recent.title}{" "}
																		</Text>
																	</TouchableOpacity>
																	<Text style={{ color: "#f3f3f3" }}>
																		erstellt
																	</Text>
																</View>
															)}
														{recent.category === "event" &&
															recent.action === "participate" && (
																<View style={{ flexDirection: "row" }}>
																	<Text style={{ color: "#f3f3f3" }}>
																		nimmt an{" "}
																	</Text>
																	<TouchableOpacity
																		onPress={() => {
																			getEventByTitle(recent.title);
																		}}
																	>
																		<Text style={{ fontWeight: "bold" }}>
																			{recent.title}{" "}
																		</Text>
																	</TouchableOpacity>
																	<Text style={{ color: "#f3f3f3" }}>teil</Text>
																</View>
															)}
													</View>
												))}
											</View>
										)}
									<View>
										<Text style={{ color: "#f3f3f3" }}>{events.title}</Text>
									</View>
								</View>
							</View>
						)}
					</ScrollView>
				</View>
			</BackgroundImage>
		</View>
	);
};

export default Profile;

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		color: "white",
	},
	text: {
		color: "#f3f3f3",
	},
	image: {
		width: 200,
		height: 200,
	},
	titleBar: {
		flexDirection: "row",
		justifyContent: "flex-end",
		color: "#f3f3f3",
	},
	profileImage: {
		width: 200,
		height: 200,
		borderRadius: 100,
		overflow: "hidden",
	},
	chat: {
		backgroundColor: "#41444B",
		position: "absolute",
		top: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	add: {
		backgroundColor: "#E63F3F",
		position: "absolute",
		borderRadius: 40,
		top: 135,
		left: 150,
	},
	infoContainer: {
		alignSelf: "center",
		alignItems: "center",
		color: "#f3f3f3",
	},
	statsContainer: {
		flexDirection: "row",
		alignSelf: "center",
		color: "#f3f3f3",
	},
	statsBox: {
		alignItems: "center",
		flex: 1,
		color: "#f3f3f3",
	},
	mediaImageContainer: {
		width: 200,
		height: 200,
		borderRadius: 40,
		overflow: "hidden",
		marginHorizontal: 12,
	},
	recentItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		color: "#f3f3f3",
	},
	recentItemIndicator: {
		backgroundColor: "#f3f3f3",
		padding: 4,
		height: 12,
		width: 12,
		borderRadius: 6,
		marginTop: 3,
		marginRight: 20,
	},
	recent: {
		marginBottom: 6,
		fontSize: 10,
		color: "#f3f3f3",
	},
	Test: {
		backgroundColor: "#999999",
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		marginTop: -50,
		height: 50,
		opacity: 0.2,
	},
	imageText: {
		color: "#FFFFFF",
		alignSelf: "center",
		textAlign: "center",
		fontSize: 20,
		bottom: 50,
		width: 200,
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22,
	},
	modalView: {
		backgroundColor: "white",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		alignItems: "flex-start",
		width: Dimensions.get("window").width,
		height: Dimensions.get("window").height / 2,
		marginBottom: 0,
		marginTop: "auto",
	},
	reportModalView: {
		backgroundColor: "white",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		alignItems: "flex-start",
		width: Dimensions.get("window").width,
		height: Dimensions.get("window").height / 1.2,
		marginBottom: 0,
		marginTop: "auto",
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
	},
	buttonOpen: {
		backgroundColor: "#F194FF",
	},
	buttonClose: {
		backgroundColor: "#2196F3",
	},
	textStyle: {
		color: "#f3f3f3",
		fontWeight: "bold",
		textAlign: "center",
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
	},
	input: {
		height: Dimensions.get("window").height / 6,
		width: Dimensions.get("window").width - 40,
		marginLeft: 20,
		marginRight: 20,
		borderWidth: 1,
		padding: 10,
		textAlignVertical: "top",
	},
	followButton: {
		paddingLeft: 5,
		paddingRight: 5,
		borderRadius: 5,
		backgroundColor: "#bebebe",
		borderColor: "#bebebe",
	},
});
