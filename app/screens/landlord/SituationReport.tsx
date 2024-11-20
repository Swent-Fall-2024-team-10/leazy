import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import TickingBox from "@/app/components/forms/TickingBox";
import Header from "@/app/components/Header";
import { appStyles, ButtonDimensions, Color, FontSizes, FontWeight } from "@/styles/styles";
import InputField from "@/app/components/forms/text_input";
import StraightLine from "@/app/components/SeparationLine";
import SubmitButton from "@/app/components/buttons/SubmitButton";

const SituationReportLayout = [1, "floor", 0, 1, "wall", 0, 1, "ceiling", 0, 1, "window", 0];

export default function SituationReport() {




    // Component representing a single situation report item
    const SituationReportItem = ({ label, n }: { label: string, n: number }) => {
        const [checked1, setChecked1] = useState(false);
        const [checked2, setChecked2] = useState(false);
        const [checked3, setChecked3] = useState(false);
        
        return (
        <View style={styles.item}>
            <View style={styles.itemRow}>
                <Text style={styles.text}>{n} : {label}</Text>
                <TickingBox checked={checked1} onChange={setChecked1} />
                <TickingBox checked={checked2} onChange={setChecked2} />
                <TickingBox checked={checked3} onChange={setChecked3} />
            </View>
        </View>
        );
    };
    
    function TenantNameGroup({ label }: { label: string }) {
        const width = 140;
        return (
            <View style={styles.tenantGroup}>
                <View style={styles.tenantRow}>
                    <Text style={styles.tenantLabel}>{label}</Text>
                    <InputField
                        value={""}
                        setValue={() => {}}
                        placeholder="Name"
                        height={40} // Increased height for the input field
                        width={width}
                        backgroundColor={Color.TextInputBackground}
                        radius={20}
                        testID="testNameField"
                    />
                </View>

                <View style={[styles.tenantRow2, { justifyContent: 'flex-end' }]}>
                    <InputField
                        value={""}
                        setValue={() => {}}
                        placeholder="Surname"
                        height={40} // Increased height for the input field
                        width={width}
                        backgroundColor={Color.TextInputBackground}
                        radius={20}
                        testID="testSurnameField"
                        style={{ justifyContent: 'flex-end' }}
                    />
                </View>
            </View>
        );
    }


    return (
        <Header>
            <ScrollView style={appStyles.screenContainer}>
                <Text style={appStyles.screenHeader}>Situation Report Form</Text>
                
                <TenantNameGroup label={"Arriving Tenant"}/>
                <TenantNameGroup label={"Leaving Tenant"}/>
                
                <View style={styles.lineContainer}>
                    <View>
                        <Text>OC : Original Condition </Text>
                        <Text>NW : Natural Wear</Text>
                        <Text>AW : Abnormal Wear</Text>
                    </View>
                    
                    <StraightLine />
                </View>
                
                <SituationReportItem label="test" n={1} />
                
                <View style={styles.lineContainer}>
                    <Text style={styles.remark}> Remark :</Text>
                    <StraightLine />
                </View>

                <SubmitButton
                    label="Submit"
                    testID="submit"
                    width={ButtonDimensions.smallButtonWidth}
                    height={ButtonDimensions.smallButtonHeight}
                    disabled={false}
                    textStyle={appStyles.submitButtonText}
                    style={appStyles.submitButton}
                    onPress={() => {}}
                />

            </ScrollView>
        </Header>
    );
}

const styles = StyleSheet.create({
    lineContainer: {
        marginBottom: '5%',
        marginTop: '5%',
    },

    labels : {

    },

    remark : {
        color: Color.ButtonBackground, /* Purple border */
        marginBottom: '2%',
        fontSize: FontSizes.label,
        fontWeight: FontWeight.label,
    },

    item: {
        backgroundColor: "#f2f2f2", /* Light gray background */
        borderWidth: 0.5,
        borderColor: "#A3A3A3CC", /* Purple border */
        borderRadius: 15, /* Rounded corners */
        height: '15%',
        justifyContent: "center", 
        padding: '2%',
    },

    itemRow: {
        flexDirection: 'row', /* Align items horizontally */
        alignItems: 'flex-start', /* Align items to the start */
        flexWrap: 'wrap', /* Allow text to wrap to the next line */
    },

    text: {
        fontSize: 20, /* Font size */
        color: "#0f5257", /* Dark green text */
        fontWeight: '600', /* Bold text */
        marginRight: 10, /* Add some spacing between the text and the checkboxes */
        flex: 1, /* Allow the text to take up remaining space */
    },

    checkboxesContainer: {
        flexDirection: 'row', /* Align checkboxes horizontally */
        justifyContent: 'flex-start', /* Align checkboxes to the left */
    },

    tenantLabel: {
        width: "45%",
        fontSize: 20,
        color: "#0f5257", 
        fontWeight: '600',
        marginTop: "2%",
        marginRight: "2%",
        marginLeft: "2%",
        alignSelf: 'flex-start', // Ensure alignment with the input field
    },

    tenantGroup: {
        backgroundColor: "#f2f2f2", /* Light gray background */
        borderWidth: 0.5,
        borderColor: "#A3A3A3CC", /* Purple border */
        borderRadius: 15, /* Rounded corners */
        height: '100%',
        justifyContent: "center", 
        padding: '2%',
        flex: 1,
        marginBottom: '3%',
    },

    tenantRow: {
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: '2%',
    },
    tenantRow2: {
        width: '51%',
        flexDirection: 'row', 
        alignItems: 'flex-end',
        alignSelf: 'flex-end', 
        marginBottom: '2%',
    },
});
