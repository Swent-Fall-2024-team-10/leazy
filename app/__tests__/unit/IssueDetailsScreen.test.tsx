import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import IssueDetailsScreen from "../../screens/issues_tenant/IssueDetailsScreen";
import {
  getMaintenanceRequest,
  updateMaintenanceRequest,
} from "../../../firebase/firestore/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import "@testing-library/jest-native/extend-expect";

// Mock Firebase Firestore functions
jest.mock("../../../firebase/firestore/firestore", () => ({
  getMaintenanceRequest: jest.fn(),
  updateMaintenanceRequest: jest.fn(),
}));

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
    expect(screen.getByText("Status: in progress")).toBeTruthy();
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
    const newStatus = "completed";
    const statusDropdown = screen.getByText("in progress"); // Existing status
    fireEvent.press(statusDropdown); // Open dropdown (you may need to adjust based on StatusDropdown component)

    fireEvent.press(screen.getByText(newStatus)); // Select new status
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

  test("opens and closes full-screen image modal", async () => {
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
    const thumbnailImage = screen.getByRole("imagebutton"); // Assumes you can query by role; adjust if needed
    fireEvent.press(thumbnailImage);

    // Verify that the full-screen image modal is visible
    const fullScreenImage = screen.getByRole("image");
    expect(fullScreenImage).toBeTruthy();

    // Close the modal
    const closeModalButton = screen.getByRole("button", { name: /close/i });
    fireEvent.press(closeModalButton);
    expect(screen.queryByRole("image")).toBeNull();
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
    const firstThumbnailImage = screen.getByRole("imagebutton");
    fireEvent.press(firstThumbnailImage);

    // Verify initial image is displayed
    const fullScreenImage = screen.getByRole("image");
    expect(fullScreenImage.props.source.uri).toBe("https://via.placeholder.com/400x300");

    // Press the right arrow to navigate to the next image
    const rightArrowButton = screen.getByRole("button", { name: /right/i });
    fireEvent.press(rightArrowButton);
    expect(fullScreenImage.props.source.uri).toBe("https://via.placeholder.com/300x400");

    // Press the left arrow to navigate back to the previous image
    const leftArrowButton = screen.getByRole("button", { name: /left/i });
    fireEvent.press(leftArrowButton);
    expect(fullScreenImage.props.source.uri).toBe("https://via.placeholder.com/400x300");
  });
});
