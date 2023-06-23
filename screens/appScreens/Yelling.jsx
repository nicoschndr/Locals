import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { firebase, firestore, auth } from "../../firebase";

const Template = () => {
	const [textInput, setTextInput] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [username, setUsername] = useState("");
	const [posts, setPosts] = useState([]);
	const [selectedColor, setSelectedColor] = useState("white");

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
		{ name: "lightpink", color: "lightpink" },
		{ name: "lightblue", color: "lightblue" },
		{ name: "lightgreen", color: "lightgreen" },
		{ name: "lavender", color: "lavender" },
		{ name: "lightyellow", color: "lightyellow" },
		{ name: "peachpuff", color: "peachpuff" },
		{ name: "lightsalmon", color: "lightsalmon" },
		{ name: "palegoldenrod", color: "palegoldenrod" },
		{ name: "lightseagreen", color: "lightseagreen" },
		{ name: "cornflowerblue", color: "cornflowerblue" },
		{ name: "thistle", color: "thistle" },
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

			<View style={styles.postContainer}>
				{posts.map((post, index) => (
					<View key={index} style={[styles.post, { backgroundColor: post.color }]}>
						<Text style={styles.postText}>{post.text}</Text>
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
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
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
		marginBottom: 10,
		padding: 10,
	},
	postText: {
		fontSize: 16,
		color: "white",
	},
	postUsername: {
		fontSize: 12,
		fontStyle: "italic",
		color: "white",
		textAlign: "right",
	},
	likeButton: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 5,
	},
	likedButton: {
		backgroundColor: "red",
	},
	likeCount: {
		fontSize: 12,
		marginLeft: 5,
	},
});

export default Template;
