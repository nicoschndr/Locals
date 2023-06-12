import {View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Alert} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {auth, firebase, firestore} from "../../firebase";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


const Follower = ({route: {params}, navigation}) => {

    useEffect(() => {
        getUserData();
        getCurrentUserData();
        getFollowerData();
    }, []);

    const [user, setUser] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const uid = params.uid;
    const [followerIDs, setFollowingIds] = useState(params.follower);
    const [followers, setUserFollowers] = useState([]);
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
                    setUserFollowers(f)
                })
        }
    }

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
                </View>
            )}
        </ScrollView>
    )
}

export default Follower;

const styles = StyleSheet.create({
    followButton: {
        borderWidth: 1,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 5,
    }
})