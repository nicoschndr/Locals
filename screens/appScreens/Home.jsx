import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	TextInput,
	StyleSheet,
	Image,
	RefreshControl,
} from "react-native";
import { firestore } from "../../firebase";

import LocalsEventCard from "../../components/LocalsEventCard";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [events, setEvents] = useState([""]);
	const [refreshing, setRefreshing] = useState(false);
	const [showSearch, setShowSearch] = useState(false);

	useEffect(() => {
		getUsers();
		getAllEvents();
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

	const getAllEvents = () => {
		firestore.collection("events").onSnapshot((snapshot) => {
			const events = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setEvents(events);
		});
	};
	const handleRefresh = () => {
		setRefreshing(true);
		getAllEvents();
		setRefreshing(false);
	};

	const filterEvents = (events, search) => {
		return events.filter((event) => {
			const date = event.date?.toDate()?.toLocaleDateString();
			// date by format: january 1, 2021
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

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Image source={require("../../assets/Logo.png")} style={styles.logo} />
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					{!showSearch ? (
						<TouchableOpacity
							style={styles.searchButton}
							onPress={() => setShowSearch(!showSearch)}
						>
							<Ionicons
								name="search-outline"
								size={28}
								color="black"
								// make icon bold
								style={{ fontWeight: "bold" }}
							/>
						</TouchableOpacity>
					) : (
						<TextInput
							style={styles.searchInput}
							value={search}
							placeholder="Search Events"
							onChangeText={setSearch}
							onSubmitEditing={() => setShowSearch(!showSearch)}
						/>
					)}

					<TouchableOpacity
						style={styles.postButton}
						onPress={() => navigation.navigate("PostEvent")}
					>
						<Ionicons name="add-circle-outline" size={28} color="black" />
					</TouchableOpacity>
				</View>
			</View>
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
				style={{ marginTop: 24, marginHorizontal: 24 }}
			>
				{FilteredEvents.map((event) => (
					<LocalsEventCard
						key={event.id}
						title={event.title}
						date={event.date?.toDate()?.toLocaleDateString()}
						location={event.address}
						image={event.imageUrl}
						onPress={() => navigation.navigate("EventDetails", { event })}
					/>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 48,
		marginHorizontal: 24,
	},
	searchInput: {
		height: 30,
		width: "75%",
		borderColor: "#000",
		borderWidth: 1,
		paddingLeft: 10,
		borderRadius: 30,
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
		left: -10,
	},
});

export default HomeScreen;
