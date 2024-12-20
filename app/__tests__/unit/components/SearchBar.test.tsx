import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../../../components/SearchBar';

// Mock Feather icons
jest.mock('react-native-vector-icons/Feather', () => 'Feather');

describe('SearchBar', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
    onClear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders search bar container with correct style', () => {
      const { getByTestId } = render(<SearchBar {...defaultProps} />);
      const container = getByTestId('search-bar-container');

      expect(container.props.style).toMatchObject({
        backgroundColor: '#D6D3F0',
        borderRadius: 30,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderColor: '#666666',
        borderWidth: 1,
        height: 40,
        width: '90%'
      });
    });

    it('renders search icon', () => {
      const { getByTestId } = render(<SearchBar {...defaultProps} />);
      const searchIcon = getByTestId('search-icon');

      expect(searchIcon).toBeTruthy();
      expect(searchIcon.props.name).toBe('search');
      expect(searchIcon.props.size).toBe(16);
      expect(searchIcon.props.color).toBe('#666666');
    });

    it('renders TextInput with correct props', () => {
      const { getByTestId } = render(<SearchBar {...defaultProps} />);
      const input = getByTestId('search-input');

      expect(input.props.placeholder).toBe('Search');
      expect(input.props.placeholderTextColor).toBe('#999999');
      expect(input.props.value).toBe('');
      expect(input.props.style).toMatchObject({
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
        fontSize: 14,
      });
    });

    it('does not render clear button when value is empty', () => {
      const { queryByTestId } = render(<SearchBar {...defaultProps} />);
      expect(queryByTestId('clear-search-button')).toBeNull();
    });

    it('renders clear button when value is not empty', () => {
      const { getByTestId } = render(
        <SearchBar {...defaultProps} value="test" />
      );
      expect(getByTestId('clear-search-button')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onChangeText when text input changes', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <SearchBar {...defaultProps} onChangeText={onChangeText} />
      );

      fireEvent.changeText(getByTestId('search-input'), 'test');
      expect(onChangeText).toHaveBeenCalledWith('test');
    });

    it('calls onClear when clear button is pressed', () => {
      const onClear = jest.fn();
      const { getByTestId } = render(
        <SearchBar {...defaultProps} value="test" onClear={onClear} />
      );

      fireEvent.press(getByTestId('clear-search-button'));
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('handles hitSlop on clear button', () => {
      const { getByTestId } = render(
        <SearchBar {...defaultProps} value="test" />
      );
      
      const clearButton = getByTestId('clear-search-button');
      expect(clearButton.props.hitSlop).toEqual({
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      });
    });
  });

  describe('Props', () => {
    it('correctly passes value to TextInput', () => {
      const { getByTestId } = render(
        <SearchBar {...defaultProps} value="test value" />
      );
      
      const input = getByTestId('search-input');
      expect(input.props.value).toBe('test value');
    });

    it('updates when value prop changes', () => {
      const { getByTestId, rerender } = render(<SearchBar {...defaultProps} />);
      const input = getByTestId('search-input');
      
      expect(input.props.value).toBe('');
      
      rerender(<SearchBar {...defaultProps} value="new value" />);
      expect(input.props.value).toBe('new value');
    });
  });

  describe('Edge cases', () => {
    it('handles empty string in onChangeText', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <SearchBar {...defaultProps} onChangeText={onChangeText} />
      );

      fireEvent.changeText(getByTestId('search-input'), '');
      expect(onChangeText).toHaveBeenCalledWith('');
    });

    it('handles special characters in input', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <SearchBar {...defaultProps} onChangeText={onChangeText} />
      );

      fireEvent.changeText(getByTestId('search-input'), '!@#$%^&*()');
      expect(onChangeText).toHaveBeenCalledWith('!@#$%^&*()');
    });

    it('handles rapid clear button presses', () => {
      const onClear = jest.fn();
      const { getByTestId } = render(
        <SearchBar {...defaultProps} value="test" onClear={onClear} />
      );

      const clearButton = getByTestId('clear-search-button');
      fireEvent.press(clearButton);
      fireEvent.press(clearButton);
      fireEvent.press(clearButton);

      expect(onClear).toHaveBeenCalledTimes(3);
    });
  });
});