import React, { useEffect } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	ImageSourcePropType,
} from "react-native";
import { AppleCard } from "react-native-apple-card-views";
import FastImage, { Source } from "react-native-fast-image";
import { Asset } from "expo-asset";

/**
 * This interface defines the props (properties) accepted by the LocalsEventCard component.
 */
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

/**
 * This function defines a function component LocalsEventCard that renders a LocalsEventCard component based on the
 * provided props.
 * @param props Object containing various configuration properties for the LocalsEventCard.
 * @constructor
 */
const LocalsEventCard = (props: LocalsEventCardProps) => {
	// const image = props.category
	// 	? {
	// 			uri: "https://source.unsplash.com/random/?" + props.category,
	// 			cache: FastImage.cacheControl.cacheOnly,
	// 			priority: FastImage.priority.high,
	// 	  }
	// 	: ({
	// 			uri: props.image || "https://source.unsplash.com/random/?city,night",
	// 			cache: FastImage.cacheControl.cacheOnly,
	// 			priority: FastImage.priority.high,
	// 	  } as unknown as ImageSourcePropType & { cache: Source["cache"] });

	// Prefetching the image on component mount
	// useEffect(() => {
	// 	Image.prefetch(props.image);
	// }, []);

	/**
	 * This function defines a function imageSource that generates an image source object based on the provided props.
	 * It takes an object props as an argument, which can have two properties: image and category.
	 */
	const image = props.image
		? {
				uri: "https://source.unsplash.com/random/?" + props.category,
		  }
		: ({
				uri: props.image || "https://source.unsplash.com/random/?city,night",
		  } as ImageSourcePropType);

	/**
	 * Renders an AppleCard component with the provided props.
	 */
	return (
		<AppleCard
			source={{ uri: props.image }}
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

		/* <FastImage
				source={props.image}
				style={styles.image}
				resizeMode={FastImage.resizeMode.cover}
			/> 
		 </AppleCard> */
	);
};

/**
 * Creates a StyleSheet object containing style definitions for the component.
 */
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
