import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Import screen components
import Template from "./appScreens/Template";
import HomeScreen from "./appScreens/Home";
import LiveMap from "./appScreens/LiveMap";
import Settings from "./appScreens/Settings";
import NewPost from "./appScreens/NewPost";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Profile from "./appScreens/Profile";
import FriendList from "./appScreens/FriendList";
import Chat from "./appScreens/Chat";
import EventDetails from "./appScreens/EventDetails";
import { auth } from "../firebase";
import { Dimensions } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Sidebar from "../components/Sidebar";
import { HeaderBackButton } from "@react-navigation/stack";

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
			<Stack.Screen name="Profile" component={Profile} />
		</Stack.Navigator>
	);
}

function ProfileDrawerScreen() {
	return (
		<Drawer.Navigator
			initialRouteName="Profile"
			screenOptions={{
				headerShown: false,
				drawerStyle: { width: deviceWidth * 0.8 },
				swipeEdgeWidth: 0,
			}}
			drawerContent={(props) => <Sidebar {...props} />}
		>
			<Drawer.Screen name="Profile" component={Profile} />
			<Drawer.Screen
				name="FriendList"
				component={FriendStackNavigator}
				options={{ headerShown: true }}
			/>
			<Drawer.Screen name="EventDetails" component={EventDetails} />
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
							if (route.name === "NewPost") {
								iconName = focused ? "create" : "create-outline";
							}
							// LIVE MAP ICON
							if (route.name === "LiveMap") {
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

							return (
								<Ionicons
									name={iconName}
									size={size}
									color={color}
									style={{
										transform: [{ translateY: focused ? -5 : 0 }],
									}}
								/>
							);
						},
						tabBarLabelStyle: {
							fontSize: 12,
						},
						tabBarActiveTintColor: "#ec404b",
						tabBarInactiveTintColor: "#734e61",
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
					<Tab.Screen name="Home" component={MainStackNavigator} />
					<Tab.Screen name="LiveMap" component={LiveMap} />
					<Tab.Screen name="NewPost" component={NewPost} />
					<Tab.Screen name="Me" component={ProfileDrawerScreen} />
					<Tab.Screen name="Settings" component={Settings} />

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
		<Tab.Navigator
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
			<Tab.Screen name="Login" component={Login} />
			<Tab.Screen name="Register" component={Register} />
		</Tab.Navigator>
	);
}

export default AppNavigation;
