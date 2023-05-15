import {StyleSheet} from "react-native";
import Profile from "./screens/Profile";
import {NavigationContainer} from "@react-navigation/native";
import newPost from "./screens/NewPost";
import {createDrawerNavigator} from "@react-navigation/drawer";

const Drawer = createDrawerNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Drawer.Navigator screenOptions={{headerShown: false}}>
                <Drawer.Screen
                    name="Profile"
                    component={Profile}
                />
                <Drawer.Screen
                    name="NewPost"
                    component={newPost}
                />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({});
