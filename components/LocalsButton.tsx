import { View, Button, StyleProp, ViewStyle, StyleSheet, TouchableOpacity, Text } from "react-native";
import React from "react";

/**
 * This interface represents the properties that can be passed to a template button component.
 */
export interface TemplateButtonProps {
	title: string;
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
	fontStyle?: StyleProp<ViewStyle>;
	variant?: "primary" | "secondary"
}

/**
 * This component is a functional component that renders a button based on the provided properties.
 * @param title A string that represents the title or label of the button.
 * @param onPress A callback function that will be called when the button is pressed. It does not take any parameters
 * and does not return a value.
 * @param style An optional style object or array of style objects that define the visual styling of the button.
 * It is used to override the default styles.
 * @param variant An optional string that specifies the variant of the button. It can be one of the following values:
 * "primary": Indicates a primary button variant.
 * "secondary": Indicates a secondary button variant.
 * @param fontStyle An optional style object or array of style objects that define the font-related styling of the
 * button's title.
 * @constructor
 */
const TemplateButton: React.FC<TemplateButtonProps> = ({
	title,
	onPress,
	style,
	variant = "primary",
	fontStyle,
}) => {

	/**
	Renders the "TemplateButton" component with the provided props.
	 **/
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

/**
 * Creates a StyleSheet object containing style definitions for the component.
 */
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
