import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import SituationReportCreation, {
  RemoveSingleInGroup,
  RemoveGroupButton,
  GroupedSituationReport,
  SituationReportItem,
} from '../../app/screens/landlord/SituationReport/SituationReportCreationScreen';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '../context/AuthContext';

const mockAuthProvider = {
  firebaseUser: null,
  fetchUser: jest.fn(),
  fetchTenant: jest.fn(),
  fetchLandlord: jest.fn(),
};
describe('SituationReportCreation', () => {
  it('renders the component and displays initial UI elements', () => {
    render(
      <AuthProvider {...mockAuthProvider}>
        <NavigationContainer>
            <SituationReportCreation />
        </NavigationContainer>
      </AuthProvider>
    );
    expect(screen.getByText('Situation Report : Layout Creation')).toBeTruthy();
    expect(screen.getByText('Layout Name :')).toBeTruthy();
    expect(screen.getByText('Tap the "Edit" button to start creating a new situation report layout')).toBeTruthy();
    expect(screen.getByTestId('edit-button')).toBeTruthy();
  });

  it('enables edit mode when the edit button is clicked', () => {
    render(
      <AuthProvider {...mockAuthProvider}>
        <NavigationContainer>
            <SituationReportCreation />
        </NavigationContainer>
      </AuthProvider>
    );
    const editButton = screen.getByTestId('edit-button');
    fireEvent.press(editButton);
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('allows adding a new group in edit mode', () => {
    render(
      <AuthProvider {...mockAuthProvider}>
        <NavigationContainer>
            <SituationReportCreation />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.press(screen.getByTestId('edit-button'));
    const addGroupButton = screen.getByTestId('add-group-button');
    fireEvent.press(addGroupButton);
    expect(screen.getByTestId('item-name-input-0-1')).toBeTruthy();
  });

  it('adds a new item to a group', () => {
    render(
      <AuthProvider {...mockAuthProvider}>
        <NavigationContainer>
            <SituationReportCreation />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.press(screen.getByTestId('edit-button'));
    fireEvent.press(screen.getByTestId('add-group-button'));
    fireEvent.press(screen.getByTestId('add-item-button-group-New Group'));
    expect(screen.getByTestId('item-name-input-0-1')).toBeTruthy();
    expect(screen.getByTestId('item-name-input-0-2')).toBeTruthy();

  });

  it('removes an item from a group', () => {
    const tempLayout: [string, [string, number][]][] = [['Group 1', [['Item 1', 0], ['Item 2', 0]]]];
    render(
      <RemoveSingleInGroup
        layout={tempLayout}
        groupId={0}
        itemId={0}
        setTempLayout={(newLayout) => {
          expect(newLayout[0][1].length).toBe(1);
        }}
        testID={'remove-element-id-0'}
      />
    );
    fireEvent.press(screen.getByTestId('remove-element-id-0'));
  });

  it('removes a group from the layout', () => {
    const tempLayout: [string, [string, number][]][] = [['Group 1', [['Item 1', 0]]]];
    render(
      <RemoveGroupButton
        layout={tempLayout}
        groupIndex={0}
        setTempLayout={(newLayout) => {
          expect(newLayout.length).toBe(0);
        }}
        testID={'remove-element-id-0'}
      />
    );
    fireEvent.press(screen.getByTestId('remove-element-id-0'));
  });

  it('prevents submission if layout or name is empty', () => {
    render(
      <AuthProvider {...mockAuthProvider}>
        <NavigationContainer>
            <SituationReportCreation />
        </NavigationContainer>
      </AuthProvider>
    );
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  it('submits the layout if all fields are valid', () => {
    render(
      <AuthProvider {...mockAuthProvider}>
        <NavigationContainer>
            <SituationReportCreation />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.press(screen.getByTestId('edit-button'));
    fireEvent.changeText(screen.getByTestId('situation-report-name'), 'Test Report');
    fireEvent.press(screen.getByTestId('add-group-button'));
    fireEvent.press(screen.getByTestId('save-button'));
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).not.toBeDisabled();
    fireEvent.press(submitButton);
  });

  it('resets layout and state on focus change', () => {
    render(
      <AuthProvider {...mockAuthProvider}>
        <NavigationContainer>
            <SituationReportCreation />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.press(screen.getByTestId('edit-button'));
    fireEvent.press(screen.getByTestId('cancel-button'));
    expect(screen.queryByText('New Group')).toBeFalsy();
  });

  it('editing, adding and tapping cancel button should not save the layout', () => {
    render(
      <AuthProvider {...mockAuthProvider}>
        <NavigationContainer>
            <SituationReportCreation />
        </NavigationContainer>
      </AuthProvider>
    );
    fireEvent.press(screen.getByTestId('edit-button'));
    fireEvent.press(screen.getByTestId('add-group-button'));
    fireEvent.press(screen.getByTestId('add-item-button-group-New Group'));
    fireEvent.press(screen.getByTestId('cancel-button'));
    expect(screen.queryByText('New Group')).toBeFalsy();

  });
});

describe('GroupedSituationReport', () => {
  const layoutMock: [string, [string, number][]][] = [
    ['Group 1', [['Item 1', 0], ['Item 2', 0]]],
    ['Group 2', [['Item 2', 0]]],
  ];

  it('should trigger handleGroupNameChange when editing group name', () => {
    const setLayoutMock = jest.fn(); // Mock function to track changes
    const { getByTestId } = render(
      <GroupedSituationReport
        layout={layoutMock}
        tempLayout={layoutMock}
        setTempLayout={setLayoutMock}
        editMode={true} // Ensure edit mode is enabled
      />
    );

    const inputField = getByTestId('group-name-input-0');

    // Simulate user input
    fireEvent.changeText(inputField, 'Updated Group Name');

    // Assert that setLayout was called with the updated layout
    expect(setLayoutMock).toHaveBeenCalledWith([
      ['Updated Group Name', [['Item 1', 0], ['Item 2', 0]]],
      ['Group 2', [['Item 2', 0]]],
    ]);
  });
});
describe('SituationReportItem', () => {
  const layoutMock: [string, [string, number][]][] = [
    ['Group 1', [['Item 1', 0]]],
    ['Group 2', [['Item 2', 0]]],
  ];

  it('should trigger handleItemNameChange when editing item name', () => {
    const setLayoutMock = jest.fn(); // Mock function to track changes
    const { getByTestId } = render(
      <SituationReportItem
        label="1: Item 1"
        layout={layoutMock}
        setLayout={setLayoutMock}
        itemIndex={0}
        groupIndex={0}
        editMode={true} // Ensure edit mode is enabled
      />
    );

    const inputField = getByTestId('item-name-input-0-0');

    // Simulate user input
    fireEvent.changeText(inputField, 'Updated Item Name');

    // Assert that setLayout was called with the updated layout
    expect(setLayoutMock).toHaveBeenCalledWith([
      ['Group 1', [['Updated Item Name', 0]]],
      ['Group 2', [['Item 2', 0]]],
    ]);
  });
});


