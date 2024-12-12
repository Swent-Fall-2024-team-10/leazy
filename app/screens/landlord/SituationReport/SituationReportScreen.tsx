import React, { useState, useEffect, useRef } from 'react';
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import TickingBox from '../../../components/forms/TickingBox';
import Header from '../../../components/Header';
import {
  appStyles,
  ButtonDimensions,
  Color,
} from '../../../../styles/styles';
import InputField from '../../../components/forms/text_input';
import StraightLine from '../../../components/SeparationLine';
import SubmitButton from '../../../components/buttons/SubmitButton';
import RNPickerSelect from 'react-native-picker-select';
import { changeStatus, fetchApartmentNames, fetchResidences, fetchSituationReportLayout, toDatabase } from '../../../utils/SituationReport';
import {
  addSituationReport,
} from '../../../../firebase/firestore/firestore';
import { SituationReport } from '../../../../types/types';
import {
  pickerSelectStyles,
  situationReportStyles,
} from '../../../../styles/SituationReportStyling';
import { useAuth } from '../../../context/AuthContext';

enum enumStatus {
  OC = 1,
  NW = 2,
  AW = 3,
  NONE = 0,
}

type PickerItem = {
  label: string;
  value: string | number | [string, [string, number][]][];
};

type GroupedSituationReportProps = {
  layout: [string, [string, number][]][]; // Layout containing groups and items
  changeStatus: (
    layout: [string, [string, number][]][],
    groupIndex: number,
    itemIndex: number,
    newStatus: string,
  ) => void;
  resetState: boolean;
  setReset: (value: boolean) => void;
};

export function GroupedSituationReport({
  layout,
  changeStatus,
  resetState,
  setReset,
}: GroupedSituationReportProps) {

  // Counter for numbering items across the layout
  let itemCounter = 1;

  return (
    <View>
      {layout.map((group, groupIndex) => {
        const groupName = group[0];
        const items = group[1];
        if (items.length > 1) {
          // Render group with more than one item inside a purple container
          return (
            <View key={groupIndex} style={situationReportStyles.groupContainer}>
              <Text style={situationReportStyles.groupLabel}>
                {groupName} :
              </Text>
              {items.map((item, itemIndex) => {
                const itemNumber = itemCounter++;
                return (
                  <View
                    key={itemIndex}
                    style={situationReportStyles.groupItemContainer}
                  >
                    <SituationReportItem
                      label={`${itemNumber}: ${item[0]}`} // Label with item number
                      groupIndex={groupIndex}
                      itemIndex={itemIndex}
                      layout={layout}
                      currentStatus={item[1]} // Current status value
                      changeStatus={changeStatus}
                      resetState={resetState}
                      setReset={setReset}
                    />
                  </View>
                );
              })}
            </View>
          );
        } else {
          // Render single item outside of any group
          const itemNumber = itemCounter++;
          return (
            <View
              key={groupIndex}
              style={situationReportStyles.singleItemContainer}
            >
              <SituationReportItem
                label={`${itemNumber}: ${items[0][0]}`} // Label with item number
                groupIndex={groupIndex}
                itemIndex={0}
                layout={layout}
                currentStatus={items[0][1]} // Current status value
                changeStatus={changeStatus}
                resetState={resetState}
                setReset={setReset}
              />
            </View>
          );
        }
      })}
    </View>
  );
}

// Picker group to select residence and apartment
export function PickerGroup({
  label,
  data,
  chosed,
  testID,
  setValue,
}: {
  testID: string;
  label: string;
  data: PickerItem[];
  chosed: any;
  setValue: (value: any) => void;
}) {
  return (
    <View
      style={[
        appStyles.grayGroupBackground,
        situationReportStyles.pickerContainer,
      ]}
    >
      <Text style={situationReportStyles.label}>{label}</Text>

      <View style={situationReportStyles.pickerWrapper} testID=''>
        <RNPickerSelect
          onValueChange={(value) => setValue(value)}
          items={data}
          value={chosed}
          placeholder={{ label }}
          style={pickerSelectStyles}
        />
      </View>
    </View>
  );
}

type SituationReportItemProps = {
  label: string;
  groupIndex: number; // Index of the group in the layout
  itemIndex: number; // Index of the item within the group
  currentStatus: number; // Current status (0 = OC, 1 = NW, 2 = AW)
  resetState: boolean;
  layout: [string, [string, number][]][];
  setReset: (value: boolean) => void;
  changeStatus: (
    layout: [string, [string, number][]][],
    groupIndex: number,
    itemIndex: number,
    newStatus: string,
  ) => void;
};

const STATUS_MAPPING = ['NONE', 'OC', 'NW', 'AW'];

function SituationReportItem({
  label,
  groupIndex,
  currentStatus,
  itemIndex,
  layout,
  resetState,
  changeStatus,
  setReset,
}: SituationReportItemProps) {
  const [checked, setChecked] = useState<number>(currentStatus);

  useEffect(() => {
    if (resetState) {
      setChecked(0);
      setReset(false);
    }
  }, [resetState]);

  function handleCheck(newStatus: number) {
    if (checked === newStatus) {
      setChecked(0);
      changeStatus(
        layout,
        groupIndex,
        itemIndex,
        STATUS_MAPPING[enumStatus.NONE],
      );
    } else {
      setChecked(newStatus);
      changeStatus(layout, groupIndex, itemIndex, STATUS_MAPPING[newStatus]);
    }
  }

  return (
    <View style={situationReportStyles.item}>
      <View style={situationReportStyles.itemRow}>
        <Text style={[situationReportStyles.text, situationReportStyles.label]}>
          {label}
        </Text>
        <TickingBox
          checked={checked === enumStatus.OC}
          onChange={() => handleCheck(enumStatus.OC)}
        />
        <TickingBox
          checked={checked === enumStatus.NW}
          onChange={() => handleCheck(enumStatus.NW)}
        />
        <TickingBox
          checked={checked === enumStatus.AW}
          onChange={() => handleCheck(enumStatus.AW)}
        />
      </View>
    </View>
  );
}

function TenantNameGroup({
  label,
  testID,
  name,
  surname,
  onNameChange,
  onSurnameChange,
  testIDName,
  testIDSurname,
}: {
  name: string;
  surname: string;
  label: string;
  testID: string;
  testIDName: string;
  testIDSurname: string;
  onSurnameChange: (value: string) => void;
  onNameChange: (value: string) => void;
}) {
  const width = 140;
  return (
    <View style={appStyles.grayGroupBackground}>
      <View style={situationReportStyles.tenantNameContainer}>
        <View style={situationReportStyles.tenantLabelContainer}>
          <Text testID={testID} style={[situationReportStyles.tenantLabel]}>
            {label}
          </Text>
        </View>

        <View
          style={[
            situationReportStyles.tenantRow,
            { justifyContent: 'flex-end', flexDirection: 'column' },
          ]}
        >
          <InputField
            value={name}
            setValue={onNameChange}
            placeholder='Name'
            height={40} // Increased height for the input field
            width={width}
            backgroundColor={Color.TextInputBackground}
            radius={20}
            testID={testIDName}
            style={{ marginBottom: '5%' }}
          />

          <InputField
            value={surname}
            setValue={onSurnameChange}
            placeholder='Surname'
            height={40} // Increased height for the input field
            width={width}
            backgroundColor={Color.TextInputBackground}
            radius={20}
            testID={testIDSurname}
            style={{ justifyContent: 'flex-end' }}
          />
        </View>
      </View>
    </View>
  );
}

export default function SituationReportScreen({ test_enabler = true }: { test_enabler?: boolean }) {
  const [selectedApartment, setSelectedApartment] = useState('');
  const [selectedResidence, setSelectedResidence] = useState('');
  const [remark, setRemark] = useState('');

  const [residencesMappedToName, setResidencesMappedToName] = useState<
    { label: string; value: string }[]
  >([]);

  const [apartmentMappedToName, setApartmentMappedToName] = useState<
    { label: string; value: string }[]
  >([]);

  const [layout, setLayout] = useState<[string, [string, number][]][]>([]);

  const [layoutMappedWithName, setLayoutMappedWithName] = useState<
    { label: string; value: [string, [string, number][]][] }[]
  >([]);

  const [arrivingTenantName, setArrivingTenantName] = useState('');
  const [arrivingTenantSurname, setArrivingTenantSurname] = useState('');

  const [leavingTenantName, setLeavingTenantName] = useState('');
  const [leavingTenantSurname, setLeavingTenantSurname] = useState('');

  const [resetState, setResetState] = useState(false);

  const { landlord } = useAuth();

  useEffect(() => {
    if (landlord) {
      fetchResidences(landlord, setResidencesMappedToName);
    }

    if (selectedResidence !== '' && selectedResidence !== undefined) {
      fetchApartmentNames(selectedResidence, setApartmentMappedToName);
      fetchSituationReportLayout(selectedResidence, setLayoutMappedWithName);
    }
    
  }, [landlord?.residenceIds, selectedResidence]);



  function reset() {
    setRemark('');
    setSelectedResidence('');
    setSelectedApartment('');
    setLayout([]);
    setArrivingTenantName('');
    setArrivingTenantSurname('');
    setLeavingTenantName('');
    setLeavingTenantSurname('');

    setResetState((prev) => !prev);
  }

  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
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
          ref={scrollViewRef}
        >
          <View style={{ marginBottom: '90%', paddingBottom: '30%' }}>
            <Text style={appStyles.screenHeader}>Situation Report Form</Text>

            <PickerGroup
              testID='residence-picker'
              label={'Residence'}
              data={residencesMappedToName}
              chosed={selectedResidence}
              setValue={setSelectedResidence}
            />
            <PickerGroup
              testID='apartment-picker'
              label={'Apartment'}
              data={apartmentMappedToName}
              chosed={selectedApartment}
              setValue={setSelectedApartment}
            />

            <PickerGroup
              testID='layout-picker'
              label={'Situation Report'}
              data={layoutMappedWithName}
              chosed={layout}
              setValue={setLayout}
            />

            <TenantNameGroup
              name={arrivingTenantName}
              onNameChange={setArrivingTenantName}
              surname={arrivingTenantSurname}
              onSurnameChange={setArrivingTenantSurname}
              testID={'arriving-tenant-label'}
              label={'Arriving Tenant'}
              testIDName='arriving-tenant-name'
              testIDSurname='arriving-tenant-surname'
            />

            <TenantNameGroup
              name={leavingTenantName}
              onNameChange={(value) => {
                setLeavingTenantName(value);
              }}
              surname={leavingTenantSurname}
              onSurnameChange={(value) => {
                setLeavingTenantSurname(value);
              }}
              testID={'leavning-tenant-label'}
              label={'Leaving Tenant'}
              testIDName='leaving-tenant-name'
              testIDSurname='leaving-tenant-surname'
            />

            <View style={situationReportStyles.lineContainer}>
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
              



            { layout?.length > 0 ? (

              <GroupedSituationReport
                layout={layout}
                changeStatus={changeStatus}
                resetState={resetState}
                setReset={() => setResetState(false)}
              />
            ) : (

              <Text style={appStyles.emptyListText}>
                Please select a residence and a situation report layout
              </Text>
            )}

            <View style={situationReportStyles.lineContainer}>
              <Text style={situationReportStyles.remark}> Remark :</Text>
              <StraightLine />

              <InputField
                value={remark}
                setValue={(value) => {
                  setRemark(value);
                }}
                placeholder='Enter your remarks here'
                height={100} // Increased height for the input field
                width={Dimensions.get('window').width * 0.85}
                backgroundColor={Color.TextInputBackground}
                radius={20}
                testID='testRemarkField'
                style={{ marginTop: '5%' }}
              />
            </View>

            <View style={appStyles.submitContainer}>
              
              <SubmitButton
                label='Submit'
                testID='submit'
                width={ButtonDimensions.smallButtonWidth}
                height={ButtonDimensions.smallButtonHeight}
                disabled={ test_enabler && (
                  layout === undefined ||
                  layout.length === 0 )
                }
                onPress={async () => {
                  console.log("Pressed")
                  const reportForm = await toDatabase(layout, "Situation Report arrival of " + arrivingTenantName + " " + arrivingTenantSurname);

                  const report: SituationReport = {
                    reportDate: new Date().toISOString(),
                    residenceId: selectedResidence,
                    apartmentId: selectedApartment,
                    arrivingTenant: JSON.stringify({
                      name: arrivingTenantName,
                      surname: arrivingTenantSurname,
                    }),
                    leavingTenant: JSON.stringify({
                      name: leavingTenantName,
                      surname: leavingTenantSurname,
                    }),
                    remarks: remark,
                    reportForm: reportForm,
                  };

                  reset();

                  try {
                    addSituationReport(report, selectedApartment);
                    Alert.alert(
                      'Situation Report',
                      'Situation Report has been successfully submitted',
                    );

                  } catch (error) {
                    console.error('Error adding document: ', error);
                    Alert.alert(
                      'Situation Report',
                      'Failed to submit the situation report please check your connection and try again',
                    );
                  }
                }}
                style={appStyles.submitButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Header>
  );
}
