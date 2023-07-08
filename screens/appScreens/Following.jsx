import {View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {auth, firebase, firestore} from "../../firebase";
import {scheduleNotificationAsync} from "expo-notifications";
import {render} from "react-dom";

/**
 * The width of the current device in px.
 * @type {number}
 */
const windowWidth = Dimensions.get("window").width;

/**
 * The height of the current device in px.
 * @type {number}
 */
const windowHeight = Dimensions.get("window").height;

/**
 * Renders the Following page with the provided props.
 * @param params the params tha are delivered through the navigation.
 * @param navigation The navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered Following page.
 * @constructor
 */
const Following = ({route: {params}, navigation}) => {

    /**
     * Executes functions once when the component mounts.
     */
    useEffect(() => {
        getUserData();
        getCurrentUserData();
        getFollowingData();
    }, []);

    /**
     * The data of the user.
     */
    const [user, setUser] = useState({});

    /**
     * The user that is currently logged in.
     */
    const [currentUser, setCurrentUser] = useState({});

    /**
     * The firebase uid of the user.
     */
    const uid = params?.uid;

    /**
     * the uid of the user the current user wants to navigate to through "recentActivities".
     */
    const ruid = params.ruid;

    /**
     * The firebase uid's of all users the current user is following.
     */
    const [followingIDs, setFollowingIds] = useState(params?.following);

    /**
     * all users the current user is following.
     */
    const [followingUsers, setFollowingUsers] = useState([]);
    const [unfollowId, setUnfollowId] = useState("");

    /**
     * used to cache the followers of the user.
     * @type {*[]}
     */
    let fllwr = [];

    /**
     * used to cache the users that the current user is following.
     * @type {*[]}
     */
    let fllwng = [];

    /**
     * used for the case that the current user wants to navigate to another profile through "recentActivities".
     */
    if (ruid !== undefined) {
        navigation.navigate('Profile', {uid: ruid})
    }

    /**
     * This function retrieves and updates the user's data from Firestore
     */
    function getUserData() {
        firestore
            .collection("users")
            .doc(uid)
            .get()
            .then((snapshot) => {
                setUser(snapshot.data());
            })
    }

    /**
     *This function retrieves and updates the current user's data from Firestore
     */
    function getCurrentUserData() {
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .get()
            .then((snapshot) => {
                setCurrentUser(snapshot.data());
            });
    }

    /**
     * retrieve and update the data of all users the current user is following based on their uid's.
     */
    function getFollowingData() {
        if (uid !== undefined && followingIDs.length > 0) {
            firestore
                .collection('users')
                .where(firebase.firestore.FieldPath.documentId(), 'in', followingIDs)
                .get()
                .then((snapshot) => {
                    const fU = snapshot.docs.map((e) => ({
                        uid: e.id,
                        ...e.data(),
                    }))
                    setFollowingUsers(fU)
                })
        }
    }

    /**
     * responsible for adding a user to the current user's following list.
     * @param userToFollow The user object representing the user to be followed.
     */
    function follow(userToFollow) {
        userToFollow.following.follower.forEach((r) => fllwr.push(r))
        firestore
            .collection("users")
            .doc(userToFollow.following.uid)
            .update({
                follower: fllwr
            }).then(
        )
        setFollowing(userToFollow)
        fllwr = [];
    }

    /**
     * Responsible for adding a user to the current user's following list.
     * @param userToFollow The user object representing the user to be followed.
     */
    function setFollowing(userToFollow) {
        currentUser.following.forEach((r) => fllwng.push(r))
        fllwng.push(userToFollow.following.uid.toString())
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .update({
                following: fllwng
            })
            .then(getCurrentUserData)
        fllwng = [];
    }

    /**
     * Responsible for removing a user from the current user's following list.
     * @param userToUnfollow The user object representing the user to be unfollowed.
     */
    function unfollow(userToUnfollow) {
        userToUnfollow.following.follower.forEach((r) => fllwr.push(r))
        const index = fllwr.indexOf(auth.currentUser.uid.toString())
        fllwr.splice(index, 1)
        firestore
            .collection("users")
            .doc(userToUnfollow.following.uid)
            .update({
                follower: fllwr
            }).then(

        )
        setUnfollowing(userToUnfollow)
        fllwr = [];
    }

    /**
     * Responsible for removing a user from the current user's following list.
     * @param userToUnfollow The user object representing the user to be unfollowed.
     */
    function setUnfollowing(userToUnfollow) {
        currentUser.following.forEach((r) => fllwng.push(r))
        const index = fllwng.indexOf(userToUnfollow.following.uid.toString())
        fllwng.splice(index, 1)
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .update({
                following: fllwng
            })
            .then(
                getCurrentUserData
            )
        fllwng = [];
    }

    /**
     * Used to access the navigation object provided by the useNavigation hook. It allows you to navigate between
     * screens or components within your application.
     * @type {NavigationProp<ReactNavigation.RootParamList>}
     */
    const uNavigation = useNavigation();

    /**
     * renders the Following page.
     */
    return (
        <ScrollView>
            <View
                style={[styles.titleBar, {marginTop: windowHeight * 0.05, flexDirection: "row", borderBottomWidth: 1}]}>
                <TouchableOpacity
                    onPress={() => uNavigation.goBack()}
                >
                    <Ionicons

                        name={"arrow-back-circle-outline"}
                        size={40}
                    >
                        {" "}
                    </Ionicons>
                </TouchableOpacity>
                {user.username && (
                    <Text style={{fontWeight: "bold", fontSize: 20, alignSelf: "center"}}>{user.username}</Text>
                )}
            </View>
            <Text style={{
                flexDirection: "row",
                marginTop: 30,
                alignSelf: "center",
                fontWeight: "bold",
                fontSize: 20
            }}>Following</Text>
            {followingUsers.length > 0 && (
                <View>
                    {followingUsers.map((following) => (
                        <View>
                            <View style={{flexDirection: "row", marginTop: 10, marginLeft: 10}}>
                                <TouchableOpacity key={following.uid} onPress={() => {
                                    navigation.goBack();
                                    navigation.navigate('Profile', {uid: following.uid})
                                }}>
                                    <Image source={{uri: following.imageUrl}}
                                           style={{width: 40, height: 40, borderRadius: 50}}></Image></TouchableOpacity>
                                <TouchableOpacity key={following.uid} onPress={() => {
                                    navigation.goBack();
                                    navigation.navigate('Profile', {uid: following.uid})
                                }}>
                                    <Text style={{marginLeft: 10, fontWeight: "bold"}}>{following.username}{"\n"}<Text
                                        style={{fontWeight: "normal"}}>{following.firstName + " " + following.lastName}</Text></Text></TouchableOpacity>
                                {currentUser.following.includes(following.uid) && user.email === auth.currentUser.email && (
                                    <TouchableOpacity style={[styles.followButton, {
                                        marginRight: 10,
                                        marginLeft: "auto",
                                        alignSelf: "center"
                                    }]} onPress={() => unfollow({following})}>
                                        <Text>gefolgt</Text>
                                    </TouchableOpacity>
                                )}
                                {!currentUser.following.includes(following.uid) && user.email === auth.currentUser.email && (
                                    <TouchableOpacity style={[styles.followButton, {
                                        marginRight: 10,
                                        marginLeft: "auto",
                                        alignSelf: "center"
                                    }]} onPress={() => follow({following})}>
                                        <Text>folgen</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    )
}

export default Following;

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
const styles = StyleSheet.create({
    followButton: {
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 5,
        backgroundColor: '#bebebe',
        borderColor: '#bebebe'
    }
})