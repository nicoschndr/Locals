import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';


interface LocalsEventCardProps {
    title: string;
    date: string;
    location: string;
    image: string;
    onPress: () => void;
}

const LocalsEventCard = (props: LocalsEventCardProps) => {

    return (
        <TouchableOpacity style={styles.container} onPress={props.onPress}>
            <Image source={{ uri: props.image }} style={styles.image} />
            <View style={styles.detailsContainer}>
                <Text style={styles.title}>{props.title}</Text>
                <Text style={styles.date}>{props.date}</Text>
                <Text style={styles.location}>{props.location}</Text>
            </View>
        </TouchableOpacity >
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 10,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    image: {
        width: 100,
        height: 100,
    },
    detailsContainer: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 16,
        marginTop: 5,
    },
    location: {
        fontSize: 16,
        marginTop: 5,
    },
});

export default LocalsEventCard;