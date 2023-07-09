import React, { useState, useEffect, useContext } from "react";
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
import { auth, firestore } from "../../firebase";
import * as Location from "expo-location";

import LocalsEventCard from "../../components/LocalsEventCard";
import { Ionicons } from "@expo/vector-icons";

import { AppleCard } from "react-native-apple-card-views";
import AppleHeader from "react-native-apple-header";
import { Divider, SocialIcon } from "react-native-elements";
import FirestoreContext from "../../context/FirestoreContext";
import { set } from "react-native-reanimated";

/**
 *
 * Renders the Profile page with the provided props.
 * @param An object representing the current route information provided by the React Navigation library or similar
 * navigation framework.
 * @returns {JSX.Element} A JSX.Element representing the Profile page.
 * @constructor
 */

const HomeScreen = ({ navigation }) => {
	/**
	 * @typedef {Object} State - The state object for the HomeScreen component.
	 * @property {Array} users - An array of users.
	 * @property {String} search - The search string.
	 * @property {Boolean} refreshing - A boolean indicating whether the screen is refreshing.
	 * @property {Boolean} showSearch - A boolean indicating whether the search bar is shown.
	 * @property {String} username - The username of the current user.
	 * @property {Array} categories - An array of categories.
	 * @property {Array} nearbyEvents - An array of nearby events.
	 * @property {Number} radius - The radius for the nearby events.
	 * @property {Object} location - The location of the current user.
	 * @property {Boolean} fullStorage - A boolean indicating whether the storage is full.
	 */

	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [username, setUsername] = useState("");
	const [categories, setCategories] = useState([]);
	const [nearbyEvents, setNearbyEvents] = useState([]);
	const [radius, setRadius] = useState(20);
	const [location, setLocation] = useState(null);
	const [fullStorage, setFullStorage] = useState(false);

	/**
	 * @typedef {Object} Effect - The effect object for the HomeScreen component.
	 * @property {Function} filterEventsByRadius - A function that filters the events by radius.
	 * @property {Function} getDistanceFromLatLonInKm - A function that calculates the distance between two points.
	 */
	useEffect(() => {
		const filteredEvents = filterEventsByRadius(events, radius);
		console.log(filteredEvents);
		setNearbyEvents(filteredEvents);
	}, [events, radius, location]);

	/**
	 * Filters the events by radius.
	 * @param {Array} events - An array of events.
	 * @param {Number} radius - The radius for the nearby events.
	 * @returns {Array} An array of events.
	 * @constructor
	 * @function
	 * @name filterEventsByRadius
	 * @description Filters the events by radius.
	 */
	const filterEventsByRadius = (events, radius) => {
		if (!location) return events;

		const { latitude, longitude } = location.coords;

		return events.filter((event) => {
			const eventDistance = getDistanceFromLatLonInKm(
				latitude,
				longitude,
				event.latitude,
				event.longitude
			);
			return eventDistance <= radius;
		});
	};

	/**
	 * Calculates the distance between two points.
	 * @param {Number} lat1 - The latitude of the first point.
	 * @param {Number} lon1 - The longitude of the first point.
	 * @param {Number} lat2 - The latitude of the second point.
	 * @param {Number} lon2 - The longitude of the second point.
	 * @returns {Number} The distance between the two points.
	 * @constructor
	 * @function
	 * @name getDistanceFromLatLonInKm
	 * @description Calculates the distance between two points.
	 *
	 * @example
	 * // returns 0.5
	 * getDistanceFromLatLonInKm(52.516272, 13.377722, 52.516272, 13.377722)
	 */

	const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
		const R = 6371; // Radius der Erde in Kilometern
		const dLat = deg2rad(lat2 - lat1); // deg2rad unten
		const dLon = deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) *
				Math.cos(deg2rad(lat2)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const d = R * c; // Entfernung in km
		return d;
	};
	const deg2rad = (deg) => {
		return deg * (Math.PI / 180);
	};

	/**
	 * @typedef {Object} Effect - The effect object for the HomeScreen component.
	 * @property {Function} getLocation - A function that gets the location of the current user.
	 * @property {Function} getUsers - A function that gets the users.
	 * @property {Function} checkTrafficAvailability - A function that checks the traffic availability.
	 */

	useEffect(() => {
		const getLocation = async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					console.log("Permission to access location was denied");
					return;
				}

				const currentLocation = await Location.getCurrentPositionAsync({});
				setLocation(currentLocation);
			} catch (error) {
				console.error("Error getting current location:", error);
			}
		};
		checkTrafficAvailability();
		getLocation();
	}, []);

	/**
	 * @typedef {Object} Context - The context object for the HomeScreen component.
	 * @property {Array} events - An array of events.
	 */
	const { events } = useContext(FirestoreContext);

	/**
	 * @typedef {Object} Context - The context object for the HomeScreen component.
	 * @property {Function} setEvents - A function that sets the events.
	 */
	const { setEvents } = useContext(FirestoreContext);

	/**
	 * @typedef {Object} Effect - The effect object for the HomeScreen component.
	 * @property {Function} filterEventsByCategory - A function that filters the events by category.
	 * @property {Function} getUsers - A function that gets the users.
	 */

	useEffect(() => {
		filterEventsByCategory(events);
		getUsers();
	}, []);

	/**
	 * Filters the events by category.
	 * @param {Array} events - An array of events.
	 * @returns {Array} An array of events.
	 * @constructor
	 * @function
	 * @name filterEventsByCategory
	 * @description Filters the events by category.
	 *
	 * @example
	 * // returns [{id: "1", category: "Sport"}, {id: "2", category: "Sport"}]
	 * filterEventsByCategory([{id: "1", category: "Sport"}, {id: "2", category: "Sport"}, {id: "3", category: "Kultur"}])
	 */

	const filterEventsByCategory = () => {
		firestore
			.collection("events")
			.where("date", ">=", new Date())
			.orderBy("date", "asc")
			.onSnapshot((snapshot) => {
				const categories = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				const categoriesMap = {};
				categories.forEach((event) => {
					const { category } = event;
					categoriesMap[category] = event;
				});
				const filteredCategories = Object.values(categoriesMap);
				setCategories(filteredCategories);
			});
	};

	/**
	 * Gets the users.
	 * @returns {Array} An array of users.
	 * @constructor
	 * @function
	 * @name getUsers
	 * @description Gets the users.
	 */

	function getUsers() {
		firestore
			.collection("users")
			.get()
			.then((snapshot) => {
				const users = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setUsers(users);
			});
	}

	/**
	 * updates the events on refresh.
	 * @returns {Array} An array of events.
	 * @constructor
	 * @function
	 * @name handleRefresh
	 * @description updates the events on refresh.
	 */

	const handleRefresh = () => {
		setRefreshing(true);
		updateEvents();
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	};

	/**
	 * @typedef {Object} Effect - The effect object for the HomeScreen component.
	 * @property {Function} filterEvents - A function that filters the events.
	 * @property {Function} options - A function that sets the options.
	 * @property {Function} shortDate - A function that sets the shortDate.
	 * @property {Function} today - A function that sets the today.
	 */

	const filterEvents = (events, search) => {
		return events.filter((event) => {
			const date = event.date?.toDate()?.toLocaleDateString();
			const byMonth = event.date?.toDate()?.toLocaleDateString("de-DE", {
				month: "long",
			});
			const byTitleLowerCase =
				`${event.title},${event.address},${date},${event.category},${byMonth}`.toLowerCase();
			const searchByTitleLowerCase = search.toLowerCase();

			return byTitleLowerCase.includes(searchByTitleLowerCase);
		});
	};

	/**
	 * @typedef {Object} Effect - The effect object for the HomeScreen component.
	 * @property {Function} FilteredEvents - A function that filters the events.
	 */
	const FilteredEvents = filterEvents(events, search);

	/**
	 * @property {Function} options - A function that sets the options.
	 */
	const options = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	/**
	 * @property {Function} shortDate - A function that sets the shortDate.
	 */
	const shortDate = {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	};

	/**
	 * @property {Function} today - A function that sets the today.
	 * @description Gets the current date.
	 */
	const today = new Date().toLocaleDateString("de-DE", options);

	/**
	 * @typedef {Object} Effect - The effect object for the HomeScreen component.
	 * @property {Function} useEffect - A function that sets the useEffect.
	 * @property {Function} unsubscribe - A function that sets the unsubscribe.
	 * @property {Function} auth - A function that sets the auth.
	 * @property {Function} firestore - A function that sets the firestore.
	 * @property {Function} doc - A function that sets the doc.
	 * @property {Function} setUsername - A function that sets the setUsername.
	 * @property {Function} userData - A function that sets the userData.
	 */
	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (user) {
				firestore
					.collection("users")
					.doc(user.uid)
					.get()
					.then((doc) => {
						if (doc.exists) {
							const userData = doc.data();
							setUsername(userData.username);
						}
					})
					.catch((error) => {
						console.log("Fehler beim Abrufen des Benutzernamens:", error);
					});
			} else {
				setUsername("");
			}
		});

		return () => unsubscribe();
	}, []);

	/**
	 * @typedef {Object} Effect - The effect object for the HomeScreen component.
	 */
	const topEvents = FilteredEvents.sort(
		(a, b) => b.impressions - a.impressions
	).slice(0, 5);

	/**
	 * @property {Function} userFriendsEvents - A function that sets the userFriendsEvents.
	 */
	const userFriendsEvents = FilteredEvents.filter((event) =>
		users.find(
			(user) =>
				user.username === event.creator &&
				user.friends &&
				Object.keys(user.friends).includes(username)
		)
	);

	/**
	 * @property {Function} userFriendsEvents - A function that sets the userFriendsEvents.
	 * @description Gets the userFriendsEvents.
	 */
	userFriendsEvents.slice(0, 5);

	const combinedEvents = [...topEvents, ...userFriendsEvents];

	const uniqueEvents = combinedEvents.reduce((unique, event) => {
		if (!unique.find((e) => e.id === event.id)) {
			unique.push(event);
		}
		return unique;
	}, []);

	let displayedEvents = uniqueEvents.slice(0, 10);

	if (displayedEvents.length < 10) {
		const remainingEvents = FilteredEvents.filter(
			(event) => !uniqueEvents.includes(event)
		);
		displayedEvents = [
			...displayedEvents,
			...remainingEvents.slice(0, 10 - displayedEvents.length),
		];
	}

	/**
	 * @property {Function} updateEvents - A function that updates the events.
	 * @description Updates the events.
	 * @returns {Array} An array of events.
	 * @constructor
	 * @function
	 * @name updateEvents
	 */
	const updateEvents = () => {
		firestore
			.collection("events")
			//where date >= today
			.where("date", ">=", new Date())
			.orderBy("date", "asc")
			.onSnapshot((snapshot) => {
				const events = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setEvents(events);
			});
	};

	/**
	 * @property {Function} checkTrafficAvailability - A function that checks the traffic availability.
	 * @description Checks the traffic availability.
	 * @returns {Boolean} A boolean indicating whether the traffic is available.
	 *
	 */
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

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<View style={styles.header}>
				<AppleHeader
					largeTitle="Explore"
					largeTitleFontColor="black"
					borderColor="white"
					dateTitle={today}
				/>
				<View
					style={{
						alignItems: "center",
						flexDirection: "row",
						justifyContent: "space-between",
						alignSelf: "center",
						right: 10,
					}}
				>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						{showSearch ? (
							<TouchableOpacity
								style={styles.searchButton}
								onPress={() => setShowSearch(!showSearch)}
							>
								<Ionicons
									name="close-outline"
									size={28}
									color="black"
									style={{ fontWeight: "bold" }}
								/>
							</TouchableOpacity>
						) : (
							<TouchableOpacity
								style={styles.searchButton}
								onPress={() => setShowSearch(!showSearch)}
							>
								<Ionicons
									name="search-outline"
									size={28}
									color="black"
									style={{ fontWeight: "bold" }}
								/>
							</TouchableOpacity>
						)}
					</View>
					<TouchableOpacity
						style={styles.postButton}
						onPress={() => navigation.navigate("PostEvent")}
					>
						<Ionicons name="add-circle-outline" size={28} color="black" />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.postButton}
						onPress={() => navigation.navigate("Yelling")}
					>
						<Ionicons name="radio-outline" size={28} color="black" />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.postButton}
						onPress={() => navigation.navigate("Chatbot")}
					>
						<Ionicons name="chatbox-ellipses-outline" size={28} color="black" />
					</TouchableOpacity>
				</View>
			</View>

			{showSearch && (
				<View style={{ alignItems: "center", marginHorizontal: 24 }}>
					<TextInput
						style={styles.searchInput}
						value={search}
						placeholder="Search Events"
						onChangeText={setSearch}
						onSubmitEditing={() => setShowSearch(!showSearch)}
					/>
				</View>
			)}
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
			>
				<ScrollView
					contentContainerStyle={{ margin: 24, marginTop: 12 }}
					horizontal
					show={false}
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
				>
					{displayedEvents.map((event) => (
						<View key={event.id} style={{ marginRight: 24 }}>
							<LocalsEventCard
								title={event.title}
								date={event.date
									?.toDate()
									?.toLocaleDateString("de-DE", shortDate)}
								location={event.address}
								category={event.title}
								onPress={() => navigation.navigate("EventDetails", { event })}
								style={{
									position: "relative",
								}}
								image={
									fullStorage
										? event.imageUrl
										: "https://source.unsplash.com/random/?" + event.category
								}
								slim
							/>
							{userFriendsEvents.includes(event) ? (
								<View style={styles.friendEventMarker}>
									<Ionicons name="people-outline" size={30} color="white" />
								</View>
							) : (
								<View
									style={[
										styles.friendEventMarker,
										{
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
										},
									]}
								>
									<Ionicons name="flame-outline" size={30} color="white" />
									<Text
										style={{
											color: "white",
											marginLeft: 4,
											fontWeight: "bold",
										}}
									>
										{event.impressions}
									</Text>
								</View>
							)}
						</View>
					))}
				</ScrollView>

				<View>
					<Text
						style={{
							fontSize: 24,
							fontWeight: "bold",
							marginBottom: 8,
							marginLeft: 24,
						}}
					>
						Kategorien
					</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{
							flexDirection: "row",
							alignItems: "center",
							margin: 24,
						}}
					>
						{categories.map((event) => (
							<LocalsEventCard
								key={event.id}
								title={event.category}
								category={event.category}
								onPress={() =>
									navigation.navigate("Categories", {
										category: event.category,
									})
								}
								style={{ marginRight: 24 }}
								image={
									fullStorage
										? event.imageUrl
										: "https://source.unsplash.com/random/?" + event.category
								}
								small
							/>
						))}
					</ScrollView>

					<Text
						style={{
							fontSize: 24,
							fontWeight: "bold",
							marginBottom: 8,
							marginLeft: 24,
						}}
					>
						In deiner Nähe
					</Text>
					<ScrollView
						contentContainerStyle={{ margin: 24, alignSelf: "center" }}
					>
						{nearbyEvents.map((event) => (
							<LocalsEventCard
								key={event.id}
								title={event.title}
								date={event.date
									?.toDate()
									?.toLocaleDateString("de-DE", shortDate)}
								location={event.address}
								image={
									fullStorage
										? event.imageUrl
										: "https://source.unsplash.com/random/?" + event.category
								}
								category={event.title}
								onPress={() => navigation.navigate("EventDetails", { event })}
								style={{ marginBottom: 24 }}
							/>
						))}
					</ScrollView>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginBottom: 80,
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
		width: 100,
		resizeMode: "contain",
		left: 10,
	},
	friendEventMarker: {
		fontWeight: "bold",
		shadowColor: "rgba(236,64,75,0.2)", // Schattenfarbe
		shadowOffset: {
			width: 0,
			height: 8,
		},
		position: "absolute",
		top: 3,
		right: 3,
		backgroundColor: "#ec404b",
		padding: 4,
		borderRadius: 8,
		shadowOpacity: 1,
		shadowRadius: 2,
		elevation: 2, // Für Android-Schatten
	},
});

export default HomeScreen;
