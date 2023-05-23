import { View, Text, Modal, StyleSheet, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { firestore } from "../../firebase";
import LocalsButton from "../../components/LocalsButton";

const EventDetails = ({ route, navigation }) => {
	const { event } = route.params;
	const { showModal, setShowModal } = useState(false);

	// delete event in firestore
	const deleteEvent = () => {
		firestore
			.collection("events")
			.doc(event.id)
			.delete()
			.then(() => {
				alert("Event successfully deleted!");
				setTimeout(() => {
					navigation.navigate("Profile");
				}, 1000);
			})
			.catch((error) => {
				alert("Error removing event: ", error);
			});
	};

	return (
		<View
			style={{ justifyContent: "center", alignItems: "center", height: "100%" }}
		>
			<Ionicons
				name="arrow-back"
				size={24}
				color="black"
				style={{ position: "absolute", top: 50, left: 20 }}
				onPress={() => navigation.goBack()}
			/>
			<Ionicons
				name="menu"
				size={24}
				color="black"
				style={{ position: "absolute", top: 50, right: 20 }}
				onPress={() => navigation.navigate("EditPost", { event })}
				// onPress={() => setShowModal(true)}
			/>
			<Ionicons
				name="trash"
				size={24}
				color="black"
				style={{ position: "absolute", top: 50, right: 60 }}
				onPress={() => deleteEvent()}
			/>
			<View>
				<Text style={{ marginBottom: 20 }}>EventDetails</Text>
				<Text>{event.id}</Text>
				<Text>{event.title}</Text>
				<Image
					source={{ uri: event.imageUrl }}
					style={{ width: 200, height: 200 }}
				/>
			</View>
			{/* <Modal animationType="slide" transparent={true} visible={showModal}>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<LocalsButton
							title="Close"
							onPress={() => setShowModal(!showModal)}
						/>
					</View>
				</View>
			</Modal> */}
		</View>
	);
};

export default EventDetails;

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22,
	},
	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
	},
	textStyle: {
		fontWeight: "bold",
		textAlign: "center",
	},
});
