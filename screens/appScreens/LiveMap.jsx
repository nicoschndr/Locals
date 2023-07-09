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

/**
 * used to create an animated marker component.
 * @type {Animated.AnimatedComponent<MapMarker>}
 */
const Marker = Animated.createAnimatedComponent(DefaultMarker);

// TODO: auslagern in eigene Datei

/**
 * is used to render a single comment in a comment section.
 * @param comment The comment data.
 * @param replies An array of reply comments.
 * @param goToComment A function to navigate to a specific comment.
 * @param openReplyInput A function to open the reply input for a comment.
 * @param highlighted Indicates whether the comment is currently highlighted.
 * @param setHighlighted A function to set the highlighted state of the comment.
 * @param likeComment A function to handle liking or unliking a comment.
 * @param username The username of the current user.
 * @returns {JSX.Element} the rendered comment section
 * @constructor
 */
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

	/**
	 * is used to handle liking or unliking a comment.
	 */
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

/**
 * Renders the LiveMap page with the provided props.
 * @param navigation The navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered LiveMap page.
 * @constructor
 */
const Livemap = ({ navigation }) => {

	/**
	 * Represents the user's current location. It is updated with the user's location coordinates.
	 */
	const [location, setLocation] = useState(null);

	/**
	 * Represents the list of events. It is updated with an array of event objects.
	 */
	const [events, setEvents] = useState([]);

	/**
	 * Controls the visibility of a modal component.
	 */
	const [modalVisible, setModalVisible] = useState(false);

	/**
	 * Represents the currently selected event object. It contains information about the event, including the list of
	 * attendees.
	 */
	const [selectedEvent, setSelectedEvent] = useState({ attendees: [] });

	/**
	 * Represents the list of comments associated with a particular event. It is updated with an array of comment
	 * objects.
	 */
	const [comments, setComments] = useState([]);

	/**
	 * Represents the text content of a new comment to be posted.
	 */
	const [newCommentText, setNewCommentText] = useState("");

	/**
	 * Represents the comment object that the user wants to reply to. It is updated with the selected comment object.
	 */
	const [replyToComment, setReplyToComment] = useState(null);

	/**
	 * Represents the text content of a reply to a specific comment. It is updated with the reply text.
	 */
	const [replyToCommentText, setReplyToCommentText] = useState(null);

	/**
	 * Provides a reference to the ScrollView component. It can be used to scroll to a specific position within the
	 * ScrollView.
	 * @type {React.MutableRefObject<undefined>}
	 */
	const scrollViewRef = useRef();
	const commentRefs = useRef({});

	/**
	 * Represents the positions of the comments within the ScrollView. It is updated with the positions of the comments
	 * relative to the top of the ScrollView.
	 */
	const [commentPositions, setCommentPositions] = useState({});

	/**
	 * Controls the visibility of comments within the UI.
	 */
	const [showComments, setShowComments] = useState(false);

	/**
	 * Represents whether the user has liked the selected event.
	 */
	const [isEventLiked, setIsEventLiked] = useState(false);

	/**
	 * Represents the username of the user. It is updated with the user's username.
	 */
	const [username, setUsername] = useState(null);

	/**
	 * Represents the username of the user. It is updated with the user's username.
	 */
	const [impressions, setImpressions] = useState({});

	/**
	 * Stores the opacity value for marker animation. It is initialized as an Animated value with a value of 0.
	 */
	const [markerOpacity, setMarkerOpacity] = useState(new Animated.Value(0));

	/**
	 * Stores the radius value. It is initialized as 30.
	 */
	const [radius, setRadius] = useState(30);

	/**
	 *  Stores the value of the slider. It is initialized as 30.
	 */
	const [sliderValue, setSliderValue] = useState(30);
	const [showRadius, setShowRadius] = useState(false);

	/**
	 * Indicates whether the slider is active or not. It is initialized as false.
	 */
	const [isSliderActive, setIsSliderActive] = useState(false);

	/**
	 * Stores the selected category. It is initialized as an empty string.
	 */
	const [category, setCategory] = useState("");

	/**
	 * Indicates whether the modal is visible or not. It is initialized as false.
	 */
	const [isModalVisible, setIsModalVisible] = useState(false);

	/**
	 * Stores the user data. It is initialized as an empty object.
	 */
	const [user, setUser] = useState({});

	const handleCategorySelect = (value) => {
		setCategory(value);
		setIsModalVisible(false);
	};

	/**
	 * represents a date format configuration used to display dates in a short format.
	 * @type {{month: string, year: string, day: string}}
	 */
	const shortDate = {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	};

	const IMPRESSION_THRESHOLD = 100;

	const onCommentLayout = (event, commentId) => {
		const layout = event.nativeEvent.layout;
		setCommentPositions((prevPositions) => ({
			...prevPositions,
			[commentId]: layout.y,
		}));
	};

	/**
	 * is used to fetch and retrieve the username of the currently authenticated user.
	 * @returns {Promise<any>}
	 */
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

	/**
	 * is triggered when an event is pressed or selected
	 * @param event The event object representing the selected event.
	 */
	const handleEventPress = (event) => {
		updateImpressions(event.id);
		setSelectedEvent(event);
		setModalVisible(true);
	};

	/**
	 *  is used to update the impressions count for a specific event
	 * @param eventId The unique identifier of the event for which to update the impressions count.
	 * @returns {Promise<void>}
	 */
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

	/**
	 *  is used to toggle the like status of the selected event
	 * @returns {Promise<void>}
	 */
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

	/**
	 * is used to like the selected event
	 * @returns {Promise<void>}
	 */
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

	/**
	 * is used to unlike the selected event
	 * @returns {Promise<void>}
	 */
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

	/**
	 *  is used to indicate that the user is attending the selected event.
	 * @returns {Promise<void>}
	 */
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

	/**
	 * is used to cancel the user's attendance for the selected event
	 * @returns {Promise<void>}
	 */
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

	/**
	 * is used to toggle the user's attendance status for the selected event
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 * asynchronous function that requests permission to access the device's location and sets up a location
		 * subscription. The subscription updates the location state whenever a new location is received.
		 */
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

	/**
	 * is used to open the reply input for a comment.
	 * @param commentId the id of the comment
	 * @param commentText the content of the comment
	 */
	const openReplyInput = (commentId, commentText) => {
		setReplyToComment(commentId);
		setReplyToCommentText(commentText);
	};

	/**
	 *  is used to open the maps application with the location of the selected event
	 */
	const openMapsApp = () => {
		const { latitude, longitude } = selectedEvent;

		const url = Platform.select({
			ios: `maps:0,0?q=${latitude},${longitude}`,
			android: `geo:0,0?q=${latitude},${longitude}`,
		});

		Linking.openURL(url);
	};

	/**
	 * is used to add a comment to the selected event
	 * @returns {Promise<void>}
	 */
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

	/**
	 * is used to like or unlike a comment within the selected event
	 * @param commentId the id of the comment
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 *  is used to retrieve and display comments for the selected event.
		 */
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

	/**
	 * is used to construct a tree-like structure for organizing comments and their replies. It takes an array of
	 * comments as input and returns the comment tree structure.
	 * @param comments the comments for an event
	 * @returns {*[]}
	 */
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

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 * responsible for fetching and subscribing to real-time updates of events from the Firestore database
		 * @returns {Promise<void>}
		 */
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

	/**
	 * component rendering function used to render a single comment item in a list. It takes an object with the item
	 * property as its parameter.
	 * @param item represents a comment object
	 * @returns {JSX.Element}
	 */
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

	/**
	 *  responsible for scrolling the comment list to a specific comment with the given commentId.
	 * @param commentId the id of the comment
	 */
	const goToComment = (commentId) => {
		const position = commentPositions[commentId];
		if (position && scrollViewRef.current) {
			scrollViewRef.current.scrollTo({ y: position, animated: true });
		}
	};

	/**
	 * is used to filter a list of events based on a given radius.
	 * @param events all events
	 * @param radius the given radius
	 * @returns {*}
	 */
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
		const uniqueCategories = [
			...new Set(events.map((event) => event.category)),
		];
		return uniqueCategories;
	}

	/**
	 *  is used to calculate the distance between two sets of latitude and longitude coordinates. It follows the
	 *  Haversine formula to calculate the distance based on the curvature of the Earth
	 * @param lat1 The latitude of the first point in decimal degrees.
	 * @param lon1 The longitude of the first point in decimal degrees.
	 * @param lat2 The latitude of the second point in decimal degrees.
	 * @param lon2 The longitude of the second point in decimal degrees.
	 * @returns {number} the distance
	 */
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

	/**
	 * used to convert degrees to radians
	 * @param deg The value in degrees to be converted to radians.
	 * @returns {number} the value in radians
	 */
	const deg2rad = (deg) => {
		return deg * (Math.PI / 180);
	};

	/**
	 * retrieves user data from the Firestore database based on the userId of a selected event
	 * @returns {Promise<void>}
	 */
	const getUser = async () => {
		const userRef = await firestore
			.collection("users")
			.doc(selectedEvent.userId)
			.get();
		setUser(userRef.data());
	};

	/**
	 * Executes functions once when the component mounts.
	 */
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

	/**
	 * the filtered events
	 * @type {*}
	 */
	const filteredEventsByRadius = filterEventsByRadius(events, radius);

	/**
	 * is used to filter events based on the selected category.
	 * @type {*}
	 */
	const filteredEvents = category
		? filteredEventsByRadius.filter((event) => event.category === category)
		: filteredEventsByRadius;

	/**
	 * renders the LiveMap page.
	 */
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
			<View style={styles.filterContainer}>
				<TouchableOpacity
					onPress={() => setIsModalVisible(true)}
					style={{
						width: 30,
						height: 30,
						borderRadius: 100,
						backgroundColor: "#ec404b",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Ionicons name="filter-outline" size={24} color="#f3f3f3" />
				</TouchableOpacity>
			</View>

			<View style={styles.sliderContainer}>
				<Slider
					style={styles.slider}
					minimumValue={1}
					maximumValue={100}
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
							size={40}
							color="#ec404b"
							style={{ position: "absolute", top: 50, left: 20 }}
							onPress={() => setModalVisible(false)}
						/>
						<View style={{ padding: 20 }}>
							<View style={styles.titleContainer}>
								<View style={{ width: "100%" }}>
									<Text style={styles.date}>
										{selectedEvent.date
											?.toDate()
											?.toLocaleDateString("de-DE", shortDate)}
									</Text>

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
								<TouchableOpacity
									onPress={() => {
										console.log(selectedEvent.userId);
										navigation.navigate("Profile", {
											uid: selectedEvent.userId,
										});
										setModalVisible(false);
									}}
								>
									<Image
										style={{ width: 32, height: 32, borderRadius: 16 }}
										source={{ uri: selectedEvent.imageUrl }}
									/>
									<Text style={styles.item}>{selectedEvent.creator}</Text>
								</TouchableOpacity>
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

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
const styles = StyleSheet.create({
	sliderContainer: {
		position: "absolute",
		bottom: 25,
		left: 20,
		right: 20,
		alignItems: "center",
	},
	filterContainer: {
		position: "absolute",
		top: 45,
		left: 20,
		right: 20,
		alignItems: "flex-end",
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
		marginBottom: 80,
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
