import { View, Button, StyleProp, ViewStyle } from "react-native";
import React from "react";

export interface TemplateButtonProps {
	title: string;
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
}

const TemplateButton: React.FC<TemplateButtonProps> = ({
	title,
	onPress,
	style,
}) => {
	return (
		<View style={style}>
			<Button title={title} onPress={onPress} />
		</View>
	);
};

export default TemplateButton;
