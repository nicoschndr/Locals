// ActiveEventsProvider.js
import React, { useEffect, useState } from "react";
import FirestoreContext from "./FirestoreContext";
import { firestore } from "../firebase";

const FirestoreProvider = ({ children }) => {
	const [events, setEvents] = useState([]);
	const [users, setUser] = useState(null);

	const getEvents = async () => {
		const snapshot = await firestore
			.collection("events")
			.orderBy("date", "asc")
			.get();

		const snapEvents = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		return snapEvents; // You missed this return statement
	};

	const getUser = async (id) => {
		const snapshot = await firestore.collection("users").doc(id).get();
		return snapshot.data();
	};

	useEffect(() => {
		const fetchEvents = async () => {
			const allEvents = await getEvents();
			setEvents(allEvents);
		};

		const fetchUser = async () => {
			const allUsers = await getUser("1");
			setUser(allUsers);
		};

		fetchEvents();
		fetchUser();
	}, []);

	return (
		<FirestoreContext.Provider value={{ events, users, setEvents }}>
			{children}
		</FirestoreContext.Provider>
	);
};

export default FirestoreProvider;
