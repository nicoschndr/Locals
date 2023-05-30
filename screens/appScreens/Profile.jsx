import {
    View,
    Image,
    Text,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {auth, firebase, firestore, storage} from "../../firebase";

const Template = ({route, navigation}) => {
    useEffect(() => {
        getUserData();
        getCurrentUserData();
        getUserPosts();
    }, []);

    const goToFriendList = () => {
        navigation.navigate("FriendList");
    };

    let flwng = [];
    let flw = [];

    const windowWidth = Dimensions.get("window").width;
    const windowHeight = Dimensions.get("window").height;

    const uid = route.params?.uid || firebase.auth().currentUser.uid;
    const [user, setUser] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const [events, setEvents] = useState([]);
    const [currentUsername, setCurrentUsername] = useState("");
    const [currentFriends, setCurrentFriends] = useState({});
    const [friendRequests, setFriendRequests] = useState([]);
    const [followerSize, setFollowerSize] = useState("");
    const [followingSize, setFollowingSize] = useState("");

    React.useLayoutEffect(() => {
        if (uid === firebase.auth().currentUser.uid) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={goToFriendList}>
                        <Ionicons name={"people"} size={25} style={{marginRight: 15}}/>
                    </TouchableOpacity>
                ),
            });
        } else {
            navigation.setOptions({
                headerRight: null,
            });
        }
    }, [navigation, uid]);

    function getUserData() {
       firestore
            .collection("users")
            .doc(uid)
            .get()
            .then((snapshot) => {
                setUser(snapshot.data());
                getCurrentUserFriends(snapshot.data().username);
            })
    }

    function getCurrentUserData() {
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .get()
            .then((snapshot) => {
                setCurrentUser(snapshot.data());
            });
    }

    function getCurrentUserFriends(username) {
        firestore
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .get()
            .then((snapshot) => {
                setCurrentFriends(snapshot.data().friends);
                setFriendRequests(Object.keys(snapshot.data().friendRequests || {}));
                checkFriendship(username, snapshot.data().friends);
                getOpenFriendRequests();
            });
    }

    function getOpenFriendRequests() {
        firestore
            .collection("users")
            .doc(uid)
            .get()
            .then((snapshot) => {
                const userData = snapshot.data();
                const friendRequests = Object.keys(userData.friendRequests || {});
                setFriendRequests(friendRequests); // Aktualisiere den Zustand mit den offenen Freundesanfragen
            })
            .catch((error) => {
                console.error("Fehler beim Abrufen der Freundschaftsanfragen:", error);
            });
    }

    function checkFriendship(username, friends) {
        if (friends && friends[username]) {
            // Der Benutzer ist ein Freund
            console.log(`Der Benutzer ${username} ist ein Freund.`);
        } else {
            // Der Benutzer ist kein Freund
            console.log(`Der Benutzer ${username} ist kein Freund.`);
        }
    }

    useEffect(() => {
        const user = firebase.auth().currentUser;

        if (user) {
            const userDocRef = firebase.firestore().collection("users").doc(user.uid);

            userDocRef.onSnapshot((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    setCurrentUsername(userData.username);
                }
            });
        }
    }, [friendRequests]);

    async function sendFriendRequest(senderUsername, receiverUsername) {
        const usersRef = firebase.firestore().collection("users");

        // Suchen des Dokuments mit dem gegebenen Benutzernamen
        const receiverQuerySnapshot = await usersRef
            .where("username", "==", receiverUsername)
            .get();
        if (!receiverQuerySnapshot.empty) {
            // Das Dokument wurde gefunden, nehmen Sie das erste Ergebnis
            const receiverDoc = receiverQuerySnapshot.docs[0];
            const receiverId = receiverDoc.id;

            // Update für das Dokument mit der ID durchführen
            await usersRef.doc(receiverId).update({
                [`friendRequests.${senderUsername}`]: true,
            });
        } else {
            // Das Dokument wurde nicht gefunden, handle den Fehler
            console.error(`No document found with username: ${receiverUsername}`);
        }
    }

    function handleSendFriendRequest() {
        const senderUsername = firebase.auth().currentUser.displayName; // Benutzernamen aus Firebase Auth holen
        const receiverUsername = user.username;
        sendFriendRequest(senderUsername, receiverUsername);
    }

    function getUserPosts() {
        firestore
            .collection("events")
            .where("creator", "==", uid)
            .onSnapshot((snapshot) => {
                const posts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setEvents(posts);
            });
    }

    function setFollower() {
            user.follower.forEach((r) => flw.push(r))
            flw.push(auth.currentUser.displayName)
            firestore
                .collection("users")
                .doc(uid)
                .update({
                    follower: flw
                }).then(
                setFollowing
            )
            flw = [];
    }

    function setFollowing() {
        currentUser.following.forEach((r) => flwng.push(r))
        flwng.push(user.firstName + " " + user.lastName)
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .update({
                following: flwng
            })
            .then(getCurrentUserData)
            .then(getUserData)
        flwng = [];
    }

    function setUnfollow() {
        user.follower.forEach((r) => flw.push(r))
        const index = flw.indexOf(auth.currentUser.displayName)
        flw.splice(index, 1)
        firestore
            .collection("users")
            .doc(uid)
            .update({
                follower: flw
            }).then(
            setUnfollowing
        )
        flw = [];
    }

    function setUnfollowing() {
        currentUser.following.forEach((r) => flwng.push(r))
        const index = flwng.indexOf(user.firstName + " " + user.lastName)
        flwng.splice(index, 1)
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .update({
                following: flwng
            })
            .then(getCurrentUserData)
            .then(getUserData)
        flwng = [];
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {uid === firebase.auth().currentUser.uid && (
                    <TouchableOpacity
                        style={[styles.titleBar, {marginTop: windowHeight * 0.05}]}
                        onPress={navigation.openDrawer}
                    >
                        <Ionicons
                            style={{marginLeft: windowWidth - 50}}
                            name={"reorder-three-outline"}
                            size={40}
                        >
                            {" "}
                        </Ionicons>
                    </TouchableOpacity>
                )}

                <View style={{alignSelf: "center"}}>
                    <View style={styles.profileImage}>
                        <Image
                            source={{uri: user.imageUrl}}
                            style={styles.image}
                            resizeMode="center"
                        />
                    </View>
                    {uid !== firebase.auth().currentUser.uid && (
                        <>
                            <TouchableOpacity style={styles.chat}>
                                <MaterialIcons name={"chat"} size={20} color={"#FFFFFF"}/>
                            </TouchableOpacity>
                            {!currentFriends[user.username] &&
                                user.username !== currentUsername && (
                                    <TouchableOpacity
                                        style={styles.add}
                                        onPress={() =>
                                            sendFriendRequest(currentUsername, user.username)
                                        }
                                    >
                                        {friendRequests.includes(currentUsername) ? (
                                            <MaterialIcons
                                                name={"schedule"}
                                                size={60}
                                                color={"#ffffff"}
                                            />
                                        ) : (
                                            <MaterialIcons name={"add"} size={60} color={"#FFFFFF"}/>
                                        )}
                                    </TouchableOpacity>
                                )}
                        </>
                    )}
                </View>

                {user.follower && user.following && currentUser.follower && currentUser.following && (
                <View
                    style={[styles.infoContainer, {marginTop: windowHeight * 0.01}]}
                >
                    <Text style={[styles.text, {fontWeight: "200", fontSize: 36}]}>
                        {user.firstName} {user.lastName}
                    </Text>
                    <Text style={[styles.text, {fontWeight: "200", fontSize: 14}]}>
                        @{user.username}
                    </Text>
                    {uid !== firebase.auth().currentUser.uid && currentUser.following.includes(user.firstName + " " + user.lastName) === false && (
                        <TouchableOpacity style={{marginTop: 10}} onPress={setFollower}>
                            <Text>Folgen</Text>
                        </TouchableOpacity>
                    )}
                    {currentUser.following.includes(user.firstName + " " + user.lastName) === true && (
                        <TouchableOpacity style={{marginTop: 10}} onPress={setUnfollow}>
                            <Text>Nicht mehr Folgen</Text>
                        </TouchableOpacity>
                    )}
                </View>
                    )}

                {user.follower && user.following && currentUser.follower && currentUser.following && (
                <View
                    style={[styles.statsContainer, {marginTop: windowHeight * 0.05}]}
                >

                    <View style={styles.statsBox}>
                        <Text>Events</Text>
                        <Text>{events.length}</Text>
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
                        <Text>{user.follower.length}</Text>
                    </View>
                    <View style={styles.statsBox}>
                        <Text>Following</Text>
                        <Text>{user.following.length}</Text>
                    </View>

                </View>
                )}


                <View style={{marginTop: windowHeight * 0.05}}>
                    <ScrollView
                        horizontal={true}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    >
                        {events.map((event) => (
                            <TouchableOpacity
                                style={styles.mediaImageContainer}
                                key={event.id}
                                onPress={() => navigation.navigate("EventDetails", {event})}
                            >
                                <Image
                                    source={{uri: event.imageUrl}}
                                    style={styles.image}
                                    resizeMode="center"
                                />
                                <Text style={styles.imageText}>{event.title}</Text>
                            </TouchableOpacity>
                        ))}
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
                        <View>
                            <Text>{events.title}</Text>
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
        width: 200,
        height: 200,
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
        bottom: 50,
        width: 200,
    },
});
