import React, { useEffect, useState } from "react";
import {
	Image,
	Linking,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firestore } from "../firebase";

/**
 * This interface defines the props (properties) accepted by the LocalsEventDetails component.
 */
interface LocalsEventDetailsProps {
	event?: any;
	onBackPress: () => void;
}

//TODO: attend to event from `LiveMap.jsx`
//TODO: like event from `LiveMap.jsx`
//TODO: comment to event from `LiveMap.jsx`

/**
 * Renders a LocalsEventDetails component with the provided props.
 * @param event The event details object.
 * @param onBackPress The function to be called when the back button is pressed.
 * @constructor
 */
const LocalsEventDetails: React.FC<LocalsEventDetailsProps> = ({
	event,
	onBackPress,
}) => {

	/**
	 * This state variable represents the User.
	 */
	const [user, setUser] = useState({});

	/**
	 * The placeholder URL for the event image. It is generated based on the event title.
	 */
	const PLACEHOLDER = "https://source.unsplash.com/random/?" + event.title;

	/**
	 * This function opens the map with the location of the event.
	 */
	const openMaps = () => {
		const scheme = Platform.select({
			ios: "maps:0,0?q=",
			android: "geo:0,0?q=",
		});
		const latLng = `${event.latitude},${event.longitude}`;
		const label = event.address;
		const url = Platform.select({
			ios: `${scheme}${label}@${latLng}`,
			android: `${scheme}${latLng}(${label})`,
		});

		Linking.openURL(url);
	};

	/**
	 * Retrieves the user document from the "users" collection in Firestore using the event's userId.
	 * Sets the retrieved user data using the setUser function.
	 */
	const getUser = async () => {
		const userRef = await firestore.collection("users").doc(event.userId).get();
		setUser(userRef.data());
	};

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {
		getUser();
	}, []);

	/**
	 * Renders the LocalsEventDetails component.
	 */
	return (
		<ScrollView style={{ height: "100%" }}>
			<Image
				/* 				source={{ uri: event?.imageUrl || PLACEHOLDER }} */
				source={{ uri: event.imageUrl }}
				style={{ width: "100%", height: 400 }}
			/>
			<Ionicons
				name="chevron-down"
				size={24}
				color="white"
				style={{ position: "absolute", top: 50, left: 20 }}
				onPress={onBackPress}
			/>
			<View style={{ padding: 20 }}>
				<View style={styles.titleContainer}>
					<View style={{ flex: 1 }}>
						<Text style={styles.date}>03.01.2024</Text>
						<Text style={styles.title}>{event?.title}</Text>
					</View>
					<Image
						source={{
							uri: "https://source.unsplash.com/random/?" + event.title,
						}}
						style={{ width: 42, height: 42, borderRadius: 50 }}
					/>
				</View>
			</View>
			<View style={styles.infoContainer}>
				{selectedEvent.isAttending ? (
					<LocalsButton title={"Nicht teilnehmen"} onPress={toggleAttendance} />
				) : (
					<LocalsButton title={"Teilnehmen"} onPress={toggleAttendance} />
				)}

				{event.category && (
					<View style={{ alignItems: "center" }}>
						<Ionicons name="list" size={32} color="grey" />
						<Text style={styles.item}>{event.category[1]}</Text>
					</View>
				)}
				<TouchableOpacity
					style={{ alignItems: "center" }}
					onPress={() => openMaps()}
				>
					<Ionicons name="compass" size={32} color="grey" />
					<Text style={styles.item} numberOfLines={2}>
						{event.address}
					</Text>
				</TouchableOpacity>
				{event.groupSize && (
					<View style={{ alignItems: "center" }}>
						<Ionicons name="people" size={32} color="grey" />
						<Text style={styles.item}>{event.groupSize}</Text>
					</View>
				)}
				{/* {event.advertised && (
                    <View style={{ alignItems: "center" }}>
                        <Ionicons
							name="megaphone"
                            size={32}
                            color="grey"
                        />
                        <Text style={styles.item}>advertised</Text>
                    </View>
                )} */}
				<View style={{ alignItems: "center" }}>
					<Ionicons name="person-circle" size={32} color="grey" />
					<Text style={styles.item}>{event.creator}</Text>
				</View>
			</View>
			{event.description && (
				<View style={{ padding: 20 }}>
					<Text style={styles.header}>About</Text>
					<Text style={{ color: "grey" }}>{event.description}</Text>
				</View>
			)}
			<View style={styles.commentsContainer}>
				<Text style={styles.header}>Comments</Text>
				{/* TODO: add comments from `LiveMap.jsx` */}
				<Text style={{ color: "grey" }}>Comments will be here</Text>
			</View>
		</ScrollView>
	);
};

/**
 * Creates a StyleSheet object containing style definitions for component.
 */
const styles = StyleSheet.create({
	date: {
		fontSize: 16,
	},
	description: {
		fontSize: 16,
		marginBottom: 20,
	},
	addressContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	addressTitle: {
		fontSize: 16,
		fontWeight: "bold",
	},
	addressText: {
		fontSize: 16,
	},

	/////
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22,
	},
	commentsContainer: {
		padding: 20,
		marginBottom: 40,
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
	},
	item: {
		maxWidth: 100,
		textAlign: "center",
		marginTop: 5,
		fontSize: 12,
	},
	infoContainer: {
		paddingHorizontal: 24,
		paddingVertical: 10,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
	},
	textStyle: {
		fontWeight: "bold",
		textAlign: "center",
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
	},
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
});

export default LocalsEventDetails;
