import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

const box_size = 30;

interface TickingBoxProps {
  checked: boolean;
  onChange: (newChecked: boolean) => void;
}

const TickingBox: React.FC<TickingBoxProps> = ({ checked, onChange }) => {
  const handleToggle = () => {
    onChange(!checked); // Toggle the checked state and pass it to the parent
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={handleToggle}>
        <View style={[styles.checkbox, checked && styles.checked]}>
          {checked && <Icon name="x" type="feather" color="#fff" size={20} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: box_size,
    height: box_size,
    borderWidth: 2,
    borderColor: '#0f5257',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: "2%",
  },
  checked: {
    backgroundColor: '#0f5257',
  },
  label: {
    fontSize: 18,
    color: '#333',
  },
});

export default TickingBox;