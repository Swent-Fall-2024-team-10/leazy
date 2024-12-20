import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SituationReportScreen from '../screens/landlord/SituationReport/SituationReportScreen'; // Adjust the import based on your file structure
import { useAuth } from '../context/AuthContext';
import { fetchResidences, fetchApartmentNames, fetchSituationReportLayout, toDatabase } from '../utils/SituationReport';
import * as SituationReportUtils from '../utils/SituationReport';
import { addSituationReport } from '../../firebase/firestore/firestore';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../utils/SituationReport');
jest.mock('../../firebase/firestore/firestore');
(useAuth as jest.Mock).mockReturnValue({
  landlord: { residenceIds: ['residenceId'] },
});

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  memoryLocalCache: jest.fn(),
  initializeFirestore: jest.fn(),
}));

// Mocking database functions
(fetchResidences as jest.Mock).mockImplementation((landlord, setResidences) => setResidences([{ label: 'Residence 1', value: 'residenceId' }]));
(fetchApartmentNames as jest.Mock).mockImplementation((residence, setApartments) => setApartments([{ label: 'Apartment 1', value: 'apartmentId' }]));
jest.spyOn(SituationReportUtils, 'toDatabase').mockImplementation(() => Promise.resolve('reportFormData'));
(addSituationReport as jest.Mock).mockResolvedValue({});

it('renders the SituationReportScreen correctly', () => {
    const { getByText, getByTestId } = render(
        <NavigationContainer>
        <SituationReportScreen test_enabler={true} />
      </NavigationContainer>
);
  
    // Check if key components are rendered
    expect(getByText('Situation Report Form')).toBeTruthy();
    expect(getByText('Residence')).toBeTruthy();
    expect(getByText('Apartment')).toBeTruthy();
    expect(getByText('Situation Report')).toBeTruthy();
    expect(getByTestId('arriving-tenant-name')).toBeTruthy();
    expect(getByTestId('leaving-tenant-name')).toBeTruthy();
  });
  

  it('handles tenant name input changes', () => {
    const { getByTestId } = render(    
    <NavigationContainer>
        <SituationReportScreen test_enabler={true} />
    </NavigationContainer>);
  
    const arrivingNameInput = getByTestId('arriving-tenant-name');
    const leavingNameInput = getByTestId('leaving-tenant-name');
  
    fireEvent.changeText(arrivingNameInput, 'John');
    fireEvent.changeText(leavingNameInput, 'Doe');
  
    expect(arrivingNameInput.props.value).toBe('John');
    expect(leavingNameInput.props.value).toBe('Doe');
  });

  it('resets the form when reset is called', () => {
    const { getByTestId } = render(    
        <NavigationContainer>
            <SituationReportScreen enableSubmit={true} />
        </NavigationContainer>);
  
    fireEvent.changeText(getByTestId('arriving-tenant-name'), 'John');
    fireEvent.changeText(getByTestId('testRemarkField'), 'Some remarks');
    
    expect(getByTestId('arriving-tenant-name').props.value).toBe('John');
    expect(getByTestId('testRemarkField').props.value).toBe('Some remarks');
  });

  it('submits the situation report correctly', async () => {
    const { getByTestId } = render(    
        <NavigationContainer>
            <SituationReportScreen enableSubmit={false} />
        </NavigationContainer>);
  
    fireEvent.changeText(getByTestId('arriving-tenant-name'), 'John');
    fireEvent.changeText(getByTestId('leaving-tenant-name'), 'Doe');
    fireEvent.changeText(getByTestId('testRemarkField'), 'Remarks');

    fireEvent.press(getByTestId('submit'));
  
    await waitFor(() => {
      expect(toDatabase).toHaveBeenCalledWith(expect.any(Array), 'Situation Report arrival of John ');
      expect(addSituationReport).toHaveBeenCalledWith(
        expect.objectContaining({
          apartmentId: "",
          arrivingTenant: JSON.stringify({name: "John", surname: ""}),
          leavingTenant: JSON.stringify({name: "Doe", surname: ""}),
          remarks: "Remarks",
          reportForm: "reportFormData",
          residenceId: undefined
        }), 
        "")
    });
  });
  

  