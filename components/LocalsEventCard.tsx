import React from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	ImageSourcePropType,
} from "react-native";
import { AppleCard } from "react-native-apple-card-views";

interface LocalsEventCardProps {
	title: string;
	date: string;
	location: string;
	image: string;
	style: any;
	onPress: () => void;
	small: boolean;
	slim: boolean;
	category?: string;
	profile?: boolean;
}

const LocalsEventCard = (props: LocalsEventCardProps) => {
	const image = props.category
		? {
				uri: "https://source.unsplash.com/random/?" + props.category,
		  }
		: ({
				uri: props.image || "https://source.unsplash.com/random/?city,night",
		  } as ImageSourcePropType);

	return (
		// <TouchableOpacity style={styles.container} onPress={props.onPress}>
		// 	<Image source={{ uri: props.image }} style={styles.image} />
		// 	<View style={styles.detailsContainer}>
		// 		<Text style={styles.title}>{props.title}</Text>
		// 		{props.date && <Text style={styles.date}>{props.date}</Text>}
		// 		{props.location && (
		// 			<Text style={styles.location}>{props.location}</Text>
		// 		)}
		// 	</View>
		// </TouchableOpacity>

		<AppleCard
			source={image}
			largeTitle={props.title}
			smallTitle={props.date}
			footnote={props.location}
			onPress={props.onPress}
			style={props.style}
			backgroundStyle={[
				props.slim && { width: 280 },
				props.small && {
					height: 100,
					width: 150,
					alignContent: "center",
				},
				props.profile && {
					width: 240,
					height: 240,
				},
			]}
			largeTitleTextStyle={[
				props.slim && { width: 260 },
				props.small && {
					height: 100,
					width: 150,
					// backgroundColor: "red",
				},
				props.profile && {
					width: 220,
					height: 240,
				},
			]}
		/>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 10,
		overflow: "hidden",
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		height: 100,
	},
	image: {
		height: 100,
		width: 100,
		resizeMode: "cover",
	},
	detailsContainer: {
		flex: 1,
		paddingHorizontal: 10,
	},
	title: {
		fontSize: 16,
		fontWeight: "bold",
	},
	date: {
		fontSize: 12,
		marginTop: 5,
		color: "#888",
	},
	location: {
		fontSize: 14,
		marginTop: 5,
	},
});

export default LocalsEventCard;
