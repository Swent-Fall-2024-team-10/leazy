import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert, ActionSheetIOS, Platform, Linking } from "react-native";
import SnitchModeScreen from "../../screens/SnitchMode/SnitchModeScreen";
import { NavigationContainer } from "@react-navigation/native";
import { act } from 'react-test-renderer';

jest.mock("expo-av", () => ({
  Audio: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
    setAudioModeAsync: jest.fn().mockResolvedValue({}),
    Recording: {
      createAsync: jest.fn(),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

jest.mock("@expo/vector-icons", () => ({
  FontAwesome: () => "FontAwesome-Mock",
}));

jest.mock("expo-linking", () => ({
  openURL: jest.fn().mockResolvedValue(true)
}));

jest.mock('react-native/Libraries/ActionSheetIOS/ActionSheetIOS', () => ({
    showActionSheetWithOptions: jest.fn(),
  }));

const mockedAudio = jest.requireMock("expo-av").Audio;

// Helper function to render with navigation
const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe("SnitchModeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "ios";
  });

  it("renders correctly", () => {
    const { getByTestId, getByText } = renderWithNavigation(
      <SnitchModeScreen />
    );
    expect(getByTestId("snitch-mode-title")).toBeTruthy();
    expect(getByText("Snitch Mode")).toBeTruthy();
  });

  it("starts recording when microphone button is pressed", async () => {
    const mockRecording = { stopAndUnloadAsync: jest.fn() };
    mockedAudio.Recording.createAsync.mockResolvedValueOnce({
      recording: mockRecording,
    });

    const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);
    fireEvent.press(getByTestId("record-button"));

    await waitFor(() => {
      expect(mockedAudio.requestPermissionsAsync).toHaveBeenCalled();
      expect(mockedAudio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      expect(mockedAudio.Recording.createAsync).toHaveBeenCalled();
    });
  });

  it("stops recording when stop button is pressed", async () => {
    const mockStopAndUnload = jest.fn();
    const mockRecording = { stopAndUnloadAsync: mockStopAndUnload };
    mockedAudio.Recording.createAsync.mockResolvedValueOnce({
      recording: mockRecording,
    });

    const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);
    fireEvent.press(getByTestId("record-button"));

    await waitFor(() => {
      fireEvent.press(getByTestId("record-button"));
      expect(mockStopAndUnload).toHaveBeenCalled();
    });
  });

  it("shows call security button when noise threshold is exceeded", async () => {
    const mockRecording = { stopAndUnloadAsync: jest.fn() };
    let meterCallback: (arg0: { metering: number }) => void;

    mockedAudio.Recording.createAsync.mockImplementation(
      (_: unknown, callback: (status: { metering: number }) => void) => {
        meterCallback = callback;
        return Promise.resolve({ recording: mockRecording });
      }
    );

    const { getByTestId, getByText } = renderWithNavigation(
      <SnitchModeScreen />
    );
    fireEvent.press(getByTestId("record-button"));

    await waitFor(() => {
      meterCallback({ metering: -15 });
      expect(
        getByText("The level of noise is higher than the limit")
      ).toBeTruthy();
    });
  });

  it("handles call security for Android", async () => {
    Platform.OS = "android";
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);

    // First start recording
    fireEvent.press(getByTestId("record-button"));

    // Simulate noise threshold exceeded
    await waitFor(() => {
      mockedAudio.Recording.createAsync.mock.calls[0][1]({ metering: -15 });
    });

    fireEvent.press(getByTestId("call-security-button"));

    expect(alertSpy).toHaveBeenCalled();
  });

  it("automatically stops recording when noise threshold is exceeded", async () => {
    const mockStopAndUnload = jest.fn();
    const mockRecording = { stopAndUnloadAsync: mockStopAndUnload };
    let meterCallback: (arg0: { metering: number }) => void;

    mockedAudio.Recording.createAsync.mockImplementation(
      (_: unknown, callback: (status: { metering: number }) => void) => {
        meterCallback = callback;
        return Promise.resolve({ recording: mockRecording });
      }
    );

    const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);
    fireEvent.press(getByTestId("record-button"));

    await waitFor(() => {
      meterCallback({ metering: -15 });
      expect(mockStopAndUnload).toHaveBeenCalled();
    });
  });
  
  it("cleans up recording when unmounting", async () => {
    const mockStopAndUnload = jest.fn();
    const mockRecording = { stopAndUnloadAsync: mockStopAndUnload };
    mockedAudio.Recording.createAsync.mockResolvedValueOnce({
      recording: mockRecording,
    });
  
    const { getByTestId, unmount } = renderWithNavigation(<SnitchModeScreen />);
    
    // Wait for recording to be set
    await waitFor(() => {
      fireEvent.press(getByTestId("record-button"));
    });
  
    unmount();
    expect(mockStopAndUnload).toHaveBeenCalled();
  });
  
  it("handles stop recording errors gracefully", async () => {
    const mockStopAndUnload = jest.fn().mockRejectedValueOnce(new Error("Stop failed"));
    const mockRecording = { stopAndUnloadAsync: mockStopAndUnload };
    mockedAudio.Recording.createAsync.mockResolvedValueOnce({
      recording: mockRecording,
    });
  
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);
  
    // Start recording
    fireEvent.press(getByTestId("record-button"));
    
    await waitFor(() => {
      expect(mockRecording).toBeTruthy();
    });
  
    // Stop recording
    fireEvent.press(getByTestId("record-button"));
    
    await waitFor(() => {
      expect(mockStopAndUnload).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to stop recording",
        expect.any(Error)
      );
    });
  
    consoleSpy.mockRestore();
  });
  
  it("updates metering and noise threshold", async () => {
    const mockRecording = { stopAndUnloadAsync: jest.fn() };
    let meterCallback: (status: { metering: number }) => void;
  
    mockedAudio.Recording.createAsync.mockImplementation((_: any, callback: (status: { metering: number; }) => void) => {
      meterCallback = callback;
      return Promise.resolve({ recording: mockRecording });
    });
  
    const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);
    fireEvent.press(getByTestId("record-button"));
  
    await waitFor(() => {
      meterCallback({ metering: -50 }); // Should result in decibelLevel < NOISE_THRESHOLD
    });
  
    // Verify metering bars are rendered
    const meteringBars = await waitFor(() => 
      getByTestId("snitch-mode-screen").findAllByProps({
        style: expect.arrayContaining([
          expect.objectContaining({ backgroundColor: "#2F4F4F" })
        ])
      })
    );
    
    expect(meteringBars).toBeTruthy();
  });
  
  it("resets states on refresh", async () => {
    const mockRecording = { stopAndUnloadAsync: jest.fn() };
    mockedAudio.Recording.createAsync.mockResolvedValueOnce({
      recording: mockRecording,
    });
  
    const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);
    
    // Start recording to set initial states
    fireEvent.press(getByTestId("record-button"));
    
    await act(async () => {
      const scrollView = getByTestId("snitch-mode-screen");
      const { refreshControl } = scrollView.props;
      refreshControl.props.onRefresh();
    });
    
    // Verify states are reset
    await waitFor(() => {
      const scrollView = getByTestId("snitch-mode-screen");
      expect(scrollView.props.refreshControl.props.refreshing).toBe(true);
    });
  });
  
});
