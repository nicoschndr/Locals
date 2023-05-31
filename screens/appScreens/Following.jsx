import {View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {auth, firebase, firestore} from "../../firebase";


const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


const Following = ({route: {params}}) => {
    useEffect(() => {
        getUserData();
        getFollowingData();
    }, []);

    const [user, setUser] = useState({});
    const uid = params.uid;
    const followingID = params.following;
    const [following, setFollowing] = useState([]);


    function getUserData() {
        firestore
            .collection("users")
            .doc(uid)
            .get()
            .then((snapshot) => {
                setUser(snapshot.data());
            })
    }

    function getFollowingData() {
        if(followingID.length > 0) {
            firestore
                .collection('users')
                .where(firebase.firestore.FieldPath.documentId(), 'in', followingID)
                .get()
                .then((snapshot) => {
                    const fU = snapshot.docs.map((e) => ({
                        ...e.data(),
                    }))
                    setFollowing(fU)
                })
        }
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