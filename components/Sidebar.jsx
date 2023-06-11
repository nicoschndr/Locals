import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, Pressable } from "react-native";
import { DrawerItemList } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { auth, firebase, firestore } from "../firebase";

const Sidebar = props => {

    useEffect(() => {
        getRelevantUserData();
    }, []);

    function getRelevantUserData() {
        firestore
            .collection("users")
            .doc(uid)
            .get()
            .then((snapshot) => setUser(
                {
                    firstName: snapshot.data().firstName,
                    imageUrl: snapshot.data().imageUrl,
                    lastName: snapshot.data().lastName,
                }
            ));
    }

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

    const uid = firebase.auth().currentUser.uid;
    const [user, setUser] = useState({
        firstName: "",
        imageUrl: "",
        lastName: "",
    });
    return (
        <ScrollView>
            <ImageBackground source={require("../assets/backgroundSidebar.png")} style={{ paddingTop: 48, padding: 16 }}>
                <Image source={user.imageUrl ? { uri: user.imageUrl } : null} style={styles.image}></Image>
                <Text style={styles.name}>{user.firstName} {user.lastName}</Text>

                <View style={{ flexDirection: "row" }}>
                    <Text style={styles.followers}>0 Followers</Text>
                    <Ionicons name="md-people" size={16} color="rgba(255,255,255, 0.8)"></Ionicons>
                </View>
            </ImageBackground>

            <View style={styles.container}>
                <DrawerItemList {...props} />
            </View>
            <Pressable style={styles.label} onPress={logout}>
                <Ionicons name="log-out-outline" size={19} color={'rgba(255, 0, 0, .87)'}></Ionicons>
                <Text style={{ fontWeight: 'bold', color: 'rgba(255, 0, 0, .87)' }}>Logout</Text>
            </Pressable>
        </ScrollView>
    )
}


export default Sidebar;

const styles = StyleSheet.create({
    image: {
        width: 70,
        height: 70,
        borderRadius: 50,
        marginTop: 20,
        borderWidth: 3,
        borderColor: '#FFFFFF'
    },
    container: {
        flex: 1,
        marginTop: 10,
    },
    name: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: "800",
        marginVertical: 8
    },
    followers: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 13,
        marginRight: 4
    },
    label: {
        flexDirection: "row",
        margin: 16,
    }
})