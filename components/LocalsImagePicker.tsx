import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import LocalsButton from "./LocalsButton";
import { Ionicons } from "@expo/vector-icons";

/**
 * This interface defines the props (properties) accepted by the LocalsImagePicker component.
 */
export interface LocalsImagePickerProps {
	onImageTaken: (imageUri: string) => void;
	placeholder?: string;
	imageSize?: "small" | "medium" | "large";
	style?: StyleProp<ViewStyle>;
}

/**
 * Renders a LocalsImagePicker component with the provided props.
 * @param onImageTaken Callback function invoked when an image is selected or captured.
 * @param placeholder Placeholder text to display when no image is selected.
 * @param imageSize Size of the image picker component. Can be "small", "medium", or "large". Default is "medium".
 * @param style Additional style for the image picker component.
 * @constructor
 */
const LocalsImagePicker: React.FC<LocalsImagePickerProps> = ({
	onImageTaken,
	placeholder,
	imageSize = "medium",
	style,
}) => {

	/**
	 * This variable represents the image that was picked from the User.
	 */
	const [pickedImage, setPickedImage] = useState("");

	/**
	 * This function defines an asynchronous function verifyPermissions that verifies and requests the required
	 * permissions for accessing the media library.
	 */
	const verifyPermissions = async () => {
		const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (result.status !== "granted") {
			alert("Insufficient permissions!");
			return false;
		}
		return true;
	};

	/**
	 * This function defines an asynchronous function takeImageHandler that handles the process of selecting an image
	 * from the media library.
	 */
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

	// variant small = 100x100, medium = 200x200, large = 300x300

	/**
	 * Renders the LocalsImagePicker component.
	 */
	return (
		<View style={[styles.imagePicker, style]}>
			{pickedImage || placeholder ? (
				<TouchableOpacity
					onPress={takeImageHandler}
					style={styles.buttonContainer}
				>
					<Image
						style={styles.image}
						source={{ uri: pickedImage || placeholder }}
					/>
					{/* edit button icon over the image */}
					<View
						style={{
							position: "absolute",
						}}
					>
						<Ionicons name="create-outline" size={24} color="#fff" />
					</View>
				</TouchableOpacity>
			) : (
				<TouchableOpacity
					onPress={takeImageHandler}
					style={styles.buttonContainer}
				>
					<Ionicons
						name="camera-outline"
						size={48}
						color="#fff"
						style={styles.icon}
					/>
				</TouchableOpacity>
			)}
		</View>
	);
};

export default LocalsImagePicker;

/**
 * Creates a StyleSheet object containing style definitions for the component.
 */
const styles = StyleSheet.create({
	buttonContainer: {
		flexDirection: "row",
		marginTop: 10,
		borderRadius: 100,
		width: "100%",
		height: 150,
		aspectRatio: 1,
		backgroundColor: "rgba(200, 200, 200, 0.5)",
		alignItems: "center",
		justifyContent: "center",
	},
	imagePicker: {
		alignItems: "center",
		marginVertical: 10,
	},
	icon: {
		alignSelf: "center",
	},
	image: {
		borderRadius: 100,
		width: "100%",
		height: 150,
	},
});
