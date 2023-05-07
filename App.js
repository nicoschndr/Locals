import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';


//Import navigation
import 'react-native-gesture-handler';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


// Import screen components
import Template from "./screens/Template";
import HomeScreen from './screens/Home';
import LiveMap from './screens/LiveMap';
import Settings from "./screens/Settings";
import NewPost from "./screens/NewPost";

const Tab = createBottomTabNavigator();




export default function App() {
	return (
		<NavigationContainer>
			<Tab.Navigator
				screenOptions={({ route }) => ({
					tabBarIcon: ({ focused, color, size }) => {
						let iconName;
						//HOME ICON
						if (route.name === 'Home') {
							iconName = focused ? 'home' : 'home-outline';
						}
						//TEMPLATE ICON
						if (route.name === 'Template') {
							iconName = focused ? 'reader' : 'reader-outline';
						}
						//NEW POST ICON
					 	if (route.name === 'NewPost') {
							iconName = focused ? 'add' : 'add-outline';
						}
					 	//LIVE MAP ICON
						 if (route.name === 'LiveMap') {
							iconName = focused ? 'map' : 'map-outline';
						}
						//SETTINGS ICON
						 if (route.name === 'Settings') {
							iconName = focused ? 'settings' : 'settings-outline';
						}

						// You can return any component that you like here!
						return <Ionicons name={iconName} size={size} color={color} style={{ marginTop: focused ? -15 : 0 }} />;
					},
					tabBarLabelStyle: {
						fontSize: 12,
					},
					activeTintColor: 'blue',
					inactiveTintColor: 'gray',
					"tabBarStyle": [
						{
							"display": "flex",
							"paddingTop": 5,
						},
						null
					]
				})}

			>
				<Tab.Screen name="Home" component={HomeScreen} />
				<Tab.Screen name="Template" component={Template} />
				<Tab.Screen name="NewPost" component={NewPost} />
				<Tab.Screen name="LiveMap" component={LiveMap} />
				<Tab.Screen name="Settings" component={Settings} />
			</Tab.Navigator>
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
