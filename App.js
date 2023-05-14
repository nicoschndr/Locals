import { StyleSheet} from "react-native";
import Profile from "./screens/Profile";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import newPost from "./screens/NewPost";

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{headerShown: false}}>
				<Stack.Screen
					name="Profile"
					component={Profile}
				/>
				<Stack.Screen
					name="NewPost"
					component={newPost}
				/>
			</Stack.Navigator>
		</NavigationContainer>

	);
}

const styles = StyleSheet.create({

});
