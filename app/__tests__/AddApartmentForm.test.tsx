import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddApartmentForm from '../components/AddApartmentForm';

describe('AddApartmentForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Existing test cases
  it('renders correctly with all required elements', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(getByTestId('add-apartment-form')).toBeTruthy();
    expect(getByTestId('apartment-name-input')).toBeTruthy();
    expect(getByTestId('cancel-add-apartment')).toBeTruthy();
    expect(getByTestId('confirm-add-apartment')).toBeTruthy();
    expect(getByPlaceholderText('Apartment name')).toBeTruthy();
  });

  it('updates input value when user types', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const input = getByTestId('apartment-name-input');
    fireEvent.changeText(input, 'Test Apartment');
    
    expect(input.props.value).toBe('Test Apartment');
  });

  it('calls onSubmit with trimmed input value when submit button is pressed', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const input = getByTestId('apartment-name-input');
    const submitButton = getByTestId('confirm-add-apartment');

    fireEvent.changeText(input, '  Test Apartment  ');
    fireEvent.press(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('Test Apartment');
  });

  it('does not call onSubmit when input is empty', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const submitButton = getByTestId('confirm-add-apartment');
    fireEvent.press(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears input after successful submission', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const input = getByTestId('apartment-name-input');
    const submitButton = getByTestId('confirm-add-apartment');

    fireEvent.changeText(input, 'Test Apartment');
    fireEvent.press(submitButton);

    expect(input.props.value).toBe('');
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const cancelButton = getByTestId('cancel-add-apartment');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles whitespace-only input correctly', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const input = getByTestId('apartment-name-input');
    const submitButton = getByTestId('confirm-add-apartment');

    fireEvent.changeText(input, '   ');
    fireEvent.press(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // New test cases for edge cases and validation

  it('clears input when cancel button is pressed', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    const input = getByTestId('apartment-name-input');
    const cancelButton = getByTestId('cancel-add-apartment');
    
    fireEvent.changeText(input, 'Test Apartment');
    fireEvent.press(cancelButton);
    
    expect(input.props.value).toBe('');
  });

  it('handles special characters and numbers in input correctly', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    const input = getByTestId('apartment-name-input');
    const submitButton = getByTestId('confirm-add-apartment');
    
    const testValue = 'Apt #123 & Suite! @Building';
    fireEvent.changeText(input, testValue);
    fireEvent.press(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith(testValue);
  });

  it('handles very long input strings appropriately', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    const input = getByTestId('apartment-name-input');
    const submitButton = getByTestId('confirm-add-apartment');
    
    const longString = 'A'.repeat(100); // Test with 100 characters
    fireEvent.changeText(input, longString);
    fireEvent.press(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith(longString);
  });

  it('handles emoji and unicode characters correctly', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    const input = getByTestId('apartment-name-input');
    const submitButton = getByTestId('confirm-add-apartment');
    
    const testValue = '🏠 Apartment 123 • テスト';
    fireEvent.changeText(input, testValue);
    fireEvent.press(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith(testValue);
  });

  it('maintains input state between multiple edits', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    const input = getByTestId('apartment-name-input');
    
    fireEvent.changeText(input, 'Test');
    expect(input.props.value).toBe('Test');
    
    fireEvent.changeText(input, 'Test Apartment');
    expect(input.props.value).toBe('Test Apartment');
    
    fireEvent.changeText(input, 'Test Apartment 123');
    expect(input.props.value).toBe('Test Apartment 123');
  });

  it('handles rapid successive submissions correctly', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    const input = getByTestId('apartment-name-input');
    const submitButton = getByTestId('confirm-add-apartment');
    
    // Simulate rapid submissions
    fireEvent.changeText(input, 'Test 1');
    fireEvent.press(submitButton);
    fireEvent.changeText(input, 'Test 2');
    fireEvent.press(submitButton);
    fireEvent.changeText(input, 'Test 3');
    fireEvent.press(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(3);
    expect(mockOnSubmit).toHaveBeenNthCalledWith(1, 'Test 1');
    expect(mockOnSubmit).toHaveBeenNthCalledWith(2, 'Test 2');
    expect(mockOnSubmit).toHaveBeenNthCalledWith(3, 'Test 3');
  });

  it('handles input focus and blur events appropriately', () => {
    const { getByTestId } = render(
      <AddApartmentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    const input = getByTestId('apartment-name-input');
    
    fireEvent(input, 'focus');
    fireEvent(input, 'blur');
    
    // The component should maintain its state after focus/blur events
    fireEvent.changeText(input, 'Test Apartment');
    expect(input.props.value).toBe('Test Apartment');
  });
});