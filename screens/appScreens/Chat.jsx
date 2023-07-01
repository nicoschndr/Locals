import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Button} from 'react-native';
import { firebase } from "../../firebase";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Chat({ route }) {
	const navigation = useNavigation();
	const { friendUsername, currentUsername } = route.params;
	const [message, setMessage] = useState('');
	const [friendIsTyping, setFriendIsTyping] = useState(false);
	const [messages, setMessages] = useState([]);
	const inputRef = useRef(null);
	const [inputHeight, setInputHeight] = useState(0);
	const scrollViewRef = useRef(null);
	const [deletedBy, setDeletedBy] = useState({});


	useEffect(() => {
		navigation.setOptions({
			headerTitle: friendUsername,
			headerRight: () => (
				<Button
					onPress={deleteChat}
					title="Chat löschen"
					color="#ff0000"
				/>
			),
		});
	}, [friendUsername, navigation, deleteChat]);


	useEffect(() => {
		const sortedUsernames = [currentUsername, friendUsername].sort();
		const chatRoomRef = firebase.firestore().collection('chatRooms')
			.doc(sortedUsernames.join('_'));

		const getChatRoom = async () => {
			let chatRoomSnapshot = await chatRoomRef.get();
			if (!chatRoomSnapshot.exists) {
				await chatRoomRef.set({
					messages: [],
					[`${currentUsername}_isTyping`]: false,
					[`${friendUsername}_isTyping`]: false
				});
				chatRoomSnapshot = await chatRoomRef.get();
			}

			chatRoomSnapshot.ref.onSnapshot((snapshot) => {
				const data = snapshot.data();
				if (data) {
					// Filter the messages based on the 'deletedBy' status
					const filteredMessages = data.messages.filter((msg) => {
						return !msg.deletedBy || !msg.deletedBy[currentUsername];
					});
					setMessages(filteredMessages || []);
					setFriendIsTyping(data[`${friendUsername}_isTyping`] || false);
					setDeletedBy(data.deletedBy || {}); // Hinzufügen dieser Linie
					if (scrollViewRef.current) {
						scrollViewRef.current.scrollToEnd({ animated: true });
					}
				}
			});

		};

		getChatRoom();
	}, [friendUsername, currentUsername]);

	useEffect(() => {
		const typingRef = firebase.firestore().collection('typingIndicators')
			.doc(currentUsername);

		const unsubscribe = typingRef.onSnapshot((snapshot) => {
			const data = snapshot.data();
			if (data && data.isTyping) {
				setFriendIsTyping(true);
			} else {
				setFriendIsTyping(false);
			}
		});

		return () => unsubscribe();
	}, [friendUsername]);

	const handleContentSizeChange = (event) => {
		const { contentSize } = event.nativeEvent;
		setInputHeight(contentSize.height);
	};

	const deleteChat = async () => {
		const sortedUsernames = [currentUsername, friendUsername].sort();
		const chatRoomRef = firebase.firestore().collection('chatRooms').doc(sortedUsernames.join('_'));

		const chatRoomSnapshot = await chatRoomRef.get();
		if (chatRoomSnapshot.exists) {
			const currentMessages = chatRoomSnapshot.data().messages || [];
			const updatedMessages = currentMessages.map((msg) => ({
				...msg,
				deletedBy: {
					...msg.deletedBy,
					[currentUsername]: true
				}
			}));

			await chatRoomRef.update({
				messages: updatedMessages,
			}).catch((error) => {
				console.log('Error setting deletedBy:', error);
			});
		}
	};

	const sendMessage = async () => {
		const sortedUsernames = [currentUsername, friendUsername].sort();
		const chatRoomRef = firebase.firestore().collection('chatRooms')
			.doc(sortedUsernames.join('_'));

		const newMessage = {
			sender: currentUsername,
			content: message,
			timestamp: new Date().getTime(),
			readStatus: false,
		};

		const chatRoomSnapshot = await chatRoomRef.get();
		if (chatRoomSnapshot.exists) {
			const currentMessages = chatRoomSnapshot.data().messages || [];
			// Statt die aktuellen Nachrichten zu verwenden, aktualisieren wir das 'deletedBy' Feld erneut
			const updatedMessages = currentMessages.map((msg) => {
				if (msg.deletedBy && msg.deletedBy[currentUsername]) {
					return {
						...msg,
						deletedBy: {
							...msg.deletedBy,
							[currentUsername]: true,
						},
					};
				}
				return msg;
			});
			await chatRoomRef.update({
				messages: [...updatedMessages, newMessage],
			}).catch((error) => {
				console.log('Error sending message:', error);
			});
		}

		setMessage('');
		setInputHeight(0);
		inputRef.current.clear();
		inputRef.current.blur();
	};
	const markMessageAsRead = async (msg, index) => {
		if (msg.sender !== currentUsername && !msg.readStatus) {
			const sortedUsernames = [currentUsername, friendUsername].sort();
			const chatRoomRef = firebase.firestore().collection('chatRooms').doc(sortedUsernames.join('_'));

			const chatRoomSnapshot = await chatRoomRef.get();
			if (chatRoomSnapshot.exists) {
				const currentMessages = chatRoomSnapshot.data().messages || [];
				const newMessages = currentMessages.map((currentMsg, i) => {
					if (i === index) {
						return {
							...currentMsg,
							readStatus: true,
							deletedBy: {
								...currentMsg.deletedBy
							}
						};
					}
					return currentMsg;
				});

				await chatRoomRef.update({
					messages: newMessages
				}).catch((error) => {
					console.log('Error updating read status:', error);
				});
			}
		}
	};

	const handleTyping = async (isTyping) => {
		const sortedUsernames = [currentUsername, friendUsername].sort();
		const chatRoomRef = firebase.firestore().collection('chatRooms')
			.doc(sortedUsernames.join('_'));

		await chatRoomRef.update({
			[`${currentUsername}_isTyping`]: isTyping
		}).catch((error) => {
			console.log('Error updating typing status:', error);
		});
	};

	return (
		<View style={styles.container}>
			<ScrollView
				ref={scrollViewRef}
				contentContainerStyle={styles.messageContainer}
				onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
			>
				{messages.map((msg, index) => {

					markMessageAsRead(msg, index);

					const messageBubbleStyle = [
						styles.messageBubble,
						msg.sender === currentUsername ? styles.rightMessage : styles.leftMessage,
					];

					return (
						<View key={index} style={messageBubbleStyle}>
							<Text style={styles.messageText}>{msg.content}</Text>
							<Text style={styles.timestampText}>{formatTimestamp(msg.timestamp)}</Text>
							{msg.readStatus && msg.sender === currentUsername && <MaterialIcons name="done-all" size={16} color="#2a9df4" />}
						</View>
					);
				})}
				{friendIsTyping && (
					<View style={styles.typingContainer}>
						<Text style={styles.typingText}>Schreibt gerade...</Text>
					</View>
				)}
			</ScrollView>
			<View style={styles.inputContainer}>
				<TextInput
					onFocus={() => handleTyping(true)}
					onBlur={() => handleTyping(false)}
					onEndEditing={() => handleTyping(false)}
					ref={inputRef}
					style={[styles.input, { height: Math.min(5 * 18, inputHeight) }]}
					value={message}
					onChangeText={setMessage}
					placeholder="Type a message..."
					multiline
					onContentSizeChange={handleContentSizeChange}
				/>
				<TouchableOpacity onPress={sendMessage}>
					<MaterialIcons name="send" size={24} color="#ec404b" />
				</TouchableOpacity>
			</View>
		</View>
	);
}

const formatTimestamp = (timestamp) => {
	const date = new Date(timestamp);
	const hours = date.getHours();
	const minutes = date.getMinutes();
	return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		marginBottom: 80,
	},
	messageContainer: {
		flexGrow: 1,
		paddingHorizontal: 16,
		paddingBottom: 8,
	},
	messageBubble: {
		borderRadius: 8,
		marginVertical: 4,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	leftMessage: {
		alignSelf: 'flex-start',
		backgroundColor: '#505050',
		borderBottomLeftRadius: 0,
	},
	rightMessage: {
		alignSelf: 'flex-end',
		backgroundColor: '#ec404b',
		borderBottomRightRadius: 0,
	},
	noTopBorderRadius: {
		borderTopLeftRadius: 0,
		borderTopRightRadius: 0,
	},
	messageText: {
		color: 'white',
	},
	timestampText: {
		fontSize: 12,
		color: '#c2c2c2',
		alignSelf: 'flex-end',
		marginTop: 4,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	input: {
		flex: 1,
		minHeight: 40,
		maxHeight: 120,
		marginRight: 8,
		paddingHorizontal: 8,
		borderWidth: 1,
		borderColor: 'gray',
		borderRadius: 15,
	},
});
