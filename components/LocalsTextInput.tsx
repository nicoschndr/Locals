import {
	View,
	Text,
	KeyboardAvoidingView,
	StyleSheet,
	InputModeOptions,
} from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-gesture-handler";

/**
 * This interface defines the props (properties) accepted by the LocalsTextInput component.
 */
export interface LocalsTextInputProps {
	placeholder: string;
	value: string;
	onChangeText: (text: string) => void;
	autoFocus?: boolean;
	inputMode?: InputModeOptions | undefined;
	style?: any;
	secureTextEntry?: boolean;
	autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined;
	fontStyle: any;
	textColor: string;
}

/**
 * Renders a LocalsTextInput component with the provided props.
 * @param placeholder - Placeholder text for the input.
 * @param autoFocus - Indicates whether the input should be focused when rendered.
 * @param inputMode - The input mode for mobile keyboards (e.g., "text", "numeric", "email").
 * @param value - The current value of the input.
 * @param onChangeText - Callback function invoked when the text in the input changes.
 * @param style - Additional style for the input component.
 * @param secureTextEntry - Indicates whether the input should be displayed as a secure text entry.
 * @param autoCapitalize - Specifies how the text should be capitalized in the input.
 * @param textColor - The color of the text in the input.
 * @constructor
 */
const LocalsTextInput: React.FC<LocalsTextInputProps> = ({
	placeholder,
	autoFocus,
	inputMode,
	value,
	onChangeText,
	style,
	secureTextEntry,
	autoCapitalize = "none",
	textColor,
}) => {

	/**
	 * Renders the LocalsTextInput component.
	 */
	return (
		<TextInput
			placeholder={placeholder}
			autoFocus={autoFocus}
			inputMode={inputMode}
			value={value}
			onChangeText={onChangeText}
			style={[styles.container, style]}
			secureTextEntry={secureTextEntry}
			autoCapitalize={autoCapitalize}
			placeholderTextColor={textColor}
		/>
	);
};

/**
 * Creates a StyleSheet object containing style definitions for component.
 */
const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 15,
	},
});

export default LocalsTextInput;
