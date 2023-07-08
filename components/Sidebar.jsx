import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ImageBackground,
	Image,
	Pressable,
} from "react-native";
import { DrawerItemList } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { auth, firebase, firestore } from "../firebase";

/**
 * Renders a Sidebar component with the provided props.
 * @param props The props object for configuring the Sidebar.
 * @returns {JSX.Element} The rendered Sidebar component.
 * @constructor
 */
const Sidebar = props => {

	/**
	 * The User that is logged in.
	 */
    const [currentUser, setCurrentUser] = useState({});

	/**
	 * The amount of friend requests from the current user.
	 */
    const [friendRequests, setFriendRequests] = useState([]);

	/**
	 * Executes functions once when the component mounts.
	 */
    useEffect(() => {
        getCurrentUserData();
        getOpenFriendRequests();
    }, []);

	/**
	 * This function retrieves the current user's data from Firestore and updates the currentUser state.
	 */
    function getCurrentUserData() {
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .onSnapshot((doc) => {
                const currentUserData = doc.data();
                setCurrentUser(currentUserData);
            })
    }

	/**
	 * This function retrieves the open friend requests for a user from Firestore and updates the friendRequests state.
	 */
    function getOpenFriendRequests() {
        firestore
            .collection("users")
            .doc(uid)
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
	 * Logs out the current user by signing out from the authentication system.
	 */
	const logout = () => {
		auth
			.signOut()
			.then(() => {
				alert("Logged out!");
			})
			.then(() => {
				props.navigation.navigate("Home");
			});
	};

	/**
	 * The uid of firebase from the user that is logged in.
	 * @type {string}
	 */
	const uid = firebase.auth().currentUser.uid;

	/**
	 * Specific data of the user.
	 */
	const [user, setUser] = useState({
		firstName: "",
		imageUrl: "",
		lastName: "",
	});

	/**
	 * Renders the Sidebar component.
	 */
	return (
		<ScrollView>
			<ImageBackground
				source={require("../assets/BackGround(h).png")}
				style={{ paddingTop: 48, padding: 16 }}
			>
				<Image
					source={currentUser.imageUrl ? { uri: currentUser.imageUrl } : null}
					style={styles.image}
				></Image>
				<Text style={styles.name}>
					{currentUser.firstName} {currentUser.lastName}
				</Text>

				{currentUser.follower && (
					<View style={{ flexDirection: "row" }}>
						<Text style={styles.followers}>
							{currentUser.follower.length} Followers
						</Text>
						<Ionicons
							name="md-people"
							size={16}
							color="rgba(255,255,255, 0.8)"
						></Ionicons>
					</View>
				)}
			</ImageBackground>

			<View style={styles.container}>
				<DrawerItemList {...props} />
			</View>
			<Pressable style={styles.label} onPress={logout}>
				<Text style={{ fontWeight: "bold", color: "rgba(255, 0, 0, .87)" }}>
					Logout
				</Text>
			</Pressable>
		</ScrollView>
	);
};

export default Sidebar;

/**
 * Creates a StyleSheet object containing style definitions for component.
 */
const styles = StyleSheet.create({
	image: {
		width: 70,
		height: 70,
		borderRadius: 50,
		marginTop: 20,
		borderWidth: 3,
		borderColor: "#FFFFFF",
	},
	container: {
		flex: 1,
		marginTop: 10,
	},
	name: {
		color: "#FFFFFF",
		fontSize: 20,
		fontWeight: "800",
		marginVertical: 8,
	},
	followers: {
		color: "rgba(255,255,255,0.8)",
		fontSize: 13,
		marginRight: 4,
	},
	label: {
		flexDirection: "row",
		margin: 16,
	},
});
