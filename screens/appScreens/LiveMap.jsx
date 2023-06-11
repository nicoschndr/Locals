import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	Button,
	FlatList,
	Image,
	Linking,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import MapView, { Circle, Marker as DefaultMarker } from "react-native-maps";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { auth, firebase } from "../../firebase";
import LocalsButton from "../../components/LocalsButton";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import LocalsEventDetails from "../../components/LocalsEventDetails";

const Marker = Animated.createAnimatedComponent(DefaultMarker);

// TODO: auslagern in eigene Datei
const Comment = ({
	comment,
	replies,
	goToComment,
	openReplyInput,
	highlighted,
	setHighlighted,
	likeComment,
	username,
}) => {
	const handleLikeComment = () => {
		likeComment(comment.id);
	};

	return (
		<TouchableOpacity
			onPress={() => goToComment(comment.id)}
			style={styles.commentContainer}
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
			<TouchableOpacity onPress={handleLikeComment}>
				<View style={styles.likeContainer}>
					<AntDesign
						name="heart"
						size={14}
						color={comment.likes.includes(username) ? "red" : "gray"}
					/>
					<Text style={styles.likeCount}>{comment.likes.length}</Text>
				</View>
			</TouchableOpacity>

			{replies.length > 0 && (
				<View>
					{replies.map((reply) => (
						<Comment
							key={reply.id}
							comment={reply}
							replies={reply.replies}
							goToComment={goToComment}
							openReplyInput={openReplyInput}
							likeComment={likeComment}
							username={username}
						/>
					))}
				</View>
			)}
		</TouchableOpacity>
	);
};


const Livemap = () => {
	const [location, setLocation] = useState(null);
	const [events, setEvents] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState({ attendees: [] });
	const [comments, setComments] = useState([]);
	const [newCommentText, setNewCommentText] = useState("");
	const [replyToComment, setReplyToComment] = useState(null);
	const [replyToCommentText, setReplyToCommentText] = useState(null);
	const scrollViewRef = useRef();
	const commentRefs = useRef({});
	const [commentPositions, setCommentPositions] = useState({});
	const [showComments, setShowComments] = useState(false);
	const [isEventLiked, setIsEventLiked] = useState(false);
	const [username, setUsername] = useState(null);
	const [impressions, setImpressions] = useState({});
	const [markerOpacity, setMarkerOpacity] = useState(new Animated.Value(0));
	const [radius, setRadius] = useState(100);
	const [sliderValue, setSliderValue] = useState(100);
	const [showRadius, setShowRadius] = useState(false);
	const [isSliderActive, setIsSliderActive] = useState(false);

	const IMPRESSION_THRESHOLD = 100;

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
			throw new Error("User not authenticated");
		}
		const userRef = firebase.firestore().collection("users").doc(user.uid);
		const userDoc = await userRef.get();
		const username = userDoc.data().username;
		setUsername(username);
		return username;
	};

	const handleEventPress = (event) => {
		updateImpressions(event.id);
		setSelectedEvent(event);
		setModalVisible(true);
	};

	const updateImpressions = async (eventId) => {
		setImpressions((prevImpressions) => {
			const eventImpressions = prevImpressions[eventId] || 0;
			return {
				...prevImpressions,
				[eventId]: eventImpressions + 1,
			};
		});
		const eventRef = firebase.firestore().collection("events").doc(eventId);
		await eventRef.update({
			impressions: firebase.firestore.FieldValue.increment(1),
		});
	};

	const toggleEventLike = async () => {
		const username = await getUsername();

		if (
			selectedEvent &&
			selectedEvent.likedBy &&
			selectedEvent.likedBy.includes(username)
		) {
			await unlikeEvent();
		} else {
			await likeEvent();
		}
	};

	const likeEvent = async () => {
		const user = firebase.auth().currentUser;
		const username = await getUsername();

		if (user && selectedEvent) {
			const eventRef = firebase
				.firestore()
				.collection("events")
				.doc(selectedEvent.id);
			await updateImpressions(selectedEvent.id);

			await eventRef.update({
				likedBy: firebase.firestore.FieldValue.arrayUnion(username),
			});

			setSelectedEvent((prevState) => ({
				...prevState,
				likedBy: [...prevState.likedBy, username],
			}));

			setIsEventLiked(true);
		}
	};

	const unlikeEvent = async () => {
		const user = firebase.auth().currentUser;
		const username = await getUsername();

		if (user && selectedEvent) {
			const eventRef = firebase
				.firestore()
				.collection("events")
				.doc(selectedEvent.id);

			await eventRef.update({
				likedBy: firebase.firestore.FieldValue.arrayRemove(username),
			});

			setSelectedEvent((prevState) => ({
				...prevState,
				likedBy: prevState.likedBy.filter((user) => user !== username),
			}));

			setIsEventLiked(false);
		}
	};

	const attendEvent = async () => {
		const user = firebase.auth().currentUser;
		const username = await getUsername();

		if (user && selectedEvent) {
			const eventRef = firebase
				.firestore()
				.collection("events")
				.doc(selectedEvent.id);
			await updateImpressions(selectedEvent.id);

			await eventRef.update({
				attendees: firebase.firestore.FieldValue.arrayUnion(username),
				groupSize: firebase.firestore.FieldValue.increment(1),
			});

			setSelectedEvent((prevState) => ({
				...prevState,
				attendees: [...prevState.attendees, username],
				groupSize: prevState.groupSize - 1,
				isAttending: true,
			}));
		}
	};

	const cancelAttendance = async () => {
		const user = firebase.auth().currentUser;
		const username = await getUsername();

		if (user && selectedEvent) {
			const eventRef = firebase
				.firestore()
				.collection("events")
				.doc(selectedEvent.id);

			await eventRef.update({
				attendees: firebase.firestore.FieldValue.arrayRemove(username),
				groupSize: firebase.firestore.FieldValue.increment(-1),
			});

			setSelectedEvent((prevState) => ({
				...prevState,
				attendees: prevState.attendees.filter((user) => user !== username),
				groupSize: prevState.groupSize + 1,
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
			if (status !== "granted") {
				alert("Permission to access location was denied");
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
			const eventRef = firebase
				.firestore()
				.collection("events")
				.doc(selectedEvent.id);
			await updateImpressions(selectedEvent.id);

			const commentData = {
				username: username,
				commentText: newCommentText.toString(),
				replyTo: replyToComment ? replyToComment : null,
				timestamp: firebase.firestore.FieldValue.serverTimestamp(),
				likes: [],
			};

			await eventRef.collection("comments").add(commentData);
		}
		setNewCommentText("");
		setReplyToComment(null);
	};

	const likeComment = async (commentId) => {
		const user = firebase.auth().currentUser;
		const username = await getUsername();

		if (user && selectedEvent) {
			const eventRef = firebase
				.firestore()
				.collection("events")
				.doc(selectedEvent.id);
			const commentRef = eventRef.collection("comments").doc(commentId);

			const commentSnapshot = await commentRef.get();
			const commentData = commentSnapshot.data();
			const likedBy = commentData.likes || [];

			if (likedBy.includes(username)) {
				// Benutzer hat den Kommentar bereits geliked, daher entfernen
				await commentRef.update({
					likes: likedBy.filter((user) => user !== username),
				});
			} else {
				// Benutzer hat den Kommentar noch nicht geliked, daher hinzufügen
				await commentRef.update({
					likes: [...likedBy, username],
				});
			}
		}
	};
	useEffect(() => {
		if (selectedEvent) {
			const eventRef = firebase
				.firestore()
				.collection("events")
				.doc(selectedEvent.id);

			eventRef
				.collection("comments")
				.orderBy("timestamp", "asc")
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
			const eventsRef = firebase.firestore().collection("events");

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

				const filteredEvents = filterEventsByRadius(eventsData, radius);
				setEvents(filteredEvents);

				Animated.timing(markerOpacity, {
					toValue: 1,
					duration: 5000,
					useNativeDriver: true,
				}).start();
			});
		};

		fetchEvents();
	}, [radius]);

	const renderComment = ({ item }) => (
		<Comment
			comment={item}
			replies={item.replies}
			goToComment={goToComment}
			openReplyInput={openReplyInput}
			likeComment={likeComment}
			username={username} // Hier wird username übergeben
		/>

	);

	const goToComment = (commentId) => {
		const position = commentPositions[commentId];
		if (position && scrollViewRef.current) {
			scrollViewRef.current.scrollTo({ y: position, animated: true });
		}
	};

	const filterEventsByRadius = (events, radius) => {
		if (!location) return events;

		const { latitude, longitude } = location.coords;

		return events.filter((event) => {
			const eventDistance = getDistanceFromLatLonInKm(
				latitude,
				longitude,
				event.latitude,
				event.longitude
			);
			return eventDistance <= radius;
		});
	};

	const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
		const R = 6371; // Radius der Erde in Kilometern
		const dLat = deg2rad(lat2 - lat1); // deg2rad unten
		const dLon = deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) *
			Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const d = R * c; // Entfernung in km
		return d;
	};

	const deg2rad = (deg) => {
		return deg * (Math.PI / 180);
	};

	const filteredEvents = filterEventsByRadius(events, radius);

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
					showsUserLocation
				>
					{isSliderActive && (
						<Circle
							center={{
								latitude: location.coords.latitude,
								longitude: location.coords.longitude,
							}}
							radius={radius * 1000}
							strokeColor="blue"
							strokeWidth={2}
							fillColor="rgba(0, 0, 255, 0.1)"
						/>
					)}

					{filteredEvents.map((event) => (
						<Marker
							key={event.id}
							coordinate={{
								latitude: event.latitude,
								longitude: event.longitude,
							}}
							onPress={() => handleEventPress(event)}
							// style={{ opacity: markerOpacity }}
							image={require("../../assets/IconMarker.png")}
						>
							{/* <View
								style={[
									event.advertised
										? styles.highlightedEventAdMarker
										: styles.eventMarker,
									event.advertised
										? null
										: event.impressions >= IMPRESSION_THRESHOLD
											? styles.friendHighlightedMarker
											: null,
								]}
							/> */}
						</Marker>
					))}
				</MapView>
			)}

			<View style={styles.sliderContainer}>
				<Slider
					style={styles.slider}
					minimumValue={1}
					maximumValue={500}
					step={1}
					value={sliderValue}
					onValueChange={(value) => {
						setSliderValue(value);
						setRadius(value);
					}}
					onSlidingStart={() => setIsSliderActive(true)}
					onSlidingComplete={() => setIsSliderActive(false)}
				/>
				<Text style={styles.sliderValueText}>{sliderValue} km</Text>
			</View>

			<Modal visible={modalVisible} animationType="slide">
				<LocalsEventDetails event={selectedEvent} onBackPress={() => setModalVisible(false)} />
				{/* <View style={styles.modalContainer}>
					{selectedEvent && !showComments && (
						<ScrollView>
							<View style={{ flex: 1, alignItems: "center" }}>
								<Image
									style={styles.eventModalImage}
									source={{ uri: selectedEvent.imageUrl }}
								/>
								{selectedEvent && selectedEvent.category && (
									<View style={styles.categoryBubbleContainer}>
										{selectedEvent.category
											.filter((category) => category !== "") // Filtere leere Kategorien
											.map((category) => (
												<View key={category} style={styles.categoryBubble}>
													<Text style={styles.categoryText}>{category}</Text>
												</View>
											))}
									</View>
								)}
								<Text style={styles.eventModalTitle}>{selectedEvent.title}</Text>
								<Text style={styles.eventModalText}>
									Erstellt von: {selectedEvent.creator}
								</Text>
								<LocalsButton title={"Hin da!"} onPress={openMapsApp} />
								<Text style={styles.eventModalText}>
									Beschreibung: {selectedEvent.description}
								</Text>



								{selectedEvent.isAttending ? (
									<LocalsButton
										title={"Nicht teilnehmen"}
										onPress={toggleAttendance}
									/>
								) : (
									<LocalsButton title={"Teilnehmen"} onPress={toggleAttendance} />
								)}

								<Text style={styles.eventModalText}>
									Freie Plätze: {selectedEvent.groupSize}
								</Text>
								{selectedEvent.likedBy &&
									selectedEvent.likedBy.includes(username) ? (
									<AntDesign
										name="heart"
										size={24}
										color="red"
										onPress={toggleEventLike}
									/>
								) : (
									<AntDesign
										name="heart"
										size={24}
										color="black"
										onPress={toggleEventLike}
									/>
								)}

								<Button
									title="Kommentare anzeigen"
									onPress={() => setShowComments(true)}
								/>
							</View>
						</ScrollView>
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
											: "Schreibe einen Kommentar"
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
				</View> */}
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	sliderContainer: {
		position: "absolute",
		bottom: 20,
		left: 20,
		right: 20,
		alignItems: "center",
	},
	sliderValueText: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 8,
	},
	slider: {
		width: "100%",
	},

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
		backgroundColor: "blue",
	},
	eventContainer: {
		alignItems: "center",
	},
	friendHighlightedMarker: {
		width: 16,
		height: 16,
		borderRadius: 2,
		borderWidth: 2,
		borderColor: "orange",
		backgroundColor: "red",
	},
	eventMarker: {
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: "red",
	},
	highlightedEventMarker: {
		width: 25,
		height: 25,
		borderRadius: 12,
		backgroundColor: "red",
		borderWidth: 4,
		borderColor: "blue",
	},
	highlightedEventAdMarker: {
		width: 30,
		height: 30,
		borderRadius: 12,
		backgroundColor: "green",
		borderWidth: 4,
		borderColor: "blue",
	},
	eventTitle: {
		fontSize: 12,
		color: "black",
		marginTop: 4,
		textAlign: "center",
	},
	modalContainer: {
		marginVertical: 30,
		flex: 1,
		justifyContent: "center",
		alignItems: "center",

	},
	eventModalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 8,
	},
	eventModalText: {
		fontSize: 16,
		marginBottom: 8,
	},
	eventModalImage: {
		width: 200,
		height: 200,
		resizeMode: "cover",
		marginBottom: 16,
	},
	closeButton: {
		fontSize: 16,
		color: "blue",
		marginTop: 20,
	},
	mapButton: {
		backgroundColor: "blue",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 4,
		marginBottom: 16,
	},
	mapButtonText: {
		color: "white",
		fontSize: 16,
	},
	button: {
		borderWidth: 1,
		borderRadius: 4,
		padding: 5,
	},

	commentContainer: {
		width: "100%", // Hinzugefügt
		marginTop: 10,
		borderLeftWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 5,
		marginBottom: 10,
		alignSelf: "flex-start",
		backgroundColor: "darkgrey",
	},

	commentText: {
		fontSize: 14,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
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
		backgroundColor: "lightblue",
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
	},
	sendButtonText: {
		fontSize: 14,
		color: "white",
	},
	replyButton: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
		backgroundColor: "lightblue",
		marginTop: 5,
	},
	replyButtonText: {
		fontSize: 14,
		color: "black",
	},
	categoryBubble: {
		backgroundColor: "blue",
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 10,
		marginBottom: 10,
		marginRight: 10
	},
	categoryText: {
		color: "white",
		fontSize: 14,
	},
	categoryBubbleContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		marginBottom: 10,
	},
	likeContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	likeCount: {
		marginLeft: 5,
		fontSize: 12,
		color: "gray",
	},
});

export default Livemap;
