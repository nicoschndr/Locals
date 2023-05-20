import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { firebase } from "../../firebase";

async function sendFriendRequest(senderUsername, receiverUsername) {
	const usersRef = firebase.firestore().collection('users');

	await usersRef.doc(receiverUsername).update({
		friendRequests: {
			[senderUsername]: true
		}
	});
}

async function acceptFriendRequest(senderUsername, receiverUsername) {
	const usersRef = firebase.firestore().collection('users');

	// Suchen des Dokuments mit dem gegebenen Benutzernamen
	const senderQuerySnapshot = await usersRef.where('username', '==', senderUsername).get();
	const receiverQuerySnapshot = await usersRef.where('username', '==', receiverUsername).get();
	let receiverId;
	if (!receiverQuerySnapshot.empty) {
		const receiverDoc = receiverQuerySnapshot.docs[0];
		receiverId = receiverDoc.id;
	}

	if (!senderQuerySnapshot.empty) {
		// Das Dokument wurde gefunden, nehmen Sie das erste Ergebnis
		const senderDoc = senderQuerySnapshot.docs[0];
		const senderId = senderDoc.id;

		// Update für das Dokument mit der ID durchführen
		const senderUpdateData = {
			friends: {
				[receiverUsername]: true
			}
		};

		const receiverUpdateData = {
			friends: {
				[senderUsername]: true
			},
			[`friendRequests.${senderUsername}`]: firebase.firestore.FieldValue.delete()
		};

		await usersRef.doc(senderId).update(senderUpdateData);
		await usersRef.doc(receiverId).update(receiverUpdateData);
	} else {
		// Das Dokument wurde nicht gefunden, handle den Fehler
		console.error(`No document found with username: ${senderUsername}`);
	}
}

async function rejectFriendRequest(senderUsername, receiverUsername) {
	const usersRef = firebase.firestore().collection('users');

	// Suchen des Dokuments mit dem gegebenen Benutzernamen
	const receiverQuerySnapshot = await usersRef.where('username', '==', receiverUsername).get();
	let receiverId;
	if (!receiverQuerySnapshot.empty) {
		const receiverDoc = receiverQuerySnapshot.docs[0];
		receiverId = receiverDoc.id;
	}

	if (receiverId) {
		// Das Dokument wurde gefunden, aktualisiere das friendRequests-Objekt
		const rejectUpdateData = {
			[`friendRequests.${senderUsername}`]: firebase.firestore.FieldValue.delete()
		};

		await usersRef.doc(receiverId).update(rejectUpdateData);
	} else {
		// Das Dokument wurde nicht gefunden, handle den Fehler
		console.error(`No document found with username: ${receiverUsername}`);
	}
}


function FriendList() {
	const [friends, setFriends] = useState([]);
	const [friendRequests, setFriendRequests] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [currentUsername, setCurrentUsername] = useState('');

	useEffect(() => {
		const user = firebase.auth().currentUser;

		if (user) {
			const userDocRef = firebase.firestore().collection('users').doc(user.uid);

			userDocRef.onSnapshot(doc => {
				if (doc.exists) {
					const userData = doc.data();
					setFriends(Object.keys(userData.friends || {}));
					setFriendRequests(Object.keys(userData.friendRequests || {}));
					setCurrentUsername(userData.username);
				}
			});
		}
	}, []);

	const searchUsers = async () => {
		const usersRef = firebase.firestore().collection('users');
		const snapshot = await usersRef.where('username', '>=', searchTerm).where('username', '<=', searchTerm+'\uf8ff').get();

		setSearchResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
	}

	return (
		<View>
			<Text>Friends:</Text>
			{friends.map(friendUsername => (
				<Text key={friendUsername}>{friendUsername}</Text>
			))}

			<Text>Friend Requests:</Text>
			{friendRequests.map(requestUsername => (
				<View key={requestUsername}>
					<Text>{requestUsername}</Text>
					<Button
						title="Accept"
						onPress={() => acceptFriendRequest(requestUsername, currentUsername)}
					/>
					<Button
						title="Reject"
						onPress={() => rejectFriendRequest(requestUsername, currentUsername)}
					/>
				</View>
			))}

			<TextInput
				value={searchTerm}
				onChangeText={setSearchTerm}
				placeholder="Search users..."
			/>
			<Button
				title="Search"
				onPress={searchUsers}
			/>

			{searchResults.map(user => (
				<View key={user.id}>
					<Text>{user.username}</Text>
					<Button
						title="ADD"
						onPress={() => sendFriendRequest(currentUsername, user.id)}
					/>
				</View>
			))}
		</View>
	);
}

export default FriendList;
