import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import CustomTextField from '../../components/CustomTextField';
import CustomButton from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { appStyles, ButtonDimensions } from '@/styles/styles';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ResidenceStackParamList } from '@/types/types';
import Header from '@/app/components/Header';

interface ResidenceFormData {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  provinceState: string;
  country: string;
  numberOfApartments: string;
  description: string;
  website: string;
  email: string;
}

interface FormErrors {
  website?: string;
  email?: string;
}

function CreateResidenceForm() {
  const navigation = useNavigation<NavigationProp<ResidenceStackParamList>>();

  const [formData, setFormData] = useState<ResidenceFormData>({
    name: '',
    address: '',
    zipCode: '',
    city: '',
    provinceState: '',
    country: '',
    numberOfApartments: '',
    description: '',
    website: '',
    email: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateWebsite = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (field: keyof ResidenceFormData) => (text: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: text
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.website && !validateWebsite(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., https://example.com)';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      navigation.navigate("ResidenceList");
    }
  };

  const ErrorText = ({ error }: { error?: string }) => (
    error ? <Text style={{ color: 'red', marginTop: 5, marginBottom: 10 }}>{error}</Text> : null
  );

  return (
    <Header>
      <ScrollView style={[appStyles.scrollContainer, {paddingBottom: 200}]}>
        <View style={appStyles.formContainer}>
          <CustomTextField
            testID="residence-name"
            value={formData.name}
            onChangeText={handleChange('name')}
            placeholder="Residence Name"
            style={appStyles.formFullWidth}
          />

          <CustomTextField
            testID="email"
            value={formData.email}
            onChangeText={handleChange('email')}
            placeholder="Email"
            style={appStyles.formFullWidth}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <ErrorText error={errors.email} />

          <CustomTextField
            testID="address"
            value={formData.address}
            onChangeText={handleChange('address')}
            placeholder="Address"
            style={appStyles.formFullWidth}
          />

          <View style={appStyles.formRow}>
            <CustomTextField
              testID="zip-code"
              value={formData.zipCode}
              onChangeText={handleChange('zipCode')}
              placeholder="Zip Code"
              style={appStyles.formZipCode}
              keyboardType="numeric"
            />

            <CustomTextField
              testID="city"
              value={formData.city}
              onChangeText={handleChange('city')}
              placeholder="City"
              style={appStyles.formCity}
            />
          </View>

          <CustomTextField
            testID="province-state"
            value={formData.provinceState}
            onChangeText={handleChange('provinceState')}
            placeholder="Province/State"
            style={appStyles.formFullWidth}
          />

          <CustomTextField
            testID="country"
            value={formData.country}
            onChangeText={handleChange('country')}
            placeholder="Country"
            style={appStyles.formFullWidth}
          />

          <CustomTextField
            testID="number-of-apartments"
            value={formData.numberOfApartments}
            onChangeText={handleChange('numberOfApartments')}
            placeholder="Number of apartments"
            style={appStyles.formFullWidth}
            keyboardType="numeric"
          />

          <CustomTextField
            testID="description"
            value={formData.description}
            onChangeText={handleChange('description')}
            placeholder="Description"
            style={[appStyles.formFullWidth, appStyles.descriptionInput]}
          />

          <CustomTextField
            testID="website"
            value={formData.website}
            onChangeText={handleChange('website')}
            placeholder="Website (e.g., https://example.com)"
            style={appStyles.formFullWidth}
            autoCapitalize="none"
          />
          <ErrorText error={errors.website} />
          <TouchableOpacity style={appStyles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color="#666" />
            <Text style={appStyles.uploadText}>List of Apartments and Tenants (.xlsx)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={appStyles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color="#666" />
            <Text style={appStyles.uploadText}>Proof of Ownership</Text>
          </TouchableOpacity>
          <TouchableOpacity style={appStyles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color="#666" />
            <Text style={appStyles.uploadText}>Pictures of residence</Text>
          </TouchableOpacity>

          <CustomButton
            testID="next-button"
            title="Next"
            onPress={handleSubmit}
            size="medium"
            style={[appStyles.submitButton, { width: ButtonDimensions.mediumButtonWidth}]}
          />
        </View>
      </ScrollView>
    </Header>
  );
}

export default CreateResidenceForm;