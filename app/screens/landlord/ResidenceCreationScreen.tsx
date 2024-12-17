import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  Keyboard,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import * as XLSX from 'xlsx';
import { Buffer } from 'buffer';
import { appStyles, ButtonDimensions } from '../../../styles/styles';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ResidenceStackParamList, Residence, Apartment } from '@/types/types';
import CustomTextField from '../../components/CustomTextField';
import CustomButton from '../../components/CustomButton';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import {
  createApartment,
  createResidence,
  updateLandlord,
  updateResidence,
  getLandlord,
} from '../../../firebase/firestore/firestore';
import CustomPopUp from '../../components/CustomPopUp';
import { arrayUnion } from 'firebase/firestore';

interface ResidenceFormData {
  name: string;
  address: string;
  number: string;
  zipCode: string;
  city: string;
  provinceState: string;
  country: string;
  description: string;
  website: string;
  tenantsFile?: string;
  ownershipProof?: string;
  pictures: string[];
}

interface FormErrors {
  website?: string;
}

const ALLOWED_EXTENSIONS = {
  excel: ['.xlsx', '.xls'],
  pdf: ['.pdf'],
  images: ['.jpg', '.jpeg', '.png'],
};

function ResidenceCreationScreen() {
  const navigation = useNavigation<NavigationProp<ResidenceStackParamList>>();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ResidenceFormData>({
    name: '',
    address: '',
    number: '',
    zipCode: '',
    city: '',
    provinceState: '',
    country: '',
    description: '',
    website: '',
    pictures: [],
  });
  const [apartments, setApartments] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [firebaseError, setFirebaseError] = useState<boolean>(false);
  const [firebaseErrorText, setFirebaseErrorText] = useState<string>('');

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const parseExcelFile = async (fileUri: string) => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const buffer = Buffer.from(fileContent, 'base64');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(firstSheet, { header: 1 });

      const apartmentNames = rows
        .slice(1)
        .map((row) => row[0])
        .filter(Boolean);
      setApartments(apartmentNames);
      Alert.alert('Success', `Parsed ${apartmentNames.length} apartments`);
    } catch (error) {
      Alert.alert('Error', 'Failed to parse Excel file');
    }
  };

  const handleFilePicker = async (
    fileType: 'excel' | 'pdf' | 'images',
    field: keyof ResidenceFormData,
  ) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type:
          fileType === 'images'
            ? 'image/*'
            : fileType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/pdf',
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const extension = file.name.toLowerCase().split('.').pop();
      const allowedExts = ALLOWED_EXTENSIONS[fileType];

      if (!allowedExts.includes(`.${extension}`)) {
        Alert.alert(
          'Invalid file type',
          `Please select a ${allowedExts.join(' or ')} file`,
        );
        return;
      }

      if (!formData.name) {
        Alert.alert('Error', 'Please enter a residence name first');
        return;
      }

      const directory =
        FileSystem.cacheDirectory + `residence/${formData.name}/`;
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

      const newPath = directory + file.name;
      await FileSystem.copyAsync({
        from: file.uri,
        to: newPath,
      });

      if (field === 'tenantsFile') {
        await parseExcelFile(newPath);
      }

      if (field === 'pictures') {
        setFormData((prev) => ({
          ...prev,
          pictures: [...prev.pictures, newPath],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [field]: newPath,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file');
    }
  };

  const validateWebsite = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (field: keyof ResidenceFormData) => (text: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: text,
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.website && !validateWebsite(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm() && user) {
      const newResidence: Residence = {
        residenceName: formData.name,
        street: formData.address,
        number: formData.number,
        city: formData.city,
        canton: formData.provinceState,
        zip: formData.zipCode,
        country: formData.country,
        landlordId: user.uid,
        tenantIds: [],
        laundryMachineIds: [],
        apartments: [],
        tenantCodesID: [],
        situationReportLayout: [],
      };

      const newResidenceId = await createResidence(newResidence);
      
      // Get current landlord data
      const landlord = await getLandlord(user.uid);
      if (landlord) {
        // Update landlord with new residence ID
        await updateLandlord(user.uid, {
          userId: landlord.userId,
          residenceIds: [...landlord.residenceIds, newResidenceId]
        });
      }

      if (!newResidenceId) {
        setFirebaseError(true);
        setFirebaseErrorText('Failed to create residence');
      } else {
        try {
          // Use Promise.all with map instead of forEach
          const newApartments = await Promise.all(
            apartments.map(async (apartmentName) => {
              const newApartment: Apartment = {
                apartmentName: apartmentName,
                residenceId: newResidenceId,
                tenants: [],
                maintenanceRequests: [],
                situationReportId: [''],
              };

              const newApartmentId = await createApartment(newApartment);
              if (!newApartmentId) {
                setFirebaseError(true);
                setFirebaseErrorText(
                  `Failed to create apartment ${apartmentName}`,
                );
                return null;
              }
              return newApartmentId;
            }),
          );

          // Filter out any null values from failed creations
          const successfulApartments = newApartments.filter(
            (id) => id !== null,
          );

          newResidence.apartments = successfulApartments;
          await updateResidence(newResidenceId, newResidence);
        } catch (error) {
          setFirebaseError(true);
          setFirebaseErrorText('Failed to create apartments');
        }
      }
      navigation.navigate('ResidenceList');
    }
  };

  const ErrorText = ({ error }: { error?: string }) =>
    error ? (
      <Text style={{ color: 'red', marginTop: 5, marginBottom: 10 }}>
        {error}
      </Text>
    ) : null;

  return (
    <Header>
      <ScrollView
        style={[
          appStyles.scrollContainer,
          { paddingBottom: 200, paddingHorizontal: 20 },
        ]}
      >
        <Text
          testID='screen-title'
          style={[appStyles.residenceTitle, { marginTop: 20 }]}
        >
          Create Your Residence
        </Text>
        <View style={appStyles.formContainer}>
          <View>
            {firebaseError && (
              <Modal visible={firebaseError}>
                <CustomPopUp
                  title='Error'
                  testID='FirebaseErrorModal'
                  text={firebaseErrorText}
                  onPress={() => setFirebaseError(false)}
                />
              </Modal>
            )}
          </View>
          <CustomTextField
            testID='residence-name'
            value={formData.name}
            onChangeText={handleChange('name')}
            placeholder='Residence Name'
            style={appStyles.formFullWidth}
          />

          <CustomTextField
            testID='address'
            value={formData.address}
            onChangeText={handleChange('address')}
            placeholder='Address'
            style={appStyles.formFullWidth}
          />

          <View style={appStyles.formRow}>
            <CustomTextField
              testID='number'
              value={formData.number}
              onChangeText={handleChange('number')}
              placeholder='Street no'
              style={appStyles.formZipCode}
              keyboardType='numeric'
            />

            <CustomTextField
              testID='zip-code'
              value={formData.zipCode}
              onChangeText={handleChange('zipCode')}
              placeholder='Zip Code'
              style={appStyles.formZipCode}
            />
          </View>

          <CustomTextField
            testID='city'
            value={formData.city}
            onChangeText={handleChange('city')}
            placeholder='City'
            style={appStyles.formFullWidth}
          />

          <CustomTextField
            testID='province-state'
            value={formData.provinceState}
            onChangeText={handleChange('provinceState')}
            placeholder='Province/State'
            style={appStyles.formFullWidth}
          />

          <CustomTextField
            testID='country'
            value={formData.country}
            onChangeText={handleChange('country')}
            placeholder='Country'
            style={appStyles.formFullWidth}
          />

          <CustomTextField
            testID='description'
            value={formData.description}
            onChangeText={handleChange('description')}
            placeholder='Description'
            style={[appStyles.formFullWidth, appStyles.descriptionInput]}
          />

          <CustomTextField
            testID='website'
            value={formData.website}
            onChangeText={handleChange('website')}
            placeholder='Website (e.g., https://example.com)'
            style={appStyles.formFullWidth}
            autoCapitalize='none'
          />
          <ErrorText error={errors.website} />

          <TouchableOpacity
            style={appStyles.uploadButton}
            onPress={() => handleFilePicker('excel', 'tenantsFile')}
          >
            <Ionicons name='cloud-upload-outline' size={24} color='#666' />
            <Text style={appStyles.uploadText}>
              {apartments.length > 0
                ? `${apartments.length} apartments loaded`
                : 'List of Apartments (.xlsx)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appStyles.uploadButton}
            onPress={() => handleFilePicker('pdf', 'ownershipProof')}
          >
            <Ionicons name='cloud-upload-outline' size={24} color='#666' />
            <Text style={appStyles.uploadText}>
              {formData.ownershipProof
                ? 'Proof uploaded'
                : 'Proof of Ownership'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appStyles.uploadButton}
            onPress={() => handleFilePicker('images', 'pictures')}
          >
            <Ionicons name='cloud-upload-outline' size={24} color='#666' />
            <Text style={appStyles.uploadText}>
              {formData.pictures.length > 0
                ? `${formData.pictures.length} pictures uploaded`
                : 'Pictures of residence'}
            </Text>
          </TouchableOpacity>

          <CustomButton
            testID='next-button'
            title='Next'
            onPress={handleSubmit}
            size='medium'
            style={[
              appStyles.submitButton,
              { width: ButtonDimensions.mediumButtonWidth },
            ]}
          />

          {/* Go back button */}
          <CustomButton
            testID='go-back-button'
            title='Go Back'
            onPress={() => navigation.goBack()}
            size='medium'
            style={[
              appStyles.submitButton,
              { width: ButtonDimensions.mediumButtonWidth },
            ]}
          />
        </View>
      </ScrollView>
    </Header>
  );
}

export default ResidenceCreationScreen;
