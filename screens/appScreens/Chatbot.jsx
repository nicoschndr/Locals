import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Animated } from 'react-native';
import { firebase } from "../../firebase";
import { useNavigation } from '@react-navigation/native';
import * as Location from "expo-location";

export default function Chatbot({ route }) {
	const scrollViewRef = useRef();
	const [location, setLocation] = useState(null);
	const [userInput, setUserInput] = useState('');
	const [aiResponse, setAiResponse] = useState('');
	const navigation = useNavigation();
	const [radius, setRadius] = useState(37);
	const [events, setEvents] = useState([]);
	const [messages, setMessages] = useState([]);

	const handleUserInput = async () => {
		const userMessage = {
			text: userInput,
			user: true,
		};
		const keywords = extractKeywords(userInput);
		const nearbyEvents = filterEventsByRadiusAndKeywords(events, radius, keywords);
		const aiResponse = await fetchAIResponse(userInput, nearbyEvents);
		const aiMessage = {
			text: aiResponse,
			user: false,
			events: nearbyEvents.slice(),
		};
		setMessages((prevMessages) => [...prevMessages, userMessage, aiMessage]);
		setUserInput('');
		scrollViewRef.current.scrollToEnd({ animated: true });
	};

	const fetchAIResponse = async (input, events) => {
		if (events.length !== 0) {
			try {
				const message = `Das ist der Text: ${input}\nUnd das die gefundenen Events: ${events.map(event => event.title).join(", ")}\nGeneriere einen kurzen Text um die Events vorzuschlagen. Maximal 60 Tokens lang`
				const response = await fetch('https://api.openai.com/v1/chat/completions', {
					method: 'POST',
					headers: {
						'Authorization': 'Bearer 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', // Ersetzen Sie dies durch Ihren OpenAI API-Schlüssel
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						messages: [{'role': 'user', 'content': message}],
						model: "gpt-3.5-turbo",
					})
				});

				if (!response.ok) {
					throw new Error('Error generating AI response');
				}

				const data = await response.json();
				return data.choices[0].message.content;
			} catch (error) {
				console.error('Error generating AI response:', error);
				return "I'm sorry, there was an error generating the response. Can I help you with anything else?";
			}
		} else {
			return "Ich konnte keine Events in deiner Nähe zu deiner Anfrage finden :("
		}
	};
	const openEventDetails = (event) => {
		navigation.navigate('EventDetails', { event });
	};

	const extractKeywords = (text) => {
		const keywords = ["sport", "culture", "music", "hiking"]; // Fügen Sie mehr Schlüsselwörter hinzu
		return keywords.filter(keyword => text.toLowerCase().includes(keyword));
	};

	const getEventsByKeywords = async (keywords) => {
		let events = [];

		for (let keyword of keywords) {
			const snapshot = await firebase.firestore().collection('events').where('category', 'array-contains', keyword).get();

			if (!snapshot.empty) {
				snapshot.forEach(doc => {
					events.push(doc.data());
				});
			}
		}

		return events;
	};

	useEffect(() => {
		const fetchEvents = async () => {
			const eventsRef = firebase.firestore().collection("events");

			eventsRef.onSnapshot((snapshot) => {
				const eventsData = snapshot.docs.map((doc) => {
					const event = {
						id: doc.id,
						...doc.data(),
					};

					return event;
				});

				const filteredEvents = filterEventsByRadius(eventsData, radius);
				setEvents(filteredEvents);
				console.log(filteredEvents)

			});
		};
		fetchEvents();
	}, [radius]);

	const filterEventsByRadius = (events, radius) => {
		if (!location) return events;

		const { latitude, longitude } = location.coords;

		return events.filter((event) => {
			const eventDistance = getDistanceFromLatLonInKm(
				latitude,
				longitude,
				event.latitude,
				event.longitude
			);
			console.log('Event Distance:', eventDistance);
			console.log('Radius:', radius);
			const numericRadius = parseFloat(radius);
			const re = eventDistance <= numericRadius
			console.log(re)
			return eventDistance <= numericRadius;
		});
	};
	useEffect(() => {
		const getLocation = async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== 'granted') {
					console.log('Permission to access location was denied');
					return;
				}

				const currentLocation = await Location.getCurrentPositionAsync({});
				setLocation(currentLocation);
			} catch (error) {
				console.error('Error getting current location:', error);
			}
		};

		getLocation();
	}, []);

	const filterEventsByRadiusAndKeywords = (events, radius, keywords) => {
		if (!location) return events;

		const { latitude, longitude } = location.coords;

		return events.filter((event) => {
			const eventDistance = getDistanceFromLatLonInKm(
				latitude,
				longitude,
				event.latitude,
				event.longitude
			);
			const eventKeywords = event.category;
			const numericRadius = parseFloat(radius);

			return (
				eventDistance <= numericRadius &&
				eventKeywords.some((keyword) => keywords.includes(keyword))
			);
		});
	};
	const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
		const R = 6371; // Radius der Erde in Kilometern
		const dLat = deg2rad(lat2 - lat1); // deg2rad unten
		const dLon = deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) *
			Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const d = R * c; // Entfernung in km
		return d;
	};

	const deg2rad = (deg) => {
		return deg * (Math.PI / 180);
	};

	return (
		<View style={styles.container}>
			<ScrollView
				ref={scrollViewRef}
				contentContainerStyle={styles.scrollViewContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.chatContainer}>
					{/* Chat Output */}
					<View style={styles.chatOutputContainer}>
						{messages.map((message, index) => (
							<View
								key={index}
								style={[
									styles.chatBubbleContainer,
									message.user ? styles.userMessage : styles.aiMessage,
								]}
							>
								<Text style={styles.chatBubbleText}>{message.text}</Text>
								{message.events && message.events.length > 0 && (
									<View style={styles.eventContainer}>
										{message.events.map((event, eventIndex) => (
											<TouchableOpacity
												key={eventIndex}
												style={styles.eventItem}
												onPress={() => openEventDetails(event)}
											>
												<View>
													<Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
													<Text style={styles.eventTitle}>{event.title}</Text>
												</View>

											</TouchableOpacity>
										))}
									</View>
								)}
							</View>
						))}
					</View>
				</View>
			</ScrollView>
			{/* Input Section */}
			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder="Type your text here..."
					value={userInput}
					onChangeText={setUserInput}
				/>
				<TextInput
					style={styles.radiusInput}
					placeholder="Radius (1-200)"
					keyboardType="numeric"
					value={radius.toString()}
					onChangeText={(value) => {
						const sanitizedValue = value.replace(/[^0-9]/g, '');
						const numericValue = parseInt(sanitizedValue);
						const clampedValue = Math.min(Math.max(numericValue, 1), 200);
						setRadius(clampedValue);
					}}
				/>
				<TouchableOpacity onPress={handleUserInput} style={styles.button}>
					<Text>Submit</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: 'flex-end', // Eingabe am unteren Bildschirmrand
	},
	scrollViewContent: {
		flexGrow: 1,
	},
	chatContainer: {
		flex: 1,
	},
	chatOutputContainer: {
		paddingHorizontal: 10,
		paddingBottom: 10,
	},
	chatBubbleContainer: {
		backgroundColor: '#ECECEC',
		borderRadius: 10,
		padding: 10,
		marginBottom: 10,
	},
	chatBubbleText: {
		fontSize: 16,
	},
	eventContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 10,
	},
	eventItem: {
		width: '50%',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 5,
		backgroundColor: 'rgba(255,255,255,0.5)',
		justifyContent: "center",
		borderRadius: "5"
	},
	eventImage: {
		width: 100,
		height: 100,
		marginRight: 10,
		borderRadius: 5,
	},
	eventTitle: {
		fontSize: 14,
		textAlign: "center"
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
	},
	input: {
		flex: 1,
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		marginRight: 10,
		paddingHorizontal: 10,
	},
	radiusInput: {
		width: 80,
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		marginRight: 10,
		paddingHorizontal: 10,
	},
	button: {
		alignItems: 'center',
		backgroundColor: '#DDDDDD',
		padding: 10,
	},
	iconContainer: {
		marginRight: 10,
	},
	userMessage: {
		alignSelf: 'flex-end',
		backgroundColor: '#ec404b',
		borderBottomRightRadius: 0,
	},
	aiMessage: {
		alignSelf: 'flex-start',
		backgroundColor: '#505050',
		borderBottomLeftRadius: 0,
	},
});
