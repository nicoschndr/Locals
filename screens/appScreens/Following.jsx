import {View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {auth, firebase, firestore} from "../../firebase";


const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


const Following = ({route: {params}}) => {
    useEffect(() => {
        getCurrentUserData();
    }, []);

    const [currentUser, setCurrentUser] = useState({});
    const [followingUser, setFollowingUser] = useState([]);
    const uid = params.uid;

    function getCurrentUserData() {
        firestore
            .collection("users")
            .doc(uid)
            .get()
            .then((snapshot) => {
                setCurrentUser(snapshot.data());
            })
    }

    const navigation = useNavigation();

    return (
        <ScrollView>
            <View style={[styles.titleBar, {marginTop: windowHeight * 0.05, flexDirection: "row", borderBottomWidth:1}]}>
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
                {currentUser.username && (
                    <Text style={{fontWeight: "bold", fontSize: 20, alignSelf: "center"}}>{currentUser.username}</Text>
                )}
            </View>
            <Text style={{flexDirection: "row",marginTop: 30, alignSelf:"center", fontWeight: "bold", fontSize: 20}}>Following</Text>
            {currentUser.following && (
            <View>
                {currentUser.following.map((following) => (
                    <View style={{flexDirection: "row", justifyContent:"space-between", marginTop: 20}}>
                        <Text style={{marginLeft: 10}}>{following}</Text>
                        {auth.currentUser.uid === uid && (
                            <TouchableOpacity style={{marginRight: 10}}>
                                <Text>nicht mehr folgen</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </View>
            )}
        </ScrollView>
    )
}

export default Following;

const styles = StyleSheet.create({})