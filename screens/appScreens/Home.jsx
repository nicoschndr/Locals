import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { firestore } from '../../firebase';

const Template = ({ navigation }) => {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState('');

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

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.searchInput}
				value={search}
				placeholder="Search Users"
				onChangeText={setSearch}
			/>

			<ScrollView>
				{users
					.filter(user => {
						const userLowerCase = `${user.firstName} ${user.lastName}`.toLowerCase();
						const searchLowerCase = search.toLowerCase();

						return userLowerCase.includes(searchLowerCase);
					})
					.map((user) => (
						<TouchableOpacity
							key={user.id}
							style={styles.userButton}
							onPress={() => navigation.navigate('Profile', { uid: user.id })}

						>
							<Text>{user.firstName} {user.lastName}</Text>
						</TouchableOpacity>
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

export default Template;
