import React from "react";
import { render } from "@testing-library/react-native";
import Greeting from "../ExampleWithProps";

// This is similar to the way we test components without props
describe("<Greeting />", () => {
    test("Greeting renders correctly on the morning", () => {
        const { getByText } = render(<Greeting name="Adrien" isMorning={true} />);
        getByText("Good Morning, Adrien!");
    });

    test("Greeting renders correctly on the afternoon", () => {
        const { getByText } = render(<Greeting name="Adrien" isMorning={false} />);
        getByText("Good Afternoon, Adrien!");
    });
});