import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Template from "./screens/Template";

export default function App() {
	return (
		<View style={styles.container}>
			<StatusBar style="auto" />
			<Text>Hola!</Text>
			<Template />
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
