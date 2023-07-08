import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Button} from 'react-native';
import { firebase } from "../../firebase";
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * Renders the Chat page with the provided props.
 * @param route The navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered Chat page.
 * @constructor
 */
export default function Chat({ route }) {

	/**
	 * Used to handle navigation actions within a component.
	 * @type {NavigationProp<ReactNavigation.RootParamList>}
	 */
	const navigation = useNavigation();

	/**
	 * The usernames of both participants of the chat.
	 */
	const { friendUsername, currentUsername } = route.params;

	/**
	 * The text message of the current user.
	 */
	const [message, setMessage] = useState('');

	/**
	 * indicates if the other participant of the chat is currently typing.
	 */
	const [friendIsTyping, setFriendIsTyping] = useState(false);

	/**
	 * All messages of one chat.
	 */
	const [messages, setMessages] = useState([]);

	/**
	 * Used to reference an input element.
	 * @type {React.MutableRefObject<null>}
	 */
	const inputRef = useRef(null);

	/**
	 * height of the text input for writing a message.
	 */
	const [inputHeight, setInputHeight] = useState(0);

	/**
	 * Used to reference the scroll view component.
	 * @type {React.MutableRefObject<null>}
	 */
	const scrollViewRef = useRef(null);

	/**
	 * indicates if a message is deleted by a user.
	 */
	const [deletedBy, setDeletedBy] = useState({});


	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 * Defining the header of the navigation component.
		 */
		navigation.setOptions({
			headerTitle: () => (<Text style={{marginLeft: 30, marginBottom: 15, fontSize: 20, fontWeight: "bold"}}>{friendUsername}</Text>),
			headerLeft: () => (
				<TouchableOpacity onPress={()=>{handleTyping(false); navigation.goBack()}}>
					<Ionicons
						style={{ marginRight:  - 90 }}
						name={"arrow-back-outline"}
						size={40}
					>
						{" "}
					</Ionicons>
				</TouchableOpacity>
			),
			headerRight: () => (
				<Button
					onPress={()=> {deleteChat(); handleTyping(false)}}
					title="Chat löschen"
					color="#ff0000"
				/>
			),
		});
	}, [friendUsername, navigation, deleteChat]);


	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 * The usernames of the chatters in alphabetical order.
		 * @type {*[]}
		 */
		const sortedUsernames = [currentUsername, friendUsername].sort();

		/**
		 * The firestore reference to the document where the chat data is saved.
		 * @type {firebase.firestore.DocumentReference<firebase.firestore.DocumentData>}
		 */
		const chatRoomRef = firebase.firestore().collection('chatRooms')
			.doc(sortedUsernames.join('_'));

		/**
		 * Responsible for retrieving and monitoring a chat room's data from the Firestore database.
		 * @returns {Promise<void>}
		 */
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

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {
		/**
		 * Reference to a Firestore document that stores typing indicators for a specific user.
		 * @type {firebase.firestore.DocumentReference<firebase.firestore.DocumentData>}
		 */
		const typingRef = firebase.firestore().collection('typingIndicators')
			.doc(currentUsername);

		/**
		 * Listener that monitors changes to the typingRef document in the Firestore database and updates the friend's
		 * typing status accordingly.
		 * @type {() => void}
		 */
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

	/**
	 * Responsible for updating the height of an input component based on the content size change event.
	 * @param event The event object containing information about the content size change.
	 */
	const handleContentSizeChange = (event) => {
		const { contentSize } = event.nativeEvent;
		setInputHeight(contentSize.height);
	};

	/**
	 * Responsible for deleting a chat conversation by marking the messages as deleted for the current user.
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Responsible for sending a message in a chat conversation by updating the chat room document in the Firestore
	 * database.
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Responsible for marking a message as read in a chat conversation by updating the read status of the message in
	 * the chat room document.
	 * @param msg The message object to be marked as read.
	 * @param index The index of the message in the chat room's messages array.
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Responsible for updating the typing status of the current user in a chat room by updating the isTyping field in
	 * the chat room document.
	 * @param isTyping Indicates whether the current user is currently typing or not.
	 * @returns {Promise<void>}
	 */
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

	/**
	 * renders the Chat page.
	 */
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

/**
 * Responsible for formatting a timestamp into a string representation of the time in hours and minutes.
 * @param timestamp The timestamp value representing a date and time.
 * @returns {`${number}:${string}${number}`}  The formatted string representation of the time in "hours:minutes" format.
 */
const formatTimestamp = (timestamp) => {
	const date = new Date(timestamp);
	const hours = date.getHours();
	const minutes = date.getMinutes();
	return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
};

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
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
