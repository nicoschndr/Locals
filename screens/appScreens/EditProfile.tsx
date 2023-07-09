import {ActivityIndicator, Alert, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import LocalsImagePicker from "../../components/LocalsImagePicker";
import LocalsTextInput from "../../components/LocalsTextInput";
import {CheckBox, Divider} from "react-native-elements";
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import DatePicker from "react-native-datepicker/datepicker";
import LocalsButton from "../../components/LocalsButton";
import React, {useEffect, useState} from "react";
import Register from "../Auth/Register";
import {auth, firestore, storage} from "../../firebase";

/**
* Renders the Edit Profile page with the provided props.
* @param navigation The navigation object for navigating between screens.
 * @param route An object representing the current route information provided by the React Navigation library or similar
 * navigation framework.
* @returns {JSX.Element} The rendered EditProfile page.
* @constructor
*/
const EditProfile = ({route, navigation}) => {

    /**
     * Executes functions once when the component mounts.
     */
    useEffect(() => {
        getCurrentUserData();
    }, []);


    /**
     * The email that the user entered inn the specific input field.
     */
    const [email, setEmail] = useState("");

    /**
     * The link to the picture the user picked from his gallery.
     */
    const [imageUri, setImageUri] = useState("");

    /**
     * The link to firestore where the picture is saved.
     */
    const [imageUrl, setImageUrl] = useState("");
    const [password, setPassword] = useState("");

    /**
     * The first name that the user entered inn the specific input field.
     */
    const [firstName, setFirstName] = useState("");

    /**
     * The last name that the user entered inn the specific input field.
     */
    const [lastName, setLastName] = useState("");

    /**
     * The birthday the user selected in the date picker.
     */
    const [birthday, setBirthday] = useState("");

    /**
     * The mobile that the user entered inn the specific input field.
     */
    const [mobile, setMobile] = useState("");

    /**
     * The address that the user entered inn the specific input field.
     */
    const [address, setAddress] = useState("");

    /**
     * The username that the user entered inn the specific input field.
     */
    const [username, setUsername] = useState("");

    /**
     * If true the picked picture is uploaded into firestore.
     */
    const [uploading, setUploading] = useState(false);
    const [transferred, setTransferred] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [latitude, setLatitude] = useState(0);

    /**
     * true if the user clicked on the edit button on the Profile image. Then renders the image picker.
     */
    const [clicked, setClicked] = useState(false);

    /**
     * The username of the user before changing.
     */
    const [oldUsername, setOldUsername] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [currentUser, setCurrentUser] = useState({});


    /**
     * This function  retrieves and updates the current user's data from Firestore in real-time. It listens for changes
     * to the user's document and performs various operations based on the retrieved data.
     */
    function getCurrentUserData() {
        firestore
            .collection("users")
            .doc(auth.currentUser.uid)
            .onSnapshot((doc) => {
                const currentUserData = doc.data();
                setEmail(currentUserData.email);
                setFirstName(currentUserData.firstName);
                setLastName(currentUserData.lastName);
                setMobile(currentUserData.mobile);
                setAddress(currentUserData.address);
                setUsername(currentUserData.username);
                setOldUsername(currentUserData.username);
                setImageUrl(currentUserData.imageUrl);
            })

    }

    /**
     * Responsible for updating the user's profile information, including the username and profile image.
     */
    async function change() {
        const isUsernameAvailable = await checkUsernameAvailability();
        if(imageUri !== ""){
            const imageUrl = await uploadImage(imageUri);
        }

        if (!isUsernameAvailable && username !== oldUsername) {
            alert(
                "Der Benutzername ist bereits vergeben. Bitte wählen Sie einen anderen."
            );
            return;
        }
        await firestore
            .collection('users')
            .doc(auth.currentUser.uid)
            .update({
                email: email,
                firstName: firstName,
                lastName: lastName,
                mobile: mobile,
                address: address,
                username: username,
                imageUrl: imageUrl
            })
        navigation.navigate('Profile')
    }

    /**
     * Responsible for deleting the current user's account from the authentication system and firestore.
     */
    async function deleteAccount() {
        await auth.currentUser.delete();
        await firestore
            .collection('users')
            .doc(auth.currentUser.uid)
            .delete()
        navigation.navigate('Login')
    }

    /**
     * Checks if the username the user entered is already used by another user.
     * @returns {Promise<boolean>} true if it is used by another user, false if not.
     */
    const checkUsernameAvailability = async () => {
        const snapshot = await firestore
            .collection("users")
            .where("username", "==", username)
            .get();

        if (snapshot.empty) {
            // Der Benutzername ist verfügbar
            return true;
        } else {
            // Der Benutzername ist bereits vergeben
            return false;
        }
    };


    /**
     * Upload image to firebase storage and return the image url.
     * @param uri The URI of the image to be uploaded.
     */
    const uploadImage = async (uri) => {
        setUploading(true);
        const response = await fetch(uri);
        const blob = await response.blob();

        let filename = new Date().getTime().toString();
        var ref = storage.ref().child("Images/user/" + filename);
        const snapshot = await ref.put(blob);

        // Get the download URL after upload completes
        const url = await snapshot.ref.getDownloadURL();
        return url;
    };

    /**
     * When the user selects his birthday the data is saved in the birthday state variable.
     * @param birthday
     */
    const handleDateChange = (birthday) => {
        setBirthday(birthday);
    };

    /**
     * Responsible for displaying an alert, which will on confirm delete the user's account. Just to make sure the user
     * really wants to do that.
     */
    const showAlert = () => {
        Alert.alert(
            'Bestätigen',
            'Bist du sicher?',
            [
                {
                    text: 'Abbrechen',
                    style: 'cancel',
                    onPress: () => console.log('Abgebrochen!'),
                },
                {
                    text: 'Bestätigen',
                    onPress: deleteAccount,
                },
            ],
            { cancelable: true }
        );
    };

    /**
     * renders the EditProfile page.
     */
    return (
        <ImageBackground
            source={require("../../assets/BackGround(h).png")}
            style={{alignItems: "center", flex: 1, width: "100%"}}
        >
            <TouchableOpacity
                style={styles.back}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="chevron-back" size={24} color="white"/>
            </TouchableOpacity>
            <View style={styles.inputContainer}>
                {!clicked && (
                    <TouchableOpacity onPress={() => setClicked(true)}>
                        <View style={styles.profileImage}>

                            <Image
                                source={{uri: imageUrl}}
                                style={styles.Pimage}
                                resizeMode="center"
                            />
                        </View>
                        <Ionicons style={{position: 'absolute', top:70, left: 140}} size={40} name='create-outline'/>
                    </TouchableOpacity>
                )}
                {clicked && (
                    <LocalsImagePicker
                        onImageTaken={(uri) => setImageUri(uri)}
                        style={[styles.image, {marginBottom: -20}]}
                    />
                )}
                {clicked && (
                <View style={{marginTop: 12}}>
                    <Text style={styles.inputTitle}>E-Mail</Text>
                    <LocalsTextInput
                        autoCapitalize="none"
                        autoFocus
                        inputMode="email"
                        value={email}
                        onChangeText={(email) => setEmail(email)}
                        style={styles.input}
                    />
                    <Divider style={styles.divider}/>
                </View>
                )}
                {!clicked && (
                <View>
                    <Text style={styles.inputTitle}>E-Mail</Text>
                    <LocalsTextInput
                        autoCapitalize="none"
                        autoFocus
                        inputMode="email"
                        value={email}
                        onChangeText={(email) => setEmail(email)}
                        style={styles.input}
                    />
                    <Divider style={styles.divider}/>
                </View>
                )}

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 12,
                    }}
                >
                    <View style={{width: "48%"}}>
                        <Text style={styles.inputTitle}>Vormame</Text>
                        <LocalsTextInput
                            autoCapitalize
                            value={firstName}
                            onChangeText={(firstName) => setFirstName(firstName)}
                            style={styles.input}
                        />
                        <Divider style={styles.divider}/>
                    </View>
                    <View style={{width: "48%"}}>
                        <Text style={styles.inputTitle}>Nachname</Text>
                        <LocalsTextInput
                            value={lastName}
                            autoCapitalize
                            onChangeText={(lastName) => setLastName(lastName)}
                            style={styles.input}
                        />
                        <Divider style={styles.divider}/>
                    </View>
                </View>
                <View style={{marginTop: 12}}>
                    <Text style={styles.inputTitle}>Addresse</Text>
                    <LocalsTextInput
                        autoCapitalize="none"
                        value={address}
                        onChangeText={(address) => setAddress(address)}
                        style={styles.input}
                    />
                    <Divider style={styles.divider}/>
                </View>
                <View style={{marginTop: 12}}>
                    <Text style={styles.inputTitle}>Alter</Text>
                    <DatePicker
                        style={styles.datePicker}
                        date={birthday}
                        mode="date"
                        format="DD-MM-YYYY"
                        minDate="01-01-1900"
                        maxDate={new Date()}
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                        customStyles={{
                            dateInput: styles.input,
                            placeholderText: styles.datePickerPlaceholder,
                            dateText: styles.datePickerText,
                        }}
                        onDateChange={handleDateChange}
                    />
                    <Divider style={styles.divider}/>
                </View>
                {/* <View style={{ marginTop: 12 }}>
						<Text style={styles.inputTitle}>Mobil-Nr.</Text>
						<LocalsTextInput
							inputMode="numeric"
							value={mobile}
							onChangeText={(mobile) => setMobile(mobile)}
							style={styles.input}
						/>
						<Divider style={styles.divider} />
					</View> */}
                <View style={{marginTop: 12}}>
                    <Text style={styles.inputTitle}>Username</Text>
                    <LocalsTextInput
                        autoCapitalize="none"
                        value={username}
                        onChangeText={(username) => setUsername(username)}
                        style={styles.input}
                    />
                    <Divider style={styles.divider}/>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')}><Text
                    style={{fontWeight: 'bold', color: "#C8C8C8", marginTop: 30}}>Passwort
                    ändern</Text></TouchableOpacity>

                <TouchableOpacity onPress={showAlert}><Text
                    style={{fontWeight: 'bold', color: "#C8C8C8", marginTop: 20}}>Account löschen
                </Text></TouchableOpacity>

                {!uploading && (
                    <LocalsButton
                        title="Änderungen Bestätigen"
                        onPress={change}
                        style={styles.loginBtn}
                    />
                )}
                {uploading && <ActivityIndicator size="large" color="#fff"/>}
            </View>
        </ImageBackground>
    )
}

export default EditProfile;

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
const styles = StyleSheet.create({
    container: {height: "100%", width: "100%"},
    image: {
        width: "100%",
    },
    addressInput: {
        backgroundColor: "transparent",
        color: "white",
    },
    inputContainer: {
        width: "80%",
        marginTop: 0,
    },
    name: {
        marginTop: 10,
        width: "48%",
        backgroundColor: "transparent",
        borderBottomColor: "white",
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: "white",
        backgroundColor: "transparent",
    },
    loginBtn: {
        marginTop: 25,
    },
    password: {
        marginTop: 10,
        backgroundColor: "transparent",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        backgroundColor: "transparent",
    },
    username: {
        marginTop: 10,
        color: "#fff",
    },
    google: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    email: {
        backgroundColor: "transparent",
    },
    username: {
        backgroundColor: "transparent",
    },
    form: {
        marginBottom: 24,
        marginHorizontal: 30,
    },
    input: {
        height: 48,
        fontSize: 12,
        color: "white",
        backgroundColor: "transparent",
        borderWidth: 0,
    },
    inputTitle: {
        color: "white",
        fontSize: 10,
        textTransform: "uppercase",
    },
    divider: {
        backgroundColor: "#fff",
        height: StyleSheet.hairlineWidth,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 100,
        overflow: "hidden",
        alignSelf: 'center',
        marginTop: 48
    },
    Pimage: {
        width: 100,
        height: 100,
        alignSelf: 'center'
    },
    back: {
        position: "absolute",
        top: 68,
        left: 32,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(21, 22, 48, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
    },
    datePicker: {
        width: "100%",
        marginTop: 10,
        borderWidth: 0,
    },
    datePickerPlaceholder: {
        color: "#C8C8C8",
    },
    datePickerText: {
        color: "white",
    },
});
