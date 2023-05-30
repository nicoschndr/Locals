import {View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Dimensions} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {auth, firestore} from "../../firebase";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


const Follower = ({route: {params}}) => {

    useEffect(() => {
        getUserData();
    }, []);

    const [user, setUser] = useState({});
    const uid = params.uid;

    function getUserData() {
        firestore
            .collection("users")
            .doc(uid)
            .get()
            .then((snapshot) => {
                setUser(snapshot.data());
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
                {user.username && (
                    <Text style={{fontWeight: "bold", fontSize: 20, alignSelf: "center"}}>{user.username}</Text>
                )}
            </View>
            <Text style={{flexDirection: "row",marginTop: 30, alignSelf:"center", fontWeight: "bold", fontSize: 20}}>Follower</Text>
            {user.follower && (
                <View>
                    {user.follower.map((follower) => (
                        <View style={{flexDirection: "row", justifyContent:"space-between", marginTop: 20}}>
                            <Text style={{marginLeft: 10}}>{follower}</Text>
                            {auth.currentUser.uid === uid && (
                                <TouchableOpacity style={{marginRight: 10}}>
                                     <Text>entfernen</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    )
}

export default Follower;

const styles = StyleSheet.create({})