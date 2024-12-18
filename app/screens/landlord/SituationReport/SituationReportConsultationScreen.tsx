import Header from '@/app/components/Header';
import { appStyles, Color, IconDimension } from '@/styles/styles';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GroupedSituationReport } from './SituationReportScreen';
import { useAuth } from '../../../context/AuthContext';
import { getSituationReport } from '@/firebase/firestore/firestore';
import { fetchFromDatabase } from '@/app/utils/SituationReport';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { reportConsStyles, situationReportStyles } from '@/styles/SituationReportStyling';
import { SituationReportLabel } from './SituationReportCreationScreen';


export default function SituationReportConsultationScreen() {
    const navigation = useNavigation();
    const { tenant } = useAuth();
    const [reportName, setReportName] = useState("");
    const [layout, setReportLayout] = useState<[string, [string, number][]][]>([]);
    const [remarks, setRemarks] = useState<string>("");
    
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
        setRemarks(situationReport.remarks);
        const [reportName, reportLayout] = await fetchFromDatabase(situationReport.reportForm)
        setReportName(reportName);
        setReportLayout(reportLayout);
    }

    useEffect(() => {
            fetchSituationReports()
        }, []);

    return (
    <Header>
        <ScrollView>
            <View style={{ marginBottom: '50%', paddingBottom: '30%' }}>

                <View>
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
                    
                    <SituationReportLabel/>

                    <View style={situationReportStyles.reportContainer}>
                        <GroupedSituationReport
                            layout={layout}
                            setReset={() => {}}
                            changeStatus={() => {}}
                            resetState={false}
                            changeAllowed={false}
                        />

                        <View style={situationReportStyles.remarkTextContainer}>
                            <Text style={situationReportStyles.remarkText}>
                                {remarks}
                            </Text>
                        </View>

                    </View>
                </View>
            </View>
        </ScrollView>
    </Header>
  );
}

