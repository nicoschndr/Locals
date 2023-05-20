import React, { useState, useEffect } from 'react';
import {View, Text, Button, TextInput, Modal, TouchableOpacity} from 'react-native';
import { firebase } from "../../firebase";
import LocalsButton from "../../components/LocalsButton";
import {Ionicons} from "@expo/vector-icons";
import LocalsTextInput from "../../components/LocalsTextInput";
import { Image } from "react-native";

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
	const [modalVisible, setModalVisible] = useState(false);

	const [friendData, setFriendData] = useState({});

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

					const friendData = {};

					// Fetch data for each friend
					Object.keys(userData.friends || {}).forEach(async (friendUsername) => {
						const friendDocRef = firebase.firestore().collection('users').doc(friendUsername);
						const friendDocSnapshot = await friendDocRef.get();

						if (friendDocSnapshot.exists) {
							friendData[friendUsername] = friendDocSnapshot.data();
						}

						setFriendData(friendData);
					});
				}
			});
		}
	}, []);

	const searchUsers = async () => {
		const usersRef = firebase.firestore().collection('users');
		const lowercaseSearchTerm = searchTerm.toLowerCase();
		const snapshot = await usersRef.get();

		const searchResults = snapshot.docs
			.map(doc => ({ id: doc.id, ...doc.data() }))
			.filter(user => user.username.toLowerCase().includes(lowercaseSearchTerm));

		setSearchResults(searchResults);
	};


	const handleOpenRequests = () => {
		setModalVisible(true);
	}

	const handleCloseModal = () => {
		setModalVisible(false);
	}

	return (
		<View>
			<TouchableOpacity onPress={handleOpenRequests} style={{ position: 'absolute', top: 10, right: 10, zIndex: 999 }}>
				<Ionicons name="notifications-outline" size={24} color="black" />
				{friendRequests.length > 0 && (
					<View style={{ position: 'absolute', top: -8, right: -8, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
						<Text style={{ color: 'white', fontSize: 12 }}>{friendRequests.length}</Text>
					</View>
				)}
			</TouchableOpacity>

			<LocalsTextInput
				value={searchTerm}
				onChangeText={(text) => {
					setSearchTerm(text);
					if (text.trim() !== '') {
						searchUsers();
					}
				}}
				placeholder="Search users..."
			/>

			{searchTerm.trim() !== '' && searchResults.map(user => (
				<View key={user.id} style={{marginLeft: 30, marginRight: 30}}>
					<Text style={{fontWeight: 'bold'}}>{user.username}</Text>
					<TouchableOpacity onPress={() => sendFriendRequest(currentUsername, user.id)} style={{ marginLeft: 'auto' }}>
						<Ionicons name="person-add-outline" size={24} color="#ec404b" />
					</TouchableOpacity>
				</View>
			))}

			<Text>Friends:</Text>
			{friends.map((friendUsername, index) => (
				<View key={friendUsername}>
					<Text style={{ marginBottom: 5 }}>{friendUsername}</Text>
					{friendData[friendUsername] && friendData[friendUsername].imageUrl &&
					<Image
						source={{ uri: friendData[friendUsername].imageUrl }}
						style={{ width: 50, height: 50 }}  // Sie können die Größe des Bilds anpassen
					/>
					}
					{index !== friends.length - 1 && <View style={{ borderBottomWidth: 1, borderBottomColor: 'gray', marginBottom: 5 }} />}
				</View>
			))}



			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={handleCloseModal}
			>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
						<Text style={{ fontSize: 18, marginBottom: 10 }}>Open Friend Requests:</Text>
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
						<Button
							title="Close"
							onPress={handleCloseModal}
						/>
					</View>
				</View>
			</Modal>





		</View>
	);
}

export default FriendList;
