import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const EventDetails = ({ route, navigation }) => {
	const { event } = route.params;

	return (
		<View
			style={{ justifyContent: "center", alignItems: "center", height: "100%" }}
		>
			<Ionicons
				name="arrow-back"
				size={24}
				color="black"
				style={{ position: "absolute", top: 50, left: 20 }}
				onPress={() => navigation.goBack()}
			/>
			<View>
				<Text>EventDetails</Text>
				<Text>{event.id}</Text>
			</View>
		</View>
	);
};

export default EventDetails;
