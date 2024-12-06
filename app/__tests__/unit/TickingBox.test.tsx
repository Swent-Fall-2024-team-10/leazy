import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TickingBox from '../../components/forms/TickingBox';

describe('TickingBox Component', () => {
  it('renders the unchecked state correctly', () => {
    const mockOnChange = jest.fn();

    const { getByTestId, queryByTestId } = render(
      <TickingBox checked={false} onChange={mockOnChange} />
    );

    const checkbox = getByTestId('ticking-box');
    const icon = queryByTestId('ticking-box-icon');

    // Ensure the checkbox is rendered
    expect(checkbox).toBeTruthy();

    // Ensure the icon is not rendered (unchecked state)
    expect(icon).toBeNull();
  });

  it('toggles the checked state when clicked', () => {
    const mockOnChange = jest.fn();

    const { getByTestId } = render(
      <TickingBox checked={false} onChange={mockOnChange} />
    );

    const button = getByTestId('ticking-box-button');

    // Simulate a press on the button
    fireEvent.press(button);

    // Ensure the onChange handler is called with the toggled state
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('toggles from checked to unchecked state when clicked', () => {
    const mockOnChange = jest.fn();

    const { getByTestId } = render(
      <TickingBox checked={true} onChange={mockOnChange} />
    );

    const button = getByTestId('ticking-box-button');

    // Simulate a press on the button
    fireEvent.press(button);

    // Ensure the onChange handler is called with the toggled state
    expect(mockOnChange).toHaveBeenCalledWith(false);
  });
});
