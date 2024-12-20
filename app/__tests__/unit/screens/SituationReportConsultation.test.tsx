import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SituationReportConsultationScreen from '../../../screens/landlord/SituationReport/SituationReportConsultationScreen'; // Adjust the import based on your file structure
import { useAuth } from '../../../context/AuthContext';
import { getSituationReport } from '../../../../firebase/firestore/firestore';
import { fetchFromDatabase } from '../../../utils/SituationReport';
import { useNavigation } from '@react-navigation/native';

// Mock the dependencies
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../firebase/firestore/firestore', () => ({
  getSituationReport: jest.fn(),
}));

jest.mock('../../../utils/SituationReport', () => ({
  fetchFromDatabase: jest.fn(),
  getNameAndSurname: jest.fn().mockReturnValue(['John', 'Doe']),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('SituationReportConsultationScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
  };

  const mockSituationReport = {
    remarks: 'Test remarks',
    reportDate: '2024-12-19T10:00:00.000Z',
    leavingTenant: JSON.stringify({ name: 'John', surname: 'Doe' }),
    reportForm: 'reportFormData',
  };

  const mockReportData = [
    'Test Report Name',
    [['Group1', [['Item1', 0]]], ['Group2', [['Item2', 1]]]]
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      tenant: { apartmentId: 'test-apartment' },
    });
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (getSituationReport as jest.Mock).mockResolvedValue(mockSituationReport);
    (fetchFromDatabase as jest.Mock).mockResolvedValue(mockReportData);
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<SituationReportConsultationScreen />);
    expect(getByText('Loading your situation report')).toBeTruthy();
  });

  it('renders report data after loading', async () => {
    const { getByText } = render(<SituationReportConsultationScreen />);

    await waitFor(() => {
      expect(getByText('Test Report Name')).toBeTruthy();
      expect(getByText('Leaving tenant : John Doe')).toBeTruthy();
      expect(getByText('Created the : 2024-12-19')).toBeTruthy();
      expect(getByText('Test remarks')).toBeTruthy();
    });
  });

  it('handles go back button press', async () => {
    const { getByTestId } = render(<SituationReportConsultationScreen />);

    await waitFor(() => {
      const backButton = getByTestId('go-back-button');
      fireEvent.press(backButton);
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('handles error when fetching situation report', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');
    (getSituationReport as jest.Mock).mockRejectedValue(new Error('Fetch error'));

    render(<SituationReportConsultationScreen />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching situation reports: ',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles missing apartment id', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log');
    (useAuth as jest.Mock).mockReturnValue({ tenant: { apartmentId: null } });

    render(<SituationReportConsultationScreen />);

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Invalid apartment id: ',
        null
      );
    });

    consoleLogSpy.mockRestore();
  });

  it('handles invalid situation report', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log');
    (getSituationReport as jest.Mock).mockResolvedValue(null);

    render(<SituationReportConsultationScreen />);

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Invalid situation report: ',
        null
      );
    });

    consoleLogSpy.mockRestore();
  });
});