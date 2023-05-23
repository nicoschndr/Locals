import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import {auth, firebase, firestore, storage} from "../../firebase";




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

	useEffect(() => {
		// Fetch events from Firebase Firestore
		const fetchEvents = async () => {
			const eventsRef = firebase.firestore().collection('events');
			const snapshot = await eventsRef.get();

			const eventsData = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			setEvents(eventsData);
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
							title={event.title}
							description={event.address}
						>
							<View style={styles.eventMarker} />
						</Marker>
					))}
				</MapView>
			)}
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
	innerCircle: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: 'blue',
	},
	eventMarker: {
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: 'red',
	},
});

export default Livemap;
