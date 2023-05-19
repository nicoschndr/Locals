/*
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import {firebase} from "../../firebase";
const FriendsScreen = () => {
	const [friends, setFriends] = useState([]);

	useEffect(() => {
		// Firebase-Datenbankreferenz für die Freundesliste
		const friendsRef = firebase.database().ref('friends');

		// Freundesliste abrufen
		friendsRef.on('value', (snapshot) => {
			if (snapshot.exists()) {
				const friendsData = snapshot.val();
				// Die Freundesliste in den State setzen
				setFriends(friendsData);
			}
		});

		// Aufräumen beim Komponentenabbau
		return () => {
			friendsRef.off('value');
		};
	}, []);

	// Rendermethode für jedes Freundesobjekt in der FlatList
	const renderFriendItem = ({ item }) => {
		return (
			<View style={styles.friendItem}>
				<Text>{item.name}</Text>
				<Text>{item.email}</Text>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>Freundesliste</Text>
			<FlatList
				data={friends}
				renderItem={renderFriendItem}
				keyExtractor={(item) => item.id}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	heading: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	friendItem: {
		marginBottom: 10,
	},
});

export default FriendsScreen;

 */



import { View, Text, Button, StyleSheet } from "react-native";
import React, { useState } from "react";

const FriendScreen = () => {

	// render related stuff is displayed here after the return statement
	return (
		<View>
			<Text>Freundes Liste (auskommentiert, weil muckt dieser Huso)</Text>
		</View>
	);
};

export default FriendScreen;

// use styles (styles.textContainer for example) to extract and separate the styling from the render function
const styles = StyleSheet.create({
	textContainer: {
		margin: 16,
		fontWeight: "bold",
		color: "green",
		fontSize: 24,
	},
	iBtn: {
		margin: 16,
		borderWidth: 3,
		borderColor: "green",
		borderRadius: 8,
	},
	dBtn: {
		margin: 16,
		borderWidth: 3,
		borderColor: "red",
		borderRadius: 8,
	},
});
