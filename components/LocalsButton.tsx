import { View, Button, StyleProp, ViewStyle, StyleSheet, TouchableOpacity, Text } from "react-native";
import React from "react";

export interface TemplateButtonProps {
	title: string;
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
	fontStyle?: StyleProp<ViewStyle>;
	variant?: "primary" | "secondary"
}

const TemplateButton: React.FC<TemplateButtonProps> = ({
	title,
	onPress,
	style,
	variant = "primary",
	fontStyle,
}) => {
	return (
		<View
			style={[variant === "primary" ? styles.primary : styles.secondary, style]}
		>
			<TouchableOpacity onPress={onPress} style={[styles.buttonContainer, { backgroundColor: variant === "primary" ? "#ec404b" : "#fff", }]}>
				<Text style={[styles.text, fontStyle]}>{title}</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	primary: {
		backgroundColor: "#ec404b",
		borderRadius: 50,
		paddingVertical: 5,
		paddingHorizontal: 10,
	},
	secondary: {
		backgroundColor: "#fff",
		borderRadius: 50,
		paddingVertical: 5,
		paddingHorizontal: 10,
	},
	text: {
		color: "#fff",
		fontSize: 16,
		textAlign: "center",
		fontWeight: "500",
	},
	buttonContainer: {
		width: "100%",
		height: 36,
		borderRadius: 50,
		paddingVertical: 5,
		paddingHorizontal: 10,
		justifyContent: "center",
	},
});

export default TemplateButton;
