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
	StatusBar,
} from "react-native";
import { firestore } from "../../firebase";

import LocalsEventCard from "../../components/LocalsEventCard";
import { Ionicons } from "@expo/vector-icons";

import { AppleCard } from "react-native-apple-card-views";
import AppleHeader from "react-native-apple-header";
import { Divider, SocialIcon } from "react-native-elements";

const HomeScreen = ({ navigation }) => {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [events, setEvents] = useState([""]);
	const [refreshing, setRefreshing] = useState(false);
	const [showSearch, setShowSearch] = useState(false);

	useEffect(() => {
		getUsers();
		getActiveEvents();
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
		firestore
			.collection("events")
			.orderBy("date", "asc")
			.onSnapshot((snapshot) => {
				const events = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setEvents(events);
			});
	};

	const getActiveEvents = () => {
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

	const handleRefresh = () => {
		setRefreshing(true);
		getActiveEvents();
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
						marginRight: 16,
						alignItems: "center",
						flexDirection: "row",
						justifyContent: "space-between",
						alignSelf: "center",
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
			>
				<ScrollView
					contentContainerStyle={{
						margin: 24,
						marginTop: 12,
					}}
					horizontal
				>
					{FilteredEvents.map((event) => (
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
						{events.map((event) => (
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
					<ScrollView style={{ padding: 24 }}>
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
