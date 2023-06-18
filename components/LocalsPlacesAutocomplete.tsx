import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

interface LocalsPlaceAutocompleteProps {
	onAddressSelected: (
		address: string,
		longitude: number,
		latitude: number
	) => void;
}

const LocalsPlacesAutocomplete: React.FC<LocalsPlaceAutocompleteProps> = ({
	onAddressSelected,
}) => {
	const [address, setAddress] = useState("");
	const [longitude, setLongitude] = useState(0);
	const [latitude, setLatitude] = useState(0);

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

const styles = StyleSheet.create({
	addressInput: {
		backgroundColor: "transparent",
		borderBottomColor: "#000000",
		borderBottomWidth: 1,
	},
});

export default LocalsPlacesAutocomplete;
