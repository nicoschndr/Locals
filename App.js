// import {Dimensions, StyleSheet} from "react-native";
// import {createDrawerNavigator} from "@react-navigation/drawer";
// import {NavigationContainer} from "@react-navigation/native";
// import newPost from "./screens/NewPost";
// import Profile from "./screens/Profile";
// import Sidebar from "./components/Sidebar";
// import {Feather} from "@expo/vector-icons";

// const Drawer = createDrawerNavigator();
// const deviceWidth = Dimensions.get("window").width

// export default function App() {
//     return (
//         <NavigationContainer>
//             <Drawer.Navigator screenOptions={{headerShown: false, drawerStyle: {width: deviceWidth*0.8}}} drawerContent={props => <Sidebar {...props}/>}>
//                 <Drawer.Screen
//                     name="Profile"
//                     component={Profile}
//                     options={{
//                         drawerIcon: ({tintColor}) => <Feather name="user" size={16} color={tintColor}/>
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="NewPost"
//                     component={newPost}
//                     options={{
//                         drawerIcon: ({tintColor}) => <Feather name="file-plus" size={16} color={tintColor}/>
//                     }}
//                 />
//             </Drawer.Navigator>
//         </NavigationContainer>
//     );
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

//Import navigation
import "react-native-gesture-handler";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import screen components
import Template from "./screens/Template";
import HomeScreen from "./screens/Home";
import LiveMap from "./screens/LiveMap";
import Settings from "./screens/Settings";
import NewPost from "./screens/NewPost";
import Login from "./screens/Auth/Login";
import Register from "./screens/Auth/Register";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Tab.Navigator
				screenOptions={({ route }) => ({
					tabBarIcon: ({ focused, color, size }) => {
						let iconName;
						//HOME ICON
						if (route.name === "Home") {
							iconName = focused ? "home" : "home-outline";
						}
						//NEW POST ICON
						if (route.name === "Register") {
							iconName = focused ? "create" : "create-outline";
						}
						//LIVE MAP ICON
						if (route.name === "Login") {
							iconName = focused ? "log-in" : "log-in-outline";
						}
						//SETTINGS ICON
						if (route.name === "Settings") {
							iconName = focused ? "settings" : "settings-outline";
						}

						// You can return any component that you like here!
						return (
							<Ionicons
								name={iconName}
								size={size}
								color={color}
								style={{ marginTop: focused ? -15 : 0 }}
							/>
						);
					},
					tabBarLabelStyle: {
						fontSize: 12,
					},
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
				<Tab.Screen name="Home" component={Template} />
				<Tab.Screen name="Register" component={Register} />
				{/* <Tab.Screen name="LiveMap" component={LiveMap} /> */}
				<Tab.Screen name="Login" component={Login} />
				<Tab.Screen name="Settings" component={Settings} />
			</Tab.Navigator>
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({});
