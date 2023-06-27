import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {auth, firestore} from "../../firebase";
import LocalsButton from "../../components/LocalsButton";

const Onboarding = ({navigation}) => {
    const [currentPage, setCurrentPage] = useState(0);
    const pages = [
        {
            id: 0,
            title: 'Willkommen',
            subtitle: 'Willkommen zur Onboarding-App!',
            //image: require('./assets/welcome.png'),
        },
        {
            id: 1,
            title: 'Funktion 1',
            subtitle: 'Entdecke die tolle Funktion 1.',
            //image: require('./assets/function1.png'),
        },
        {
            id: 2,
            title: 'Funktion 2',
            subtitle: 'Entdecke die tolle Funktion 2.',
            //image: require('./assets/function2.png'),
        },
        {
            id: 3,
            title: 'Fertig',
            subtitle: 'Du bist bereit, loszulegen!',
            //image: require('./assets/finish.png'),
        },
    ];

    const handleNext = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    };


    const renderOnboardingPages = () => {
        return pages.map((page, index) => (

            <View style={styles.pageContainer}>
                {page.id === currentPage && (
                    <View>
                        <Text style={styles.title}>{page.title}</Text>
                        <Image source={page.image} style={styles.image}/>
                        <Text style={styles.subtitle}>{page.subtitle}</Text>
                    </View>
                )}
            </View>

        ));
    };

    const setStorage = async () => {
        await AsyncStorage.setItem('ONBOARDED', 'true');
        navigation.navigate('Auth')
    }

    return (
        <View style={styles.container}>
            <View style={styles.onboardingContainer}>
                {renderOnboardingPages()}
            </View>
            <View style={styles.buttonContainer}>
                {currentPage < pages.length - 1 && (
                    <LocalsButton
                        style={{ marginTop: 20, alignSelf: "center" }}
                        title={"weiter"}
                        onPress={() => {handleNext()}}
                    >
                    </LocalsButton>
                )}
                {currentPage === pages.length - 1 && (
                    <LocalsButton
                        style={{ marginTop: 20, alignSelf: "center" }}
                        title={"jetzt loslegen"}
                        onPress={() => {handleNext(); setStorage()}}
                    >
                    </LocalsButton>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    onboardingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        marginHorizontal: 40,
        marginBottom: 20,
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    nextButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    startButton: {
        backgroundColor: '#27ae60',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default Onboarding;

