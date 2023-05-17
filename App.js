import {createDrawerNavigator} from "@react-navigation/drawer";
import {NavigationContainer} from "@react-navigation/native";
import LiveMap from "./screens/appScreens/LiveMap";
import Settings from "./screens/appScreens/Settings";
import NewPost from "./screens/appScreens/NewPost";
import Login from "./screens/Auth/Login";
import Register from "./screens/Auth/Register";
import Profile from "./screens/appScreens/Profile";
import {Dimensions, StyleSheet, Text, View} from "react-native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Feather, Ionicons} from "@expo/vector-icons";
import HomeScreen from "./screens/appScreens/Home";
import React from "react";
import newPost from "./screens/appScreens/NewPost";
import Sidebar from "./components/Sidebar";

const Tab = createBottomTabNavigator();

function TabScreen() {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                    let iconName;
                    // HOME ICON
                    if (route.name === "Home") {
                        iconName = focused ? "home" : "home-outline";
                    }
                    // NEW POST ICON
                    if (route.name === "NewPost") {
                        iconName = focused ? "create" : "create-outline";
                    }
                    // LIVE MAP ICON
                    if (route.name === "LiveMap") {
                        iconName = focused ? "map" : "map-outline";
                    }
                    // LOGIN ICON
                    if (route.name === "Login") {
                        iconName = focused ? "log-in" : "log-in-outline";
                    }
                    // REGISTER ICON
                    if (route.name === "Register") {
                        iconName = focused ? "person-add" : "person-add-outline";
                    }
                    // PROFILE ICON
                    if (route.name === "Profile") {
                        iconName = focused ? "person" : "person-outline";
                    }
                    // SETTINGS ICON
                    if (route.name === "Settings") {
                        iconName = focused ? "settings" : "settings-outline";
                    }

                    // You can return any component that you like here!
                    return (
                        <Ionicons
                            name={iconName}
                            size={size}
                            color={color}
                            style={{marginTop: focused ? -15 : 0}}
                        />
                    );
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
                headerShown: false,
                activeTintColor: "blue",
                inactiveTintColor: "gray",
                tabBarStyle: [
                    {
                        display: "flex",
                        paddingTop: 5,
                    },
                    null,
                ],
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen}/>
            <Tab.Screen name="NewPost" component={NewPost}/>
            <Tab.Screen name="LiveMap" component={LiveMap}/>
            <Tab.Screen name="Login" component={Login}/>
            <Tab.Screen name="Register" component={Register}/>
            <Tab.Screen name="Profile" component={Profile}/>
            <Tab.Screen name="Settings" component={Settings}/>
        </Tab.Navigator>
    )
}

const Drawer = createDrawerNavigator();
const deviceWidth = Dimensions.get('window').width;
export default function App() {
    return (
        <NavigationContainer>
            <Drawer.Navigator initialRouteName='Home' screenOptions={{headerShown: false, drawerStyle: {width: deviceWidth * 0.8}, swipeEdgeWidth: 0}}
                              drawerContent={props => <Sidebar {...props}/>}>
                <Drawer.Screen
                    name="Tab"
                    component={TabScreen}
                    options={{
                        drawerItemStyle: {height:0}
                    }}
                />
                <Drawer.Screen
                    name="Profile"
                    component={Profile}
                    options={{
                        drawerIcon: ({tintColor}) => <Feather name="user" size={16} color={tintColor}/>
                    }}
                />
                <Drawer.Screen
                    name="NewPost"
                    component={newPost}
                    options={{
                        drawerIcon: ({tintColor}) => <Feather name="file-plus" size={16} color={tintColor}/>
                    }}
                />
            </Drawer.Navigator>
        </NavigationContainer>
    )
}

const styles = StyleSheet.create({});
