import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, ScrollView, ImageBackground, Image, Pressable, SafeAreaView} from "react-native";
import {DrawerItemList} from "@react-navigation/drawer";
import {Ionicons} from "@expo/vector-icons";
import {auth, firebase, firestore} from "../firebase";
import {Badge} from "react-native-elements";

const DrawerFriendList = () => {
    const [friendRequests, setFriendRequests] = useState([]);

    useEffect(() => {
        getOpenFriendRequests();
    }, []);


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
            {friendRequests && (
                <View style={{flexDirection: 'row'}}><Text>FriendList</Text>{friendRequests.length > 0 && (<Badge
                    containerStyle={{marginLeft: 5}} value={friendRequests.length} status='error'></Badge>)}</View>
            )}
        </SafeAreaView>
    )
}

export default DrawerFriendList;