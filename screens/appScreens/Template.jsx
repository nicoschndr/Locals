import { View, Text, Button, StyleSheet } from "react-native";
import React, { useState } from "react";
import LocalsButton from "../../components/LocalsButton";

const Template = () => {
	// use state hook to set & update a value
	const [count, setCount] = useState(0);

	// array with letters from a to z
	const Array = ["a", "b", "c", "d", "e", "f", "g", "h"];

	// array with objects
	const Array2 = [
		{ name: "John", age: 20 },
		{ name: "Jane", age: 21 },
		{ name: "Jack", age: 22 },
	];

	// simple react funtion to increment the count
	const increment = () => {
		setCount(count + 1);
	};

	// simple react funtion to decrement the count
	const decrement = () => {
		setCount(count - 1);
	};

	// using tsx
	const UseTsx = () => {
		return (
			<View style={{ alignItems: "center", marginTop: 32 }}>
				<Text>Using tsx</Text>
			</View>
		);
	};

	// render related stuff is displayed here after the return statement
	return (
		<View style={{ alignItems: "center" }}>
			<Text style={styles.textContainer}>{count}</Text>
			{/* use the TemplateButton component and pass the props to it*/}
			<LocalsButton title="Increment" onPress={increment} style={styles.iBtn} />
			<LocalsButton
				title="Decrement"
				onPress={decrement}
				style={styles.dBtn}
				variant="secondary"
			/>
			{/* render the tsx component from above */}
			<UseTsx />
			<View style={{ margin: 16, alignItems: "center" }}>
				{/* map over the array and display each letter in a text component */}
				<Text style={{ fontWeight: "bold" }}>Simple Array</Text>
				{Array.map((letter) => {
					return <Text key={letter}>{letter}</Text>;
				})}
			</View>
			<View style={{ margin: 16, alignItems: "center" }}>
				{/* map over the array with objects and display each object in a text component */}
				<Text style={{ fontWeight: "bold" }}>Array with object</Text>
				{Array2.map((person) => {
					return (
						<Text key={person.name}>
							{person.name} is {person.age} years old
						</Text>
					);
				})}
			</View>
		</View>
	);
};

export default Template;

// use styles (styles.textContainer for example) to extract and separate the styling from the render function
const styles = StyleSheet.create({
	textContainer: {
		margin: 16,
		fontWeight: "bold",
		color: "green",
		fontSize: 24,
	},
	iBtn: {
		margin: 16,
	},
	dBtn: {
		margin: 16,
	},
});
