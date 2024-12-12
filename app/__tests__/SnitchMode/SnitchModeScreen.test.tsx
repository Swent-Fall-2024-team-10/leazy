import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert, Platform, ActionSheetIOS, Linking } from "react-native";
import SnitchModeScreen from "../../screens/SnitchMode/SnitchModeScreen";
import { NavigationContainer } from "@react-navigation/native";
import { act } from "react-test-renderer";

// Create mock instances with proper callback handling
let recordingStatusCallback: ((status: any) => void) | null = null;
const mockStopAndUnloadAsync = jest.fn().mockResolvedValue({});
const mockSetOnRecordingStatusUpdate = jest
  .fn()
  .mockImplementation((callback) => {
    recordingStatusCallback = callback;
  });
const mockSetProgressUpdateInterval = jest.fn();
const mockStartAsync = jest.fn().mockResolvedValue({});
const mockPrepareToRecordAsync = jest.fn().mockResolvedValue({});

const mockRecordingInstance = {
  prepareToRecordAsync: mockPrepareToRecordAsync,
  startAsync: mockStartAsync,
  setOnRecordingStatusUpdate: mockSetOnRecordingStatusUpdate,
  setProgressUpdateInterval: mockSetProgressUpdateInterval,
  stopAndUnloadAsync: mockStopAndUnloadAsync,
};

// Mock setup with mock.fn() to track calls
const mockOpenURL = jest.fn().mockResolvedValue(true);

// Create a mock object for Linking
const mockLinking = {
  openURL: mockOpenURL,
};

// Mock the entire expo-linking module
jest.mock("expo-linking", () => mockLinking);

jest.mock("expo-av", () => ({
  Audio: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
    setAudioModeAsync: jest.fn().mockResolvedValue({}),
    Recording: jest.fn().mockImplementation(() => mockRecordingInstance),
    RecordingOptionsPresets: {
      HIGH_QUALITY: {
        android: {},
        ios: {},
      },
    },
    AndroidOutputFormat: { MPEG_4: 2 },
    AndroidAudioEncoder: { AAC: 3 },
    IOSOutputFormat: { MPEG4AAC: "aac" },
    IOSAudioQuality: { HIGH: "high" },
  },
}));

jest.mock("@expo/vector-icons", () => ({
  FontAwesome: () => "FontAwesome-Mock",
}));

// Create a wrapper component with NavigationContainer
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>{children}</NavigationContainer>
);

const renderWithNavigation = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe("SnitchModeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    recordingStatusCallback = null;
    Platform.OS = "ios";
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders initial screen correctly", () => {
      const { getByTestId, getByText } = renderWithNavigation(
        <SnitchModeScreen />
      );
      expect(getByTestId("snitch-mode-title")).toBeTruthy();
      expect(getByText("🤓 Snitch Mode 🤓")).toBeTruthy();
    });

    it("renders record button initially", () => {
      const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);
      expect(getByTestId("record-button")).toBeTruthy();
    });
  });

  describe("Recording functionality", () => {
    it("starts recording when microphone button is pressed", async () => {
      const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);

      await act(async () => {
        fireEvent.press(getByTestId("record-button"));
      });

      const Audio = require("expo-av").Audio;
      expect(Audio.requestPermissionsAsync).toHaveBeenCalled();
      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    });

    it("stops recording when stop button is pressed", async () => {
      const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);

      await act(async () => {
        fireEvent.press(getByTestId("record-button")); // Start recording
        await waitFor(() => expect(mockStartAsync).toHaveBeenCalled());
      });

      await act(async () => {
        fireEvent.press(getByTestId("record-button")); // Stop recording
        await waitFor(() => expect(mockStopAndUnloadAsync).toHaveBeenCalled());
      });
    });

    it("handles recording errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const alertSpy = jest.spyOn(Alert, "alert");
      mockPrepareToRecordAsync.mockRejectedValueOnce(
        new Error("Recording failed")
      );

      const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);

      await act(async () => {
        fireEvent.press(getByTestId("record-button"));
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith(
        "Error",
        "Failed to prepare audio recorder"
      );

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it("handles permission denial", async () => {
      const Audio = require("expo-av").Audio;
      const alertSpy = jest.spyOn(Alert, "alert");
      Audio.requestPermissionsAsync.mockResolvedValueOnce({ status: "denied" });

      const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);

      await act(async () => {
        fireEvent.press(getByTestId("record-button"));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        "Permission required",
        "Please grant microphone permission to use this feature"
      );
      alertSpy.mockRestore();
    });
  });

  describe("Cleanup and reset", () => {
    it("cleans up recording when unmounting", async () => {
      const { getByTestId, unmount } = renderWithNavigation(
        <SnitchModeScreen />
      );

      await act(async () => {
        fireEvent.press(getByTestId("record-button"));
        await waitFor(() => expect(mockStartAsync).toHaveBeenCalled());
      });

      mockStopAndUnloadAsync.mockClear();

      await act(async () => {
        unmount();
      });

      expect(mockStopAndUnloadAsync).toHaveBeenCalled();
    });

    it("resets state on refresh", async () => {
      const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);

      await act(async () => {
        const scrollView = getByTestId("snitch-mode-screen");
        scrollView.props.refreshControl.props.onRefresh();
      });

      await waitFor(() => {
        const scrollView = getByTestId("snitch-mode-screen");
        expect(scrollView.props.refreshControl.props.refreshing).toBe(true);
      });
    });
  });

  describe("Noise threshold functionality", () => {
    it("shows call security button when noise threshold is exceeded", async () => {
      const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);
      
      await act(async () => {
        fireEvent.press(getByTestId("record-button"));
        await waitFor(() => expect(mockSetOnRecordingStatusUpdate).toHaveBeenCalled());
      });

      await act(async () => {
        if (recordingStatusCallback) {
          recordingStatusCallback({ metering: 160 });
        }
      });

      await waitFor(() => {
        const callButton = getByTestId("call-security-button");
        expect(callButton).toBeTruthy();
      });
    });
  });


});
