import React, { useState, useEffect, useMemo, useContext } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	TextInput,
	StyleSheet,
	Image,
	RefreshControl,
	StatusBar,
} from "react-native";
import { firestore } from "../../firebase";

import LocalsEventCard from "../../components/LocalsEventCard";
import { Ionicons } from "@expo/vector-icons";

import { AppleCard } from "react-native-apple-card-views";
import AppleHeader from "react-native-apple-header";
import { Divider, SocialIcon } from "react-native-elements";
import FirestoreContext from "../../context/FirestoreContext";
import { set } from "react-native-reanimated";

/**
 * Renders the categories page with the provided props.
 * @param navigation The navigation object for navigating between screens.
 * @param route An object representing the current route information provided by the React Navigation library or similar
 * navigation framework.
 * @returns {JSX.Element} The rendered TabProfileIcon component.
 * @constructor
 */
const Categories = ({ navigation, route }) => {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");

	/**
	 * True if the page is resetting.
	 */
	const [refreshing, setRefreshing] = useState(false);
	const [showSearch, setShowSearch] = useState(false);

	/**
	 * the filtered events.
	 */
	const [activeEvents, setActiveEvents] = useState([]);
	const [categories, setCategories] = useState([]);
	const [events, setEvents] = useState([]);
	const [fullStorage, setFullStorage] = useState(false);

	/**
	 * The category that was delivered as payload of the route.
	 */
	const { category } = route.params;

	const getEvents = () => {
		firestore
			.collection("events")
			.where("category", "==", category)
			.orderBy("date", "asc")
			.onSnapshot((snapshot) => {
				const events = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				console.log(events); // Add this line
				setEvents(events);
			});
	};

	useEffect(() => {
		getEvents();
		checkTrafficAvailability();
	}, []); //

	/**
	 * Sets refreshing true until the events are updated.
	 */
	const handleRefresh = () => {
		setRefreshing(true);
		getEvents();
		setRefreshing(false);
	};

	/**
	 * Used to configure the formatting options for displaying a date.
	 */
	const options = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	/**
	 * Used to configure the formatting options for displaying a short date.
	 */
	const shortDate = {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	};

	/**
	 * represents today's date.
	 */
	const today = new Date().toLocaleDateString("de-DE", options);

	const checkTrafficAvailability = async () => {
		try {
			// Verwende die Firebase Storage API, um Informationen über den verbleibenden Traffic abzurufen
			const storageRef = firebase.storage().ref();

			// Rufe die Nutzungsinformationen des Storage ab
			const { usage } = await storageRef.child("/").getMetadata();

			// Überprüfe, ob noch ausreichend Traffic vorhanden ist
			const remainingTraffic = usage.limit - usage.size;
			const threshold = 100000; // Schwellenwert für verbleibenden Traffic

			if (remainingTraffic < threshold) {
				setFullStorage(true);
			}

			return remainingTraffic > threshold;
		} catch (error) {
			console.error("Error checking traffic availability:", error);
			return false;
		}
	};

	/**
	 * renders the Categories page.
	 */
	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			{/* <View style={styles.header}>
				<Image source={require("../../assets/Logo.png")} style={styles.logo} />

				</View>
			</View> */}
			<View style={styles.header}>
				{/* <Image source={require("../../assets/Logo.png")} style={styles.logo} /> */}

				<View
					style={{
						alignItems: "center",
						flexDirection: "row",
						justifyContent: "space-between",
						alignSelf: "center",
						right: 10,
					}}
				>
					<TouchableOpacity
						style={styles.postButton}
						onPress={() => navigation.goBack()}
					>
						<Ionicons name="chevron-back" size={28} color="black" />
					</TouchableOpacity>
					<AppleHeader
						largeTitle={category}
						dateTitle={today}
						onPress={() => navigation.navigate("Home")}
						imageSource={0}
					/>
				</View>
			</View>

			{/* <Divider
				style={{
					backgroundColor: "black",
					height: StyleSheet.hairlineWidth,
				}}
			/> */}
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						// Android offset for RefreshControl
						progressViewOffset={10}
					/>
				}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
			>
				<ScrollView
					contentContainerStyle={{
						margin: 24,
						marginTop: 12,
					}}
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
				>
					{events.map((event) => (
						<LocalsEventCard
							key={event.id}
							title={event.title}
							date={event.date
								?.toDate()
								?.toLocaleDateString("de-DE", shortDate)}
							location={event.address}
							image={
								event.imageUrl
							}
							category={event.title}
							onPress={() => navigation.navigate("EventDetails", { event })}
							style={{ marginRight: 24, marginBottom: 24 }}
							small={false}
							slim={false}
						/>
					))}
				</ScrollView>
			</ScrollView>
		</View>
	);
};

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginBottom: 85,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 58,
		marginHorizontal: 8,
	},
	searchInput: {
		height: 40,
		width: "100%",
		borderColor: "#000",
		borderWidth: 1,
		paddingLeft: 10,
		borderRadius: 30,
		backgroundColor: "#fff",
		marginBottom: 12,
	},
	postButton: {
		marginLeft: 10,
	},
	searchButton: {
		marginLeft: 10,
	},
	logo: {
		height: 40,
		// adjust styling for logo
		width: 100,
		resizeMode: "contain",
		left: 10,
	},
});

export default Categories;
