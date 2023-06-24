import React, { useState, useEffect } from 'react';
import {View, Text, Button, TextInput, Modal, TouchableOpacity, Alert} from 'react-native';
import { firebase } from "../../firebase";
import LocalsButton from "../../components/LocalsButton";
import {Ionicons} from "@expo/vector-icons";
import LocalsTextInput from "../../components/LocalsTextInput";
import { Image } from "react-native";
import {useFocusEffect} from "@react-navigation/native";
import {Badge} from "react-native-elements";

async function sendFriendRequest(senderUsername, receiverUsername) {
	const usersRef = firebase.firestore().collection('users');

	// Suchen des Dokuments mit dem gegebenen Benutzernamen
	const receiverQuerySnapshot = await usersRef.where('username', '==', receiverUsername).get();
	if (!receiverQuerySnapshot.empty) {
		// Das Dokument wurde gefunden, nehmen Sie das erste Ergebnis
		const receiverDoc = receiverQuerySnapshot.docs[0];
		const receiverId = receiverDoc.id;

		// Update für das Dokument mit der ID durchführen
		await usersRef.doc(receiverId).update({
			[`friendRequests.${senderUsername}`]: true
		});
	} else {
		// Das Dokument wurde nicht gefunden, handle den Fehler
		console.error(`No document found with username: ${receiverUsername}`);
	}
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
		await usersRef.doc(senderId).update({
			[`friends.${receiverUsername}`]: true
		});
		await usersRef.doc(receiverId).update({
			[`friends.${senderUsername}`]: true,
			[`friendRequests.${senderUsername}`]: firebase.firestore.FieldValue.delete()
		});
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

function FriendList({navigation}) {
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
					setFriendRequests(Object.keys(userData.friendRequests || {}));
					setCurrentUsername(userData.username);

					const friendIds = Object.keys(userData.friends || {});
					setFriends(friendIds);

					const friendData = {};

					// Fetch data for each friend
					friendIds.forEach(async (friendUsername) => {
						const usersRef = firebase.firestore().collection('users');
						const friendQuerySnapshot = await usersRef.where('username', '==', friendUsername).get();

						if (!friendQuerySnapshot.empty) {
							const friendDoc = friendQuerySnapshot.docs[0];
							friendData[friendUsername] = friendDoc.data();
						} else {
							console.log(`No document found for friend: ${friendUsername}`);
						}

						setFriendData(friendData);
					});

				}
			});
		}
	}, []);

	useEffect(
		()=>{
			getChats();
		}, []);
	let messages = [];
	const [unreadMessages, setUnreadMessages] = useState([]);

	const getChats = async () =>  {
		try {
			const chatRef = firebase.firestore().collection('chatRooms')

			const userChats = chatRef
				.where(`nico_isTyping`, '==', false)
				.onSnapshot((snapshot) => {
					const chats = snapshot.docs.map((doc) => ({
						...doc.data()
					}));
					chats.forEach((c) => c.messages.map((e) => messages.push(e)))
					setUnreadMessages(messages.filter((e) => e.sender !== 'nico' && e.readStatus === false))
					messages.splice(1, messages.length)
					console.log(unreadMessages)
				});

		}catch (e){
			console.log(e)
		}
	}

	const searchUsers = async () => {
		const usersRef = firebase.firestore().collection('users');
		const lowercaseSearchTerm = searchTerm.toLowerCase();
		const snapshot = await usersRef.get();

		const searchResults = snapshot.docs
			.map(doc => ({ id: doc.id, ...doc.data() }))
			.filter(user => (
				user.username.toLowerCase().includes(lowercaseSearchTerm) &&
				!friends.includes(user.username) // Filtere bereits bestehende Freunde aus den Suchergebnissen
			));

		setSearchResults(searchResults);
	};


	const handleOpenRequests = () => {
		setModalVisible(true);
	}

	const handleCloseModal = () => {
		setModalVisible(false);
	}

	const handleFriendClick = (friendUsername) => {
		navigation.navigate('Chat', { friendUsername: friendUsername, currentUsername: currentUsername });
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
			{searchTerm.trim() !== '' && (
				<Text style={{alignSelf: "center"}}>Gefundene User:</Text>
			)}
			{searchTerm.trim() !== '' && searchResults.map(user => (
				<View key={user.id} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 30, marginRight: 30 }}>
					{user.imageUrl && (
						<Image
							source={{ uri: user.imageUrl }}
							style={{ width: 50, height: 50, borderRadius: 25 }}
						/>
					)}
					<Text style={{fontWeight: 'bold', marginLeft: 10}}>{user.username}</Text>
					<TouchableOpacity
						onPress={() => sendFriendRequest(currentUsername, user.username)} style={{ marginLeft: 'auto' }}>
						<Ionicons name="person-add-outline" size={24} color="#ec404b" />
					</TouchableOpacity>
				</View>
			))}


			<Text>Friends:</Text>
			{friends.map((friendUsername, index) => (
				<TouchableOpacity key={friendUsername} onPress={() => handleFriendClick(friendUsername)}>
					<View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
						{friendData[friendUsername] && friendData[friendUsername].imageUrl &&
						<Image
							source={{ uri: friendData[friendUsername].imageUrl }}
							style={{ width: 50, height: 50, borderRadius: 25 }}  // Set borderRadius to half of width/height to make it round
						/>
						}
						<Text style={{ marginLeft: 10 }}>{friendUsername}</Text>
						{(unreadMessages.filter((e) => e.sender === friendUsername)).length > 0 && (
						<Badge containerStyle={{position: 'absolute', top: -2, left:40}} status='error' value={(unreadMessages.filter((e) => e.sender === friendUsername)).length}></Badge>)}
						{index !== friends.length - 1 &&
						<View style={{ borderBottomWidth: 1, borderBottomColor: '#ec404b', marginTop: 5 }} />
						}
					</View>
				</TouchableOpacity>
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
							<View key={requestUsername} style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Text>{requestUsername}</Text>
								<TouchableOpacity onPress={() => acceptFriendRequest(requestUsername, currentUsername)} style={{ marginLeft: 'auto' }}>
									<Ionicons name="person-add-outline" size={24} color="green" />
								</TouchableOpacity>
								<TouchableOpacity onPress={() => rejectFriendRequest(requestUsername, currentUsername)} style={{ marginLeft: 10 }}>
									<Ionicons name="remove-circle-outline" size={24} color="red" />
								</TouchableOpacity>
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
