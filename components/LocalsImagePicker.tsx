import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Button, Image, View, Platform, StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import LocalsButton from "./LocalsButton";

export interface LocalsImagePickerProps {
	onImageTaken: (imageUri: string) => void;
}

const LocalsImagePicker: React.FC<LocalsImagePickerProps> = ({
	onImageTaken,
}) => {
	const [pickedImage, setPickedImage] = useState("");

	const verifyPermissions = async () => {
		const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (result.status !== "granted") {
			alert("Insufficient permissions!");
			return false;
		}
		return true;
	};

	const takeImageHandler = async () => {
		const hasPermission = await verifyPermissions();
		if (!hasPermission) {
			return;
		}
		const image = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [16, 9],
			quality: 0.5,
		});
		setPickedImage(image.assets[0].uri);
		onImageTaken(image.assets[0].uri);
	};

	return (
		<View style={styles.imagePicker}>
			{pickedImage && (
				<Image style={styles.image} source={{ uri: pickedImage }} />
			)}
			{!pickedImage ? (
				<LocalsButton title="Take Image" onPress={takeImageHandler} />
			) : (
				<View style={styles.buttonContainer}>
					<LocalsButton title="Change Image" onPress={takeImageHandler} />
					<LocalsButton
						title="Remove Image"
						onPress={() => setPickedImage("")}
						style={{ marginLeft: 10 }}
						variant="secondary"
					/>
				</View>
			)}
		</View>
	);
};

export default LocalsImagePicker;

const styles = StyleSheet.create({
	buttonContainer: {
		flexDirection: "row",
		marginTop: 10,
	},
	imagePicker: {
		alignItems: "center",
		marginVertical: 10,
	},
	image: {
		marginTop: 10,
		borderRadius: 10,
		width: "100%",
		height: 200,
	},
});
