import {
	View,
	Text,
	Modal,
	StyleSheet,
	Image,
	Actionsheet,
	ActionSheetIOS,
	Alert,
	TouchableOpacity,
	Linking,
	FlatList,
	TextInput,
	Button,
	Animated,
	Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import LocalsButton from "../../components/LocalsButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { auth, firebase, firestore } from "../../firebase";

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
		<TouchableOpacity style={styles.commentContainer}>
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

const EventDetails = ({ route, navigation }) => {
	const { event } = route.params;
	const [selectedEvent, setSelectedEvent] = useState({ attendees: [] });
	const { showModal, setShowModal } = useState(false);
	const [user, setUser] = useState({});
	const [showComments, setShowComments] = useState(false);
	const [comments, setComments] = useState([]);
	const [newCommentText, setNewCommentText] = useState("");
	const [replyToComment, setReplyToComment] = useState(null);
	const [replyToCommentText, setReplyToCommentText] = useState(null);
	const scrollViewRef = useRef();
	const [impressions, setImpressions] = useState({});
	const [isEventLiked, setIsEventLiked] = useState(false);
	const [username, setUsername] = useState(null);
	const [currentUser, setCurrentUser] = useState({});
	const [fullStorage, setFullStorage] = useState(false);
	let rA = [];

	const getEventById = async (id) => {
		const user = auth.currentUser;
		if (!user) {
			throw new Error("User not authenticated");
		}
		const userRef = firebase.firestore().collection("users").doc(user.uid);
		const userDoc = await userRef.get();
		const username = userDoc.data().username;
		setUsername(username);

		// Verbindung zur Firestore-Datenbank
		const db = firebase.firestore();

		// Zugriff auf die Event-Dokumente
		const eventRef = db.collection("events").doc(id);

		// Abrufen des Dokuments
		const doc = await eventRef.get();

		// Überprüfen, ob das Dokument existiert
		if (!doc.exists) {
			console.log("Kein solches Event vorhanden!");
			return;
		}

		// Wenn das Dokument existiert, speichern Sie die Daten als event
		let event = doc.data();

		// Abrufen der Kommentare
		const commentsRef = eventRef.collection("comments");
		const commentsSnapshot = await commentsRef.get();

		// Konvertieren der Snapshot-Daten in ein einfacher zu handhabendes Format
		const comments = commentsSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		// Hinzufügen der id und comments zum event Objekt
		event = {
			id: doc.id,
			comments,
			...event,
		};
		event.isAttending = Array.isArray(event.attendees)
			? event.attendees.includes(username)
			: false;

		setSelectedEvent(event);

		console.log(true);
		const eventRef3 = firebase.firestore().collection("events").doc(event.id);

		eventRef3
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
		console.log(selectedEvent.likedBy);
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
			recentActivity(
				"event",
				"participate",
				selectedEvent.id,
				selectedEvent.title
			);
		}
	};

	function recentActivity(category, action, uid, title) {
		currentUser.recentActivities.forEach((a) => rA.push(a));
		if (rA.length === 3) {
			rA.splice(0, 1);
			rA.push({
				category: category,
				action: action,
				title: title,
				uid: uid,
			});
			firestore.collection("users").doc(auth.currentUser.uid).update({
				recentActivities: rA,
			});
		} else {
			rA.push({
				category: category,
				action: action,
				title: title,
				uid: uid,
			});
			firestore.collection("users").doc(auth.currentUser.uid).update({
				recentActivities: rA,
			});
		}
	}
	function getCurrentUserData() {
		firestore
			.collection("users")
			.doc(auth.currentUser.uid)
			.onSnapshot((snapshot) => {
				setCurrentUser(snapshot.data());
			});
	}

	const getEventHost = async () => {
		const userRef = await firestore.collection("users").doc(event.userId).get();
		setUser(userRef.data());
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
			const eventRef = firebase.firestore().collection("events").doc(event.id);
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
		getEventHost();
		getCurrentUserData();
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
	}, []);

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

	const shortDate = {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	};

	const goToComment = (commentId) => {
		const position = commentPositions[commentId];
		if (position && scrollViewRef.current) {
			scrollViewRef.current.scrollTo({ y: position, animated: true });
		}
	};

	const openReplyInput = (commentId, commentText) => {
		setReplyToComment(commentId);
		setReplyToCommentText(commentText);
	};

	//TODO: attend to event from `LiveMap.jsx`

	const deleteEvent = () => {
		Alert.alert(
			"Delete Event",
			"Are you sure you want to delete this event?",
			[
				{
					text: "Cancel",
					onPress: () => console.log("Cancel Pressed"),
					style: "cancel",
				},
				{
					text: "OK",
					onPress: () => {
						firestore
							.collection("events")
							.doc(event.id)
							.delete()
							.then(() => {
								alert("Event successfully deleted!");
								setTimeout(() => {
									navigation.navigate("Profile");
								}, 1000);
							})
							.catch((error) => {
								alert("Error removing event: ", error);
							});
					},
				},
			],
			{ cancelable: false }
		);
	};

	const getUser = async () => {
		const userRef = await firestore.collection("users").doc(event.userId).get();
		setUser(userRef.data());
	};

	useEffect(() => {
		const fetchUsernameAndEvent = async () => {
			await getEventById(route.params.event.id);
		};
		fetchUsernameAndEvent();
		checkTrafficAvailability();
	}, []);

	const showActionSheet = () => {
		const options = ["Edit", "Delete", "Cancel"];
		const destructiveButtonIndex = 1;
		const cancelButtonIndex = 2;

		ActionSheetIOS.showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				destructiveButtonIndex,
			},
			(buttonIndex) => {
				if (buttonIndex === 0) {
					navigation.navigate("EditPost", { event });
				} else if (buttonIndex === 1) {
					deleteEvent();
				}
			}
		);
	};

	const checkTrafficAvailability = async () => {
		try {
			// Verwende die Firebase Storage API, um Informationen über den verbleibenden Traffic abzurufen
			const storageRef = firebase.storage().ref();

			// Rufe die Nutzungsinformationen des Storage ab
			const { usage } = await storageRef.child("/").getMetadata();

			// Überprüfe, ob noch ausreichend Traffic vorhanden ist
			const remainingTraffic = usage.limit - usage.size;
			const threshold = 100000; // Schwellenwert für verbleibenden Traffic

			if (remainingTraffic < threshold) {
				setFullStorage(true);
			}

			return remainingTraffic > threshold;
		} catch (error) {
			console.error("Error checking traffic availability:", error);
			return false;
		}
	};

	return (
		<View style={styles.container}>
			{!showComments && (
				<ScrollView style={{ height: "100%" }}>
					<Image
						style={{ width: "100%", height: 400 }}
						// source={{ uri: event.imageUrl }}
						image={
							fullStorage
								? event.imageUrl
								: "https://source.unsplash.com/random/?portrait"
						}
					/>
					<Ionicons
						name="chevron-down"
						size={40}
						color="#ec404b"
						style={{ position: "absolute", top: 50, left: 20 }}
						onPress={() => navigation.goBack()}
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
								onPress={() =>
									navigation.navigate("Profile", {
										uid: event.userId,
									})
								}
							>
								<Image
									style={{ width: 32, height: 32, borderRadius: 16 }}
									image={
										fullStorage
											? user.imageUrl
											: "https://source.unsplash.com/random/?portrait"
									}
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
					{event.description && (
						<View style={{ padding: 20 }}>
							<Text style={styles.header}>About</Text>
							<Text style={{ color: "grey" }}>{event.description}</Text>
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
			{showComments && (
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
		</View>
	);
};

export default EventDetails;

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
