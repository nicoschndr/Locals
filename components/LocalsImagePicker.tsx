import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import LocalsButton from "./LocalsButton";
import { Ionicons } from "@expo/vector-icons";

export interface LocalsImagePickerProps {
	onImageTaken: (imageUri: string) => void;
	imageSize?: "small" | "medium" | "large";
	style?: StyleProp<ViewStyle>;
}

const LocalsImagePicker: React.FC<LocalsImagePickerProps> = ({
	onImageTaken,
	imageSize = "medium",
	style,
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

	// variant small = 100x100, medium = 200x200, large = 300x300

	return (
		<View style={[styles.imagePicker, style]}>
			{pickedImage ? (
				<TouchableOpacity
					onPress={takeImageHandler}
					style={styles.buttonContainer}
				>
					<Image style={styles.image} source={{ uri: pickedImage }} />
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

const styles = StyleSheet.create({
	buttonContainer: {
		flexDirection: "row",
		marginTop: 10,
		borderRadius: 100,
		width: "100%",
		height: 150,
		aspectRatio: 1,
		backgroundColor: "#ccc",
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
