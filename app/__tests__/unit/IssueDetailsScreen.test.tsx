import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import IssueDetailsScreen from "../../screens/issues_tenant/IssueDetailsScreen";
import {
  getMaintenanceRequest,
  updateMaintenanceRequest,
} from "../../../firebase/firestore/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import "@testing-library/jest-native/extend-expect";

// portions of this code were generated using chatGPT as an AI assistant

// Mock Firebase Firestore functions
jest.mock("../../../firebase/firestore/firestore", () => ({
  getMaintenanceRequest: jest.fn(),
  updateMaintenanceRequest: jest.fn(),
}));

jest.mock('../../components/CustomModal', () => {
  const { View, Text } = require('react-native');
  return ({ visible, children, testID }: { visible: boolean; children: React.ReactNode; testID: string }) => {
    console.log("Mock CustomModal rendered with visible:", visible);
    return visible ? <View testID={testID}><Text>coucou2</Text>{children}</View> : <Text>coucou</Text>;
  };
});

jest.mock("react-native-dropdown-picker", () => {
  const React = require("react"); // Import React inside the factory
  const { View, Text, TouchableOpacity } = require("react-native"); // Import React Native components inside the factory

  return ({
    open,
    value,
    items,
    setOpen,
    setValue,
    testID,
  }: {
    open: boolean;
    value: string;
    items: Array<{ label: string; value: string }>;
    setOpen: (open: boolean) => void;
    setValue: (value: string) => void;
    testID: string;
  }) => {
    return (
      <View>
        <Text testID={testID}>{value}</Text> {/* Mocked dropdown display */}
        {open && (
          <View>
            {items.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => {
                  setValue(item.value);
                  setOpen(false);
                }}
                testID={`${testID}-${item.value}`}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };
});


// Mock Navigation and Route
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: { requestID: "mockRequestID" },
  }),
}));

describe("IssueDetailsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading text initially", () => {
    (getMaintenanceRequest as jest.Mock).mockResolvedValueOnce(null);
    const { getByText } = render(<IssueDetailsScreen />);
    expect(getByText("Loading...")).toBeTruthy();
  });

  test("fetches and displays maintenance request details", async () => {
    const mockIssueData = {
      requestID: "mockRequestID",
      requestTitle: "Leaky faucet",
      requestStatus: "inProgress",
      requestDescription: "A faucet is leaking in the bathroom.",
      picture: ["https://via.placeholder.com/400x300"],
    };

    (getMaintenanceRequest as jest.Mock).mockResolvedValueOnce(mockIssueData);

    const screen = render(<IssueDetailsScreen />);

    // Wait for data to load and assert the correct elements are displayed
    await waitFor(() => expect(getMaintenanceRequest).toHaveBeenCalledWith("mockRequestID"));
    expect(screen.getByText("Issue : Leaky faucet")).toBeTruthy();
    expect(screen.getByText("Status: In Progress")).toBeTruthy();
    expect(screen.getByText("A faucet is leaking in the bathroom.")).toBeTruthy();
  });

  test("displays 'Issue not found' if issue data is not available", async () => {
    (getMaintenanceRequest as jest.Mock).mockResolvedValueOnce(null);
    const screen = render(<IssueDetailsScreen />);

    // Wait for loading state to pass and check for 'Issue not found' message
    await waitFor(() => expect(getMaintenanceRequest).toHaveBeenCalledWith("mockRequestID"));
    expect(screen.getByText("Issue not found.")).toBeTruthy();
  });

  test("navigates to messaging screen when 'Open chat about this subject' button is pressed", async () => {
    const mockIssueData = {
      requestID: "mockRequestID",
      requestTitle: "Leaky faucet",
      requestStatus: "inProgress",
      requestDescription: "A faucet is leaking in the bathroom.",
      picture: ["https://via.placeholder.com/400x300"],
    };

    (getMaintenanceRequest as jest.Mock).mockResolvedValueOnce(mockIssueData);

    const screen = render(<IssueDetailsScreen />);
    await waitFor(() => expect(getMaintenanceRequest).toHaveBeenCalled());

    const chatButton = screen.getByText("Open chat about this subject");
    fireEvent.press(chatButton);

    expect(mockNavigate).toHaveBeenCalledWith("Messaging");
  });

  test("updates status and description when 'Close' button is pressed", async () => {
    const mockIssueData = {
      requestID: "mockRequestID",
      requestTitle: "Leaky faucet",
      requestStatus: "inProgress",
      requestDescription: "A faucet is leaking in the bathroom.",
      picture: ["https://via.placeholder.com/400x300"],
    };

    (getMaintenanceRequest as jest.Mock).mockResolvedValueOnce(mockIssueData);

    const screen = render(<IssueDetailsScreen />);
    await waitFor(() => expect(getMaintenanceRequest).toHaveBeenCalled());

    // Simulate changing status through StatusDropdown
    const statusDropdown = screen.getByTestId('statusDropdown'); // Existing status
    fireEvent(statusDropdown, 'setOpen', true);

    // Simulate selecting a new status
    const newStatus = "completed"; // Value to simulate
      // After opening the dropdown, the options should be available
    await waitFor(() => {const dropdownOption = screen.getByTestId(`statusDropdown-${newStatus}`);
      fireEvent.press(dropdownOption); // Simulates selecting the new status
    });

    // Verify the new status is selected
    await waitFor(() => {
      expect(screen.getByText("completed")).toBeTruthy();
    });
    expect(screen.queryByText(newStatus)).toBeTruthy(); // New status should be selected

    // Press the "Close" button to save changes
    const closeButton = screen.getByTestId("saveChangesButton");
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(updateMaintenanceRequest).toHaveBeenCalledWith("mockRequestID", {
        requestStatus: newStatus,
        requestDescription: "A faucet is leaking in the bathroom.",
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith("Issues");
  });

  test.only("opens and closes full-screen image modal", async () => {
    const mockIssueData = {
      requestID: "mockRequestID",
      requestTitle: "Leaky faucet",
      requestStatus: "inProgress",
      requestDescription: "A faucet is leaking in the bathroom.",
      picture: ["https://via.placeholder.com/400x300"],
    };

    (getMaintenanceRequest as jest.Mock).mockResolvedValueOnce(mockIssueData);

    const screen = render(<IssueDetailsScreen />);
    await waitFor(() => expect(getMaintenanceRequest).toHaveBeenCalled());

    // Open full-screen modal by pressing the image
    const thumbnailImage = screen.getByTestId('imageItem-0');

    // Trigger state changes that open the modal
    act(() => {
    fireEvent.press(thumbnailImage);

  });

    // Wait for the modal to appear
    await waitFor(() => {
      const modal = screen.queryByTestId("fullModal");
      screen.debug();
      expect(modal).toBeTruthy();
    });
      // Additional debugging
  
    
    // Verify that the full-screen image modal is visible
    const fullScreenImage = await waitFor(() => screen.getByTestId("imageFull"));
    expect(fullScreenImage).toBeTruthy();

    // Close the modal
    const closeModalButton = screen.getByTestId("closeModalButton");

    // Trigger state changes that open the modal
    await act(async () => {
      // Simulate any asynchronous actions, e.g., API calls or event handlers
      fireEvent.press(closeModalButton);
    });

    expect(screen.queryByTestId("imageFull")).toBeNull();
  });

  test("navigates through images using arrows in full-screen mode", async () => {
    const mockIssueData = {
      requestID: "mockRequestID",
      requestTitle: "Leaky faucet",
      requestStatus: "inProgress",
      requestDescription: "A faucet is leaking in the bathroom.",
      picture: [
        "https://via.placeholder.com/400x300",
        "https://via.placeholder.com/300x400",
      ],
    };

    (getMaintenanceRequest as jest.Mock).mockResolvedValueOnce(mockIssueData);

    const screen = render(<IssueDetailsScreen />);
    await waitFor(() => expect(getMaintenanceRequest).toHaveBeenCalled());

    // Open full-screen modal
    const firstThumbnailImage = screen.getByTestId("imageItem-0");
    fireEvent.press(firstThumbnailImage);

    // Verify initial image is displayed
    const fullScreenImage = await waitFor(() => screen.getByTestId("imageFull"));

    expect(fullScreenImage.props.source.uri).toBe("https://via.placeholder.com/400x300");

    // Press the right arrow to navigate to the next image
    const rightArrowButton = screen.getByTestId("leftButton");
    fireEvent.press(rightArrowButton);
    expect(fullScreenImage.props.source.uri).toBe("https://via.placeholder.com/300x400");

    // Press the left arrow to navigate back to the previous image
    const leftArrowButton = screen.getByTestId("rightButton");
    fireEvent.press(leftArrowButton);
    expect(fullScreenImage.props.source.uri).toBe("https://via.placeholder.com/400x300");
  });
});
