import {View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {auth, firebase, firestore} from "../../firebase";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


const Follower = ({route: {params}}) => {

    useEffect(() => {
        getUserData();
        getFollowerData();
    }, []);

    const [user, setUser] = useState({});
    const uid = params.uid;
    const followerID = params.follower;
    const [follower, setFollower] = useState([]);

    function getUserData() {
        firestore
            .collection("users")
            .doc(uid)
            .get()
            .then((snapshot) => {
                setUser(snapshot.data());
            })
    }

    function getFollowerData() {
        if(followerID.length > 0) {
            firestore
                .collection('users')
                .where(firebase.firestore.FieldPath.documentId(), 'in', followerID)
                .get()
                .then((snapshot) => {
                    const fU = snapshot.docs.map((e) => ({
                        ...e.data(),
                    }))
                    setFollower(fU)
                })
        }
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
            {follower.length > 0 && (
                <View>
                    {follower.map((follower) => (
                        <View>
                            <View style={{flexDirection: "row", marginTop: 10, marginLeft: 10}}>
                                <Image source={{uri: follower.imageUrl}}
                                       style={{width: 40, height: 40, borderRadius: 50}}></Image>
                                <Text style={{marginLeft: 10, fontWeight: "bold"}}>{follower.username}{"\n"}<Text style={{fontWeight: "normal"}}>{follower.firstName + " " + follower.lastName}</Text></Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    )
}

export default Follower;

const styles = StyleSheet.create({})