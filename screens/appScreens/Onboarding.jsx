import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, firestore } from "../../firebase";
import LocalsButton from "../../components/LocalsButton";

/**
* Renders the Onboarding page with the provided props.
* @param navigation The navigation object for navigating between screens.
* @returns {JSX.Element} The rendered Onboarding page.
* @constructor
*/
const Onboarding = ({ navigation }) => {

	/**
	 * Identifier for the page the user is looking at.
	 */
	const [currentPage, setCurrentPage] = useState(0);

	/**
	 * The five Onboarding screens with their content.
	 * @type {[{image: *, subtitle: string, id: number, title: string},{image: *, subtitle: string, id: number, title: string},{image: *, subtitle: string, id: number, title: string},{image: *, subtitle: string, id: number, title: string},{image: *, subtitle: string, id: number, title: string}]}
	 */
	const pages = [
		{
			id: 0,
			title: "Willkommen bei:",
			subtitle:
				"Im Folgenden bekommst du eine kurze Einführung über die wichtigsten Funktionen der App",
			image: require("../../assets/Logo_onboarding.png"),
		},
		{
			id: 1,
			title: "Events",
			subtitle:
				"Du kannst Events erstellen, daran teilnehmen sowie nach bestimmten Events suchen.",
			image: require("../../assets/party.png"),
		},
		{
			id: 2,
			title: "Livemap",
			subtitle:
				"Die Livemap gibt dir einen Überblick wo die Events stattfinden.",
			image: require("../../assets/liveMap.png"),
		},
		{
			id: 3,
			title: "Vernetzen",
			subtitle:
				"Jeder hat ein eigenes Profil. Dort kann man anderen folgen, Freundschaftsanfragen versenden, chatten sowie sehen was ein anderer User in letzter Zeit gemacht hat.",
			image: require("../../assets/profiles.png"),
		},
		{
			id: 4,
			title: "Fertig",
			subtitle: "Du bist bereit, loszulegen. Viel Spaß!",
			image: require("../../assets/Logo_onboarding.png"),
		},
	];

	/**
	 * When the user clicks on the button which says "next", the page identifier is incremented.
	 */
	const handleNext = () => {
		if (currentPage < pages.length - 1) {
			setCurrentPage(currentPage + 1);
		}
	};

	/**
	 * Renders each Oboarding page with their content, meaning image and text.
	 * @returns {unknown[]}
	 */
	const renderOnboardingPages = () => {
		return pages.map((page, index) => (
			<View style={styles.pageContainer}>
				{page.id === currentPage && (
					<View>
						<Text style={styles.title}>{page.title}</Text>
						{page.image === require("../../assets/Logo_onboarding.png") && (
							<Image source={page.image} style={styles.logo} />
						)}
						{page.image !== require("../../assets/Logo_onboarding.png") && (
							<Image source={page.image} style={styles.image} />
						)}
						<Text style={styles.subtitle}>{page.subtitle}</Text>
					</View>
				)}
			</View>
		));
	};

	/**
	 * When the Onboarding s complete, that is saved in the Async storage to make sure the user only sees the
	 * onboarding once.
	 * @returns {Promise<void>}
	 */
	const setStorage = async () => {
		await AsyncStorage.setItem("ONBOARDED", "true");
		navigation.navigate("Auth");
	};

	/**
	 * renders the Onboarding page.
	 */
	return (
		<View style={styles.container}>
			<View style={styles.onboardingContainer}>{renderOnboardingPages()}</View>
			<View style={styles.buttonContainer}>
				{currentPage < pages.length - 1 && (
					<LocalsButton
						style={{ marginTop: 20, alignSelf: "center" }}
						title={"weiter"}
						onPress={() => {
							handleNext();
						}}
					></LocalsButton>
				)}
				{currentPage === pages.length - 1 && (
					<LocalsButton
						style={{ marginTop: 20, alignSelf: "center" }}
						title={"jetzt loslegen"}
						onPress={() => {
							handleNext();
							setStorage();
						}}
					></LocalsButton>
				)}
			</View>
		</View>
	);
};

/**
 * Creates a StyleSheet object containing style definitions for the page.
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	onboardingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	pageContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		alignSelf: "center",
	},
	subtitle: {
		fontSize: 18,
		textAlign: "center",
		marginHorizontal: 40,
		marginBottom: 20,
	},
	image: {
		width: 250,
		height: 200,
		marginBottom: 40,
		alignSelf: "center",
	},
	logo: {
		marginBottom: 40,
		alignSelf: "center",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 40,
	},
	nextButton: {
		backgroundColor: "#3498db",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 5,
		marginRight: 10,
	},
	nextButtonText: {
		color: "#fff",
		fontSize: 16,
	},
	startButton: {
		backgroundColor: "#27ae60",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 5,
	},
	startButtonText: {
		color: "#fff",
		fontSize: 16,
	},
});

export default Onboarding;
