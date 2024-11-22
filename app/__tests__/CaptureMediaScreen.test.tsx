import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CapturedMediaScreen from '../screens/camera/CapturedMediaScreen'; // Adjust the path as needed
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePictureContext } from '../context/PictureContext';
import { Alert } from 'react-native';
import { cacheFile, picFileUri } from '../utils/cache';
import * as ImageManipulator from 'expo-image-manipulator';

// Mock required modules
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('../context/PictureContext', () => ({
  usePictureContext: jest.fn(),
}));

jest.mock('expo-modules-core', () => ({
  NativeModule: {},
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Video: 'Video',
  Audio: {
    Sound: {
      createAsync: jest.fn(),
      unloadAsync: jest.fn(),
    },
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png'
  }
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn().mockResolvedValue({}),
  getDownloadURL: jest.fn().mockResolvedValue('mock-download-url'),
}));

jest.mock('../utils/cache', () => ({
  cacheFile: jest.fn().mockResolvedValue('mock-cached-file-uri'),
  picFileUri: jest.fn(() => 'mock-pic-uri'),
}));

jest.spyOn(Alert, 'alert');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('CapturedMediaScreen', () => {
  const mockGoBack = jest.fn();
  const mockAddPicture = jest.fn();
  let headerLeft: React.ReactNode; 
  let headerRight: React.ReactNode;
  const mockImageGetSize = jest.fn();


  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Image.getSize
    jest.spyOn(require('react-native').Image, 'getSize').mockImplementation(mockImageGetSize);

    // Mock navigation
    (useNavigation as jest.Mock).mockReturnValue({
      setOptions: jest.fn(({ headerLeft: left, headerRight: right }) => {
        headerLeft = left && left();
        headerRight = right && right();
      }),
      goBack: mockGoBack,
    });

    // Mock route
    (useRoute as jest.Mock).mockReturnValue({
      params: { uri: 'mock-uri', type: 'photo' },
    });

    // Mock picture context
    (usePictureContext as jest.Mock).mockReturnValue({
      addPicture: mockAddPicture,
    });

    // Mock ImageManipulator
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: 'resized-image-uri',
    });

    // Mock cache utilities
    (picFileUri as jest.Mock).mockReturnValue('mock-cached-file-path');
    (cacheFile as jest.Mock).mockResolvedValue(true);

    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: 'file://mock-resized-image.jpg' // Valid file URI format
    });


  });

  it('renders correctly for photo type', () => {
    const { getByLabelText, getByText } = render(<CapturedMediaScreen />);
    expect(getByLabelText('Captured photo')).toBeTruthy();
    expect(getByText('Photo captured')).toBeTruthy();
  });

  it('renders upload and close buttons in the header', () => {
    render(<CapturedMediaScreen />);

    // Test headerLeft (close button)
    const closeButton = render(headerLeft as React.ReactElement).getByTestId('close-button');
    expect(closeButton).toBeTruthy();

    // Test headerRight (upload button)
    const uploadButton = render(headerRight as React.ReactElement).getByTestId('upload-button');
    expect(uploadButton).toBeTruthy();
  });

  it('navigates back when the close button is pressed', () => {
    render(<CapturedMediaScreen />);

    const closeButton = render(headerLeft as React.ReactElement).getByTestId('close-button');
    fireEvent.press(closeButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('renders video type correctly', () => {
    (useRoute as jest.Mock).mockReturnValueOnce({
      params: { uri: 'mock-video-uri', type: 'video' },
    });

    const { getByText } = render(<CapturedMediaScreen />);
    expect(getByText('Video recorded')).toBeTruthy();
  });


  it('handles image dimension retrieval error', async () => {
    // Mock Image.getSize to trigger an error
    mockImageGetSize.mockImplementationOnce((uri, successCallback, errorCallback) => {
      errorCallback(new Error('Dimension retrieval failed'));
    });

    const { getByTestId } = render(<CapturedMediaScreen />);

    // Find and press upload button
    const uploadButton = render(headerRight as React.ReactElement).getByTestId('upload-button');
    fireEvent.press(uploadButton);

    // Wait for error handling
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to upload media to Firebase');
    });
  });

  it('toggles video play/pause', () => {
    (useRoute as jest.Mock).mockReturnValueOnce({
      params: { uri: 'mock-video-uri', type: 'video' },
    });

    const { getByTestId } = render(<CapturedMediaScreen />);

    // Since play/pause is an internal state change, we'd typically 
    // need to add a testID to the play/pause button in the actual component
    // This is a placeholder for how you might test the play/pause functionality
  });

  it('retrieves image dimensions correctly', async () => {
    mockImageGetSize.mockImplementationOnce((uri, successCallback) => {
      successCallback(800, 600); // Mock width and height
    });

    const { getByTestId } = render(<CapturedMediaScreen />);

    // Find and press upload button
    const uploadButton = render(headerRight as React.ReactElement).getByTestId('upload-button');
    fireEvent.press(uploadButton);

    // Wait for assertions
    await waitFor(() => {
      expect(mockImageGetSize).toHaveBeenCalledWith(
        'mock-uri',
        expect.any(Function),
        expect.any(Function)
      );
      expect(Alert.alert).toHaveBeenCalledWith('Debug', 'Image dimensions retrieved: 800x600');
    });
  });


  it('toggles video play/pause', () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { uri: 'mock-video-uri', type: 'video' }, // Mock the type as 'video'
    });

    const { getByTestId } = render(<CapturedMediaScreen />);

    // Find and press play/pause button
    const playPauseButton = getByTestId('play-pause-button');
    fireEvent.press(playPauseButton);

    // Verify play state changes to pause
    expect(getByTestId('pause-icon')).toBeTruthy();

    fireEvent.press(playPauseButton);

    // Verify play state changes to play
    expect(getByTestId('play-icon')).toBeTruthy();
  });


  it('sets navigation options correctly', () => {
    render(<CapturedMediaScreen />);

    expect(headerLeft).toBeTruthy();
    expect(headerRight).toBeTruthy();
  });


  it('renders correct UI for photo type', () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { uri: 'mock-photo-uri', type: 'photo' },
    });

    const { getByLabelText } = render(<CapturedMediaScreen />);
    expect(getByLabelText('Captured photo')).toBeTruthy();
  });

  it('renders correct UI for video type', () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { uri: 'mock-video-uri', type: 'video' },
    });

    const { getByTestId } = render(<CapturedMediaScreen />);
    expect(getByTestId('play-pause-button')).toBeTruthy();
  });

  it('renders correctly with invalid or missing type', () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { uri: 'mock-uri', type: null }, // Invalid or missing type
    });

    const { queryByLabelText, queryByTestId, getByText } = render(<CapturedMediaScreen />);

    // Ensure no photo or video UI is rendered
    expect(queryByLabelText('Captured photo')).toBeNull();
    expect(queryByTestId('play-pause-button')).toBeNull();

    // Verify fallback message is displayed
    expect(getByText('Invalid media type')).toBeTruthy();
  });



  it('handles zero image dimensions gracefully', async () => {
    mockImageGetSize.mockImplementationOnce((uri, successCallback) => {
      successCallback(0, 0); // Zero dimensions
    });

    const { getByTestId } = render(<CapturedMediaScreen />);
    const uploadButton = render(headerRight as React.ReactElement).getByTestId('upload-button');
    fireEvent.press(uploadButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to upload media to Firebase');
    });
  });

  it('handles large image dimensions correctly', async () => {
    mockImageGetSize.mockImplementationOnce((uri, successCallback) => {
      successCallback(10000, 8000); // Large dimensions
    });

    const { getByTestId } = render(<CapturedMediaScreen />);
    const uploadButton = render(headerRight as React.ReactElement).getByTestId('upload-button');
    fireEvent.press(uploadButton);

    await waitFor(() => {
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'mock-uri',
        [{ resize: { width: 5000, height: 4000 } }], // 50% of large dimensions
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
    });
  });

  it('handles image upload process correctly with actual URIs and caching', async () => {
    const mockResizedUri = 'file://mock-resized-image.jpg';
    const mockBlob = new Blob(['mock data']);

    // Mock successful image dimension retrieval
    mockImageGetSize.mockImplementationOnce((uri, successCallback) => {
      successCallback(800, 600);
    });

    // Mock image manipulation
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: mockResizedUri
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue(mockBlob)
    } as unknown as Response);

    const { getByTestId } = render(<CapturedMediaScreen />);
    const uploadButton = render(headerRight as React.ReactElement).getByTestId('upload-button');

    await act(async () => {
      fireEvent.press(uploadButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(mockResizedUri);
    }, { timeout: 3000 });
  });

});
