import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onClear }) => (
    <View testID="search-bar-container" style={{
        backgroundColor: '#D6D3F0',
        borderRadius: 30,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderColor: '#666666',
        borderWidth: 1,
        height: 36,
        width: '40%'
    }}>
        <Feather testID="search-icon" name="search" size={16} color="#666666" />
        <TextInput
            testID="search-input"
            placeholder="Search"
            value={value}
            onChangeText={onChangeText}
            style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 8,
                fontSize: 14,
            }}
            placeholderTextColor="#999999"
        />
        {value !== '' && (
            <Pressable
                testID="clear-search-button"
                onPress={onClear}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Feather name="x" size={16} color="#666666" />
            </Pressable>
        )}
    </View>
);

export default SearchBar;