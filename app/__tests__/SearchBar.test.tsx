import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../components/SearchBar';

describe('SearchBar', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
    onClear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with empty value', () => {
    const { getByTestId, queryByTestId } = render(<SearchBar {...defaultProps} />);
    
    // Check if main container exists
    expect(getByTestId('search-bar-container')).toBeTruthy();
    
    // Check if search icon exists
    expect(getByTestId('search-icon')).toBeTruthy();
    
    // Check if search input exists with correct placeholder
    const searchInput = getByTestId('search-input');
    expect(searchInput.props.placeholder).toBe('Search');
    
    // Clear button should not be visible when value is empty
    expect(queryByTestId('clear-search-button')).toBeNull();
  });

  it('renders clear button when value is not empty', () => {
    const props = {
      ...defaultProps,
      value: 'test',
    };
    
    const { getByTestId } = render(<SearchBar {...props} />);
    
    // Clear button should be visible
    expect(getByTestId('clear-search-button')).toBeTruthy();
  });

  it('calls onChangeText when input text changes', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} />);
    const searchInput = getByTestId('search-input');
    
    fireEvent.changeText(searchInput, 'test input');
    
    expect(defaultProps.onChangeText).toHaveBeenCalledWith('test input');
    expect(defaultProps.onChangeText).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when clear button is pressed', () => {
    const props = {
      ...defaultProps,
      value: 'test',
    };
    
    const { getByTestId } = render(<SearchBar {...props} />);
    const clearButton = getByTestId('clear-search-button');
    
    fireEvent.press(clearButton);
    
    expect(props.onClear).toHaveBeenCalledTimes(1);
  });

  it('renders with correct styles', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} />);
    const container = getByTestId('search-bar-container');
    const searchInput = getByTestId('search-input');
    
    // Check container styles
    expect(container.props.style).toMatchObject({
      backgroundColor: '#D6D3F0',
      borderRadius: 30,
      marginBottom: 10,
      borderColor: '#666666',
      borderWidth: 1,
      height: 36,
      width: '40%'
    });
    
    // Check input styles
    expect(searchInput.props.style).toMatchObject({
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 8,
      fontSize: 14
    });
  });

  it('renders with correct placeholder text color', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} />);
    const searchInput = getByTestId('search-input');
    
    expect(searchInput.props.placeholderTextColor).toBe('#999999');
  });
});