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

import LocalsEventCard from "../../components/LocalsEventCard";
import { Ionicons } from "@expo/vector-icons";

import { AppleCard } from "react-native-apple-card-views";
import AppleHeader from "react-native-apple-header";
import { Divider, SocialIcon } from "react-native-elements";
import FirestoreContext from "../../context/FirestoreContext";

const HomeScreen = ({ navigation }) => {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [username, setUsername] = useState("");

	const { events } = useContext(FirestoreContext);

	useEffect(() => {
		getUsers();
	}, []);

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

	const handleRefresh = () => {
		setRefreshing(true);
		setRefreshing(false);
	};

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

	const FilteredEvents = filterEvents(events, search);

	const options = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	const shortDate = {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	};

	const today = new Date().toLocaleDateString("de-DE", options);

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

	const topEvents = FilteredEvents
		.sort((a, b) => b.impressions - a.impressions)
		.slice(0, 5);

	const userFriendsEvents = FilteredEvents.filter((event) =>
		users.find(
			(user) =>
				user.username === event.creator &&
				user.friends &&
				Object.keys(user.friends).includes(username)
		)
	);



	userFriendsEvents.slice(0, 5)


	const combinedEvents = [...topEvents, ...userFriendsEvents];

	const uniqueEvents = combinedEvents.reduce((unique, event) => {
		if (!unique.find((e) => e.id === event.id)) {
			unique.push(event);
		}
		return unique;
	}, []);

	let displayedEvents = uniqueEvents.slice(0, 10);

	if (displayedEvents.length < 10) {
		const remainingEvents = FilteredEvents.filter((event) => !uniqueEvents.includes(event));
		displayedEvents = [...displayedEvents, ...remainingEvents.slice(0, 10 - displayedEvents.length)];
	}

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
						marginRight: 16,
						alignItems: "center",
						flexDirection: "row",
						justifyContent: "space-between",
						alignSelf: "center",
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
						<Ionicons
							name="chatbox-ellipses-outline"
							size={28}
							color="black"
						/>
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
			>
				<ScrollView
					contentContainerStyle={{ margin: 24, marginTop: 12 }}
					horizontal
				>
					{displayedEvents.map((event) => (
						<View key={event.id} style={{ marginRight: 24 }}>
							<LocalsEventCard
								title={event.title}
								date={event.date?.toDate()?.toLocaleDateString("de-DE", shortDate)}
								location={event.address}
								category={event.title}
								onPress={() => navigation.navigate("EventDetails", { event })}
								style={{
									position: "relative",
								}}
								slim
							/>
							{userFriendsEvents.includes(event) ? (
								<View style={styles.friendEventMarker}>
									<Ionicons name="people-outline" size={30} color="white" />
								</View>
							) : (
								<View style={[styles.friendEventMarker, { display: "flex", flexDirection: "row", alignItems: "center" }]}>
									<Ionicons name="flame-outline" size={30} color="white" />
									<Text style={{ color: "white", marginLeft: 4, fontWeight: "bold" }}>
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
						{FilteredEvents.map((event) => (
							<LocalsEventCard
								key={event.id}
								title={event.category}
								category={event.category}
								onPress={() => navigation.navigate("Category", { event })}
								style={{ marginRight: 24 }}
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
						{events.map((event) => (
							<LocalsEventCard
								key={event.id}
								title={event.title}
								date={event.date
									?.toDate()
									?.toLocaleDateString("de-DE", shortDate)}
								location={event.address}
								// image={event.imageUrl}
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
	friendEventMarker:{
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
	}
});

export default HomeScreen;
