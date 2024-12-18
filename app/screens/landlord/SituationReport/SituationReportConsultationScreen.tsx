import Header from '@/app/components/Header';
import { appStyles, ButtonDimensions, Color, IconDimension } from '@/styles/styles';
import React, { useEffect, useState } from 'react';
import { View, Text, Touchable, TouchableOpacity } from 'react-native';
import { GroupedSituationReport } from './SituationReportCreationScreen';
import { useAuth } from '../../../context/AuthContext';
import { getApartment, getSituationReport } from '@/firebase/firestore/firestore';
import { fetchFromDatabase } from '@/app/utils/SituationReport';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { reportConsStyles, situationReportStyles } from '@/styles/SituationReportStyling';


export default function SituationReportConsultationScreen() {
    const navigation = useNavigation();
    const { tenant } = useAuth();
    const [reportName, setReportName] = useState("");
    const [layout, setReportLayout] = useState<[string, [string, number][]][]>([]);
    
    async function fetchSituationReports() {
        if(!tenant?.apartmentId){
            console.log("Invalid apartment id : ", tenant?.apartmentId);
            return
        }


        const situationReport = await getSituationReport(tenant.apartmentId);

        if (!situationReport){
            console.log("Invalid situation report : ", situationReport);
            return
        }
        console.log("situation report: ", situationReport.situationReport)
        console.log("situation report ID: ", situationReport.reportForm)
        const [reportName, reportLayout] = await fetchFromDatabase(situationReport.reportForm)
        setReportName(reportName);
        setReportLayout(reportLayout);
        console.log("reportName: ", reportName)
        console.log("reportName: ", reportName)
        console.log("layout: ", reportLayout)
        console.log("fecthing done properly")
    }

    useEffect(() => {
            fetchSituationReports()
        }, []);

    return (
    <Header>
        <ScrollView>
            <View style={appStyles.backButton}>
                <TouchableOpacity
                    testID='go-back-button'
                    onPress={() => {
                        navigation.goBack()
                    }}
                >
                    <Icon name="arrow-back" size={IconDimension.mediumIcon} color={Color.ButtonBackground} />
                </TouchableOpacity>
            </View>
            

            <View style={[appStyles.screenContainer, reportConsStyles.screenContainer]}>
                <Text style={appStyles.screenHeader}>{reportName}</Text>
                <GroupedSituationReport
                    layout={layout}
                    editMode={false}
                    setTempLayout={() => {}}
                    tempLayout={[]}
                />
            </View>
        </ScrollView>
    </Header>
  );
}

