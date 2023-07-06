import React, {useEffect, useState} from "react";
import {
    View,
    Alert,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Dimensions,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ActivityIndicator, Platform, PermissionsAndroid, FlatList,
} from "react-native";
import MapView, {Marker} from "react-native-maps";
import {CheckBox} from "react-native-elements";
import * as Location from "expo-location";
import {Ionicons} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {auth, firestore, storage} from "../../firebase";

import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import LocalsImagePicker from "../../components/LocalsImagePicker";
import DropDownPicker from "react-native-dropdown-picker";
import {set} from "react-native-reanimated";


const PostEvent = ({navigation}) => {
    const windowWidth = Dimensions.get("window").width;
    const [showDatePicker, setShowDatePicker] = useState(false);

    const windowHeight = Dimensions.get("window").height;
    const [datePicker, setDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const [imageUri, setImageUri] = useState("");
    const [uploading, setUploading] = useState(false);
    const [transferred, setTransferred] = useState(0);
    const [title, setTitle] = useState("");
    const [address, setAddress] = useState("");
    const [groupSize, setGroupSize] = useState("");
    const [description, setDescription] = useState("");
    const [gender, setGender] = useState("");
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [showMap, setShowMap] = useState(false);
    const [advertised, setAdvertised] = useState(false);
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState([""]);
    const [location, setLocation] = useState(null);
    const [currentUser, setCurrentUser] = useState({});
    const [createdEvent, setCreatedEvent] = useState({});
    let rA = [];


    const [items, setItems] = useState([
        {label: "Sport", value: "sport"},
        {label: "Culture", value: "culture"},
        {label: "Concert", value: "concert"},
        {label: "Test", value: "test"},
        {label: "Party", value: "party"},
    ]);

    useEffect(() => {
        requestLocationPermission();
        getCurrentUserData();
    }, []);


    const requestLocationPermission = async () => {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    await getCurrentLocation();
                } else {
                    console.log("Location permission denied");
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            await getCurrentLocation();
        }
    };


    const getCurrentLocation = async () => {
        try {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const {latitude, longitude} = location.coords;
            // setLatitude(latitude);
            // setLongitude(longitude);
            // setAddress(`${latitude}, ${longitude}`);
        } catch (error) {
            console.log(error);
        }
    };


    const uploadImage = async (uri) => {
        setUploading(true);
        const response = await fetch(uri);
        const blob = await response.blob();

        let filename = new Date().getTime().toString();
        var ref = storage.ref().child("Images/events/" + filename);
        const snapshot = await ref.put(blob);

        // Get the download URL after upload completes
        const url = await snapshot.ref.getDownloadURL();
        return url;
    };

    const checkInputs = () => {
        if (
            title === "" ||
            address === "" ||
            imageUri === "" ||
            groupSize === "" ||
            category === ""
        ) {
            Alert.alert("Input Check", "Please fill in all mandatory fields", [
                {
                    text: "Cancel",
                },
            ]);
            return false;
        }
    };
    const uploadPost = async () => {
        const imageUrl = await uploadImage(imageUri);

        // Get the current user's document
        const userDoc = await firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .get();
        const username = userDoc.data().username;

        firestore
            .collection("events")
            .add({
                creator: username,
                title: title,
                description: description,
                address: address,
                groupSize: groupSize,
                latitude: latitude,
                longitude: longitude,
                imageUrl: imageUrl,
                advertised: advertised,
                category: category,
                date: date,
                attendees: [],
                likedBy: [],
                userId: auth.currentUser.uid,
            })
            .then(() => {
                getEventByTitle(title);
                alert("Post created successfully");
                setTimeout(() => {
                    navigation.navigate("Profile");
                }, 1000);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    function getCurrentUserData() {
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .onSnapshot((doc) => {
                const currentUserData = doc.data();
                setCurrentUser(currentUserData);
            })
    }

    function getEventByTitle(title) {
        firestore
            .collection('events')
            .where('title', '==', title)
            .get()
            .then((snapshot) => {
                const singleEvent = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }))
                const event = singleEvent[0];
                recentActivity('event', 'create', event.id, event.title)
            })
    }

    function recentActivity(category, action, uid, title) {
        console.log(title)
        currentUser.recentActivities.forEach((a) => rA.push(a))
        if (rA.length === 3) {
            rA.splice(0, 1)
            rA.push({
                category: category,
                action: action,
                title: title,
                uid: uid
            })
            firestore
                .collection('users')
                .doc(auth.currentUser.uid)
                .update({
                    recentActivities: rA
                })
        } else {
            rA.push({
                category: category,
                action: action,
                title: title,
                uid: uid
            })
            firestore
                .collection('users')
                .doc(auth.currentUser.uid)
                .update({
                    recentActivities: rA
                })
        }
        setCreatedEvent({})
    }

    const openDatePicker = () => {
        setShowDatePicker(true);
    }

    const closeDatePicker = () => {
        setShowDatePicker(false);
    }

    const onDateSelected = (date) => {
        setDate(date);
        closeDatePicker();
    }

    const renderDatePicker = () => {
        if (showDatePicker) {
            return (
                <View>
                    <DateTimePicker
                        value={date}
                        locale="de-DE"
                        mode="date"
                        onChange={(event, date) => onDateSelected(date)}
                    />
                </View>

            );
        }
        return null;
    }


    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : ""}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
            >
                <TouchableOpacity
                    style={[styles.titleBar, {marginTop: windowHeight * 0.05}]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        style={{marginRight: windowWidth - 90}}
                        name={"arrow-back-circle-outline"}
                        size={40}
                    />
                </TouchableOpacity>

                <View style={{alignSelf: "center", marginBottom: 50}}>
                    <View style={styles.postImage}>
                        <LocalsImagePicker
                            onImageTaken={(uri) => setImageUri(uri)}
                            style={styles.image}
                        />
                    </View>
                </View>

                <View style={[styles.inputContainer, {marginTop: 70}]}>
                    <Text>Title</Text>
                    <TextInput
                        style={styles.inputText}
                        value={title}
                        onChangeText={(title) => setTitle(title)}
                        // is mendatory
                    />
                </View>

                <FlatList
                    data={[{key: 'uniqueKey'}]} // Pass an array of objects to `data`, it could be your state or prop
                    renderItem={({item}) => (
                        <View style={styles.inputContainer}>
                            <Text>Address</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <GooglePlacesAutocomplete
                                    fetchDetails={true}
                                    currentLocation={true}
                                    currentLocationLabel='Current location'
                                    listViewDisplayed={false}
                                    onPress={(data, details = null) => {
                                        setAddress(details.formatted_address);
                                        setLongitude(details.geometry.location.lng);
                                        setLatitude(details.geometry.location.lat);
                                    }}
                                    query={{
                                        key: 'AIzaSyAyviffxI6ZlWwof4_vA6S1LjmLrYkjxMI',
                                    }}
                                    styles={{
                                        textInput: styles.addressInput,
                                        listView: {
                                            width: '90%', // Set the width of the suggestions list
                                        },
                                        container: {
                                            width: '100%', // Set the width of the container
                                        },
                                    }}
                                />
                            </View>
                        </View>
                    )}
                />

                <View style={styles.inputContainer}>
                    <Text>Group Size</Text>
                    <TextInput
                        style={styles.inputText}
                        value={groupSize.toString()}
                        onChangeText={(groupSize) => setGroupSize(parseInt(groupSize))}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text>Description</Text>
                    <TextInput
                        style={styles.inputText}
                        value={description}
                        onChangeText={(description) => setDescription(description)}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text>Gender</Text>
                    <TextInput
                        style={styles.inputText}
                        value={gender}
                        onChangeText={(gender) => setGender(gender)}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text>Date</Text>
                    <View
                        style={{
                            flexDirection: "row",
                            marginTop: 12,
                            alignItems: "center",
                        }}
                    >
                        <Ionicons
                            name={"calendar-outline"}
                            size={30}
                            onPress={openDatePicker}
                        />

                        <View>
                            {renderDatePicker()}
                        </View>
                    </View>
                </View>
                <KeyboardAvoidingView style={styles.inputContainer} behavior={Platform.OS === "ios" ? "padding" : ""}>
                    <Text>Category</Text>
                    <DropDownPicker
                        open={open}
                        value={category}
                        items={items}
                        setOpen={setOpen}
                        setValue={setCategory}
                        setItems={setItems}
                        multiple
                        mode="BADGE"
                        badgeDotColors={[
                            "#e76f51",
                            "#00b4d8",
                            "#e9c46a",
                            "#e76f51",
                            "#8ac926",
                            "#00b4d8",
                            "#e9c46a",
                        ]}
                        style={{marginTop: 10, width: 300}}
                    />
                </KeyboardAvoidingView>

                <TouchableOpacity style={styles.button} onPress={uploadPost}>
                    <Text style={{color: "#FFFFFF"}}>Post Event</Text>
                </TouchableOpacity>


            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default PostEvent;

const styles = StyleSheet.create({
    addressInput: {
        backgroundColor: "transparent",
        borderBottomColor: "#000000",
        borderBottomWidth: 1,
    },
    container: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 85,
    },
    titleBar: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    postImage: {
        width: 100,
        height: 100,
        borderRadius: 100,
    },
    inputContainer: {
        textAlign: "left",
        marginTop: 10,
    },
    inputText: {
        fontWeight: "bold",
        borderBottomColor: "#000000",
        borderBottomWidth: 1,
        marginTop: 10,
    },
    map: {
        width: "100%",
        height: 300,
        marginTop: 20,
    },
    button: {
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 50,
        backgroundColor: "#E63F3F",
        marginVertical: 20,
    },
    image: {
        width: "100%",
        marginBottom: 40,
    },
});
