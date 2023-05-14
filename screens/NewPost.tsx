import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Dimensions,
    Image,
    TextInput,
    Button,
    Pressable
} from "react-native";
import React, {useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker'
import RNDateTimePicker from "@react-native-community/datetimepicker";
import {render} from "react-dom";

const Template = ({navigation}) => {

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const [datePicker, setDatePicker] = useState(false);
    const [date, setDate] = useState(new Date);

    function showDatePicker(){
        setDatePicker(true)
    }
    function onDateSelected(event, value) {
        setDate(value)
        setDatePicker(false)
    }


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.titleBar, {marginTop: windowHeight * 0.05}]}>
                    <Ionicons style={{marginRight: windowWidth - 90}} onPress={() => navigation.navigate('Profile')}
                              name={"arrow-back-circle-outline"} size={40}> </Ionicons>
                </View>

                <View style={{alignSelf: "center"}}>
                    <View style={styles.postImage}>
                        <Image source={require("../assets/building.jpg")} style={styles.image}
                               resizeMode="center"></Image>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text>Title</Text>
                    <TextInput style={styles.inputText}></TextInput>
                </View>
                <View style={styles.inputContainer}>
                    <Text>Address<Text style={{fontWeight: "bold"}}> or Set Marker*</Text></Text>
                    <TextInput style={styles.inputText}></TextInput>
                </View>
                <View style={styles.inputContainer}>
                    <Text>Group Size</Text>
                    <TextInput style={styles.inputText}></TextInput>
                </View>
                <View style={styles.inputContainer}>
                    <Text>Description</Text>
                    <TextInput style={styles.inputText}></TextInput>
                </View>
                <View style={styles.inputContainer}>
                    <Text>Gender</Text>
                    <TextInput style={styles.inputText}></TextInput>
                </View>
                <View style={styles.inputContainer}>
                    <Text>Category</Text>
                    <TextInput style={styles.inputText}></TextInput>
                </View>
                <View style={styles.inputContainer}>
                    <Text>Date</Text>
                    <View style={{flexDirection: "row"}}>
                        <Ionicons name={"calendar-outline"} onPress={showDatePicker} size={30}></Ionicons>
                        {datePicker && (
                            <DateTimePicker
                                value={date}
                                mode={'date'}
                                is24Hour={true}
                                onChange={onDateSelected}
                            />
                        )}
                        <Text style={styles.date}>{date.toString()}</Text></View>
                </View>
                <View style={{flexDirection:"row", marginTop: 20, justifyContent: "space-between"}}>
                    <Ionicons name={"camera-outline"} size={30}></Ionicons>
                    <Pressable style={styles.button}>
                        <Text style={{color:"#FFFFFF"}}>Post Event</Text>
                    </Pressable>
                    <Ionicons name={"images-outline"} size={30}></Ionicons>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Template;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    titleBar: {
        flexDirection: "row",
        justifyContent: "flex-start"
    },
    postImage: {
        width: 100,
        height: 100,
        borderRadius: 100,
        overflow: "hidden"
    },
    image: {
        flex: 1,
        width: 200,
        height: 200,
        borderRadius: 30
    },
    inputContainer: {
        textAlign: "left",
        marginTop: 10
    },
    inputText: {
        fontWeight: "bold",
        borderBottomColor: "#000000",
        borderBottomWidth: 1,
        marginTop: 10
    },
    date: {
        marginLeft: 10,
        marginTop: 10,
        fontWeight: "bold"
    },
    button: {
        alignSelf:"center",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 50,
        backgroundColor: "#E63F3F",
        width: 200,
    }
    }
);