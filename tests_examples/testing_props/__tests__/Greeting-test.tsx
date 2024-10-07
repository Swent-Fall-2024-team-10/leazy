import React from "react";
import { render } from "@testing-library/react-native";
import Greeting from "../ExampleWithProps";

// This is similar to the way we test components without props
describe("<Greeting />", () => {
    test("Greeting renders correctly on the morning", () => {
        const { getByText } = render(<Greeting name="Adrien" isMorning={true} />);
        expect(getByText("Good Morning, Adrien!")).toBeTruthy();
    });

    test("Greeting renders correctly on the afternoon", () => {
        const { getByText } = render(<Greeting name="Adrien" isMorning={false} />);
        expect(getByText("Good Afternoon, Adrien!")).toBeTruthy();
    });
});