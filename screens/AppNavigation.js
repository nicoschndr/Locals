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
import {auth} from "../firebase";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
									style={{ marginTop: focused ? -15 : 0 }}
								/>
							);
						},
						tabBarLabelStyle: {
							fontSize: 12,
						},
						activeTintColor: "#ec404b",
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
					<Tab.Screen name="Home" component={HomeScreen} />
					<Tab.Screen name="NewPost" component={NewPost} />
					<Tab.Screen name="LiveMap" component={LiveMap} />
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
				tabBarIcon: ({ focused, color, size }) => {
					// ...TabBar Icon-Code...
				},
				tabBarLabelStyle: {
					fontSize: 12,
				},
				activeTintColor: "#ec404b",
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
			<Tab.Screen name="Login" component={Login} />
			<Tab.Screen name="Register" component={Register} />
		</Tab.Navigator>
	);
}

export default AppNavigation;
