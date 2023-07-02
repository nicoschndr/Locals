import React, {useEffect, useState} from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {Ionicons} from "@expo/vector-icons";

// Import screen components
import HomeScreen from "./appScreens/Home";
import LiveMap from "./appScreens/LiveMap";
import Settings from "./appScreens/Settings";
import PostEvent from "./appScreens/PostEvent";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Profile from "./appScreens/Profile";
import FriendList from "./appScreens/FriendList";
import Chat from "./appScreens/Chat";
import EventDetails from "./appScreens/EventDetails";
import EditPost from "./appScreens/EditPost";
import Follower from "./appScreens/Follower";
import Chatbot from "./appScreens/Chatbot";
import DrawerFriendList from "../components/DrawerFriendListIcon";

import {auth} from "../firebase";
import {Dimensions, Text, View} from "react-native";
import {createDrawerNavigator, DrawerItem} from "@react-navigation/drawer";
import Sidebar from "../components/Sidebar";
import {HeaderBackButton} from "@react-navigation/stack";
import Following from "./appScreens/Following";
import follower from "./appScreens/Follower";
import {Badge} from "react-native-elements";
import TabProfileIcon from "../components/TabProfileIcon";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const deviceWidth = Dimensions.get("window").width;

function FriendStackNavigator() {
	return (
		<Stack.Navigator
			initialRouteName="FriendList"
			screenOptions={{ headerShown: false }}
		>
			<Stack.Screen name="Friends" component={FriendList} />
			<Stack.Screen
				name="Chat"
				options={{ headerShown: true }}
				component={Chat}
			/>
		</Stack.Navigator>
	);
}

const MainStackNavigator = () => {
	return (
		<Stack.Navigator
			initialRouteName="Home"
			screenOptions={{ headerShown: false }}
		>
			<Stack.Screen name="Start" component={HomeScreen} />
			<Stack.Screen
				name="Chat"
				component={Chat}
				options={{ headerShown: true }}
			/>
			<Stack.Screen name="Chatbot" component={Chatbot} />
			<Stack.Screen name="Profile" component={Profile} />
			<Stack.Screen name="Follower" component={Follower} />
			<Stack.Screen name="Following" component={Following} />
			<Stack.Screen name="PostEvent" component={PostEvent} />
			<Stack.Screen name="EventDetails" component={EventDetails} />
			<Stack.Screen name="EditPost" component={EditPost} />
		</Stack.Navigator>
	);
};

function ProfileDrawerScreen() {
	return (
		<Drawer.Navigator
			initialRouteName="Profile"
			screenOptions={{
				headerShown: false,
				drawerStyle: { width: deviceWidth * 0.5 },
				swipeEdgeWidth: 0,
				drawerPosition: "right",
			}}
			drawerContent={(props) => <Sidebar {...props} />}
			// open drawer on right side
		>
			<Drawer.Screen
				options={{ unmountOnBlur: true }}
				name="Profile"
				component={Profile}
			/>
			<Drawer.Screen
				name="FriendList"
				component={FriendStackNavigator}
                options={{headerShown: true, unmountOnBlur: true,
                    drawerLabel: () => <DrawerFriendList />
                }}
			/>
			<Drawer.Screen name="EventDetails" component={EventDetails} />
			<Drawer.Screen name="EditPost" component={EditPost} />
			<Drawer.Screen name="Settings" component={Settings} />
			<Drawer.Screen
				options={{
					drawerItemStyle: { display: "none" },
					unmountOnBlur: true,
				}}
				name="Follower"
				component={Follower}
			/>
			<Drawer.Screen
				options={{
					drawerItemStyle: { display: "none" },
					unmountOnBlur: true,
				}}
				name="Following"
				component={Following}
			/>
		</Drawer.Navigator>
	);
}

function AppNavigation() {
	const [user, setUser] = useState(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			setUser(user);
			setIsReady(true);
		});

		return () => unsubscribe();
	}, []);

	if (!isReady) {
		return null; // Warte auf den Abschluss der Authentifizierungsprüfung
	}

	return (
		<NavigationContainer>
			{user ? ( // Benutzer angemeldet
				<Tab.Navigator
					screenOptions={({ route }) => ({
						tabBarIcon: ({ focused, color, size }) => {
							let iconName;
							// HOME ICON
							if (route.name === "Home") {
								iconName = focused ? "home" : "home-outline";
							}
							// NEW POST ICON
							if (route.name === "PostEvent") {
								iconName = focused ? "create" : "create-outline";
							}
							// LIVE MAP ICON
							if (route.name === "Map") {
								iconName = focused ? "map" : "map-outline";
							}
							// PROFILE ICON
							if (route.name === "Me") {
								iconName = focused ? "person" : "person-outline";
							}
							// FRIENDLIST ICON
							if (route.name === "FriendList") {
								iconName = focused ? "people" : "people-outline";
							}
							// SETTINGS ICON
							if (route.name === "Settings") {
								iconName = focused ? "settings" : "settings-outline";
							}

							return <Ionicons name={iconName} size={size} color={color} />;
						},
						tabBarLabelStyle: {
							fontSize: 12,
						},
						tabBarActiveTintColor: "#ec404b",
						tabBarInactiveTintColor: "#734e61",
						headerShown: false,
						tabBarStyle: {
							backgroundColor: "transparent",
							borderTopWidth: 0,
							position: "absolute",
							bottom: 0,
							height: 80,
						},
					})}
				>
					<Tab.Screen
						options={{ unmountOnBlur: true }}
						name="Home"
						component={MainStackNavigator}
					/>
					<Tab.Screen name="Map" component={LiveMap} />
					<Tab.Screen
						options={{ unmountOnBlur: true, tabBarLabel: () => <TabProfileIcon /> }}
						name="Me"
						component={ProfileDrawerScreen}
					/>
				</Tab.Navigator>
			) : (
				<Stack.Navigator>
					<Stack.Screen
						name="Auth"
						component={AuthScreen}
						options={{ headerShown: false }}
					/>
				</Stack.Navigator>
			)}
		</NavigationContainer>
	);
}

function AuthScreen() {
	return (
		<Stack.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {},
				tabBarLabelStyle: {
					fontSize: 12,
				},
				tabBarActiveTintColor: "#ec404b",
				inactiveTintColor: "gray",
				headerShown: false,
				tabBarStyle: [
					{
						display: "flex",
						paddingTop: 5,
					},
					null,
				],
			})}
		>
			<Stack.Screen name="Login" component={Login} />
			<Stack.Screen name="Register" component={Register} />
		</Stack.Navigator>
	);
}

export default AppNavigation;
