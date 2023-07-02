import {
	View,
	Text,
	Modal,
	StyleSheet,
	Image,
	Actionsheet,
	ActionSheetIOS,
	Alert,
	TouchableOpacity,
	Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import LocalsButton from "../../components/LocalsButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { auth, firebase, firestore } from "../../firebase";

const EventDetails = ({ route, navigation }) => {
	const { event } = route.params;
	const { showModal, setShowModal } = useState(false);
	const [user, setUser] = useState({});

	//TODO: attend to event from `LiveMap.jsx`

	const deleteEvent = () => {
		Alert.alert(
			"Delete Event",
			"Are you sure you want to delete this event?",
			[
				{
					text: "Cancel",
					onPress: () => console.log("Cancel Pressed"),
					style: "cancel",
				},
				{
					text: "OK",
					onPress: () => {
						firestore
							.collection("events")
							.doc(event.id)
							.delete()
							.then(() => {
								alert("Event successfully deleted!");
								setTimeout(() => {
									navigation.navigate("Profile");
								}, 1000);
							})
							.catch((error) => {
								alert("Error removing event: ", error);
							});
					},
				},
			],
			{ cancelable: false }
		);
	};

	const getUser = async () => {
		const userRef = await firestore.collection("users").doc(event.userId).get();
		setUser(userRef.data());
	};

	useEffect(() => {
		getUser();
	}, []);

	// get current logged in user
	const currentUser = auth.currentUser;

	const showActionSheet = () => {
		const options = ["Edit", "Delete", "Cancel"];
		const destructiveButtonIndex = 1;
		const cancelButtonIndex = 2;

		ActionSheetIOS.showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				destructiveButtonIndex,
			},
			(buttonIndex) => {
				if (buttonIndex === 0) {
					navigation.navigate("EditPost", { event });
				} else if (buttonIndex === 1) {
					deleteEvent();
				}
			}
		);
	};

	// navigate to google maps with lat lng from event address
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

	return (
		<ScrollView style={{ height: "100%", marginBottom: 85 }}>
			<Image
				placeholder="Event Image"
				source={{
					uri:
						// event.imageUrl ||
						"https://source.unsplash.com/random/?" + event.title,
				}}
				style={{ width: "100%", height: 400 }}
			/>
			<Ionicons
				name="chevron-back"
				size={24}
				color="white"
				style={{ position: "absolute", top: 50, left: 20 }}
				onPress={() => navigation.goBack()}
			/>
			{event.userId === currentUser.uid && (
				<Ionicons
					name="menu"
					size={24}
					color="white"
					style={{ position: "absolute", top: 50, right: 20 }}
					onPress={() => showActionSheet()}
				/>
			)}
			<View style={{ padding: 20 }}>
				<View style={styles.titleContainer}>
					<View style={{ flex: 1 }}>
						<Text style={styles.date}>03.01.2024</Text>
						<Text style={styles.title}>{event.title}</Text>
					</View>
					{user && (
						<Image
							source={{
								uri:
									user.imageUrl ||
									"https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png",
							}}
							style={{ width: 42, height: 42, borderRadius: 50 }}
						/>
					)}
				</View>
			</View>
			<View style={styles.infoContainer}>
				{event.category && (
					<View style={{ alignItems: "center" }}>
						<Ionicons name="list" size={32} color="grey" />
						<Text style={styles.item}>{event.category}</Text>
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
				<Text style={{ color: "grey" }}>Comments will be here</Text>
			</View>
		</ScrollView>
	);
};

export default EventDetails;

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22,
	},
	commentsContainer: {
		padding: 20,
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
