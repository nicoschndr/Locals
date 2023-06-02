import {View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {auth, firebase, firestore} from "../../firebase";
import {scheduleNotificationAsync} from "expo-notifications";
import {render} from "react-dom";


const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


const Following = ({route: {params}}) => {
    useEffect(() => {
        getUserData();
        getCurrentUserData();
        getFollowingData();
    }, []);

    const [user, setUser] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const uid = params.uid;
    const [followingID, setFollowingId] = useState(params.following);
    const [following, setFollowing] = useState([]);
    const [unfollowId, setUnfollowId] = useState("");
    let flw = [];
    let flwng = [];


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
        if(followingID.length > 0) {
            firestore
                .collection('users')
                .where(firebase.firestore.FieldPath.documentId(), 'in', followingID)
                .get()
                .then((snapshot) => {
                    const fU = snapshot.docs.map((e) => ({
                        uid: e.id,
                        ...e.data(),
                    }))
                    setFollowing(fU)
                })
        }
    }

    function follow(userToFollow){
        userToFollow.following.follower.forEach((r) => flw.push(r))
        firestore
            .collection("users")
            .doc(userToFollow.following.uid)
            .update({
                follower: flw
            }).then(
        )
        setfollowing(userToFollow)
        flw = [];
    }

    function setfollowing(u) {
        currentUser.following.forEach((r) => flwng.push(r))
        flwng.push(u.following.uid.toString())
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .update({
                following: flwng
            })
            .then(getCurrentUserData)
        flwng = [];
    }

    function unfollow(userToUnfollow){
        userToUnfollow.following.follower.forEach((r) => flw.push(r))
        const index = flw.indexOf(auth.currentUser.uid.toString())
        flw.splice(index, 1)
        firestore
            .collection("users")
            .doc(userToUnfollow.following.uid)
            .update({
                follower: flw
            }).then(

        )
        setUnfollowing(userToUnfollow)
        flw = [];
    }

    function setUnfollowing(u) {
        currentUser.following.forEach((r) => flwng.push(r))
        const index = flwng.indexOf(u.following.uid.toString())
        flwng.splice(index, 1)
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .update({
                following: flwng
            })
            .then(
                getCurrentUserData
            )
        flwng = [];
    }

    const navigation = useNavigation();

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
            }}>Following</Text>
            {following.length > 0 && (
                <View>
                    {following.map((following) => (
                        <View>
                            <View style={{flexDirection: "row", marginTop: 10, marginLeft: 10}}>
                                <Image source={{uri: following.imageUrl}}
                                       style={{width: 40, height: 40, borderRadius: 50}}></Image>
                                <Text style={{marginLeft: 10, fontWeight: "bold"}}>{following.username}{"\n"}<Text style={{fontWeight: "normal"}}>{following.firstName + " " + following.lastName}</Text></Text>
                                {currentUser.following.includes(following.uid) && (
                                <TouchableOpacity style={{marginRight:10, marginLeft:"auto", alignSelf:"center"}} onPress={() => unfollow({following})}>
                                    <Text>gefolgt</Text>
                                </TouchableOpacity>
                            )}
                                {!currentUser.following.includes(following.uid) && (
                                    <TouchableOpacity style={{marginRight:10, marginLeft:"auto", alignSelf:"center"}} onPress={() => follow({following})}>
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

const styles = StyleSheet.create({})