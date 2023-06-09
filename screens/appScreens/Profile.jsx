import {
    View,
    Image,
    Text,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert, Modal, Pressable, TextInput, KeyboardAvoidingView, Platform, Keyboard,
} from "react-native";
import React, {useEffect, useState} from "react";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {auth, firebase, firestore, storage} from "../../firebase";
import LocalsButton from "../../components/LocalsButton";


const Profile = ({route, navigation}) => {
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
    let blockedUsers = [];
    let friends = [];

    const windowWidth = Dimensions.get("window").width;
    const windowHeight = Dimensions.get("window").height;
    const platform = Platform.OS;

    const uid = route.params?.uid || firebase.auth().currentUser.uid;
    const [user, setUser] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const [events, setEvents] = useState([]);
    const [currentUsername, setCurrentUsername] = useState("");
    const [currentFriends, setCurrentFriends] = useState({});
    const [friendRequests, setFriendRequests] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [followerSize, setFollowerSize] = useState("");
    const [followingSize, setFollowingSize] = useState("");
    const [text, onChangeText] = React.useState('');
    const [number, onChangeNumber] = React.useState('');
    const [reportCategory, setReportCategory] = useState([])

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
            //where("creator", "==", uid  or user.username
            .where("creator", "==", user.username || uid)
            .onSnapshot((snapshot) => {
                const posts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setEvents(posts);
            });
    }

    useEffect(() => {
        const user = firebase.auth().currentUser;
        getUserPosts();
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

    function setFollower() {
        user.follower.forEach((r) => flw.push(r))
        flw.push(auth.currentUser.uid.toString())
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
        flwng.push(uid.toString())
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
        const index = flw.indexOf(auth.currentUser.uid.toString())
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
        const index = flwng.indexOf(uid.toString())
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


    function changeModal() {
        setModalVisible(false)
        setReportModal(true)
    }

    function reportUser() {
        firestore
            .collection('users')
            .doc(uid)
            .update({
                [`reportedBy.${currentUsername}`]: {Time: new Date(), Category: reportCategory, Text: text}
            }).then(
        )
        setReportModal(false)
        setReportCategory([])
        onChangeText('');
    }

    function blockUser() {
        setUnfollow()
        unFriendCurrentUser().then()
        currentUser.blockedUsers.forEach((e) => blockedUsers.push(e))
        blockedUsers.push(user.username)
        firestore
            .collection('users')
            .doc(auth.currentUser.uid)
            .update({
                blockedUsers: blockedUsers
            })
        setModalVisible(false)
        getCurrentUserData()
        blockedUsers = []
    }

    function unblockUser() {
        currentUser.blockedUsers.forEach((e) => blockedUsers.push(e))
        const index = blockedUsers.indexOf(user.username)
        blockedUsers.splice(index, 1);
        firestore
            .collection('users')
            .doc(auth.currentUser.uid)
            .update({
                blockedUsers: blockedUsers
            })
        setModalVisible(false)
        getCurrentUserData()
        blockedUsers = []
    }

    async function unFriendCurrentUser() {
        const usersRef = firebase.firestore().collection('users');

        // Suchen des Dokuments mit dem gegebenen Benutzernamen
        const friendQuerySnapshot = await usersRef.where('username', '==', user.username).get();
        let friendId;
        if (!friendQuerySnapshot.empty) {
            const friendDoc = friendQuerySnapshot.docs[0];
            friendId = friendDoc.id;
        }

        if (friendId) {
            // Das Dokument wurde gefunden, aktualisiere das friendRequests-Objekt
            const rejectUpdateData = {
                [`friends.${currentUsername}`]: firebase.firestore.FieldValue.delete()
            };

            await usersRef.doc(friendId).update(rejectUpdateData);
        } else {
            // Das Dokument wurde nicht gefunden, handle den Fehler
            console.error(`No document found with username: ${user.username}`);
        }
        await unFriendUser()
    }

    async function unFriendUser() {
        const usersRef = firebase.firestore().collection('users');

        // Suchen des Dokuments mit dem gegebenen Benutzernamen
        const friendQuerySnapshot = await usersRef.where('username', '==', currentUsername).get();
        let friendId;
        if (!friendQuerySnapshot.empty) {
            const friendDoc = friendQuerySnapshot.docs[0];
            friendId = friendDoc.id;
        }

        if (friendId) {
            // Das Dokument wurde gefunden, aktualisiere das friendRequests-Objekt
            const rejectUpdateData = {
                [`friends.${user.username}`]: firebase.firestore.FieldValue.delete()
            };

            await usersRef.doc(friendId).update(rejectUpdateData);
        } else {
            // Das Dokument wurde nicht gefunden, handle den Fehler
            console.error(`No document found with username: ${currentUsername}`);
        }
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

                {uid !== firebase.auth().currentUser.uid && (
                    <TouchableOpacity
                        style={[styles.titleBar, {marginTop: windowHeight * 0.05}]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons
                            style={{marginLeft: windowWidth - 50}}
                            name={"ellipsis-vertical"}
                            size={40}
                        >
                            {" "}
                        </Ionicons>
                    </TouchableOpacity>
                )}

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}>
                    <TouchableOpacity style={{width: windowWidth, height: windowHeight}}
                                      onPress={() => setModalVisible(false)}>
                    </TouchableOpacity>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <TouchableOpacity onPress={() => changeModal()}
                                              style={{marginLeft: 20, marginTop: 20}}><Text>melden
                                ...</Text></TouchableOpacity>
                            {(currentUser.blockedUsers && !currentUser.blockedUsers.includes(user.username) &&
                                <TouchableOpacity onPress={() => blockUser()}
                                                  style={{marginLeft: 20, marginTop: 20}}><Text
                                    style={{color: 'rgba(255, 0, 0, .87)'}}>blockieren</Text></TouchableOpacity>)}
                            {(currentUser.blockedUsers && currentUser.blockedUsers.includes(user.username) &&
                                <TouchableOpacity onPress={() => unblockUser()}
                                                  style={{marginLeft: 20, marginTop: 20}}><Text
                                    style={{color: 'rgba(255, 0, 0, .87)'}}>nicht mehr
                                    blockieren</Text></TouchableOpacity>)}
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={reportModal}>
                    <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
                                          behavior={Platform.OS === "ios" ? "padding" : "height" || Platform.OS === "android" ? "padding" : "height"}
                                          keyboardVerticalOffset={150}
                                          enabled>
                        <TouchableOpacity style={{width: windowWidth, height: windowHeight}}
                                          onPress={() => setReportModal(false)}>
                        </TouchableOpacity>
                        <View style={styles.centeredView}>
                            <View style={styles.reportModalView}>
                                <Text style={{
                                    alignSelf: "center",
                                    fontWeight: "bold",
                                    fontSize: 20,
                                    borderBottomWidth: 1,
                                    flexDirection: "row"
                                }}>melden</Text>

                                {reportCategory.includes('Belästigung') && (
                                    <TouchableOpacity onPress={() => {
                                        reportCategory.splice(reportCategory.indexOf('Belästigung'), 1);
                                        setReportCategory([...reportCategory])
                                    }
                                    } style={{marginLeft: 20, marginTop: 20}}><Text>Belästigung <Ionicons
                                        name="checkmark"></Ionicons></Text></TouchableOpacity>
                                )}
                                {!reportCategory.includes('Belästigung') && (
                                    <TouchableOpacity onPress={() => setReportCategory([
                                        ...reportCategory,
                                        'Belästigung'
                                    ])} style={{
                                        marginLeft: 20,
                                        marginTop: 20
                                    }}><Text>Belästigung</Text></TouchableOpacity>
                                )}

                                {reportCategory.includes('Hassrede') && (
                                    <TouchableOpacity onPress={() => {
                                        reportCategory.splice(reportCategory.indexOf('Hassrede'), 1);
                                        setReportCategory([...reportCategory])
                                    }
                                    } style={{marginLeft: 20, marginTop: 20}}><Text>Hassrede <Ionicons
                                        name="checkmark"></Ionicons></Text></TouchableOpacity>
                                )}
                                {!reportCategory.includes('Hassrede') && (
                                    <TouchableOpacity onPress={() => setReportCategory([
                                        ...reportCategory,
                                        'Hassrede'
                                    ])}
                                                      style={{
                                                          marginLeft: 20,
                                                          marginTop: 20
                                                      }}><Text>Hassrede</Text></TouchableOpacity>
                                )}

                                {reportCategory.includes('Gewalt') && (
                                    <TouchableOpacity onPress={() => {
                                        reportCategory.splice(reportCategory.indexOf('Gewalt'), 1);
                                        setReportCategory([...reportCategory])
                                    }
                                    } style={{marginLeft: 20, marginTop: 20}}><Text>Gewalt <Ionicons
                                        name="checkmark"></Ionicons></Text></TouchableOpacity>
                                )}
                                {!reportCategory.includes('Gewalt') && (
                                    <TouchableOpacity onPress={() => setReportCategory([
                                        ...reportCategory,
                                        'Gewalt'
                                    ])} style={{
                                        marginLeft: 20,
                                        marginTop: 20
                                    }}><Text>Gewalt</Text></TouchableOpacity>
                                )}

                                {reportCategory.includes('Spam') && (
                                    <TouchableOpacity onPress={() => {
                                        reportCategory.splice(reportCategory.indexOf('Spam'), 1);
                                        setReportCategory([...reportCategory])
                                    }
                                    } style={{marginLeft: 20, marginTop: 20}}><Text>Spam <Ionicons
                                        name="checkmark"></Ionicons></Text></TouchableOpacity>
                                )}
                                {!reportCategory.includes('Spam') && (
                                    <TouchableOpacity onPress={() => setReportCategory([
                                        ...reportCategory,
                                        'Spam'
                                    ])} style={{marginLeft: 20, marginTop: 20}}><Text>Spam</Text></TouchableOpacity>
                                )}

                                {reportCategory.includes('Betrug') && (
                                    <TouchableOpacity onPress={() => {
                                        reportCategory.splice(reportCategory.indexOf('Betrug'), 1);
                                        setReportCategory([...reportCategory])
                                    }
                                    } style={{marginLeft: 20, marginTop: 20}}><Text>Betrug <Ionicons
                                        name="checkmark"></Ionicons></Text></TouchableOpacity>
                                )}
                                {!reportCategory.includes('Betrug') && (
                                    <TouchableOpacity onPress={() => setReportCategory([
                                        ...reportCategory,
                                        'Betrug'
                                    ])} style={{
                                        marginLeft: 20,
                                        marginTop: 20
                                    }}><Text>Betrug</Text></TouchableOpacity>
                                )}

                                {reportCategory.includes('Identitätsdiebstahl') && (
                                    <TouchableOpacity onPress={() => {
                                        reportCategory.splice(reportCategory.indexOf('Identitätsdiebstahl'), 1);
                                        setReportCategory([...reportCategory])
                                    }
                                    } style={{
                                        marginLeft: 20,
                                        marginTop: 20
                                    }}><Text>Identitätsdiebstahl <Ionicons
                                        name="checkmark"></Ionicons></Text></TouchableOpacity>
                                )}
                                {!reportCategory.includes('Identitätsdiebstahl') && (
                                    <TouchableOpacity onPress={() => setReportCategory([
                                        ...reportCategory,
                                        'Identitätsdiebstahl'
                                    ])} style={{
                                        marginLeft: 20,
                                        marginTop: 20
                                    }}><Text>Identitätsdiebstahl</Text></TouchableOpacity>
                                )}

                                {reportCategory.includes('Nacktheit oder sexuelle Inhalte') && (
                                    <TouchableOpacity onPress={() => {
                                        reportCategory.splice(reportCategory.indexOf('Nacktheit oder sexuelle Inhalte'), 1);
                                        setReportCategory([...reportCategory])
                                    }
                                    } style={{marginLeft: 20, marginTop: 20}}><Text>Nacktheit oder sexuelle
                                        Inhalte <Ionicons
                                            name="checkmark"></Ionicons></Text></TouchableOpacity>
                                )}
                                {!reportCategory.includes('Nacktheit oder sexuelle Inhalte') && (
                                    <TouchableOpacity onPress={() => setReportCategory([
                                        ...reportCategory,
                                        'Nacktheit oder sexuelle Inhalte'
                                    ])} style={{marginLeft: 20, marginTop: 20}}><Text>Nacktheit oder sexuelle
                                        Inhalte</Text></TouchableOpacity>
                                )}

                                {reportCategory.includes('Urheberrechtsverletzung') && (
                                    <TouchableOpacity onPress={() => {
                                        reportCategory.splice(reportCategory.indexOf('Urheberrechtsverletzung'), 1);
                                        setReportCategory([...reportCategory])
                                    }
                                    } style={{
                                        marginLeft: 20,
                                        marginTop: 20
                                    }}><Text>Urheberrechtsverletzung <Ionicons
                                        name="checkmark"></Ionicons></Text></TouchableOpacity>
                                )}
                                {!reportCategory.includes('Urheberrechtsverletzung') && (
                                    <TouchableOpacity onPress={() => setReportCategory([
                                        ...reportCategory,
                                        'Urheberrechtsverletzung'
                                    ])} style={{
                                        marginLeft: 20,
                                        marginTop: 20
                                    }}><Text>Urheberrechtsverletzung</Text></TouchableOpacity>
                                )}

                                {reportCategory.includes('Falsche Informationen') && (
                                    <TouchableOpacity onPress={() => {
                                        reportCategory.splice(reportCategory.indexOf('Falsche Informationen'), 1);
                                        setReportCategory([...reportCategory])
                                    }
                                    } style={{marginLeft: 20, marginTop: 20}}><Text>Falsche
                                        Informationen <Ionicons
                                            name="checkmark"></Ionicons></Text></TouchableOpacity>
                                )}
                                {!reportCategory.includes('Falsche Informationen') && (
                                    <TouchableOpacity onPress={() => setReportCategory([
                                        ...reportCategory,
                                        'Falsche Informationen'
                                    ])} style={{marginLeft: 20, marginTop: 20}}><Text>Falsche
                                        Informationen</Text></TouchableOpacity>
                                )}

                                {reportCategory.includes('Verletzung der Privatsphäre') && (
                                    <TouchableOpacity onPress={() => {
                                        reportCategory.splice(reportCategory.indexOf('Verletzung der Privatsphäre'), 1);
                                        setReportCategory([...reportCategory])
                                    }
                                    } style={{marginLeft: 20, marginTop: 20}}><Text>Verletzung der
                                        Privatsphäre <Ionicons
                                            name="checkmark"></Ionicons></Text></TouchableOpacity>
                                )}
                                {!reportCategory.includes('Verletzung der Privatsphäre') && (
                                    <TouchableOpacity onPress={() => setReportCategory([
                                        ...reportCategory,
                                        'Verletzung der Privatsphäre'
                                    ])} style={{marginLeft: 20, marginTop: 20}}><Text>Verletzung der
                                        Privatsphäre</Text></TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={{
                                        marginLeft: 20,
                                        marginTop: 20
                                    }}><Text>Sonstiges:</Text></TouchableOpacity>
                                <TextInput
                                    editable
                                    multiline
                                    onChangeText={onChangeText}
                                    value={text}
                                    style={styles.input}
                                >
                                </TextInput>
                                <LocalsButton style={{marginTop: 20, alignSelf: "center"}} title={"absenden"}
                                              onPress={reportUser}></LocalsButton>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                <View style={{alignSelf: "center"}}>
                    {currentUser.blockedUsers && user.blockedUsers && !currentUser.blockedUsers.includes(user.username) && !user.blockedUsers.includes(currentUsername) && (
                        <View style={styles.profileImage}>
                            <Image
                                source={{uri: user.imageUrl}}
                                style={styles.image}
                                resizeMode="center"
                            />
                        </View>
                    )}
                    {currentUser.blockedUsers && user.blockedUsers && (currentUser.blockedUsers.includes(user.username) || user.blockedUsers.includes(currentUsername)) && (
                        <View style={styles.profileImage}>
                            <Image
                                source={require('../../assets/blank_profile.png')}
                                style={styles.image}
                                resizeMode="center"
                            />
                        </View>
                    )}
                    {uid !== firebase.auth().currentUser.uid && currentUser.blockedUsers && user.blockedUsers && !currentUser.blockedUsers.includes(user.username) && !user.blockedUsers.includes(currentUsername) && (
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

                {user.follower && user.following && currentUser.follower && currentUser.following && user.username && currentUser.blockedUsers && user.blockedUsers && (
                    <View
                        style={[styles.infoContainer, {marginTop: windowHeight * 0.01}]}
                    >
                        <Text style={[styles.text, {fontWeight: "200", fontSize: 36}]}>
                            {user.firstName} {user.lastName}
                        </Text>
                        <Text style={[styles.text, {fontWeight: "200", fontSize: 14}]}>
                            @{user.username}
                        </Text>
                        {uid !== firebase.auth().currentUser.uid && currentUser.following.includes(uid) === false && !currentUser.blockedUsers.includes(user.username) && !user.blockedUsers.includes(currentUsername) && (
                            <TouchableOpacity style={{marginTop: 10}} onPress={setFollower}>
                                <Text>Folgen</Text>
                            </TouchableOpacity>
                        )}
                        {currentUser.following.includes(uid) === true && !currentUser.blockedUsers.includes(user.username) && (
                            <TouchableOpacity style={{marginTop: 10}} onPress={setUnfollow}>
                                <Text>Nicht mehr Folgen</Text>
                            </TouchableOpacity>
                        )}
                        {currentUser.blockedUsers.includes(user.username) && (
                            <TouchableOpacity style={{marginTop: 10}} onPress={unblockUser}>
                                <Text>Nicht mehr blockieren</Text>
                            </TouchableOpacity>
                        )}
                        {(user.blockedUsers.includes(currentUsername) &&
                            <Text></Text>
                        )}
                    </View>
                )}

                {user.follower && user.following && currentUser.follower && currentUser.following && currentUser.blockedUsers && user.blockedUsers && (
                    <View
                        style={[styles.statsContainer, {marginTop: windowHeight * 0.05}]}
                    >
                        <View style={styles.statsBox}>
                            <Text>Events</Text>
                            {(!currentUser.blockedUsers.includes(user.username) && !user.blockedUsers.includes(currentUsername) &&
                                <Text>{events.length}</Text>
                            )}
                            {((currentUser.blockedUsers.includes(user.username) || user.blockedUsers.includes(currentUsername)) &&
                                <Text>0</Text>
                            )}
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
                            {auth.currentUser.uid === uid && (
                                <TouchableOpacity style={styles.statsBox}
                                                  onPress={() => navigation.navigate('Follower', {
                                                      uid: uid,
                                                      follower: currentUser.follower
                                                  })}>
                                    <Text>Follower</Text>
                                    <Text>{user.follower.length}</Text>
                                </TouchableOpacity>
                            )}
                            {auth.currentUser.uid !== uid && (
                                <TouchableOpacity style={styles.statsBox}
                                                  onPress={() => navigation.navigate('Follower', {
                                                      uid: uid,
                                                      follower: user.follower
                                                  })}>
                                    <Text>Follower</Text>
                                    {(!currentUser.blockedUsers.includes(user.username) && !user.blockedUsers.includes(currentUsername) &&
                                        <Text>{user.follower.length}</Text>
                                    )}
                                    {((currentUser.blockedUsers.includes(user.username) || user.blockedUsers.includes(currentUsername)) &&
                                        <Text>0</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                        {auth.currentUser.uid === uid && (
                            <TouchableOpacity style={styles.statsBox}
                                              onPress={() => navigation.navigate('Following', {
                                                  uid: uid,
                                                  following: currentUser.following
                                              })}>
                                <View style={styles.statsBox}>
                                    <Text>Following</Text>
                                    <Text>{user.following.length}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        {auth.currentUser.uid !== uid && (
                            <TouchableOpacity style={styles.statsBox}
                                              onPress={() => navigation.navigate('Following', {
                                                  uid: uid,
                                                  following: user.following
                                              })}>
                                <View style={styles.statsBox}>
                                    <Text>Following</Text>
                                    {(!currentUser.blockedUsers.includes(user.username) && !user.blockedUsers.includes(currentUsername) &&
                                        <Text>{user.following.length}</Text>
                                    )}
                                    {((currentUser.blockedUsers.includes(user.username) || user.blockedUsers.includes(currentUsername)) &&
                                        <Text>0</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>

    )

};

export default Profile;

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
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'flex-start',
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height / 2,
        marginBottom: 0,
        marginTop: "auto"
    },
    reportModalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'flex-start',
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height / 1.2,
        marginBottom: 0,
        marginTop: "auto"
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        height: Dimensions.get("window").height / 6,
        width: Dimensions.get("window").width - 40,
        marginLeft: 20,
        marginRight: 20,
        borderWidth: 1,
        padding: 10,
        textAlignVertical: "top"
    },
});
