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

const HomeScreen = ({ navigation }) => {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [categories, setCategories] = useState([]);
	const [activeEvents, setActiveEvents] = useState([]);

	const { events } = useContext(FirestoreContext);
	// create contest for events
	const { setEvents } = useContext(FirestoreContext);

	useEffect(() => {
		getUsers();
		filterEventsByCategory(events);
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

	const filterEventsByCategory = () => {
		const categoriesMap = {};
		events.forEach((event) => {
			const { category } = event;
			categoriesMap[category] = event;
		});

		const filteredCategories = Object.values(categoriesMap);
		setCategories(filteredCategories);
	};

	const getActiveEvents = useMemo(() => {
		return events.filter((event) => {
			const date = event.date?.toDate()?.toLocaleDateString();
			const today = new Date().toLocaleDateString();
			return date >= today;
		});
	}, [events]);

	useEffect(() => {
		setActiveEvents(getActiveEvents);
	}, [getActiveEvents]);

	const handleRefresh = () => {
		setRefreshing(true);
		updateEvents();
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

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			{/* <View style={styles.header}>
				<Image source={require("../../assets/Logo.png")} style={styles.logo} />

				</View>
			</View> */}
			<View style={styles.header}>
				{/* <Image source={require("../../assets/Logo.png")} style={styles.logo} /> */}

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
						{showSearch && (
							// close search
							<TouchableOpacity
								style={styles.searchButton}
								onPress={() => setShowSearch(!showSearch)}
							>
								<Ionicons
									name="close-outline"
									size={28}
									color="black"
									// make icon bold
									style={{ fontWeight: "bold" }}
								/>
							</TouchableOpacity>
						)}
						{!showSearch && (
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
				<View
					style={{
						alignItems: "center",
						marginHorizontal: 24,
					}}
				>
					<TextInput
						style={styles.searchInput}
						value={search}
						placeholder="Search Events"
						onChangeText={setSearch}
						onSubmitEditing={() => setShowSearch(!showSearch)}
					/>
				</View>
			)}
			{/* <Divider
				style={{
					backgroundColor: "black",
					height: StyleSheet.hairlineWidth,
				}}
			/> */}
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
			>
				<ScrollView
					contentContainerStyle={{
						margin: 24,
						marginTop: 12,
					}}
					horizontal
					show={false}
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
				>
					{activeEvents.map((event) => (
						<LocalsEventCard
							key={event.id}
							title={event.title}
							date={event.date
								?.toDate()
								?.toLocaleDateString("de-DE", shortDate)}
							location={event.address}
							image={event.imageUrl}
							category={event.title}
							onPress={() => navigation.navigate("EventDetails", { event })}
							style={{ marginRight: 24 }}
							slim
						/>
					))}
				</ScrollView>
				{/* categories */}
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
						{/* filter event categories  */}

						{categories.map((event) => (
							<LocalsEventCard
								key={event.id}
								title={event.category}
								category={event.category}
								onPress={() => navigation.navigate("Category", { event })}
								style={{ marginRight: 24 }}
								image={event.imageUrl}
								small
							/>
						))}
					</ScrollView>
					{/* in der nähe vertical scrollView */}
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
								image={event.imageUrl}
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

export default HomeScreen;
