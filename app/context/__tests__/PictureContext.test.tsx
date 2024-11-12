import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PictureProvider, usePictureContext } from '../PictureContext';
import { Text, Button } from 'react-native';
import '@testing-library/jest-native/extend-expect';

describe('PictureContext in React Native', () => {
  const TestComponent = () => {
    const { pictureList, addPicture, resetPictureList, removePicture } = usePictureContext();

    return (
      <>
        <Text testID='pictureList'>{JSON.stringify(pictureList)}</Text>
        <Button testID='' title="Add Picture" onPress={() => addPicture('test1')} />
        <Button title="Remove Picture" onPress={() => removePicture('test1')} />
        <Button title="Reset List" onPress={() => resetPictureList()} />
      </>
    );
  };

  const setup = () => {
    return render(
      <PictureProvider>
        <TestComponent />
      </PictureProvider>
    );
  };

  test('initializes with an empty pictureList', () => {
    const { getByTestId } = setup();
    expect(getByTestId('pictureList')).toHaveTextContent('[]');
  });

  test('adds a picture to pictureList', () => {
    const { getByTestId, getByText } = setup();

    fireEvent.press(getByText('Add Picture'));
    expect(getByTestId('pictureList')).toHaveTextContent('["test1"]');
  });

  test('removes a picture from pictureList', () => {
    const { getByTestId, getByText } = setup();

    // Add picture first
    fireEvent.press(getByText('Add Picture'));
    expect(getByTestId('pictureList')).toHaveTextContent('["test1"]');

    // Remove picture
    fireEvent.press(getByText('Remove Picture'));
    expect(getByTestId('pictureList')).toHaveTextContent('[]');
  });

  test('resets the pictureList', () => {
    const { getByTestId, getByText } = setup();

    // Add pictures
    fireEvent.press(getByText('Add Picture'));
    fireEvent.press(getByText('Add Picture')); // Add again
    expect(getByTestId('pictureList')).toHaveTextContent('["test1","test1"]');

    // Reset list
    fireEvent.press(getByText('Reset List'));
    expect(getByTestId('pictureList')).toHaveTextContent('[]');
  });

  test('throws error when usePictureContext is used outside PictureProvider', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'Context used outside of a PictureProvider'
    );

    errorSpy.mockRestore();
  });
});
