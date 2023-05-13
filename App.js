import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Template from "./screens/Template";
import Profile from "./screens/Profile";

export default function App() {
	return (
		<View style={styles.container}>
			<StatusBar style="auto" />
			<Profile />
		</View>
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
