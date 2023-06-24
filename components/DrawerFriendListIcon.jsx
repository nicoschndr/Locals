import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, ScrollView, ImageBackground, Image, Pressable, SafeAreaView} from "react-native";
import {DrawerItemList} from "@react-navigation/drawer";
import {Ionicons} from "@expo/vector-icons";
import {auth, firebase, firestore} from "../firebase";
import {Badge} from "react-native-elements";

const DrawerFriendList = () => {
    const [currentUser, setCurrentUser] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [number, setNumber] = useState(0);


    useEffect(() => {
        getCurrentUserData();
    }, []);

    function getCurrentUserData() {
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .onSnapshot((doc) => {
                const currentUserData = doc.data();
                setNumber((Object.keys(currentUserData.friendRequests)).length+currentUserData.unreadMessages)
                console.log(number)
                //setCurrentUser(currentUserData);
                //setFriendRequests(Object.keys(currentUserData.friendRequests || {}))
                //getChats(currentUserData.username);
            })
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
            {{number} && (
                <View style={{flexDirection: 'row'}}>
                    <Text>FriendList</Text>
                    {number>0 && (
                        <Badge containerStyle={{marginLeft: 5}} value={number} status='error'></Badge>
                    )}
                </View>
            )}
        </SafeAreaView>
    )
}

export default DrawerFriendList;