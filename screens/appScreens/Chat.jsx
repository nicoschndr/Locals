import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { firebase } from "../../firebase";
import { MaterialIcons } from '@expo/vector-icons';

export default function Chat({ route }) {
	const { friendUsername, currentUsername } = route.params;
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [previousMessageHasTip, setPreviousMessageHasTip] = useState(false);
	const inputRef = useRef(null);
	const [inputHeight, setInputHeight] = useState(0);

	useEffect(() => {
		const sortedUsernames = [currentUsername, friendUsername].sort();
		const chatRoomRef = firebase.firestore().collection('chatRooms')
			.doc(sortedUsernames.join('_'));

		const getChatRoom = async () => {
			let chatRoomSnapshot = await chatRoomRef.get();
			if (!chatRoomSnapshot.exists) {
				await chatRoomRef.set({ messages: [] });
				chatRoomSnapshot = await chatRoomRef.get();
			}

			chatRoomSnapshot.ref.onSnapshot((snapshot) => {
				setMessages(snapshot.data()?.messages || []);
			});
		};

		getChatRoom();
	}, [friendUsername, currentUsername]);


	const handleContentSizeChange = (event) => {
		const { contentSize } = event.nativeEvent;
		setInputHeight(contentSize.height);
	};

	const sendMessage = async () => {
		const sortedUsernames = [currentUsername, friendUsername].sort();
		const chatRoomRef = firebase.firestore().collection('chatRooms')
			.doc(sortedUsernames.join('_'));

		const newMessage = {
			sender: currentUsername,
			content: message,
			timestamp: new Date().getTime()
		};

		await chatRoomRef.update({
			messages: [...messages, newMessage]
		}).catch((error) => {
			console.log('Error sending message:', error);
		});

		setMessage('');
		setPreviousMessageHasTip(false);
		setInputHeight(0);
		inputRef.current.clear();
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.messageContainer}>
				{messages.map((msg, index) => {

					const messageBubbleStyle = [
						styles.messageBubble,
						msg.sender === currentUsername ? styles.rightMessage : styles.leftMessage,
					];


					return (
						<View key={index} style={messageBubbleStyle}>
							<Text style={styles.messageText}>{msg.content}</Text>
							<Text style={styles.timestampText}>{formatTimestamp(msg.timestamp)}</Text>
						</View>
					);
				})}
			</ScrollView>
			<View style={styles.inputContainer}>
				<TextInput
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
		borderRadius: 4,
	},
});
