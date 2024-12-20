import React from "react";
import { render } from "@testing-library/react-native";
import StatusBadge from "../../../components/StatusBadge"; // Adjust the path as needed
import { getIssueStatusColor, getIssueStatusText } from "../../../utils/StatusHelper";

// Mock the helper functions
jest.mock("../../../utils/StatusHelper", () => ({
  getIssueStatusColor: jest.fn(),
  getIssueStatusText: jest.fn(),
}));

describe("StatusBadge Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with the correct status color and text", () => {
    // Mock return values for the helper functions
    (getIssueStatusColor as jest.Mock).mockReturnValue("#FF0000");
    (getIssueStatusText as jest.Mock).mockReturnValue("Pending");

    const { getByText, toJSON } = render(<StatusBadge status="inProgress" />);

    // Verify the text content
    expect(getByText("Status: Pending")).toBeTruthy();

    // Verify the background color is applied correctly
    const badge = toJSON();
    expect(badge).toMatchObject({
      type: "View",
      props: {
        style: expect.arrayContaining([
          expect.objectContaining({ backgroundColor: "#FF0000" }),
        ]),
      },
    });
  });

  it("renders with different status color and text when props change", () => {
    (getIssueStatusColor as jest.Mock).mockReturnValueOnce("#00FF00");
    (getIssueStatusText as jest.Mock).mockReturnValueOnce("Resolved");

    const { getByText, toJSON } = render(<StatusBadge status="completed" />);

    // Verify the text content
    expect(getByText("Status: Resolved")).toBeTruthy();

    // Verify the background color is applied correctly
    const badge = toJSON();
    expect(badge).toMatchObject({
      type: "View",
      props: {
        style: expect.arrayContaining([
          expect.objectContaining({ backgroundColor: "#00FF00" }),
        ]),
      },
    });
  });
});
