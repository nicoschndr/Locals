import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView } from "react-native";
import React, { useEffect, useState } from "react";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import { firebase, firestore, auth } from "../../firebase";

const formatTimestamp = (timestamp) => {
	const date = timestamp.toDate();
	const now = new Date();
	const isSameDay = now.getDate() === date.getDate() &&
		now.getMonth() === date.getMonth() &&
		now.getFullYear() === date.getFullYear();

	if (isSameDay) {
		return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
	} else {
		return date.toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit' });
	}
};


const Template = () => {
	const [textInput, setTextInput] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [modalSelectVisible, setModalSelectVisible] = useState(false);

	const [username, setUsername] = useState("");
	const [posts, setPosts] = useState([]);
	const [selectedColor, setSelectedColor] = useState("white");
	const [selectedPost, setSelectedPost] = useState(null);
	const [commentInput, setCommentInput] = useState("");
	const [comments, setComments] = useState([]);
	const [inputHeight, setInputHeight] = useState(0);


	const handlePostClick = (post) => {
		setSelectedPost(post);
		setModalSelectVisible(true);
	};
	useEffect(() => {
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
					setComments(commentsData);
				});

			return () => unsubscribe();
		}
	}, [selectedPost]);
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
	useEffect(() => {
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

	useEffect(() => {
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

	const submitText = () => {
		if (textInput.trim() !== "") {
			const post = {
				text: textInput,
				username: username,
				color: selectedColor,
				likes: [],
				timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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
		}
	};

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



	const handleColorSelection = (color) => {
		setSelectedColor(color);
	};

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

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.addIcon} onPress={() => setModalVisible(true)}>
				<Ionicons name="add-circle-outline" size={30} color="black" />
			</TouchableOpacity>

			<Modal visible={modalVisible} animationType="slide">
				<KeyboardAvoidingView style={styles.modalContainer} behavior="padding">
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
						<Button title="Absenden" onPress={submitText} />
						<Button title="Abbrechen" onPress={() => setModalVisible(false)} />
					</View>

					<Text>Wählen Sie eine Farbe aus</Text>

					<ScrollView horizontal contentContainerStyle={styles.colorPickerScrollContainer}>
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

				</KeyboardAvoidingView>
			</Modal>



			<Modal
				visible={modalSelectVisible}
				animationType="slide"
				animationIn="slideInUp"
				animationOut="slideOutDown"
				style={{backgroundColor: selectedPost?.color, flex: 1}}

			>
				<KeyboardAvoidingView style={styles.modalContainer} >
					<View style={{flex: 1, backgroundColor: 'white', minWidth: "100%"}}>

					<ScrollView style={[styles.postContainer, { backgroundColor: selectedPost?.color }]}>
						<View style={[styles.postModal, { backgroundColor: selectedPost?.color }]}>
							<View style={styles.postContent}>
								<Text style={styles.postText}>{selectedPost?.text}</Text>
							</View>

							<View style={styles.postFooter}>
								<Text style={styles.postUsername}>- {selectedPost?.username}</Text>

								<TouchableOpacity
									style={[styles.likeButton, selectedPost?.likes.includes(username) && styles.likedButton]}
									onPress={() => handleLike(selectedPost?.id)}
								>
									<Ionicons
										name={selectedPost?.likes.includes(username) ? "heart" : "heart-outline"}
										size={16}
										color={selectedPost?.likes.includes(username) ? "red" : "black"}
									/>
									<Text style={styles.likeCount}>{selectedPost?.likes.length}</Text>
								</TouchableOpacity>
							</View>
						</View>
						{comments.reverse().map((comment, index) => (
							<View key={index} style={styles.comment}>
								<Text style={styles.postText}>{comment.text}</Text>
								<Text style={[styles.postUsername, {textAlign: "right"}]}>{comment.username}</Text>
								<Text style={[styles.postUsername, {textAlign: "right"}]}>{formatTimestamp(comment.timestamp)}</Text>
							</View>
						))}
					</ScrollView>



					<View style={[styles.inputContainerComment, {backgroundColor: "white"}]}>
						<TextInput
							style={[styles.inputComment, { height: Math.min(5 * 18, inputHeight) }]}
							placeholder="Kommentar hinzufügen"
							value={commentInput}
							onChangeText={setCommentInput}
						/>
						<TouchableOpacity onPress={handleSubmitComment}>
							<MaterialIcons name="send" size={24} color="#ec404b" />
						</TouchableOpacity>
					</View>

					<Button title="Schließen" onPress={() => setModalSelectVisible(false)} />
					</View>
				</KeyboardAvoidingView>
			</Modal>




			<ScrollView style={styles.postContainer}>
				{posts.map((post, index) => (
					<TouchableOpacity
					key={index}
					onPress={()=>handlePostClick(post)}
					>
						<View key={index} style={[styles.post, { backgroundColor: post.color }]}>
							<View style={styles.postContent}>
								<Text style={styles.postText}>{post.text}</Text>
							</View>

							<View style={styles.postFooter}>
								<Text style={styles.postUsername}>- {post.username}</Text>

								<TouchableOpacity
									style={[styles.likeButton, post.likes.includes(username) && styles.likedButton]}
									onPress={() => handleLike(post.id)}
								>
									<Ionicons
										name={post.likes.includes(username) ? "heart" : "heart-outline"}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 20,
		paddingBottom: 20,
		marginBottom: 85,
	},
	addIcon: {
		position: "absolute",
		top: 20,
		right: 20,
		zIndex: 999,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "white",
		paddingVertical: 20,
	},
	input: {
		width: "99%",
		height: "50%",
		borderWidth: 1,
		borderColor: "gray",
		marginBottom: 10,
		paddingHorizontal: 10,
		textAlignVertical: "top",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 10,
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
	},
	selectedColorButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginHorizontal: 5,
	},
	postContainer: {
		flex: 1,
	},
	post: {
		flexDirection: "column",
		marginBottom: 10,
		padding: 10,
		minHeight: 100,
		justifyContent: "space-between",
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

	postContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	postText: {
		fontSize: 16,
		color: "white",
		textAlign: "left"
	},

	likedButton: {
		color: "red",
	},
	likeCount: {
		fontSize: 12,
		marginLeft: 5,
	},
	inputContainerComment: {
		flexDirection: 'row',
		alignItems: 'center',
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
		borderColor: 'gray',
		borderRadius: 15,
	},
	commentContainer:{
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
		borderBottomColor: 'rgb(255,255,255)'

	},
	comment: {
		marginTop: 10,
		marginBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0,0,0,0.6)'
	},

});

export default Template;
