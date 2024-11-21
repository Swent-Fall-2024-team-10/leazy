import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const DropdownPickerExample = () => {
  const [open, setOpen] = useState(false); // Controls dropdown visibility
  const [value, setValue] = useState(null); // Selected value
  const [items, setItems] = useState([
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Orange', value: 'orange' },
  ]); // Dropdown options

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Fruit:</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={(isOpen) => {
          setOpen(isOpen);
          console.log(`Dropdown is now ${open ? 'open' : 'closed'}`);
        }}
        setValue={(selectedValue) => {
          setValue(selectedValue);
          console.log(`Selected value: ${selectedValue}`);
        }}
        setItems={setItems}
        placeholder="Select an item"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />
      {value && <Text style={styles.selected}>Selected: {value}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropdownContainer: {
    borderColor: '#ddd',
  },
  selected: {
    marginTop: 16,
    fontSize: 16,
    color: 'blue',
  },
});

export default DropdownPickerExample;
