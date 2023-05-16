import { View, Button, StyleProp, ViewStyle, StyleSheet } from "react-native";
import React from "react";

export interface TemplateButtonProps {
	title: string;
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
	variant?: "primary" | "secondary";
}

const TemplateButton: React.FC<TemplateButtonProps> = ({
	title,
	onPress,
	style,
	variant = "primary",
}) => {
	return (
		<View
			style={[variant === "primary" ? styles.primary : styles.secondary, style]}
		>
			<Button
				title={title}
				onPress={onPress}
				color={variant === "primary" ? "#fff" : "black"}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	primary: {
		backgroundColor: "#ec404b",
		borderRadius: 10,
		paddingVertical: 5,
		paddingHorizontal: 10,
	},
	secondary: {
		backgroundColor: "#fff",
		borderRadius: 10,
		paddingVertical: 5,
		paddingHorizontal: 10,
	},
});

export default TemplateButton;
