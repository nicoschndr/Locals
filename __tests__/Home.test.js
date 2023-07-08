import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../screens/appScreens/Home";

test("path to Home.jsx exists", () => {
	expect(HomeScreen).toBeDefined();
});
