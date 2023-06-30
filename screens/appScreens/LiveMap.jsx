import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	FlatList,
	Linking,
	Modal,
	Platform,
	StyleSheet,
	Text,
	ScrollView,
	TouchableOpacity,
	Button,
	Image,
	TextInput,
	View,
} from "react-native";
import MapView, { Circle, Marker as DefaultMarker } from "react-native-maps";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { auth, firebase } from "../../firebase";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import LocalsEventDetails from "../../components/LocalsEventDetails";

import LocalsButton from "../../components/LocalsButton";

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

	const [category, setCategory] = useState("");
	const [isModalVisible, setIsModalVisible] = useState(false);

	const [user, setUser] = useState({});

	const handleCategorySelect = (value) => {
		setCategory(value);
		setIsModalVisible(false);
	};

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

	function filterEventsByCategory(events, category) {
		return events.filter((event) => event.category === category);
	}

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

	const getUser = async () => {
		const userRef = await firestore
			.collection("users")
			.doc(selectedEvent.userId)
			.get();
		setUser(userRef.data());
	};

	useEffect(() => {
		getUser();
	}, []);

	const openMaps = () => {
		const scheme = Platform.select({
			ios: "maps:0,0?q=",
			android: "geo:0,0?q=",
		});
		const latLng = `${selectedEvent.latitude},${selectedEvent.longitude}`;
		const label = selectedEvent.address;
		const url = Platform.select({
			ios: `${scheme}${label}@${latLng}`,
			android: `${scheme}${latLng}(${label})`,
		});

		Linking.openURL(url);
	};

	const filteredEventsByRadius = filterEventsByRadius(events, radius);

	const filteredEvents = category
		? events.filter((event) => event.category === category)
		: events;

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

			{/* filter events by category modal */}
			<Modal visible={isModalVisible} animationType="slide">
				<View
					style={{
						margin: 100,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
						Filter by category{" "}
					</Text>
					<FlatList
						data={events.map((event) => event.category)}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => {
									setCategory(item);
									setIsModalVisible(false);
								}}
							>
								<Text
									style={{
										fontSize: 20,
										fontWeight: "bold",
										marginBottom: 20,
										color: "blue",
									}}
								>
									{item}
								</Text>
							</TouchableOpacity>
						)}
						keyExtractor={(item) => item}
					/>

					{/* remove filter */}
					<LocalsButton
						variant="secondary"
						title={"Clear filter"}
						onPress={() => {
							setCategory(null);
							setIsModalVisible(false);
						}}
						style={{ width: 200, height: 50, borderRadius: 10 }}
						fontStyle={{ color: "red", fontWeight: "bold" }}
					/>
					<LocalsButton
						variant="secondary"
						title={"Close"}
						onPress={() => setIsModalVisible(false)}
						style={{ width: 200, height: 50, borderRadius: 10 }}
						fontStyle={{ color: "black", fontWeight: "bold" }}
					/>
				</View>
			</Modal>

			<View style={styles.sliderContainer}>
				{/* filter events by category modal button */}

				<LocalsButton
					title={"Filter by " + (category ? category : "category")}
					onPress={() => setIsModalVisible(true)}
					style={{ width: 200, height: 50, borderRadius: 10 }}
				/>
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
				{/* <LocalsEventDetails event={selectedEvent} onBackPress={() => setModalVisible(false)} /> */}
				{selectedEvent && !showComments && (
					<ScrollView style={{ height: "100%" }}>
						<Image
							style={{ width: "100%", height: 400 }}
							// source={{ uri: selectedEvent.imageUrl }}
							source={{
								uri:
									"https://source.unsplash.com/random/?" + selectedEvent.title,
							}}
						/>
						<Ionicons
							name="chevron-down"
							size={24}
							color="white"
							style={{ position: "absolute", top: 50, left: 20 }}
							onPress={() => setModalVisible(false)}
						/>
						<View style={{ padding: 20 }}>
							<View style={styles.titleContainer}>
								<View style={{ width: "100%" }}>
									<Text style={styles.date}>03.01.2024</Text>

									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "space-between",
										}}
									>
										<Text style={styles.title}>{selectedEvent.title}</Text>

										{selectedEvent.likedBy &&
										selectedEvent.likedBy.includes(username) ? (
											<Ionicons
												name="heart"
												size={24}
												color="red"
												onPress={toggleEventLike}
											/>
										) : (
											<Ionicons
												name="heart-outline"
												size={24}
												color="red"
												onPress={toggleEventLike}
											/>
										)}
									</View>
								</View>
								<Image
									source={{ uri: user.imageUrl }}
									style={{ width: 42, height: 42, borderRadius: 50 }}
								/>
							</View>
						</View>
						<View style={styles.infoContainer}>
							{selectedEvent.category && (
								<View style={{ alignItems: "center" }}>
									<Ionicons name="list" size={32} color="grey" />
									<Text style={styles.item}>{selectedEvent.category}</Text>
								</View>
							)}
							<TouchableOpacity
								style={{ alignItems: "center" }}
								onPress={() => openMapsApp()}
							>
								<Ionicons name="compass" size={32} color="grey" />
								<Text style={styles.item} numberOfLines={2}>
									{selectedEvent.address}
								</Text>
							</TouchableOpacity>
							{selectedEvent.groupSize && (
								<View style={{ alignItems: "center" }}>
									<Ionicons name="people" size={32} color="grey" />
									<Text style={styles.item}>{selectedEvent.groupSize}</Text>
								</View>
							)}

							<View style={{ alignItems: "center" }}>
								<Ionicons name="person-circle" size={32} color="grey" />
								<Text style={styles.item}>{selectedEvent.creator}</Text>
							</View>
						</View>
						<View style={{ padding: 20 }}>
							{selectedEvent.isAttending ? (
								<LocalsButton
									title={"Nicht teilnehmen"}
									onPress={toggleAttendance}
								/>
							) : (
								<LocalsButton
									title={"Teilnehmen"}
									onPress={toggleAttendance}
									style={{ marginHorizontal: 24 }}
								/>
							)}
						</View>
						{selectedEvent.description && (
							<View style={{ padding: 20 }}>
								<Text style={styles.header}>About</Text>
								<Text style={{ color: "grey" }}>
									{selectedEvent.description}
								</Text>
							</View>
						)}
						<View style={styles.commentsContainer}>
							<Text style={styles.header}>Comments</Text>
							<LocalsButton
								variant="secondary"
								title="Kommentare anzeigen"
								onPress={() => setShowComments(true)}
								fontStyle={{ color: "dodgerblue" }}
							/>
						</View>
					</ScrollView>
				)}

				{selectedEvent && showComments && (
					<View style={styles.commentsContainer}>
						<Text style={styles.header}>Comments</Text>
						{/* TODO: add comments from `LiveMap.jsx` */}
						<Text style={{ color: "grey" }}>Comments will be here</Text>

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
							<TouchableOpacity style={styles.sendButton} onPress={addComment}>
								<Text style={styles.sendButtonText}>Senden</Text>
							</TouchableOpacity>
						</View>
						<Button
							title="Zurück zur Event-Ansicht"
							onPress={() => setShowComments(false)}
						/>
					</View>
				)}
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	sliderContainer: {
		position: "absolute",
		bottom: 85,
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
		marginTop: 20,
	},
	infoContainer: {
		paddingHorizontal: 24,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	container: {
		flex: 1,
		marginBottom: 80
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
		marginRight: 10,
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
	date: {
		fontSize: 16,
		marginRight: 10,
	},
	description: {
		fontSize: 16,
		marginBottom: 20,
	},
	addressContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	addressTitle: {
		fontSize: 16,
		fontWeight: "bold",
	},
	addressText: {
		fontSize: 16,
	},

	/////
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22,
	},
	commentsContainer: {
		padding: 20,
		marginBottom: 20,
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
	},
	item: {
		maxWidth: 100,
		textAlign: "center",
		marginTop: 5,
		fontSize: 12,
	},
	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
	},
	textStyle: {
		fontWeight: "bold",
		textAlign: "center",
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
	},
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
});

export default Livemap;
