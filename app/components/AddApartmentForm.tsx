import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Color } from '../../styles/styles'; // Adjust the import path as needed

// AddApartmentForm Component
interface AddApartmentFormProps {
    onSubmit: (name: string) => void;
    onCancel: () => void;
  }

const AddApartmentForm: React.FC<AddApartmentFormProps> = ({ onSubmit, onCancel }) => {
    const [apartmentName, setApartmentName] = useState('');

    const handleSubmit = () => {
        if (apartmentName.trim()) {
            onSubmit(apartmentName.trim());
        }
        setApartmentName('');
    };

    return (
        <View testID="add-apartment-form" style={{
            width: '90%',
            height: 100,
            backgroundColor: 'white',
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 10
        }}>
            <TextInput
                testID="apartment-name-input"
                style={{
                    width: '100%',
                    borderWidth: 1,
                    borderRadius: 20,
                    height: 40,
                    backgroundColor: Color.TextInputBackground,
                    paddingHorizontal: 10,
                    fontSize: 14
                }}
                value={apartmentName}
                onChangeText={setApartmentName}
                placeholder='Apartment name'
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                <Pressable
                    testID="cancel-add-apartment"
                    onPress={() => {
                        onCancel()
                        setApartmentName('')}}
                    style={{ marginRight: 20 }}
                >
                    <Feather name="x" size={24} color="#666666" />
                </Pressable>
                <Pressable
                    testID="confirm-add-apartment"
                    onPress={handleSubmit}
                >
                    <Feather name="check" size={24} color="#666666"/>
                </Pressable>
            </View>
        </View>
    );
};

export default AddApartmentForm;