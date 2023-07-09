import {
	View,
	Text,
	Button,
	StyleSheet,
	TouchableOpacity,
	Modal,
	TextInput,
	ScrollView,
	KeyboardAvoidingView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { firebase, firestore, auth } from "../../firebase";
import * as Location from "expo-location";

/**
 * used to format a timestamp into a localized string representation.
 * @param timestamp The timestamp object to be formatted.
 * @returns {string} returns a formatted string representation of the timestamp. If the timestamp parameter is not valid
 * or does not have a toDate method, an empty string is returned.
 */
const formatTimestamp = (timestamp) => {
	if (timestamp && timestamp.toDate) {
		const date = timestamp.toDate();
		const now = new Date();
		const isSameDay =
			now.getDate() === date.getDate() &&
			now.getMonth() === date.getMonth() &&
			now.getFullYear() === date.getFullYear();

		if (isSameDay) {
			return date.toLocaleTimeString("de-DE", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else {
			return date.toLocaleString("de-DE", {
				hour: "2-digit",
				minute: "2-digit",
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
		}
	} else {
		return "";
	}
};

/**
 * Renders the Yelling page with the provided props.
 * @param navigation The navigation object for navigating between screens.
 * @returns {JSX.Element} The rendered Yelling page.
 * @constructor
 */
const Yell = ({ navigation }) => {

	/**
	 * the text input of the user
	 */
	const [textInput, setTextInput] = useState("");

	/**
	 * indicates if the modal is visible or not
	 */
	const [modalVisible, setModalVisible] = useState(false);

	/**
	 * indicates if the select modal is visible or not
	 */
	const [modalSelectVisible, setModalSelectVisible] = useState(false);

	/**
	 * the username of the current user.
	 */
	const [username, setUsername] = useState("");

	/**
	 * the posts of the current user.
	 */
	const [posts, setPosts] = useState([]);

	/**
	 * the selected background color of the post
	 */
	const [selectedColor, setSelectedColor] = useState("white");

	/**
	 * the post that is clicked on
	 */
	const [selectedPost, setSelectedPost] = useState(null);

	/**
	 * the text of a comment
	 */
	const [commentInput, setCommentInput] = useState("");

	/**
	 * comments of a post
	 */
	const [comments, setComments] = useState([]);

	/**
	 * the height of the text input
	 */
	const [inputHeight, setInputHeight] = useState(0);

	/**
	 * event handler used to handle the click event on a post.
	 * @param post The post object that was clicked.
	 */
	const handlePostClick = (post) => {
		setSelectedPost(post);
		setModalSelectVisible(true);
	};

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 *  sets up a Firestore realtime listener to listen for changes in the comments collection of a selected post
		 *  and update the comments state variable
		 */
		if (selectedPost) {
			const unsubscribe = firestore
				.collection("posts")
				.doc(selectedPost.id)
				.collection("comments")
				.orderBy("timestamp", "desc")
				.onSnapshot((snapshot) => {
					const commentsData = [];
					snapshot.forEach((doc) => {
						const commentData = doc.data();
						commentsData.push({ id: doc.id, ...commentData });
					});
					setComments(commentsData.reverse()); // Hier wurde reverse() hinzugefügt
				});

			return () => unsubscribe();
		}
	}, [selectedPost]);


	/**
	 * used to handle the submission of a comment on a selected post.
	 */
	const handleSubmitComment = () => {
		if (commentInput.trim() !== "") {
			const comment = {
				text: commentInput,
				username: username,
				timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			};

			firestore
				.collection("posts")
				.doc(selectedPost.id)
				.collection("comments")
				.add(comment)
				.then(() => {
					setCommentInput("");
				})
				.catch((error) => {
					console.log("Fehler beim Speichern des Kommentars:", error);
				});
		}
	};

	/**
	 * used to handle the reporting of a post.
	 * @param postId The ID of the post to be reported.
	 */
	const handleReport = (postId) => {
		firestore
			.collection("posts")
			.doc(postId)
			.get()
			.then((doc) => {
				if (doc.exists) {
					const postData = doc.data();
					if (!postData.reports) {
						firestore
							.collection("posts")
							.doc(postId)
							.update({ reports: [] })
							.then(() => {
								console.log("Das 'reports'-Array wurde erfolgreich erstellt.");
								reportPost(postId);
							})
							.catch((error) => {
								console.log(
									"Fehler beim Erstellen des 'reports'-Arrays:",
									error
								);
							});
					} else {
						reportPost(postId);
					}
				}
			})
			.catch((error) => {
				console.log("Fehler beim Abrufen des Posts:", error);
			});
	};

	/**
	 * used to report a specific post.
	 * @param postId The ID of the post to be reported.
	 */
	const reportPost = (postId) => {
		const reportData = {
			username: username,
			timestamp: new Date(),
		};

		firestore
			.collection("posts")
			.doc(postId)
			.update({
				reports: firebase.firestore.FieldValue.arrayUnion(reportData),
			})
			.then(() => {
				console.log("Post erfolgreich gemeldet");
				alert("Yell gemeldet");
			})
			.catch((error) => {
				console.log("Fehler beim Melden des Posts:", error);
			});
	};

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 * sets up an onAuthStateChanged listener to listen for changes in the user authentication state.
		 * @type {Unsubscribe}
		 */
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (user) {
				firestore
					.collection("users")
					.doc(user.uid)
					.get()
					.then((doc) => {
						if (doc.exists) {
							const userData = doc.data();
							setUsername(userData.username);
						}
					})
					.catch((error) => {
						console.log("Fehler beim Abrufen des Benutzernamens:", error);
					});
			} else {
				setUsername("");
			}
		});

		return () => unsubscribe();
	}, []);


	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 * sets up a Firestore realtime listener to listen for changes in the "posts" collection and update the posts
		 * state variable accordingly.
		 * @type {() => void}
		 */
		const unsubscribe = firestore
			.collection("posts")
			.orderBy("timestamp", "desc")
			.onSnapshot((snapshot) => {
				const postsData = [];
				snapshot.forEach((doc) => {
					const postData = doc.data();
					postsData.push({ id: doc.id, ...postData });
				});
				setPosts(postsData);
			});

		return () => unsubscribe();
	}, []);

	/**
	 * used to submit a text post to the Firestore "posts" collection.
	 * @returns {Promise<void>}
	 */
	const submitText = async () => {
		if (textInput.trim() !== "") {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status === "granted") {
					const location = await Location.getCurrentPositionAsync({});
					const { latitude, longitude } = location.coords;

					const post = {
						text: textInput,
						username: username,
						color: selectedColor,
						likes: [],
						timestamp: firebase.firestore.FieldValue.serverTimestamp(),
						location: new firebase.firestore.GeoPoint(latitude, longitude),
					};

					firestore
						.collection("posts")
						.add(post)
						.then(() => {
							console.log("Text erfolgreich gespeichert");
							setTextInput("");
							setModalVisible(false);
						})
						.catch((error) => {
							console.log("Fehler beim Speichern des Textes:", error);
						});
				} else {
					console.log("Keine Berechtigung zur Standortabfrage erteilt");
				}
			} catch (error) {
				console.log("Fehler bei der Standortabfrage:", error);
			}
		}
	};

	/**
	 * array of objects representing a predefined color palette.
	 * @type {[{color: string, name: string},{color: string, name: string},{color: string, name: string},
	 * {color: string, name: string},{color: string, name: string},null,null,null,null,null,null,null,null,null]}
	 */
	const colorPalette = [
		{ name: "Crimson", color: "#DC143C" },
		{ name: "DarkRed", color: "#8B0000" },
		{ name: "DarkOrange", color: "#FF8C00" },
		{ name: "Chocolate", color: "#D2691E" },
		{ name: "DarkGoldenrod", color: "#B8860B" },
		{ name: "Olive", color: "#808000" },
		{ name: "DarkOliveGreen", color: "#556B2F" },
		{ name: "ForestGreen", color: "#228B22" },
		{ name: "Teal", color: "#008080" },
		{ name: "SteelBlue", color: "#4682B4" },
		{ name: "RoyalBlue", color: "#4169E1" },
		{ name: "MediumPurple", color: "#9370DB" },
		{ name: "MediumOrchid", color: "#BA55D3" },
		{ name: "MediumVioletRed", color: "#C71585" },
	];

	/**
	 * used to handle the selection of a color from the
	 * @param color The selected color.
	 */
	const handleColorSelection = (color) => {
		setSelectedColor(color);
	};

	/**
	 * used to handle the liking or unliking of a post.
	 * @param postId The ID of the post.
	 */
	const handleLike = (postId) => {
		const postRef = firestore.collection("posts").doc(postId);

		postRef.get().then((doc) => {
			if (doc.exists) {
				const post = doc.data();
				const { likes } = post;

				if (likes.includes(username)) {
					const updatedLikes = likes.filter((like) => like !== username);
					postRef.update({ likes: updatedLikes });
				} else {
					const updatedLikes = [...likes, username];
					postRef.update({ likes: updatedLikes });
				}
			}
		});
	};

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 * used to select a random color from the colorPalette array.
		 * @type {string}
		 */
		const randomColor =
			colorPalette[Math.floor(Math.random() * colorPalette.length)].color;
		setSelectedColor(randomColor);
	}, [modalVisible]);

	/**
	 * renders the Yelling page.
	 */
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.goBack}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="chevron-back" size={30} color="black" />
				</TouchableOpacity>
				<Text
					style={{
						fontSize: 24,
						fontWeight: "bold",
					}}
				>
					Community Posts
				</Text>
				<TouchableOpacity
					style={styles.addIcon}
					onPress={() => setModalVisible(true)}
				>
					<Ionicons name="add-circle-outline" size={30} color="black" />
				</TouchableOpacity>
			</View>
			<Modal visible={modalVisible} animationType="slide">
				<KeyboardAvoidingView
					style={[
						styles.postModalContainer,
						{ backgroundColor: selectedColor },
					]}
					behavior="padding"
				>
					<View style={styles.modalHeader}>
						<TouchableOpacity
							style={styles.goBack}
							onPress={() => setModalVisible(false)}
						>
							<Ionicons name="chevron-down" size={30} />
						</TouchableOpacity>
						<Text style={{ fontSize: 24, fontWeight: "bold" }}>Neuer Post</Text>
						<TouchableOpacity style={styles.addIcon} onPress={console.log}>
							<Ionicons
								name="add-circle-outline"
								size={30}
								color="transparent"
							/>
						</TouchableOpacity>
					</View>
					<View style={{ alignItems: "center" }}>
						<TextInput
							value={textInput}
							onChangeText={setTextInput}
							placeholder="Text eingeben"
							style={styles.input}
							multiline={true}
							numberOfLines={5}
							maxLength={240}
						/>

						<View style={styles.buttonContainer}>
							<TouchableOpacity onPress={submitText}>
								<Ionicons name="megaphone-outline" size={50} color="white" />
							</TouchableOpacity>
						</View>

						<Text style={{ fontSize: 20, paddingTop: 90 }}>
							Wählen eine Farbe aus
						</Text>
						<ScrollView
							horizontal
							contentContainerStyle={styles.colorPickerScrollContainer}
						>
							{colorPalette.map((color, index) => (
								<TouchableOpacity
									key={index}
									style={[
										styles.colorButton,
										{ backgroundColor: color.color },
										selectedColor === color.color && styles.selectedColorButton,
									]}
									onPress={() => handleColorSelection(color.color)}
								/>
							))}
						</ScrollView>
					</View>
				</KeyboardAvoidingView>
			</Modal>

			<Modal
				visible={modalSelectVisible}
				animationType="slide"
				animationIn="slideInUp"
				animationOut="slideOutDown"
			>
				<KeyboardAvoidingView style={styles.modalContainer}>
					<View style={{ flex: 1, backgroundColor: "white", minWidth: "100%" }}>
						<ScrollView
							style={[
								styles.postContainer,
								{ backgroundColor: selectedPost?.color },
							]}
						>
							<View
								style={[
									styles.postModal,
									{ backgroundColor: selectedPost?.color },
								]}
							>
								<View style={styles.postHeader}>
									<TouchableOpacity
										style={styles.reportBtn}
										onPress={() => handleReport(selectedPost?.id)}
									>
										<Ionicons name="alert-circle-outline" size={20} />
									</TouchableOpacity>
								</View>

								<View style={styles.postContent}>
									<Text style={styles.postText}>{selectedPost?.text}</Text>
								</View>

								<View style={styles.postFooter}>
									<Text style={styles.postUsername}>
										- {selectedPost?.username}
									</Text>

									<TouchableOpacity
										style={[
											styles.likeButton,
											selectedPost?.likes.includes(username) &&
												styles.likedButton,
										]}
										onPress={() => handleLike(selectedPost?.id)}
									>
										<Ionicons
											name={
												selectedPost?.likes.includes(username)
													? "heart"
													: "heart-outline"
											}
											size={16}
											color={
												selectedPost?.likes.includes(username) ? "red" : "black"
											}
										/>
										<Text style={styles.likeCount}>
											{selectedPost?.likes.length}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
							{comments.map((comment, index) => (
								<View key={index} style={styles.comment}>
									<Text style={styles.postText}>{comment.text}</Text>
									<Text style={[styles.postUsername, { textAlign: "right" }]}>
										{comment.username}
									</Text>
									<Text style={[styles.postUsername, { textAlign: "right" }]}>
										{formatTimestamp(comment.timestamp)}
									</Text>
								</View>
							))}
						</ScrollView>

						<View
							style={[
								styles.inputContainerComment,
								{ backgroundColor: "white" },
							]}
						>
							<TextInput
								style={[
									styles.inputComment,
									{ height: Math.min(5 * 18, inputHeight) },
								]}
								placeholder="Kommentar hinzufügen"
								value={commentInput}
								onChangeText={setCommentInput}
							/>
							<TouchableOpacity onPress={handleSubmitComment}>
								<MaterialIcons name="send" size={24} color="#ec404b" />
							</TouchableOpacity>
						</View>

						<Button
							title="Schließen"
							onPress={() => setModalSelectVisible(false)}
						/>
					</View>
				</KeyboardAvoidingView>
			</Modal>

			<ScrollView
				style={styles.postContainer}
				showsVerticalScrollIndicator={false}
			>
				{posts.map((post, index) => (
					<TouchableOpacity key={index} onPress={() => handlePostClick(post)}>
						<View
							key={index}
							style={[styles.post, { backgroundColor: post.color }]}
						>
							<View style={styles.postContent}>
								<Text style={styles.postText}>{post.text}</Text>
							</View>

							<View style={styles.postFooter}>
								<Text style={styles.postUsername}>- {post.username}</Text>
								<Text style={styles.postUsername}>
									- {formatTimestamp(post.timestamp)}
								</Text>

								<TouchableOpacity
									style={[
										styles.likeButton,
										post.likes.includes(username) && styles.likedButton,
									]}
									onPress={() => handleLike(post.id)}
								>
									<Ionicons
										name={
											post.likes.includes(username) ? "heart" : "heart-outline"
										}
										size={16}
										color={post.likes.includes(username) ? "red" : "black"}
									/>
									<Text style={styles.likeCount}>{post.likes.length}</Text>
								</TouchableOpacity>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
};

/**
 * Creates a StyleSheet object containing style definitions for component.
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 20,
		marginBottom: 85,
	},
	header: {
		top: 40,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		position: "relative",
		zIndex: 1,
		marginHorizontal: 20,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		position: "relative",
		zIndex: 1,
		marginHorizontal: 20,
	},
	addIcon: {
		zIndex: 999,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "white",
		paddingVertical: 20,
	},
	postModalContainer: {
		flex: 1,
		justifyContent: "space-between",
		backgroundColor: "white",
		paddingVertical: 20,
		paddingTop: 60,
	},
	input: {
		width: "99%",
		height: "50%",
		borderBottomWidth: 1,
		borderColor: "white",
		paddingHorizontal: 10,
		textAlignVertical: "top",
		color: "white",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		marginVertical: 10,
	},
	colorPickerScrollContainer: {
		alignItems: "center",
		paddingHorizontal: 10,
	},
	colorButton: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginHorizontal: 5,
		borderWidth: 1,
		borderColor: "white",
	},
	selectedColorButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginHorizontal: 5,
		shadowColor: "rgba(0, 0, 0, 0.3)", // Schattenfarbe
		shadowOffset: {
			width: 1,
			height: 5,
		},
		shadowOpacity: 1,
		shadowRadius: 2,
		elevation: 2, // Für Android-Schatten
	},
	postContainer: {
		flex: 1,
		top: 48,
		marginBottom: 52,
	},
	post: {
		flexDirection: "column",
		borderRadius: 10,
		margin: 5,
		padding: 10,
		minHeight: 100,
		justifyContent: "space-between",
		shadowColor: "rgba(0, 0, 0, 0.2)", // Schattenfarbe
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 1,
		shadowRadius: 2,
		elevation: 2, // Für Android-Schatten
	},
	postFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 10,
	},
	postUsername: {
		fontSize: 12,
		fontStyle: "italic",
		color: "white",
	},
	likeButton: {
		flexDirection: "row",
		alignItems: "center",
	},

	postHeader: {
		flex: 1,
		justifyContent: "flex-end",
		alignItems: "flex-end",
	},

	reportBtn: {},

	postContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	postText: {
		fontSize: 16,
		color: "white",
		textAlign: "left",
	},

	likedButton: {
		color: "red",
	},
	likeCount: {
		fontSize: 12,
		marginLeft: 5,
	},
	inputContainerComment: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	inputComment: {
		flex: 1,
		minHeight: 40,
		maxHeight: 120,
		marginRight: 8,
		paddingHorizontal: 8,
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 15,
	},
	commentContainer: {
		width: "100%",
		borderTopWidth: 2,
	},
	postModal: {
		flexDirection: "column",
		marginBottom: 20,
		padding: 10,
		minHeight: 100,
		justifyContent: "space-between",
		borderBottomWidth: 5, // Fügt eine untere Grenze hinzu
		borderBottomColor: "rgb(255,255,255)",
	},
	comment: {
		padding: 5,
		marginTop: 10,
		marginBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.6)",
	},
});

export default Yell;
