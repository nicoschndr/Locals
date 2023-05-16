import React from "react";
import {View, Text, StyleSheet, ScrollView, ImageBackground, Image} from "react-native";
import {DrawerItemList} from "@react-navigation/drawer";
import {Ionicons} from "@expo/vector-icons";

const Sidebar = props => (
    <ScrollView>
        <ImageBackground source={require("../assets/backgroundSidebar.png")} style={{paddingTop: 48, padding: 16}}>
            <Image source={require("../assets/Profil_Test.jpg")} style={styles.image}></Image>
            <Text style={styles.name}>Nico Schneider</Text>

            <View style={{flexDirection: "row"}}>
                <Text style={styles.followers}>0 Followers</Text>
                <Ionicons name="md-people" size={16} color="rgba(255,255,255, 0.8)"></Ionicons>
            </View>
        </ImageBackground>

        <View style={styles.container}>
            <DrawerItemList {...props}/>
        </View>
    </ScrollView>
)

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
        marginRight:4
    }
})
