import Header from '@/app/components/Header';
import {
  appStyles,
  ButtonDimensions,
  Color,
  defaultButtonRadius,
  textInputHeight,
} from '@/styles/styles';
import { useCallback, useState } from 'react';
import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import StraightLine from '../../../components/SeparationLine';
import {
  layoutCreationStyles,
  situationReportStyles,
} from '../../../../styles/SituationReportStyling';
import TickingBox from '../../../components/forms/TickingBox';
import {
  addGroupToLayout,
  addSingleItemToGroup,
  removeGroupFromLayout,
  removeItemFrom,
  toDatabaseFormat,
} from '../../../utils/SituationReport';
import SubmitButton from '@/app/components/buttons/SubmitButton';
import InputField from '@/app/components/forms/text_input';
import { KeyboardAvoidingView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  addSituationReportLayout,
} from '@/firebase/firestore/firestore';

type RemoveSingleProps = {
  layout: [string, [string, number][]][];
  groupId: number;
  itemId: number;
  setTempLayout: (newLayout: [string, [string, number][]][]) => void;
  testID: string;
};

export function RemoveSingleInGroup({
  layout,
  groupId,
  itemId,
  setTempLayout,
  testID,
}: RemoveSingleProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={layoutCreationStyles.addButton}
      onPress={() => {
        let nextLayout = removeItemFrom(layout, itemId, groupId);
        setTempLayout(nextLayout);
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Icon
          name='remove'
          size={20}
          color='white'
          backgroundColor={'red'}
          style={{ borderRadius: defaultButtonRadius }}
        />
      </View>
    </TouchableOpacity>
  );
}

type RemoveGroupButtonProps = {
  layout: [string, [string, number][]][];
  groupIndex: number;
  setTempLayout: (newLayout: [string, [string, number][]][]) => void;
  testID: string;
};

export function RemoveGroupButton({
  layout,
  groupIndex,
  setTempLayout,
  testID,
}: RemoveGroupButtonProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={layoutCreationStyles.addButton}
      onPress={() => {
        let nextLayout = removeGroupFromLayout(layout, groupIndex);
        setTempLayout(nextLayout);
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Icon
          name='remove'
          size={20}
          color='white'
          backgroundColor={'red'}
          style={{ borderRadius: defaultButtonRadius }}
        />
      </View>
    </TouchableOpacity>
  );
}

type SituationReportItemProps = {
  label: string;
  layout: [string, [string, number][]][];
  setLayout: (a: [string, [string, number][]][]) => void;
  itemIndex: number;
  groupIndex: number;
  editMode: boolean;
};
/**
 * represent a situation report item where the check boxes are displayed but not functional
 *
 *
 *
 * */
function SituationReportItem({
  label,
  layout,
  setLayout,
  itemIndex,
  groupIndex,
  editMode,
}: SituationReportItemProps) {
  const [itemName, setItemName] = useState(label);

  const handleItemNameChange = useCallback(
    (newName: string) => {
      setItemName(newName);
      const updatedLayout = [...layout];
      updatedLayout[groupIndex][1][itemIndex][0] = newName; // Update item name in layout
      setLayout(updatedLayout);
    },
    [layout, groupIndex, itemIndex, setLayout],
  );

  const [itemNumber, itemText] = label.split(': ');

  return (
    <View style={situationReportStyles.item}>
      <View style={situationReportStyles.itemRow}>
        {editMode ? (
          <InputField
            value={itemText}
            setValue={handleItemNameChange}
            placeholder='Item Name'
            testID={`item-name-input-${groupIndex}-${itemIndex}`}
            style={layoutCreationStyles.inputField}
            height={textInputHeight}
            width={ButtonDimensions.fullWidthButtonWidth}
            backgroundColor={Color.TextInputBackground}
          />
        ) : (
          <Text
            style={[situationReportStyles.text, situationReportStyles.label]}
          >
            {itemNumber} : {itemText}
          </Text>
        )}

        <TickingBox checked={false} onChange={() => {}} />
        <TickingBox checked={false} onChange={() => {}} />
        <TickingBox checked={false} onChange={() => {}} />
      </View>
    </View>
  );
}

type GroupedSituationReportProps = {
  layout: [string, [string, number][]][]; // Layout containing groups and items
  editMode: boolean; // Whether the layout is in edit mode this will allow the user to add new groups or items while in edit mode
  setTempLayout: (newLayout: [string, [string, number][]][]) => void;
  tempLayout: [string, [string, number][]][];
};

export function GroupedSituationReport({
  layout,
  editMode,
  setTempLayout,
  tempLayout,
}: GroupedSituationReportProps) {
  const handleGroupNameChange = useCallback(
    (groupIndex: number, newName: string) => {
      const updatedLayout = [...tempLayout];
      updatedLayout[groupIndex][0] = newName;
      setTempLayout(updatedLayout);
    },
    [tempLayout, setTempLayout],
  );

  let itemCounter = 1;

  return (
    <View>
      {layout.map((group, groupIndex) => {
        const groupName = group[0];
        const items = group[1];

        if (items.length > 1) {
          return (
            <View key={groupIndex} style={situationReportStyles.groupContainer}>
              {editMode ? (
                <InputField
                  value={groupName}
                  setValue={(newName) =>
                    handleGroupNameChange(groupIndex, newName)
                  }
                  placeholder={groupName}
                  testID={`group-name-input-${groupIndex}`}
                  style={layoutCreationStyles.inputField}
                  height={textInputHeight}
                  width={ButtonDimensions.fullWidthButtonWidth}
                  backgroundColor={Color.TextInputBackground}
                />
              ) : (
                <Text style={situationReportStyles.groupLabel}>
                  {groupName} :
                </Text>
              )}

              {items.map((item, itemIndex) => {
                const itemNumber = itemCounter++;
                return (
                  <View
                    key={itemIndex}
                    style={[
                      situationReportStyles.groupItemContainer,
                      situationReportStyles.removeContainer,
                    ]}
                  >
                    <View>
                      {editMode && (
                        <RemoveSingleInGroup
                          itemId={itemIndex}
                          testID={'remove-element-id-' + groupIndex}
                          layout={tempLayout}
                          groupId={groupIndex}
                          setTempLayout={setTempLayout}
                        />
                      )}
                    </View>

                    <View style={{ flex: 100 }}>
                      <SituationReportItem
                        label={`${itemNumber}: ${item[0]}`} // Label with item number
                        layout={tempLayout}
                        setLayout={setTempLayout}
                        itemIndex={itemIndex}
                        groupIndex={groupIndex}
                        editMode={editMode}
                      />
                    </View>
                  </View>
                );
              })}
              {editMode && (
                <AddItemButton
                  label='Add New Item'
                  testID={'add-item-button-group-' + groupName}
                  buttonStyle={layoutCreationStyles.addButton}
                  textStyle={layoutCreationStyles.buttonText}
                  onPress={() => {
                    let nextLayout = addSingleItemToGroup(
                      tempLayout,
                      ['New Item', 0],
                      groupIndex,
                    );
                    setTempLayout(nextLayout);
                    console.log('Add new item');
                    console.log(tempLayout);
                    console.log(groupIndex);
                  }}
                />
              )}
            </View>
          );
        } else {
          const itemNumber = itemCounter++;
          return (
            <View
              key={groupIndex}
              style={situationReportStyles.singleItemContainer}
            >
              <View style={situationReportStyles.removeContainer}>
                <View>
                  {editMode && (
                    <RemoveGroupButton
                      testID={'remove-element-id-' + groupIndex}
                      layout={tempLayout}
                      groupIndex={groupIndex}
                      setTempLayout={setTempLayout}
                    />
                  )}
                </View>
                <View style={{ flex: 100 }}>
                  <SituationReportItem
                    label={`${itemNumber}: ${items[0][0]}`}
                    setLayout={setTempLayout}
                    layout={tempLayout}
                    itemIndex={0}
                    groupIndex={groupIndex}
                    editMode={editMode}
                  />
                </View>
              </View>
            </View>
          );
        }
      })}
    </View>
  );
}

type AddItemButtonProps = {
  label: string;
  testID: string;
  buttonStyle: any;
  textStyle: any;
  onPress: () => void;
};

export function AddItemButton({
  label,
  testID,
  buttonStyle,
  textStyle,
  onPress,
}: AddItemButtonProps) {
  return (
    <TouchableOpacity testID={testID} style={buttonStyle} onPress={onPress}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Icon
          name='add'
          size={20}
          color='white'
          backgroundColor={'green'}
          style={{ borderRadius: defaultButtonRadius }}
        />

        <Text style={textStyle}> {label} </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SituationReportCreation() {
  const navigation = useNavigation();
  const [layout, setLayout] = useState<[string, [string, number][]][]>([]);
  const [editMode, setEditMode] = useState(false);
  const [tempLayout, setTempLayout] = useState<[string, [string, number][]][]>(
    [],
  );

  const [situationReportName, setSituationReportName] = useState('');

  function resetStates() {
    setLayout([]);
    setSituationReportName('');
    setEditMode(false);
    setTempLayout([]);
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetStates();
      };
    }, []),
  );

  return (
    <Header>
      <KeyboardAvoidingView
        behavior='padding'
        style={appStyles.screenContainer}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets={true}
          removeClippedSubviews={true}
        >
          <View style={{ marginBottom: '90%', paddingBottom: '30%' }}>
            <Text style={appStyles.screenHeader}>
              Situation Report : Layout Creation{' '}
            </Text>

            <View>
              <View
                style={[
                  situationReportStyles.itemRow,
                  layoutCreationStyles.layoutNameContainer,
                ]}
              >
                <Text style={appStyles.inputFieldLabel}> Layout Name : </Text>
                <InputField
                  value={situationReportName}
                  setValue={(newName) => setSituationReportName(newName)}
                  placeholder={'Situation Report Name'}
                  testID={'situation-report-name'}
                  height={textInputHeight}
                  width={ButtonDimensions.fullWidthButtonWidth}
                  backgroundColor={Color.TextInputBackground}
                />
              </View>
            </View>

            <View style={situationReportStyles.layoutCreationSeparationLine}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginBottom: '2%' }}>
                  <Text testID='OC-description'>OC = Original Condition </Text>
                  <Text testID='NW-description'>NW = Natural Wear</Text>
                  <Text testID='AW-description'>AW = Abnormal Wear</Text>
                </View>

                <View style={situationReportStyles.labels}>
                  <Text
                    testID='OC-tag'
                    style={situationReportStyles.wearStatus}
                  >
                    OC
                  </Text>
                  <Text
                    testID='NW-tag'
                    style={situationReportStyles.wearStatus}
                  >
                    NW
                  </Text>
                  <Text
                    testID='AW-tag'
                    style={situationReportStyles.wearStatus}
                  >
                    AW
                  </Text>
                </View>
              </View>

              <StraightLine />
            </View>

            {editMode ? (
              <View style={layoutCreationStyles.cancelOrSaveContainer}>
                <Button
                  testID='cancel-button'
                  title='Cancel'
                  titleStyle={appStyles.submitButtonText}
                  onPress={() => {
                    setLayout(layout);
                    setTempLayout(layout);
                    setEditMode(false);
                  }}
                  buttonStyle={[
                    appStyles.buttonCancel,
                    layoutCreationStyles.layoutModificationButton,
                  ]}
                />

                <Button
                  testID='save-button'
                  title='Save'
                  titleStyle={appStyles.submitButtonText}
                  onPress={() => {
                    setLayout(tempLayout);
                    setTempLayout(layout);
                    setEditMode(false);
                  }}
                  buttonStyle={[
                    appStyles.buttonAccept,
                    layoutCreationStyles.layoutModificationButton,
                  ]}
                />
              </View>
            ) : (
              <View style={layoutCreationStyles.editButton}>
                <Button
                  testID='edit-button'
                  title='Edit'
                  titleStyle={appStyles.submitButtonText}
                  onPress={() => {
                    setEditMode(true);
                    setTempLayout(layout);
                  }}
                  buttonStyle={[
                    appStyles.buttonAccept,
                    layoutCreationStyles.layoutModificationButton,
                  ]}
                />
              </View>
            )}

            {layout.length === 0 && !editMode ? (
              <Text style={appStyles.emptyListText}>
                {' '}
                Tap the "Edit" button to start creating a new situation report
                layout{' '}
              </Text>
            ) : editMode ? (
              <GroupedSituationReport
                layout={tempLayout}
                editMode={editMode}
                setTempLayout={setTempLayout}
                tempLayout={tempLayout}
              />
            ) : (
              <GroupedSituationReport
                layout={layout}
                editMode={editMode}
                setTempLayout={setTempLayout}
                tempLayout={tempLayout}
              />
            )}

            {editMode && (
              <View style={layoutCreationStyles.addButtonContainer}>
                <AddItemButton
                  label='Add New Group'
                  testID='add-group-button'
                  buttonStyle={[
                    layoutCreationStyles.addButton,
                    layoutCreationStyles.globalButton,
                  ]}
                  textStyle={[layoutCreationStyles.buttonText]}
                  onPress={() => {
                    let nextLayout = addGroupToLayout(
                      tempLayout,
                      [
                        ['New Item 1', 0],
                        ['New Item 2', 0],
                      ],
                      'New Group',
                    );
                    setTempLayout(nextLayout);
                    console.log('Add new group');
                  }}
                />

                <AddItemButton
                  label='Add New Single Item'
                  testID='add-single-item-button'
                  buttonStyle={[
                    layoutCreationStyles.addButton,
                    layoutCreationStyles.globalButton,
                  ]}
                  textStyle={layoutCreationStyles.buttonText}
                  onPress={() => {
                    let nextLayout = addGroupToLayout(
                      tempLayout,
                      [['New Item', 0]],
                      'New Group',
                    );
                    setTempLayout(nextLayout);
                  }}
                />
              </View>
            )}
            {situationReportName === '' && (
              <Text style={[appStyles.emptyListText]}>
                {' '}
                Situation Report Name cannot be empty !{' '}
              </Text>
            )}

            <View
              style={[
                appStyles.submitContainer,
                situationReportStyles.submitMargin,
              ]}
            >
              <SubmitButton
                disabled={layout.length === 0 || situationReportName === ''}
                label='Submit'
                testID='submit-button'
                width={ButtonDimensions.mediumButtonWidth}
                height={ButtonDimensions.mediumButtonHeight}
                style={appStyles.submitButton}
                textStyle={appStyles.submitButtonText}
                onPress={() => {
                  const reportLayout = [
                    toDatabaseFormat(layout, situationReportName),
                  ];
                  const residenceId = 'GpcR4a8vz8L8SIpe3TbE';
                  addSituationReportLayout(reportLayout, residenceId);
                  navigation.navigate('ListIssues' as never);
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Header>
  );
}
