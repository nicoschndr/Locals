import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, StyleSheet, Modal, TouchableOpacity, Linking, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { auth, firebase } from "../../firebase";
import { Text, Image } from "react-native";
import LocalsButton from "../../components/LocalsButton";

const AnimatedCircle = ({ style }) => {
	const scaleAnimation = useRef(new Animated.Value(0)).current;
	const opacityAnimation = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		Animated.loop(
			Animated.timing(scaleAnimation, {
				toValue: 1,
				duration: 2000,
				easing: Easing.linear,
				useNativeDriver: true,
			})
		).start();
	}, []);

	useEffect(() => {
		Animated.loop(
			Animated.timing(opacityAnimation, {
				toValue: 0,
				duration: 2000,
				easing: Easing.linear,
				useNativeDriver: true,
			})
		).start();
	}, []);

	return (
		<Animated.View
			style={[
				style,
				{ transform: [{ scale: scaleAnimation }], opacity: opacityAnimation },
			]}
		>
			<View style={styles.innerCircle} />
		</Animated.View>
	);
};

const Livemap = () => {
	const [location, setLocation] = useState(null);
	const [events, setEvents] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState({ attendees: [] });
	const { user } = auth.currentUser;

	const getUsername = async () => {
		const user = auth.currentUser;
		if (!user) {
			throw new Error('User not authenticated');
		}
		const userRef = firebase.firestore().collection('users').doc(user.uid);
		const userDoc = await userRef.get();
		const username = userDoc.data().username;
		return username;
	};


	const handleEventPress = (event) => {
		setSelectedEvent(event);
		setModalVisible(true);
	};

	const attendEvent = async () => {
		const user = firebase.auth().currentUser;
		const username = await getUsername();

		if (user && selectedEvent) {
			const eventRef = firebase.firestore().collection('events').doc(selectedEvent.id);

			await eventRef.update({
				attendees: firebase.firestore.FieldValue.arrayUnion(username),
				groupSize: firebase.firestore.FieldValue.increment(1)
			});

			setSelectedEvent(prevState => ({
				...prevState,
				attendees: [...prevState.attendees, username],
				groupSize: prevState.groupSize + 1,
				isAttending: true,
			}));
		}
	};

	const cancelAttendance = async () => {
		const user = firebase.auth().currentUser;
		const username = await getUsername();

		if (user && selectedEvent) {
			const eventRef = firebase.firestore().collection('events').doc(selectedEvent.id);

			await eventRef.update({
				attendees: firebase.firestore.FieldValue.arrayRemove(username),
				groupSize: firebase.firestore.FieldValue.increment(-1)
			});

			setSelectedEvent(prevState => ({
				...prevState,
				attendees: prevState.attendees.filter(user => user !== username),
				groupSize: prevState.groupSize - 1,
				isAttending: false,
			}));
		}
	};


	const toggleAttendance = async () => {
		const username = await getUsername();

		if (selectedEvent && selectedEvent.attendees && selectedEvent.attendees.includes(username)) {
			cancelAttendance();
		} else {
			attendEvent();
		}
	};

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				alert('Permission to access location was denied');
				return;
			}

			let locationSubscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 1000,
					distanceInterval: 1,
				},
				(location) => {
					setLocation(location);
				}
			);

			return () => {
				locationSubscription.remove();
			};
		})();
	}, []);

	const openMapsApp = () => {
		const { latitude, longitude } = selectedEvent;

		const url = Platform.select({
			ios: `maps:0,0?q=${latitude},${longitude}`,
			android: `geo:0,0?q=${latitude},${longitude}`,
		});

		Linking.openURL(url);
	};

	useEffect(() => {
		const fetchEvents = async () => {
			const username = await getUsername();
			const eventsRef = firebase.firestore().collection('events');

			eventsRef.onSnapshot((snapshot) => {
				const eventsData = snapshot.docs.map((doc) => {
					const event = {
						id: doc.id,
						...doc.data(),
					};

					event.isAttending = Array.isArray(event.attendees) && event.attendees.includes(username);
					return event;
				});

				setEvents(eventsData);
			});
		};

		fetchEvents();
	}, []);
	return (
		<View style={styles.container}>
			{location && (
				<MapView
					style={styles.map}
					initialRegion={{
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					}}
				>
					<Marker
						coordinate={{
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
						}}
					>
						<AnimatedCircle style={styles.outerCircle} />
					</Marker>

					{events.map((event) => (
						<Marker
							key={event.id}
							coordinate={{
								latitude: event.latitude,
								longitude: event.longitude,
							}}
							onPress={() => handleEventPress(event)}
						>
							<View style={styles.eventMarker} />
						</Marker>
					))}
				</MapView>
			)}
			<Modal visible={modalVisible} animationType="slide">
				<View style={styles.modalContainer}>
					{selectedEvent && (
						<View style={{ flex: 1, alignItems: "center" }}>
							<Image style={styles.eventModalImage} source={{ uri: selectedEvent.imageUrl }} />
							<Text style={styles.eventModalTitle}>{selectedEvent.title}</Text>
							<Text style={styles.eventModalText}>Erstellt von: {selectedEvent.creator}</Text>
							<LocalsButton title={"Hin da!"} onPress={openMapsApp} />
							<Text style={styles.eventModalText}>Beschreibung: {selectedEvent.description}</Text>
							<Text style={styles.eventModalText}>Wer ist eingeladen: {selectedEvent.gender}</Text>
							<Text style={styles.eventModalText}>Kategorie: {selectedEvent.category}</Text>

							{selectedEvent.isAttending ? (
								<LocalsButton title={"Nicht teilnehmen"} onPress={toggleAttendance} />
							) : (
								<LocalsButton title={"Teilnehmen"} onPress={toggleAttendance} />
							)}


							<Text style={styles.eventModalText}>Group Size: {selectedEvent.groupSize}</Text>
						</View>
					)}

					<TouchableOpacity onPress={() => setModalVisible(false)}>
						<Text style={styles.closeButton}>Close</Text>
					</TouchableOpacity>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	outerCircle: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: 'transparent',
		borderWidth: 2,
		borderColor: 'blue',
		alignItems: 'center',
		justifyContent: 'center',
	},
	eventContainer: {
		alignItems: 'center',
	},
	eventMarker: {
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: 'red',
	},
	eventTitle: {
		fontSize: 12,
		color: 'black',
		marginTop: 4,
		textAlign: 'center',
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	eventModalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	eventModalText: {
		fontSize: 16,
		marginBottom: 8,
	},
	eventModalImage: {
		width: 200,
		height: 200,
		resizeMode: 'cover',
		marginBottom: 16,
	},
	closeButton: {
		fontSize: 16,
		color: 'blue',
		marginTop: 20,
	},
	mapButton: {
		backgroundColor: 'blue',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 4,
		marginBottom: 16,
	},
	mapButtonText: {
		color: 'white',
		fontSize: 16,
	},
});

export default Livemap;
