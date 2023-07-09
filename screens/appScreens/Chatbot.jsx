import React, { useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Image,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { firebase } from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { Modal } from "react-native";
import LocalsButton from "../../components/LocalsButton";
import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // Importieren Sie die Slider und Modal Komponenten
import LocalsEventCard from "../../components/LocalsEventCard";
import AppleHeader from "react-native-apple-header";

/**
 * Renders the Chatbot page with the provided props.
 * @param route An object representing the current route information provided by the React Navigation library or similar
 * navigation framework.
 * @returns {JSX.Element} The rendered Chatbot page.
 * @constructor
 */
export default function Chatbot({ route }) {

	/**
	 * used to reference the scroll view.
	 * @type {React.MutableRefObject<undefined>}
	 */
	const scrollViewRef = useRef();

	/**
	 * The location of the current user.
	 */
	const [location, setLocation] = useState(null);

	/**
	 * The input that the user wrote in the text input.
	 */
	const [userInput, setUserInput] = useState("");
	const [aiResponse, setAiResponse] = useState("");

	/**
	 * Used to access the navigation object within a component.
	 * @type {NavigationProp<ReactNavigation.RootParamList>}
	 */
	const navigation = useNavigation();

	/**
	 * The radius where events for the user are searched.
	 */
	const [radius, setRadius] = useState(37);

	/**
	 * all events
	 */
	const [events, setEvents] = useState([]);

	/**
	 * AI message.
	 */
	const [messages, setMessages] = useState([]);

	/**
	 * Gif that is displayed when the chatbot is "thinking".
	 */
	const [gifUrl, setGifUrl] = useState(null);

	/**
	 * indicates if the radius picker is visible or not.
	 */
	const [isRadiusPickerVisible, setIsRadiusPickerVisible] = useState(false); // Neuer Status für die Sichtbarkeit des Sliders

	/**
	 * This function is called when the user clicks the icon to set the radius. It opens th radius picker.
	 */
	const openRadiusPicker = () => {
		try {
			setIsRadiusPickerVisible(true);
		} catch (error) {
			console.error(error);
		}
	};

	/**
	 * This function is called when the user presses the "Set" button to confirm the new radius. It closes the radius
	 * picker.
	 */
	const closeRadiusPicker = () => {
		setIsRadiusPickerVisible(false);
	};

	/**
	 * responsible for fetching a random GIF URL from the GIPHY API.
	 * @returns {Promise<void>}
	 */
	const fetchGifUrl = async () => {
		try {
			const response = await fetch(
				"http://api.giphy.com/v1/gifs/random?api_key=0UTRbFtkMxAplrohufYco5IY74U8hOes&tag=looking&rating=r"
			);
			const data = await response.json();
			setGifUrl(data.data.images.original.url);
		} catch (error) {
			console.error("Error fetching gif:", error);
		}
	};

	/**
	 * responsible for processing user input and generating AI responses.
	 * @returns {Promise<void>}
	 */
	const handleUserInput = async () => {
		const userMessage = {
			text: userInput,
			user: true,
		};
		setMessages((prevMessages) => [...prevMessages, userMessage]);
		setUserInput("");
		scrollViewRef.current.scrollToEnd({ animated: true });

		// Platzhalter hinzufügen
		const placeholderMessage = {
			loading: true,
			user: false,
		};
		setMessages((prevMessages) => [...prevMessages, placeholderMessage]);

		const keywords = await extractKeywords(userInput);
		const nearbyEvents = filterEventsByRadiusAndKeywords(
			events,
			radius,
			keywords
		);
		const aiResponse = await fetchAIResponse(userInput, nearbyEvents);
		const aiMessage = {
			text: aiResponse,
			user: false,
			events: nearbyEvents.slice(),
		};

		// Platzhalter entfernen und AI Nachricht hinzufügen
		setMessages((prevMessages) => {
			const filteredMessages = prevMessages.filter(
				(message) => !message.loading
			);
			return [...filteredMessages, aiMessage];
		});
		fetchGifUrl();
	};

	/**
	 * Responsible for generating an AI response based on the user's input and events data.
	 * @param input The user's input or message.
	 * @param events An array of events data.
	 * @returns {Promise<*|string>}
	 */
	const fetchAIResponse = async (input, events) => {
		console.log(events);
		if (events.length !== 0) {
			try {
				const message = `Das ist der Text: ${input}\nUnd das die gefundenen Events: ${events
					.map((event) => {
						// Umwandlung des Firebase Timestamps in ein JavaScript Date Objekt
						const eventDate = event.date.toDate();

						// Formatierung des Datums in deutschem Format (Tag.Monat.Jahr)
						const formattedDate = eventDate.toLocaleDateString("de-DE");

						// Rückgabe des Titels und des formatierten Datums
						return `${event.title} (${formattedDate})`;
					})
					.join(
						", "
					)}\nGeneriere einen kurzen Text um die Events vorzuschlagen. Schreibe nur kurze und wichtige Sätze`;

				const response = await fetch(
					"https://api.openai.com/v1/chat/completions",
					{
						method: "POST",
						headers: {
							Authorization:
								"Bearer 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", // Ersetzen Sie dies durch Ihren OpenAI API-Schlüssel
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							messages: [{ role: "user", content: message }],
							model: "gpt-3.5-turbo",
						}),
					}
				);

				if (!response.ok) {
					throw new Error("Error generating AI response");
				}

				const data = await response.json();
				return data.choices[0].message.content;
			} catch (error) {
				console.error("Error generating AI response:", error);
				return "I'm sorry, there was an error generating the response. Can I help you with anything else?";
			}
		} else {
			try {
				const message = `Das ist der Text: ${input}\n Schreibe dem Nutzer, dass leider keine Events gefunden werden können. Falls er fragt sag ihm, dass er nach events für sport, kultur, party, konzerten und kultur suchen kann. Beantworte keine Fragen, die abseits von Events sind und nichts mit Events zutun haben. In solchen Fällen sag, dass du das nicht weißt`;
				const response = await fetch(
					"https://api.openai.com/v1/chat/completions",
					{
						method: "POST",
						headers: {
							Authorization:
								"Bearer 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", // Ersetzen Sie dies durch Ihren OpenAI API-Schlüssel
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							messages: [{ role: "user", content: message }],
							model: "gpt-3.5-turbo",
						}),
					}
				);

				if (!response.ok) {
					throw new Error("Error generating AI response");
				}

				const data = await response.json();
				return data.choices[0].message.content;
			} catch (error) {
				console.error("Error generating AI response:", error);
				return "I'm sorry, there was an error generating the response. Can I help you with anything else?";
			}
		}
	};

	/**
	 * navigate to the details of the suggested event.
	 * @param event
	 */
	const openEventDetails = (event) => {
		navigation.navigate("EventDetails", { event });
	};

	/**
	 * provides translations for specific keywords.
	 * @type {{generell: string, kultur: string, konzert: string, sport: string, party: string}}
	 */
	const keywordsTranslations = {
		sport: "sport",
		kultur: "culture",
		party: "party",
		konzert: "concert",
		generell: "general",
		// Fügen Sie weitere Übersetzungen hinzu
	};

	/**
	 * extracts keywords from the provided text using AI-powered language processing.
	 * @param text The text from which keywords are to be extracted.
	 * @returns {Promise<*|*[]>}
	 */
	const aiKeywords = async (text) => {
		try {
			const message = `Das ist der Text: ${text}\n Suche innerhalb des Textes, nach was der user sucht. 
			Er kann nach mehreren Sachen suchen. Die Keywords sind:
			 sport, culture, party und concert
			 . 
			Beachte, dass der Text deutsch ist, der ausgabewert aber englisch.
			Gebe als Antwort nur die keywords zurück die in dem Text ein match haben. 
			Ich brauche wirklich nur die keywords von dir, sonst nichts. Separiere die Keyword mit einem Komma`;
			const response = await fetch(
				"https://api.openai.com/v1/chat/completions",
				{
					method: "POST",
					headers: {
						Authorization:
							"Bearer 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", // Ersetzen Sie dies durch Ihren OpenAI API-Schlüssel
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						messages: [{ role: "user", content: message }],
						model: "gpt-3.5-turbo",
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Error generating AI response");
			}

			const data = await response.json();
			// Assuming the response is an array of keywords
			return data.choices[0].message.content.split(", "); // Splitting the response by commas to get an array of keywords
		} catch (error) {
			console.error("Error generating AI response:", error);
			return [];
		}
	};

	/**
	 * extracts keywords from the provided text and translates them using a predefined set of translations
	 * @param text The text from which keywords are to be extracted.
	 * @returns {Promise<*|*[]>}
	 */
	const extractKeywords = async (text) => {
		const matches = await aiKeywords(text);
		const keywords = Object.keys(keywordsTranslations); // Die deutschen Schlüsselwörter
		const foundKeywords = keywords.filter((keyword) =>
			text.toLowerCase().includes(keyword)
		);
		console.log(foundKeywords.map((keyword) => keywordsTranslations[keyword]));
		return matches; // Übersetzung zu englischen Schlüsselwörtern
	};

	const getEventsByKeywords = async (keywords) => {
		let events = [];

		for (let keyword of keywords) {
			const snapshot = await firebase
				.firestore()
				.collection("events")
				.where("category", "array-contains", keyword)
				.get();

			if (!snapshot.empty) {
				snapshot.forEach((doc) => {
					events.push(doc.data());
				});
			}
		}

		return events;
	};

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 * retrieves the data of all events
		 * @returns {Promise<void>}
		 */
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
			});
		};
		fetchEvents();
	}, [radius]);

	/**
	 * filters events based on the specified radius from the user's location.
	 * @param events An array of event objects to be filtered.
	 * @param radius The radius within which events should be considered, specified in kilometers.
	 * @returns {*}
	 */
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
			console.log("Event Distance:", eventDistance);
			console.log("Radius:", radius);
			const numericRadius = parseFloat(radius);
			const re = eventDistance <= numericRadius;
			//console.log(re)
			return eventDistance <= numericRadius;
		});
	};

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {

		/**
		 * retrieves and updates the location of the current user.
		 * @returns {Promise<void>}
		 */
		const getLocation = async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					console.log("Permission to access location was denied");
					return;
				}

				const currentLocation = await Location.getCurrentPositionAsync({});
				setLocation(currentLocation);
			} catch (error) {
				console.error("Error getting current location:", error);
			}
		};

		getLocation();
	}, []);

	/**
	 * filters events based on the specified radius from the user's location and matching keywords.
	 * @param events An array of event objects to be filtered.
	 * @param radius The radius within which events should be considered, specified in kilometers.
	 * @param keywords An array of keywords to match against event categories.
	 * @returns {*}
	 */
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
				Array.isArray(eventKeywords) &&
				eventKeywords.some((keyword) => keywords.includes(keyword))
			);
		});
	};

	/**
	 * Executes functions once when the component mounts.
	 */
	useEffect(() => {
		fetchGifUrl();
	}, []);

	/**
	 * calculates the distance between two sets of latitude and longitude coordinates using the Haversine formula.
	 * @param lat1 Latitude of the first point.
	 * @param lon1 Longitude of the first point.
	 * @param lat2 Latitude of the second point.
	 * @param lon2 Longitude of the second point.
	 * @returns {number} The distance between the two points in kilometers.
	 */
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

	/**
	 * converts an angle in degrees to radians.
	 * @param deg The angle in degrees.
	 * @returns {number} The angle converted to radians.
	 */
	const deg2rad = (deg) => {
		return deg * (Math.PI / 180);
	};

	/**
	 * represents a date format configuration for displaying a short date representation.
	 * @type {{month: string, year: string, day: string}}
	 */
	const shortDate = {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	};

	/**
	 * renders the Chatbot page.
	 */
	return (
		<KeyboardAvoidingView style={styles.container} behavior="padding">
			{/* <AppleHeader
				largeTitle={"Guide"}
				onPress={() => navigation.goBack()}
				largeTitleTextStyle={{ textAlign: "center", marginTop: 20 }}
			/> */}
			<View style={styles.headerContainer}>
				<TouchableOpacity
					style={styles.goBack}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="chevron-back" size={30} />
				</TouchableOpacity>
				<Text
					style={{
						fontSize: 24,
						fontWeight: "bold",
					}}
				>
					Guide
				</Text>
				<TouchableOpacity onPress={openRadiusPicker} style={styles.radiusIcon}>
					<Ionicons name="compass-outline" size={30} />
				</TouchableOpacity>
			</View>
			<Modal visible={isRadiusPickerVisible} animationType="slide">
				<View style={styles.radiusPickerContainer}>
					{/* close icon on top right  */}

					<Text
						style={{
							fontSize: 26,
							fontWeight: "bold",
							position: "absolute",
							top: 65,
						}}
					>
						Umkreis
					</Text>
					<TouchableOpacity
						style={styles.closeIcon}
						onPress={closeRadiusPicker}
					>
						<Ionicons name="close-outline" size={30} />
					</TouchableOpacity>

					<Slider
						minimumValue={1}
						maximumValue={200}
						step={1}
						value={radius}
						onValueChange={(value) => setRadius(value)}
						style={styles.slider}
					/>
					<Text style={{ fontWeight: "bold", fontSize: 18 }}>{radius}km</Text>
					<LocalsButton
						title={"Set"}
						onPress={closeRadiusPicker}
						style={{ marginTop: 20 }}
					></LocalsButton>
				</View>
			</Modal>
			<ScrollView
				ref={scrollViewRef}
				contentContainerStyle={styles.scrollViewContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				style={{ marginTop: 50 }}
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
								{message.loading ? (
									<View>
										<Image
											source={{ uri: gifUrl }} // Verwenden Sie gifUrl hier
											style={styles.placeholderGif}
										/>
										<Text>Ich suche...</Text>
									</View>
								) : (
									<Text style={styles.chatBubbleText}>{message.text}</Text>
								)}
								{message.events && message.events.length > 0 && (
									<View style={styles.eventContainer}>
										<ScrollView
											horizontal
											showsHorizontalScrollIndicator={false}
										>
											{message.events.map((event, eventIndex) => (
												// <TouchableOpacity
												// 	key={eventIndex}
												// 	style={styles.eventItem}
												// 	onPress={() => openEventDetails(event)}
												// >
												// 	<View>
												// 		<Image
												// 			source={{ uri: event.imageUrl }}
												// 			style={styles.eventImage}
												// 		/>
												// 		<Text style={styles.eventTitle}>{event.title}</Text>
												// 	</View>
												// </TouchableOpacity>
												<LocalsEventCard
													key={eventIndex}
													event={event}
													onPress={() => openEventDetails(event)}
													profile
													style={{ marginRight: 8 }}
													title={event.title}
													imageUrl={event.imageUrl}
													date={event.date
														?.toDate()
														?.toLocaleDateString("de-DE", shortDate)}
													location={event.address}
												/>
											))}
										</ScrollView>
									</View>
									// replace with localsEventCard component
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

				<TouchableOpacity onPress={handleUserInput}>
					<MaterialIcons name="send" size={24} color="#ec404b" />
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
}

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
const styles = StyleSheet.create({
	closeIcon: {
		position: "absolute",
		top: 65,
		right: 20,
	},
	placeholderGif: {
		width: 200,
		height: 200,
		// Sie können weitere Stile hinzufügen, um das Aussehen des GIFs zu verändern
	},
	container: {
		flex: 1,
		padding: 10,
		justifyContent: "flex-end", // Eingabe am unteren Bildschirmrand
		marginBottom: 80,
	},
	scrollViewContent: {
		flexGrow: 1,
	},
	chatContainer: {
		flex: 1,
	},
	goBack: {},

	chatOutputContainer: {
		paddingHorizontal: 10,
		paddingBottom: 10,
	},
	chatBubbleContainer: {
		backgroundColor: "#ECECEC",
		borderRadius: 10,
		padding: 10,
		marginBottom: 10,
	},
	chatBubbleText: {
		fontSize: 16,
	},
	eventContainer: {
		display: "flex",
		flexDirection: "row",
		marginTop: 10,
	},
	eventItem: {
		flex: "0 0 auto",
		width: "50%",
		alignItems: "center",
		marginBottom: 5,
		paddingTop: 5,
		backgroundColor: "rgba(236, 64, 75, 0.5)",
		justifyContent: "center",
		borderRadius: 5,
		marginRight: 5,
	},
	eventImage: {
		width: 100,
		height: 100,
		alignSelf: "center",
		borderRadius: 5,
	},
	eventTitle: {
		fontSize: 14,
		textAlign: "center",
	},

	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 10,
	},
	input: {
		flex: 1,
		minHeight: 40,
		maxHeight: 120,
		marginRight: 8,
		paddingHorizontal: 8,
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 15,
	},
	radiusInput: {
		width: 80,
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		marginRight: 10,
		paddingHorizontal: 10,
	},
	button: {
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.3)",
		padding: 10,
	},
	iconContainer: {
		marginRight: 10,
	},
	userMessage: {
		alignSelf: "flex-end",
		backgroundColor: "#ec404b",
		borderBottomRightRadius: 0,
		marginLeft: 40,
	},
	aiMessage: {
		alignSelf: "flex-start",
		backgroundColor: "#e1e1e1",
		borderBottomLeftRadius: 0,
		color: "white",
		marginRight: 40,
	},
	radiusIcon: {
		zIndex: 999,
	},
	headerContainer: {
		top: 40,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		position: "relative",
		zIndex: 1,
	},
	radiusPickerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},

	sliderContainer: {
		position: "absolute",
		bottom: 20,
		left: 20,
		right: 20,
		alignItems: "center",
	},
	sliderValueText: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 8,
	},
	slider: {
		width: "90%",
	},
});
