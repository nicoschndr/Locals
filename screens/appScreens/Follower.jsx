import {View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Alert} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {auth, firebase, firestore} from "../../firebase";

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
 * Renders the Follower page with the provided props.
 * @param params the params tha are delivered through the navigation.
 * @param navigation The navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered Follower page.
 * @constructor
 */
const Follower = ({route: {params}, navigation}) => {

    /**
     * Executes functions once when the component mounts.
     */
    useEffect(() => {
        getUserData();
        getCurrentUserData();
        getFollowerData();
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
    const uid = params.uid;

    /**
     * The follower difference since the last time the user navigated to this page.
     */
    const diff = params.diff;

    /**
     * The firebase uid's of all followers of the user.
     */
    const [followerIDs, setFollowingIds] = useState(params.follower);

    /**
     * all followers of the user.
     */
    const [followers, setUserFollowers] = useState([]);

    /**
     * The followers that followed sine the last time the user navigated to this page.
     */
    const [newFollowers, setNewFollowers] = useState([]);

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
    let ue = []

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
     * retrieve and update the data of all followers of the user based on their uid's.
     */
    function getFollowerData() {
        if (followerIDs.length > 0) {
            firestore
                .collection('users')
                .where(firebase.firestore.FieldPath.documentId(), 'in', followerIDs)
                .get()
                .then((snapshot) => {
                    const f = snapshot.docs.map((e) => ({
                        uid: e.id,
                        ...e.data(),
                    }))
                    setUserFollowers(f.filter((e) => f.indexOf(e) < f.length - diff))
                    setNewFollowers(f.filter((e) => f.indexOf(e) >= f.length - diff))
                })
        }
    }

    /**
     * Responsible for removing a follower from the current user's follower list.
     * @param follower The follower object to be removed from the current user's follower list.
     */
    function deleteFollower(follower) {
        currentUser.follower.forEach((e) => {
            fllwr.push(e)
        })
        const index = fllwr.indexOf(follower.follower.uid)
        fllwr.splice(index, 1)
        firestore
            .collection('users')
            .doc(auth.currentUser.uid)
            .update({
                    follower: fllwr
                }
            ).then(
        )
        deleteFollowing(follower)
        fllwr = [];
    }

    /**
     * Responsible for removing the current user from a follower's following list.
     * @param follower The follower object from which the current user will be removed from the following list.
     */
    function deleteFollowing(follower) {
        follower.follower.following.forEach((e) => fllwng.push(e))
        const index = fllwng.indexOf(auth.currentUser.uid)
        fllwng.splice(index, 1)
        firestore
            .collection('users')
            .doc(follower.follower.uid)
            .update({
                following: fllwng
            }).then(
            getCurrentUserData
        )
        fllwng = [];
    }

    /**
     * Responsible for removing the current user from a follower's following list without deleting the follower entry
     * from the current user's follower list.
     * @param follower The follower object from which the current user will be removed from the following list.
     */
    function notDeleteFollower(follower) {
        follower.follower.following.forEach((e) => fllwng.push(e))
        firestore
            .collection('users')
            .doc(follower.follower.uid)
            .update({
                following: fllwng
            }).then()
        notDeleteFollowing(follower)
        fllwng = [];
    }

    /**
     * Responsible for adding a follower to the current user's follower list without deleting the following entry from the follower's following list.
     * @param follower The follower object to be added to the current user's follower list.
     */
    function notDeleteFollowing(follower) {
        currentUser.follower.forEach((e) => fllwr.push(e))
        fllwr.push(follower.follower.uid)
        firestore
            .collection('users')
            .doc(auth.currentUser.uid)
            .update({
                follower: fllwr
            }).then(
            getCurrentUserData
        )
        fllwr = [];
    }


    const uNavigation = useNavigation();

    /**
     * renders the Follower page.
     */
    return (
        <ScrollView>
            <View
                style={[styles.titleBar, {marginTop: windowHeight * 0.05, flexDirection: "row", borderBottomWidth: 1}]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
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
            }}>Follower</Text>
            {followers.length > 0 && (
                <View>
                    {followers.map((follower) => (
                        <View>
                            <View style={{flexDirection: "row", marginTop: 10, marginLeft: 10}}>
                                <TouchableOpacity key={follower.uid} onPress={() => {
                                    navigation.goBack();
                                    navigation.navigate('Profile', {uid: follower.uid})
                                }}>
                                    <Image source={{uri: follower.imageUrl}}
                                           style={{width: 40, height: 40, borderRadius: 50}}></Image></TouchableOpacity>
                                <TouchableOpacity key={follower.uid} onPress={() => {
                                    navigation.goBack();
                                    navigation.navigate('Profile', {uid: follower.uid})
                                }}><Text style={{marginLeft: 10, fontWeight: "bold"}}>{follower.username}{"\n"}<Text
                                    style={{fontWeight: "normal"}}>{follower.firstName + " " + follower.lastName}</Text></Text></TouchableOpacity>
                                {currentUser.follower.includes(follower.uid) && user.email === auth.currentUser.email && (
                                    <TouchableOpacity style={[styles.followButton, {
                                        marginRight: 10,
                                        marginLeft: "auto",
                                        alignSelf: "center"
                                    }]} onPress={() => deleteFollower({follower})}>
                                        <Text>entfernen</Text>
                                    </TouchableOpacity>
                                )}
                                {!currentUser.follower.includes(follower.uid) && user.email === auth.currentUser.email && (
                                    <TouchableOpacity style={[styles.followButton, {
                                        marginRight: 10,
                                        marginLeft: "auto",
                                        alignSelf: "center"
                                    }]} onPress={() => notDeleteFollower({follower})}>
                                        <Text>rückgängig</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                    {newFollowers.length > 0 && (
                    <View>
                        <Text style={{fontWeight:'bold', alignSelf:'center', marginTop: 20}}>New:</Text>
                    </View>
                    )}
                    {newFollowers.map((follower) => (
                        <View>
                            <View style={{flexDirection: "row", marginTop: 10, marginLeft: 10}}>
                                <TouchableOpacity key={follower.uid} onPress={() => {
                                    navigation.goBack();
                                    navigation.navigate('Profile', {uid: follower.uid})
                                }}>
                                    <Image source={{uri: follower.imageUrl}}
                                           style={{width: 40, height: 40, borderRadius: 50}}></Image></TouchableOpacity>
                                <TouchableOpacity key={follower.uid} onPress={() => {
                                    navigation.goBack();
                                    navigation.navigate('Profile', {uid: follower.uid})
                                }}><Text style={{marginLeft: 10, fontWeight: "bold"}}>{follower.username}{"\n"}<Text
                                    style={{fontWeight: "normal"}}>{follower.firstName + " " + follower.lastName}</Text></Text></TouchableOpacity>
                                {currentUser.follower.includes(follower.uid) && user.email === auth.currentUser.email && (
                                    <TouchableOpacity style={[styles.followButton, {
                                        marginRight: 10,
                                        marginLeft: "auto",
                                        alignSelf: "center"
                                    }]} onPress={() => deleteFollower({follower})}>
                                        <Text>entfernen</Text>
                                    </TouchableOpacity>
                                )}
                                {!currentUser.follower.includes(follower.uid) && user.email === auth.currentUser.email && (
                                    <TouchableOpacity style={[styles.followButton, {
                                        marginRight: 10,
                                        marginLeft: "auto",
                                        alignSelf: "center"
                                    }]} onPress={() => notDeleteFollower({follower})}>
                                        <Text>rückgängig</Text>
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

export default Follower;

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