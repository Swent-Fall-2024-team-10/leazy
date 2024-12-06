import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import StatusDropdown from "../../components/StatusDropdown"; // Adjust the path as needed

jest.mock("react-native-dropdown-picker", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  return jest.fn().mockImplementation((props) => (
    <View>
      {props.open && (
        <View>
          {props.items.map((item, index) => (
            <Text key={index} onPress={() => props.setValue(item.value)}>
              {item.label}
            </Text>
          ))}
        </View>
      )}
    </View>
  ));
});

describe("StatusDropdown Component", () => {
  const mockSetValue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with the correct initial value", () => {
    const { getByText } = render(
      <StatusDropdown value="notStarted" setValue={mockSetValue} />
    );

    // Ensure that initial label renders correctly
    expect(getByText("Change status")).toBeTruthy();
  });
});
