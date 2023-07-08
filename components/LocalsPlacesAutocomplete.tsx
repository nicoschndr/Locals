import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

/**
 * This interface defines the props (properties) accepted by the LocalsPlaceAutocomplete component.
 */
interface LocalsPlaceAutocompleteProps {
	onAddressSelected: (
		address: string,
		longitude: number,
		latitude: number
	) => void;
}

/**
 * This function renders a LocalsPlacesAutocomplete component based on the provided props. The component is defined
 * using the React. FC type, indicating it is a function component.
 * @param onAddressSelected A required callback function that is invoked when an address is selected from the
 * autocomplete results
 * @constructor
 */
const LocalsPlacesAutocomplete: React.FC<LocalsPlaceAutocompleteProps> = ({
	onAddressSelected,
}) => {

	/**
	 * The selected address.
	 */
	const [address, setAddress] = useState("");

	/**
	 * The longitude coordinate of the selected address.
	 */
	const [longitude, setLongitude] = useState(0);

	/**
	 * The latitude coordinate of the selected address.
	 */
	const [latitude, setLatitude] = useState(0);

	/**
	 * Renders the LocalsPlacesAutocomplete component.
	 */
	return (
		<GooglePlacesAutocomplete
			fetchDetails={true}
			currentLocation={true}
			currentLocationLabel="Current location"
			listViewDisplayed={false}
			onPress={(data, details = null) => {
				setAddress(data.description);
				setLongitude(details.geometry.location.lng);
				setLatitude(details.geometry.location.lat);
				onAddressSelected(
					data.description,
					details.geometry.location.lng,
					details.geometry.location.lat
				);
			}}
			query={{
				key: "AIzaSyAyviffxI6ZlWwof4_vA6S1LjmLrYkjxMI",
				language: "de",
				components: "country:de",
			}}
			styles={{
				textInput: styles.addressInput,
				listView: {
					width: "90%", // Set the width of the suggestions list
				},
				container: {
					width: "100%", // Set the width of the container
				},
			}}
			placeholder={""}
		/>
	);
};

/**
 * Creates a StyleSheet object containing style definitions for component.
 */
const styles = StyleSheet.create({
	addressInput: {
		backgroundColor: "transparent",
		borderBottomColor: "#000000",
		borderBottomWidth: 1,
	},
});

export default LocalsPlacesAutocomplete;
