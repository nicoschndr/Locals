import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { firestore } from '../../firebase';

import LocalsEventCard from '../../components/LocalsEventCard';

const HomeScreen = ({ navigation }) => {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState('');
	const [events, setEvents] = useState([""]);
	const [refreshing, setRefreshing] = useState(false);


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
		firestore
			.collection("events")
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
		getAllEvents();
		setRefreshing(false);
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.searchInput}
				value={search}
				placeholder="Search Events"
				onChangeText={setSearch}
			/>

			<ScrollView
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			>
				{events
					.filter((events) => {
						const date = events.date?.toDate()?.toLocaleDateString();
						// date by format: january 1, 2021
						const byMonth = events.date?.toDate()?.toLocaleDateString("de-DE", {
							month: "long",
						});
						const byTitleLowerCase = `${events.title},${events.address},${date},${events.category},${byMonth}`.toLowerCase();
						const searchByTitleLowerCase = search.toLowerCase();

						return byTitleLowerCase.includes(searchByTitleLowerCase);
					})
					.map((event) => (
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
		marginTop: 50,
		padding: 10,
	},
	searchInput: {
		height: 40,
		borderColor: '#000',
		borderWidth: 1,
		paddingLeft: 10,
	},
	userButton: {
		backgroundColor: '#ddd',
		marginTop: 10,
		padding: 10,
	}
});

export default HomeScreen;
