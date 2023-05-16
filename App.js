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
import AppNavigation from "./screens/AppNavigation";

export default function App() {
	return <AppNavigation />;
}

const styles = StyleSheet.create({});
