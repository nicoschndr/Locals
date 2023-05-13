import {View, Image, Text, Button, StyleSheet, Dimensions, SafeAreaView, ScrollView} from "react-native";
import React, { useState } from "react";
import{Ionicons, MaterialIcons} from "@expo/vector-icons";

const Template = () => {

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.titleBar}>
                    <Ionicons style={{marginLeft: windowWidth - 50}} name={"reorder-three-outline"} size={40}> </Ionicons>
                </View>

                <View style={{alignSelf: "center"}}>
                    <View style={styles.profileImage}>
                        <Image source={require("../assets/Profil_Test.jpg")} style={styles.image} resizeMode="center"></Image>
                    </View>
                    <View style={styles.chat}>
                        <MaterialIcons name={"chat"} size={20} color={"#FFFFFF"}></MaterialIcons>
                    </View>
                    <View style={styles.add}>
                        <MaterialIcons name={"add"} size={60} color={"#FFFFFF"}></MaterialIcons>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={[styles.text, {fontWeight: "200", fontSize: 36}]}>Nico Schneider</Text>
                    <Text style={[styles.text, {fontWeight: "200", fontSize: 14}]}>Locals</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statsBox}>
                        <Text>Events</Text>
                        <Text>0</Text>
                    </View>
                    <View style={[styles.statsBox, {borderColor: "DFD8C8", borderLeftWidth: 1, borderRightWidth: 1}]}>
                        <Text>Follower</Text>
                        <Text>0</Text>
                    </View>
                    <View style={styles.statsBox}>
                        <Text>Following</Text>
                        <Text>0</Text>
                    </View>
                </View>

                <View style={{marginTop: 32}}>
                    <ScrollView horizontal={true} showsVerticalScrollIndicator={false}>
                        <View style={styles.mediaImageContainer}>
                            <Image source={require("../assets/Profil_Test.jpg")} style={styles.image} resizeMode="center"></Image>
                        </View>
                        <View style={styles.mediaImageContainer}>
                            <Image source={require("../assets/Profil_Test.jpg")} style={styles.image} resizeMode="center"></Image>
                        </View>
                        <View style={styles.mediaImageContainer}>
                            <Image source={require("../assets/Profil_Test.jpg")} style={styles.image} resizeMode="center"></Image>
                        </View>
                        <View style={styles.mediaImageContainer}>
                            <Image source={require("../assets/Profil_Test.jpg")} style={styles.image} resizeMode="center"></Image>
                        </View>
                        <View style={styles.mediaImageContainer}>
                            <Image source={require("../assets/Profil_Test.jpg")} style={styles.image} resizeMode="center"></Image>
                        </View>
                    </ScrollView>
                        <Text style={[styles.text, styles.recent]}>
                            Recent Activity
                        </Text>


                        <View style={styles.recentItem}>
                            <View style={styles.recentItemIndicator}></View>
                            <View>
                                <Text>
                                    spielt Tennis
                                </Text>
                            </View>
                        </View>

                </View>
            </ScrollView>

        </SafeAreaView>
    );
};

export default Template;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    text: {
        color: "#5257SD"
    },
    image: {
        flex: 1,
        width: undefined,
        height: undefined
    },
    titleBar: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 50,
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        overflow: "hidden"
    },
    chat: {
        backgroundColor: "#41444B",
        position: "absolute",
        top: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    add: {
        backgroundColor:"#E63F3F",
        position: "absolute",
        borderRadius: 40,
        top: 135,
        left: 150
    },
    infoContainer: {
        alignSelf:"center",
        alignItems:"center",
        marginTop: 16
    },
    statsContainer: {
        flexDirection: "row",
        alignSelf: "center",
        marginTop: 32
    },
    statsBox: {
        alignItems: "center",
        flex: 1
    },
    mediaImageContainer: {
        width: 200,
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        marginHorizontal: 12
    },
    recentItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
        marginLeft: 98
    },
    recentItemIndicator: {
        backgroundColor: "#000000",
        padding: 4,
        height: 12,
        width: 12,
        borderRadius: 6,
        marginTop: 3,
        marginRight: 20
    },
    recent:{
        marginLeft: 98,
        marginTop: 32,
        marginBottom: 6,
        fontSize: 10
    }
});