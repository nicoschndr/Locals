import React, { useEffect, useRef, useState } from 'react';
import {
	Animated,
	Easing,
	View,
	StyleSheet,
	Modal,
	TouchableOpacity,
	Linking,
	Platform,
	Button,
	TextInput,
	ScrollView,
	FlatList,
	Text,
	Image
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { auth, firebase } from '../../firebase';
import LocalsButton from '../../components/LocalsButton';
import { MaterialIcons } from '@expo/vector-icons';


const Comment = ({
					 comment,
					 replies,
					 goToComment,
					 openReplyInput,
					 highlighted,
					 setHighlighted,
				 }) => {
	const [isHighlighted, setIsHighlighted] = useState(false);

	useEffect(() => {
		setIsHighlighted(highlighted === comment.id);
	}, [highlighted, comment.id]);

	return (
		<TouchableOpacity
			onPress={() => goToComment(comment.id)}
			style={[
				styles.commentContainer,
				isHighlighted ? styles.highlightedCommentContainer : null,
			]}
		>
			<Text style={styles.commentText}>
				{comment.username}: {comment.commentText}
			</Text>
			<TouchableOpacity
				onPress={() => openReplyInput(comment.id, comment.commentText)}
				style={styles.replyButton}
			>
				<Text style={styles.replyButtonText}>Reply</Text>
			</TouchableOpacity>
			{replies.map((reply) => (
				<Comment
					key={reply.id}
					comment={reply}
					replies={reply.replies}
					goToComment={goToComment}
					openReplyInput={openReplyInput}
					highlighted={highlighted}
					setHighlighted={setHighlighted}
				/>
			))}
		</TouchableOpacity>
	);
};



const Livemap = () => {
	const [location, setLocation] = useState(null);
	const [events, setEvents] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState({ attendees: [] });
	const { user } = auth.currentUser;
	const [comments, setComments] = useState([]);
	const [newCommentText, setNewCommentText] = useState('');
	const [replyToComment, setReplyToComment] = useState(null);
	const [replyToCommentText, setReplyToCommentText] = useState(null);
	const scrollViewRef = useRef();
	const commentRefs = useRef({});
	const [commentPositions, setCommentPositions] = useState({});
	const [showComments, setShowComments] = useState(false);
	const [highlighted, setHighlighted] = useState(false);

	const onCommentLayout = (event, commentId) => {
		const layout = event.nativeEvent.layout;
		setCommentPositions((prevPositions) => ({
			...prevPositions,
			[commentId]: layout.y,
		}));
	};

	const getUsername = async () => {
		const user = auth.currentUser;
		if (!user) {
			throw new Error('User not authenticated');
		}
		const userRef = firebase.firestore().collection('users').doc(user.uid);
		const userDoc = await userRef.get();
		const username = userDoc.data().username;
		return username;
	};

	const handleEventPress = (event) => {
		setSelectedEvent(event);
		setModalVisible(true);
	};

	const attendEvent = async () => {
		const user = firebase.auth().currentUser;
		const username = await getUsername();

		if (user && selectedEvent) {
			const eventRef = firebase.firestore().collection('events').doc(selectedEvent.id);

			await eventRef.update({
				attendees: firebase.firestore.FieldValue.arrayUnion(username),
				groupSize: firebase.firestore.FieldValue.increment(1),
			});

			setSelectedEvent((prevState) => ({
				...prevState,
				attendees: [...prevState.attendees, username],
				groupSize: prevState.groupSize + 1,
				isAttending: true,
			}));
		}
	};

	const cancelAttendance = async () => {
		const user = firebase.auth().currentUser;
		const username = await getUsername();

		if (user && selectedEvent) {
			const eventRef = firebase.firestore().collection('events').doc(selectedEvent.id);

			await eventRef.update({
				attendees: firebase.firestore.FieldValue.arrayRemove(username),
				groupSize: firebase.firestore.FieldValue.increment(-1),
			});

			setSelectedEvent((prevState) => ({
				...prevState,
				attendees: prevState.attendees.filter((user) => user !== username),
				groupSize: prevState.groupSize - 1,
				isAttending: false,
			}));
		}
	};

	const toggleAttendance = async () => {
		const username = await getUsername();

		if (
			selectedEvent &&
			selectedEvent.attendees &&
			selectedEvent.attendees.includes(username)
		) {
			cancelAttendance();
		} else {
			attendEvent();
		}
	};

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				alert('Permission to access location was denied');
				return;
			}

			let locationSubscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 1000,
					distanceInterval: 1,
				},
				(location) => {
					setLocation(location);
				}
			);

			return () => {
				locationSubscription.remove();
			};
		})();
	}, []);

	const openReplyInput = (commentId, commentText) => {
		setReplyToComment(commentId);
		setReplyToCommentText(commentText);
	};

	const openMapsApp = () => {
		const { latitude, longitude } = selectedEvent;

		const url = Platform.select({
			ios: `maps:0,0?q=${latitude},${longitude}`,
			android: `geo:0,0?q=${latitude},${longitude}`,
		});

		Linking.openURL(url);
	};

	const addComment = async () => {
		const user = firebase.auth().currentUser;
		const username = await getUsername();

		if (user && selectedEvent) {
			const eventRef = firebase.firestore().collection('events').doc(selectedEvent.id);

			const commentData = {
				username: username,
				commentText: newCommentText.toString(),
				replyTo: replyToComment ? replyToComment : null,
				timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			};

			await eventRef.collection('comments').add(commentData);
		}
		setNewCommentText('');
		setReplyToComment(null);
	};

	useEffect(() => {
		if (selectedEvent) {
			const eventRef = firebase.firestore().collection('events').doc(selectedEvent.id);

			eventRef
				.collection('comments')
				.orderBy('timestamp', 'asc')
				.onSnapshot((snapshot) => {
					const commentData = snapshot.docs.map((doc) => {
						return {
							id: doc.id,
							...doc.data(),
						};
					});

					const commentTree = buildCommentTree(commentData);
					setComments(commentTree);
				});
		}
	}, [selectedEvent]);

	const buildCommentTree = (comments) => {
		let commentMap = {};
		let commentTree = [];

		comments.forEach((comment) => {
			comment.replies = [];
			commentMap[comment.id] = comment;
		});

		comments.forEach((comment) => {
			if (comment.replyTo) {
				const parentComment = commentMap[comment.replyTo];
				if (parentComment) {
					parentComment.replies.push(comment);
				} else {
					commentTree.push(comment);
				}
			} else {
				commentTree.push(comment);
			}
		});

		return commentTree.reverse();
	};

	useEffect(() => {
		const fetchEvents = async () => {
			const username = await getUsername();
			const eventsRef = firebase.firestore().collection('events');

			eventsRef.onSnapshot((snapshot) => {
				const eventsData = snapshot.docs.map((doc) => {
					const event = {
						id: doc.id,
						...doc.data(),
					};

					event.isAttending = Array.isArray(event.attendees)
						? event.attendees.includes(username)
						: false;
					return event;
				});

				setEvents(eventsData);
			});
		};

		fetchEvents();
	}, []);

	const renderComment = ({ item }) => (
		<Comment
			comment={item}
			replies={item.replies}
			goToComment={goToComment}
			openReplyInput={openReplyInput}
			onLayout={(event) => onCommentLayout(event, item.id)}
			highlighted={highlighted}
			setHighlighted={setHighlighted}
		/>
	);

	const goToComment = (commentId) => {
		const position = commentPositions[commentId];
		if (position && scrollViewRef.current) {
			scrollViewRef.current.scrollTo({ y: position, animated: true });
			setHighlighted(commentId);
		}
	};

	return (
		<View style={styles.container}>
			{location && (
				<MapView
					style={styles.map}
					initialRegion={{
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					}}
				>
					<Marker
						coordinate={{
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
						}}
					>
						<MaterialIcons name="location-on" size={30} color="#ec404b" />
					</Marker>

					{events.map((event) => (
						<Marker
							key={event.id}
							coordinate={{
								latitude: event.latitude,
								longitude: event.longitude,
							}}
							onPress={() => handleEventPress(event)}
						>
							<View style={styles.eventMarker} />
						</Marker>
					))}
				</MapView>
			)}
			<Modal visible={modalVisible} animationType="slide">
				<View style={styles.modalContainer}>
					{selectedEvent && !showComments && (
						<View style={{ flex: 1, alignItems: 'center' }}>
							<Image
								style={styles.eventModalImage}
								source={{ uri: selectedEvent.imageUrl }}
							/>
							<Text style={styles.eventModalTitle}>{selectedEvent.title}</Text>
							<Text style={styles.eventModalText}>
								Erstellt von: {selectedEvent.creator}
							</Text>
							<LocalsButton title={'Hin da!'} onPress={openMapsApp} />
							<Text style={styles.eventModalText}>
								Beschreibung: {selectedEvent.description}
							</Text>
							<Text style={styles.eventModalText}>
								Wer ist eingeladen: {selectedEvent.gender}
							</Text>
							<Text style={styles.eventModalText}>
								Kategorie: {selectedEvent.category}
							</Text>

							{selectedEvent.isAttending ? (
								<LocalsButton
									title={'Nicht teilnehmen'}
									onPress={toggleAttendance}
								/>
							) : (
								<LocalsButton
									title={'Teilnehmen'}
									onPress={toggleAttendance}
								/>
							)}

							<Text style={styles.eventModalText}>
								Group Size: {selectedEvent.groupSize}
							</Text>
							<Button
								title="Kommentare anzeigen"
								onPress={() => setShowComments(true)}
							/>
						</View>
					)}

					{selectedEvent && showComments && (
						<View style={{ flex: 1 }}>
							<FlatList
								ref={scrollViewRef}
								data={comments}
								renderItem={renderComment}
								keyExtractor={(item) => item.id}
							/>
							<View style={styles.inputContainer}>
								<TextInput
									value={newCommentText}
									onChangeText={setNewCommentText}
									placeholder={
										replyToComment
											? `Antwort auf: ${replyToCommentText}`
											: 'Schreibe einen Kommentar'
									}
									style={styles.input}
								/>
								<TouchableOpacity
									style={styles.sendButton}
									onPress={addComment}
								>
									<Text style={styles.sendButtonText}>Senden</Text>
								</TouchableOpacity>
							</View>
							<Button
								title="Zurück zur Event-Ansicht"
								onPress={() => setShowComments(false)}
							/>
						</View>
					)}

					<TouchableOpacity onPress={() => setModalVisible(false)}>
						<Text style={styles.closeButton}>Close</Text>
					</TouchableOpacity>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	positionMarker: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: 'blue',
	},
	eventContainer: {
		alignItems: 'center',
	},
	eventMarker: {
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: 'red',
	},
	eventTitle: {
		fontSize: 12,
		color: 'black',
		marginTop: 4,
		textAlign: 'center',
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	eventModalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	eventModalText: {
		fontSize: 16,
		marginBottom: 8,
	},
	eventModalImage: {
		width: 200,
		height: 200,
		resizeMode: 'cover',
		marginBottom: 16,
	},
	closeButton: {
		fontSize: 16,
		color: 'blue',
		marginTop: 20,
	},
	mapButton: {
		backgroundColor: 'blue',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 4,
		marginBottom: 16,
	},
	mapButtonText: {
		color: 'white',
		fontSize: 16,
	},
	button: {
		borderWidth: 1,
		borderRadius: 4,
		padding: 5,
	},

	commentContainer: {
		marginTop: 10,
		borderLeftWidth: 1,
		borderRadius: 10, // Anpassen der Border-Radius-Eigenschaft für Bubble-Effekt
		paddingHorizontal: 10,
		paddingVertical: 5,
		marginBottom: 10,
		alignSelf: 'flex-start', // Zur Linksbündigkeit der eigenen Kommentare
		backgroundColor: 'darkgrey', // Hintergrundfarbe für Kommentar-Bubbles

	},
	highlightedCommentContainer: {
		backgroundColor: 'yellow',
	},
	commentText: {
		fontSize: 14,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 20,
		paddingHorizontal: 10,
		paddingVertical: 5,
		marginRight: 10,
		fontSize: 14,
	},
	sendButton: {
		backgroundColor: 'lightblue',
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
	},
	sendButtonText: {
		fontSize: 14,
		color: 'white',
	},
	replyButton: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
		backgroundColor: 'lightblue',
		marginTop: 5,
	},
	replyButtonText: {
		fontSize: 14,
		color: 'black',
	},
});

export default Livemap;
