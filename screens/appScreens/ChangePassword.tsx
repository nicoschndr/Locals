import LocalsTextInput from "../../components/LocalsTextInput";
import React, {useState} from "react";
import {Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {CheckBox, Divider} from "react-native-elements";
import LocalsButton from "../../components/LocalsButton";
import {auth} from "../../firebase";



/**
* Renders the ChangePassword page with the provided props.
* @param navigation The navigation object for navigating between screens.
 * @param route An object representing the current route information provided by the React Navigation library or similar
 * navigation framework.
* @returns {JSX.Element} The rendered ChangePassword page.
* @constructor
*/
const ChangePassword = ({route, navigation}) => {

    /**
     * The new password that is entered in the specific input field.
     */
    const [password, setPassword] = useState('');

    /**
     * The confirmation of the password that is entered in the specific input field.
     */
    const [confirmPassword, setConfirmPassword] = useState('');

    /**
     * The height of the user's device in px.
     */
    const deviceHeight = Dimensions.get("window").height;

    /**
     * If true the password is shown to the user.
     */
    const [showPassword, setShowPassword] = useState(false);

    /**
     * If the password and the confirmation are identical the password is changed in the authentication system.
     * Otherwise, it triggers an alert.
     */
    function changePassword(){
        if(password === confirmPassword){
            auth.currentUser.updatePassword(password).then(alert('Das hat geklappt'))
        }else {
            alert('Passwörter stimmen nicht überein')
        }
    }

    /**
     * renders the TabProfileIcon component.
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
        <View style={[styles.inputContainer, {marginTop: deviceHeight*0.3}]}>



            <Text style={styles.inputTitle}>Neues Password:</Text>
            <LocalsTextInput
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(password) => setPassword(password)}
                style={styles.input}
            />
            <Divider style={styles.divider}/>
            <Text style={styles.inputTitle}>Passwort erneut eingeben</Text>
            <LocalsTextInput
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={(confirmPassword) => setConfirmPassword(confirmPassword)}
                style={styles.input}
            />

            <Divider style={styles.divider}/>
            <CheckBox
                title="Passwort anzeigen"
                checked={showPassword}
                onPress={() => setShowPassword(!showPassword)}
                containerStyle={{
                    backgroundColor: "transparent",
                    borderWidth: 0,
                    marginLeft: 0,
                    padding: 0,
                    marginBottom: 12,
                }}
                textStyle={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: "normal",
                    marginLeft: 4,
                }}
                checkedColor="#ec404b"
                size={20}
            />
        </View>


            <LocalsButton style={{marginTop: 12}} title={'Passwort ändern'} onPress={changePassword}/>
        </ImageBackground>
    )

}

export default ChangePassword;

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
const styles = StyleSheet.create({
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
    inputContainer: {
        width: "80%",
    },
    inputTitle: {
        color: "white",
        fontSize: 10,
        textTransform: "uppercase",
    },
    input: {
        height: 48,
        fontSize: 12,
        color: "white",
        backgroundColor: "transparent",
        borderWidth: 0,
    },
    divider: {
        backgroundColor: "#fff",
        height: StyleSheet.hairlineWidth,
    },
})
