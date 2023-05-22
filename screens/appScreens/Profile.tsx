import {
	View,
	Image,
	Text,
	StyleSheet,
	Dimensions,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { firebase, firestore, storage } from "../../firebase";
import Firestore = firebase.firestore.Firestore;
import auth = firebase.auth;
import Auth = firebase.auth.Auth;
import LocalsImagePicker from "../../components/LocalsImagePicker";
import Sidebar from "../../components/Sidebar";

const Template = ({ navigation }) => {
	useEffect(() => {
		getUserData();
		getUserPosts();
	}, []);
	const goToFriendList = () => {
		navigation.navigate("FriendList");
	};

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity onPress={goToFriendList}>
					<Ionicons name={"people"} size={25} style={{ marginRight: 15 }} />
				</TouchableOpacity>
			),
		});
	}, [navigation]);

	const windowWidth = Dimensions.get("window").width;
	const windowHeight = Dimensions.get("window").height;

	const uid = firebase.auth().currentUser.uid;
	const [user, setUser] = useState({
		address: "",
		age: "",
		email: "",
		firstName: "",
		friendRequests: {},
		friends: {},
		imageUrl: "",
		lastName: "",
		mobile: "",
		username: ""
	});
	const [posts, setPosts] = useState({});


	function getUserData() {
		firestore
			.collection("users")
			.doc(uid)
			.get()
			.then((snapshot) => setUser(
				{
					address: snapshot.data().address,
					age: snapshot.data().age,
					email: snapshot.data().email,
					firstName: snapshot.data().firstName,
					friendRequests: snapshot.data().friemdRequests,
					friends: snapshot.data().friends,
					imageUrl: snapshot.data().imageUrl,
					lastName: snapshot.data().lastName,
					mobile: snapshot.data().mobile,
					username: snapshot.data().username,
				}
			));
	}

	function getUserPosts() {
		firestore
			.collection("posts")
			.where('creator', '==', uid)
			.get().then (r => r.forEach((doc) => {
				setPosts({...doc.data()})
		}))
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<TouchableOpacity
					style={[styles.titleBar, { marginTop: windowHeight * 0.05 }]}
					onPress={navigation.openDrawer}
				>
					<Ionicons
						style={{ marginLeft: windowWidth - 50 }}
						name={"reorder-three-outline"}
						size={40}
					>
						{" "}
					</Ionicons>
				</TouchableOpacity>

				<View style={{ alignSelf: "center" }}>
					<View style={styles.profileImage}>
						<Image
							source={user.imageUrl ? {uri: user.imageUrl} : null} alt={"../assets/avatar.png"}
							style={styles.image}
							resizeMode="center"
						></Image>
					</View>
					<TouchableOpacity style={styles.chat}>
						<MaterialIcons
							name={"chat"}
							size={20}
							color={"#FFFFFF"}
						></MaterialIcons>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.add}
						onPress={() => navigation.navigate("NewPost")}
					>
						<MaterialIcons
							name={"add"}
							size={60}
							color={"#FFFFFF"}
						></MaterialIcons>
					</TouchableOpacity>
				</View>

				<View
					style={[styles.infoContainer, { marginTop: windowHeight * 0.01 }]}
				>
					<Text style={[styles.text, { fontWeight: "200", fontSize: 36 }]}>
						{user.firstName} {user.lastName}
					</Text>
					<Text style={[styles.text, { fontWeight: "200", fontSize: 14 }]}>
						Locals
					</Text>
				</View>

				<View
					style={[styles.statsContainer, { marginTop: windowHeight * 0.05 }]}
				>
					<View style={styles.statsBox}>
						<Text>Events</Text>
						<Text>0</Text>
					</View>
					<View
						style={[
							styles.statsBox,
							{
								borderColor: "DFD8C8",
								borderLeftWidth: 1,
								borderRightWidth: 1,
							},
						]}
					>
						<Text>Follower</Text>
						<Text>0</Text>
					</View>
					<View style={styles.statsBox}>
						<Text>Following</Text>
						<Text>0</Text>
					</View>
				</View>

				<View style={{ marginTop: windowHeight * 0.05 }}>
					<ScrollView
						horizontal={true}
						showsVerticalScrollIndicator={false}
						showsHorizontalScrollIndicator={false}
					>
						<View style={styles.mediaImageContainer}>
							<Image
								source={require("../../assets/sunrise.jpg")}
								style={styles.image}
								resizeMode="center"
							></Image>
							<View style={styles.Test}></View>
							<Text style={styles.imageText}>Test: AutoRefresh</Text>
						</View>
						<View style={styles.mediaImageContainer}>
							<Image
								source={require("../../assets/building.jpg")}
								style={styles.image}
								resizeMode="center"
							></Image>
							<View style={styles.Test}></View>
							<Text style={styles.imageText}>Test Geopoint</Text>
						</View>
						<View style={styles.mediaImageContainer}>
							<Image
								source={require("../../assets/concert.jpg")}
								style={styles.image}
								resizeMode="center"
							></Image>
							<View style={styles.Test}></View>
							<Text style={styles.imageText}>Test</Text>
						</View>
					</ScrollView>
					<Text
						style={[
							styles.text,
							styles.recent,
							{
								marginLeft: windowWidth * 0.15,
								marginTop: windowHeight * 0.05,
							},
						]}
					>
						Recent Activity
					</Text>

					<View
						style={[
							styles.recentItem,
							{
								marginBottom: windowHeight * 0.02,
								marginLeft: windowWidth * 0.15,
							},
						]}
					>
						<View style={styles.recentItemIndicator}></View>
						<View style={{flexDirection:"row"}}>
							<Text>Nimmt an </Text>
							<Text style={{fontWeight: "bold"}}>Event </Text>
							<Text>teil</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Template;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		color: "#000000",
	},
	image: {
		flex: 1,
		width: 200,
		height: 200,
		borderRadius: 30,
	},
	titleBar: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	profileImage: {
		width: 200,
		height: 200,
		borderRadius: 100,
		overflow: "hidden",
	},
	chat: {
		backgroundColor: "#41444B",
		position: "absolute",
		top: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	add: {
		backgroundColor: "#E63F3F",
		position: "absolute",
		borderRadius: 40,
		top: 135,
		left: 150,
	},
	infoContainer: {
		alignSelf: "center",
		alignItems: "center",
	},
	statsContainer: {
		flexDirection: "row",
		alignSelf: "center",
	},
	statsBox: {
		alignItems: "center",
		flex: 1,
	},
	mediaImageContainer: {
		width: 200,
		height: 200,
		borderRadius: 40,
		overflow: "hidden",
		marginHorizontal: 12,
	},
	recentItem: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	recentItemIndicator: {
		backgroundColor: "#000000",
		padding: 4,
		height: 12,
		width: 12,
		borderRadius: 6,
		marginTop: 3,
		marginRight: 20,
	},
	recent: {
		marginBottom: 6,
		fontSize: 10,
	},
	Test: {
		backgroundColor: "#999999",
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		marginTop: -50,
		height: 50,
		opacity: 0.2,
	},
	imageText: {
		color: "#FFFFFF",
		alignSelf: "center",
		textAlign: "center",
		fontSize: 20,
		marginTop: -53,
		width: 200,
	},
});
