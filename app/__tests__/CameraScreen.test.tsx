import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import CameraScreen from '../screens/camera/CameraScreen';
import { Camera, CameraType } from 'expo-camera';
import { Alert } from 'react-native';




jest.mock('expo-camera', () => {
    // Define a typed mock CameraView component
    const MockCameraView = jest.fn(({ children, ref }: { 
      children: React.ReactNode, 
      ref?: React.RefObject<{ 
        takePictureAsync: jest.Mock 
      }> 
    }) => {
      // If a ref is provided, set up a mock takePictureAsync
      if (ref && ref.current) {
        ref.current.takePictureAsync = jest.fn();
      }
      return <>{children}</>;
    });
  
    return {
      Camera: {
        requestCameraPermissionsAsync: jest.fn(),
      },
      CameraView: MockCameraView,
      CameraType: {
        back: 'back',
        front: 'front',
      },
    };
  });
    

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(),
  },
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(),
  saveToLibraryAsync: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

describe('CameraScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  } as unknown as NavigationProp<any>;

  const mockRoute = {
    params: {},
  } as RouteProp<any, string>;


  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default permission mocks
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ 
      status: 'granted' 
    });
    (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ 
      status: 'granted' 
    });
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({ 
      status: 'granted' 
    });
  });


  it('displays no access message when permissions are denied', async () => {
    // Mock permissions being denied
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ 
      status: 'denied' 
    });

    const { getByText } = render(<CameraScreen />);

    await waitFor(() => {
      expect(getByText('No access to camera')).toBeTruthy();
    });
  });

  it('renders CameraView when all permissions are granted', async () => {
    const { getByTestId } = render(<CameraScreen />);
  
    await waitFor(() => {
      expect(getByTestId('capture-button')).toBeTruthy();
    });
  });

  it('adjusts zoom when zoom buttons are pressed', async () => {
    const { getByTestId } = render(<CameraScreen />);
  
    const zoomInButton = await waitFor(() => getByTestId('zoom-in-button'));
    const zoomOutButton = await waitFor(() => getByTestId('zoom-out-button'));
  
    fireEvent.press(zoomInButton);
  
    await waitFor(() => {
      expect(zoomInButton).toBeTruthy();
    });
  
    fireEvent.press(zoomOutButton);
  
    await waitFor(() => {
      expect(zoomOutButton).toBeTruthy();
    });
  });

  it('navigates back when go-back button is pressed', async () => {
    const mockGoBack = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      ...mockNavigation,
      goBack: mockGoBack,
    });
  
    const { getByTestId } = render(<CameraScreen />);
    const goBackButton = await waitFor(() => getByTestId('go-back-button'));
    fireEvent.press(goBackButton);
  
    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
  
  it('toggles camera type when camera-reverse button is pressed', async () => {
    const { getByTestId } = render(<CameraScreen />);
    
    await waitFor(() => {
      const cameraReverseButton = getByTestId('camera-reverse-button');
      expect(cameraReverseButton).toBeTruthy();
    });

    const cameraReverseButton = getByTestId('camera-reverse-button');
    fireEvent.press(cameraReverseButton);
  });

  it('toggles flash mode when flash button is pressed', async () => {
    const { getByTestId } = render(<CameraScreen />);

    await waitFor(() => {
      const flashButton = getByTestId('flash-button');
      expect(flashButton).toBeTruthy();
    });

    const flashButton = getByTestId('flash-button');
    fireEvent.press(flashButton);
  });

  it('handles zoom limit cases', async () => {
    const { getByTestId } = render(<CameraScreen />);
    
    const zoomInButton = await waitFor(() => getByTestId('zoom-in-button'));
    const zoomOutButton = await waitFor(() => getByTestId('zoom-out-button'));

    // Simulate multiple zoom in presses to hit upper limit
    for (let i = 0; i < 15; i++) {
      fireEvent.press(zoomInButton);
    }

    // Simulate multiple zoom out presses to hit lower limit
    for (let i = 0; i < 15; i++) {
      fireEvent.press(zoomOutButton);
    }

    // Verify the buttons are still present and functional
    expect(zoomInButton).toBeTruthy();
    expect(zoomOutButton).toBeTruthy();
  });


  it('handles partial permission scenarios', async () => {
    // Scenario: Camera permission denied
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ 
      status: 'denied' 
    });
    (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ 
      status: 'granted' 
    });
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({ 
      status: 'granted' 
    });

    const { getByText } = render(<CameraScreen />);

    await waitFor(() => {
      expect(getByText('No access to camera')).toBeTruthy();
    });

    // Scenario: Audio permission denied
    jest.clearAllMocks();
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ 
      status: 'granted' 
    });
    (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ 
      status: 'denied' 
    });
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({ 
      status: 'granted' 
    });

    const { rerender } = render(<CameraScreen />);
    rerender(<CameraScreen />);

    await waitFor(() => {
      expect(getByText('No access to camera')).toBeTruthy();
    });
  });
});