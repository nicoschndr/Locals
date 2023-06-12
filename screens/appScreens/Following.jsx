import {View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {auth, firebase, firestore} from "../../firebase";
import {scheduleNotificationAsync} from "expo-notifications";
import {render} from "react-dom";


const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


const Following = ({route: {params}, navigation}) => {
    useEffect(() => {
        getUserData();
        getCurrentUserData();
        getFollowingData();
    }, []);

    const [user, setUser] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const uid = params.uid;
    const [followingIDs, setFollowingIds] = useState(params.following);
    const [followingUsers, setFollowingUsers] = useState([]);
    const [unfollowId, setUnfollowId] = useState("");
    let fllwr = [];
    let fllwng = [];


    function getUserData() {
        firestore
            .collection("users")
            .doc(uid)
            .get()
            .then((snapshot) => {
                setUser(snapshot.data());
            })
    }

    function getCurrentUserData() {
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .get()
            .then((snapshot) => {
                setCurrentUser(snapshot.data());
            });
    }

    function getFollowingData() {
        if (followingIDs.length > 0) {
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

    const uNavigation = useNavigation();

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

const styles = StyleSheet.create({
    followButton: {
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 5,
        backgroundColor: '#bebebe',
        borderColor: '#bebebe'
    }
})