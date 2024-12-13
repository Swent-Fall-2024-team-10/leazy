import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert, ActionSheetIOS, Linking } from "react-native";
import SnitchModeScreen from "../../../screens/SnitchMode/SnitchModeScreen";
import {
  WaveformVisualizer,
  MAX_BARS,
} from "../../../screens/SnitchMode/WaveformVisualizer";
import { NavigationContainer } from "@react-navigation/native";
import { act } from "react-test-renderer";

// Keep your existing mocks
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

const mockOpenURL = jest.fn().mockResolvedValue(true);
const mockLinking = {
  openURL: mockOpenURL,
};

const mockActionSheet = {
  showActionSheetWithOptions: jest.fn((options, callback) => callback(0))
};

// Keep your existing mock setups
jest.mock("react-native/Libraries/ActionSheetIOS/ActionSheetIOS", () => ({
  showActionSheetWithOptions: jest.fn((options, callback) => {
    setTimeout(() => callback(0), 0);
  })
}));

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

// Add react-native-reanimated mock
jest.mock("react-native-reanimated", () => ({
  ...jest.requireActual("react-native-reanimated/mock"),
  ZoomIn: {
    duration: () => ({ duration: 150 }),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>{children}</NavigationContainer>
);

const renderWithNavigation = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

// At the top with other imports
import { Platform } from 'react-native';

// Create a mutable platform configuration
const platformConfig = {
  OS: 'ios' as 'ios' | 'android',
};

// Mock Platform at the top with other mocks
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  get OS() {
    return platformConfig.OS;
  },
  select: (spec: any) => spec[platformConfig.OS],
}));

describe("SnitchModeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    recordingStatusCallback = null;
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
        await waitFor(() =>
          expect(mockSetOnRecordingStatusUpdate).toHaveBeenCalled()
        );
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

  describe("Error handling", () => {
    it("handles stop recording errors", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockStopAndUnloadAsync.mockRejectedValueOnce(new Error("Stop failed"));

      const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);

      // Start recording
      await act(async () => {
        fireEvent.press(getByTestId("record-button"));
        await waitFor(() => expect(mockStartAsync).toHaveBeenCalled());
      });

      // Stop recording
      await act(async () => {
        fireEvent.press(getByTestId("record-button"));
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to stop recording",
        expect.any(Error)
      );
      expect(mockStopAndUnloadAsync).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Recording status updates", () => {
    it("handles undefined metering gracefully", async () => {
      const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);

      await act(async () => {
        fireEvent.press(getByTestId("record-button"));
        if (recordingStatusCallback) {
          recordingStatusCallback({});
        }
      });

      // Verify that no errors occurred
      expect(getByTestId("record-button")).toBeTruthy();
    });
  });

  describe("Platform-specific behavior", () => {
    beforeEach(() => {
      platformConfig.OS = 'ios';
      mockActionSheet.showActionSheetWithOptions.mockClear();
    });

    it("uses ActionSheetIOS on iOS", async () => {
        platformConfig.OS = 'ios';
        const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);
        
        // Start recording and trigger noise threshold
        await act(async () => {
          fireEvent.press(getByTestId("record-button"));
          // Make sure recording is initialized
          await waitFor(() => expect(mockStartAsync).toHaveBeenCalled());
          
          // Trigger noise threshold
          if (recordingStatusCallback) {
            recordingStatusCallback({ metering: 160 });
          }
        });
      
        // Wait for call security button to appear
        const callButton = await waitFor(() => getByTestId("call-security-button"));
        
        // Press the call security button
        await act(async () => {
          fireEvent.press(callButton);
        });
      
        // Verify ActionSheet was shown
        expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            options: ['Cancel', '🐖 Call Security 🐖'],
            cancelButtonIndex: 0,
            message: expect.stringContaining('Call 911')
          }),
          expect.any(Function)
        );
      });

      it("uses different UI on Android", async () => {
        platformConfig.OS = 'android';  // Override for Android test
        const alertSpy = jest.spyOn(Alert, 'alert');
        const { getByTestId } = renderWithNavigation(<SnitchModeScreen />);
        
        // Start recording and trigger noise threshold
        await act(async () => {
          fireEvent.press(getByTestId("record-button"));
          // Make sure recording is initialized
          await waitFor(() => expect(mockStartAsync).toHaveBeenCalled());
          
          // Trigger noise threshold
          if (recordingStatusCallback) {
            recordingStatusCallback({ metering: 160 });
          }
        });
      
        // Wait for call security button to appear
        const callButton = await waitFor(() => getByTestId("call-security-button"));
        
        // Press the call security button
        await act(async () => {
          fireEvent.press(callButton);
        });
      
        // Verify Alert was shown with correct options
        expect(alertSpy).toHaveBeenCalledWith(
          '🐖 Call Security 🐖',
          '🐖 Do you want to call security at 911? 🐖',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: '🐖 Call 🐖',
              onPress: expect.any(Function),
              style: 'default'
            }
          ],
          { cancelable: true }
        );
      
        // Clean up
        alertSpy.mockRestore();
      });
    });
});

describe("WaveformVisualizer", () => {
  it("initializes with minimum height bars", () => {
    const { getAllByTestId } = render(
      <WaveformVisualizer
        metering={null}
        isRecording={false}
        noiseThresholdExceeded={false}
      />
    );

    const bars = getAllByTestId(/waveform-bar-/);
    expect(bars.length).toBeGreaterThan(0);
    bars.forEach((bar) => {
      expect(bar.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            height: 10, // MIN_HEIGHT
          }),
        ])
      );
    });
  });

  it("updates waveform data when recording", async () => {
    const { getAllByTestId, rerender } = render(
      <WaveformVisualizer
        metering={-40}
        isRecording={true}
        noiseThresholdExceeded={false}
      />
    );

    // Rerender with different metering values
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        rerender(
          <WaveformVisualizer
            metering={-20 + i * 10}
            isRecording={true}
            noiseThresholdExceeded={false}
          />
        );
      });
    }

    const bars = getAllByTestId(/waveform-bar-/);
    expect(bars.length).toBeGreaterThan(0);

    // Verify that at least some bars have updated heights
    const barHeights = bars.map(
      (bar) =>
        bar.props.style.find((style: any) => style.height !== undefined)?.height
    );
    expect(barHeights.some((height) => height > 10)).toBe(true);
  });

  it("changes bar color when noise threshold is exceeded", () => {
    const { getAllByTestId } = render(
      <WaveformVisualizer
        metering={-40}
        isRecording={true}
        noiseThresholdExceeded={true}
      />
    );

    const bars = getAllByTestId(/waveform-bar-/);
    bars.forEach((bar) => {
      expect(bar.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: "#FF4444",
          }),
        ])
      );
    });
  });

  it("stops updating when noiseThresholdExceeded is true", async () => {
    const { getAllByTestId, rerender } = render(
      <WaveformVisualizer
        metering={-40}
        isRecording={true}
        noiseThresholdExceeded={true}
      />
    );

    const initialBars = getAllByTestId(/waveform-bar-/);
    const initialHeights = initialBars.map(
      (bar) =>
        bar.props.style.find((style: any) => style.height !== undefined)?.height
    );

    // Attempt to update with new metering value
    rerender(
      <WaveformVisualizer
        metering={0}
        isRecording={true}
        noiseThresholdExceeded={true}
      />
    );

    const updatedBars = getAllByTestId(/waveform-bar-/);
    const updatedHeights = updatedBars.map(
      (bar) =>
        bar.props.style.find((style: any) => style.height !== undefined)?.height
    );

    // Heights should remain the same
    expect(updatedHeights).toEqual(initialHeights);
  });
});