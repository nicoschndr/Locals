// // create a function component based on 				<TextInput
// 					placeholder="Email"
// 					autoFocus
// 					inputMode="email"
// 					value={email}
// 					onChangeText={(text) => setEmail(text)}
// 					style={styles.email}
// 				/>

import {
	View,
	Text,
	KeyboardAvoidingView,
	StyleSheet,
	InputModeOptions,
} from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-gesture-handler";

export interface LocalsTextInputProps {
	placeholder: string;
	value: string;
	onChangeText: (text: string) => void;
	autoFocus?: boolean;
	inputMode?: InputModeOptions | undefined;
	style?: any;
	secureTextEntry?: boolean;
}

const LocalsTextInput: React.FC<LocalsTextInputProps> = ({
	placeholder,
	autoFocus,
	inputMode,
	value,
	onChangeText,
	style,
	secureTextEntry,
}) => {
	return (
		<TextInput
			placeholder={placeholder}
			autoFocus={autoFocus}
			inputMode={inputMode}
			value={value}
			onChangeText={onChangeText}
			style={[styles.container, style]}
			secureTextEntry={secureTextEntry}
		/>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 15,
	},
});

export default LocalsTextInput;
