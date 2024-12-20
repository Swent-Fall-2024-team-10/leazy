import Header from '../../../components/Header';
import { appStyles, Color, IconDimension } from '../../../../styles/styles';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GroupedSituationReport } from './SituationReportScreen';
import { useAuth } from '../../../context/AuthContext';
import { getSituationReport } from '../../../../firebase/firestore/firestore';
import { fetchFromDatabase, getNameAndSurname } from '../../../utils/SituationReport';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { reportConsStyles, situationReportStyles } from '../../../../styles/SituationReportStyling';
import { SituationReportLabel } from './SituationReportCreationScreen';

export default function SituationReportConsultationScreen() {
    const navigation = useNavigation();
    const { tenant } = useAuth();
    const [reportName, setReportName] = useState("");
    const [reportDate, setReportDate] = useState("");
    const [leavingTenant, setLeavingTenant] = useState("");
    const [layout, setReportLayout] = useState<[string, [string, number][]][]>([]);
    const [remarks, setRemarks] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    async function fetchSituationReports() {
        try {
            if (!tenant?.apartmentId) {
                console.log("Invalid apartment id: ", tenant?.apartmentId);
                return;
            }

            const situationReport = await getSituationReport(tenant.apartmentId);
            if (!situationReport) {
                console.log("Invalid situation report: ", situationReport);
                return;
            }

            console.log("Situation report date: ", situationReport);
            setRemarks(situationReport.remarks);
            setReportDate(situationReport.reportDate.split("T")[0]);
            const [name, surname] = getNameAndSurname(situationReport.leavingTenant);
            setLeavingTenant(`${name} ${surname}`);
            const [reportName, reportLayout] = await fetchFromDatabase(situationReport.reportForm);
            setReportName(reportName);
            setReportLayout(reportLayout);
        } catch (error) {
            console.error("Error fetching situation reports: ", error);
        } finally {
            setIsLoading(false); 
        }
    }

    useEffect(() => {
        fetchSituationReports();
    }, []);

    if (isLoading) {
        return (
            <View style={[appStyles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Color.ButtonBackground} />
                <Text>Loading your situation report</Text>
            </View>
        );
    }

    return (
        <Header>
            <ScrollView>
                <View style={{ marginBottom: '50%', paddingBottom: '30%' }}>
                    <View style={situationReportStyles.backButton}>
                        <TouchableOpacity
                            testID="go-back-button"
                            onPress={() => {
                                navigation.goBack();
                            }}
                        >
                            <Icon name="arrow-back" size={IconDimension.mediumIcon} color={Color.ButtonBackground} />
                        </TouchableOpacity>
                    </View>

                    <View style={[appStyles.screenContainer]}>
                        <Text style={[appStyles.screenHeader, reportConsStyles.reportHeader]}>{reportName}</Text>
                        
                        <Text style={appStyles.inputFieldLabel}>Leaving tenant : {leavingTenant}</Text>

                        <Text style={appStyles.inputFieldLabel}>Created the : {reportDate}</Text>
                        
                        <SituationReportLabel />

                        <View style={situationReportStyles.reportContainer}>
                            <GroupedSituationReport
                                layout={layout}
                                setReset={() => {}}
                                changeStatus={() => {}}
                                resetState={false}
                                changeAllowed={false}
                            />

                            <View style={situationReportStyles.remarkTextContainer}>
                                <Text style={situationReportStyles.remarkText}>{remarks}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Header>
    );
}
