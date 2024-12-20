import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import {
  getApartment,
  getLandlord,
  getResidence,
  getMaintenanceRequest,
} from "../../../firebase/firestore/firestore";
import {
  Landlord,
  Residence,
  MaintenanceRequest,
  Apartment,
  ResidenceStackParamList,
} from "@/types/types";

import {
  appStyles,
  Color,
  FontSizes,
  stylesForNonHeaderScreens,
} from "../../../styles/styles";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { LandlordStackParamList } from "../../../types/types";

const RoundedRectangle: React.FC<{
  children: React.ReactNode;
  testID?: string;
}> = ({ children, testID }) => (
  <View style={styles.roundedRectangle} testID={testID}>
    {children}
  </View>
);

const LandlordDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<LandlordStackParamList>>();

  if (!user) {
    throw new Error("User not found.");
  }
  const landlordId = user.uid;

  const [residenceList, setResidenceList] = useState<Residence[]>([]);
  const [maintenanceRequestList, setMaintenanceRequestList] = useState<
    MaintenanceRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResidence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const landlord = (await getLandlord(landlordId)) as Landlord;
      if (!landlord) {
        throw new Error("Landlord not found");
      }

      const residencesPromises = landlord.residenceIds.map((resId) =>
        getResidence(resId)
      );
      const residencesResults = await Promise.all(residencesPromises);
      const residences: Residence[] = residencesResults as Residence[];

      const apartmentsPromises: Promise<Apartment>[] = [];
      residences.forEach((residence) => {
        residence.apartments.forEach((apartId) => {
          const apartmentPromise = getApartment(apartId);
          apartmentsPromises.push(
            apartmentPromise.then((apartment) => {
              if (!apartment) {
                throw new Error(`Apartment with ID ${apartId} not found.`);
              }
              return apartment;
            })
          );
        });
      });

      const apartmentsResults = await Promise.all(apartmentsPromises);
      const apartments: Apartment[] = apartmentsResults as Apartment[];
      const maintenanceRequestsPromises: Promise<MaintenanceRequest | null>[] =
        [];
      apartments.forEach((apartment) => {
        apartment.maintenanceRequests.forEach((requestId) => {
          maintenanceRequestsPromises.push(getMaintenanceRequest(requestId));
        });
      });

      const maintenanceRequestsResults = (
        await Promise.all(maintenanceRequestsPromises)
      ).filter((request): request is MaintenanceRequest => request !== null);

      setResidenceList(residences);
      setMaintenanceRequestList(maintenanceRequestsResults);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    fetchResidence();
  }, [fetchResidence]);

  const calculateMaintenanceIssues = useMemo(() => {
    const notStarted = maintenanceRequestList.filter(
      (request) => request.requestStatus === "notStarted"
    ).length;

    const inProgress = maintenanceRequestList.filter(
      (request) => request.requestStatus === "inProgress"
    ).length;

    const completed = maintenanceRequestList.filter(
      (request) => request.requestStatus === "completed"
    ).length;

    let mostRecentRequest: MaintenanceRequest | null = null;
    if (maintenanceRequestList.length > 0) {
      mostRecentRequest = maintenanceRequestList.reduce((latest, current) => {
        const parseDate = (dateString: string) => {
          const [datePart, timePart] = dateString.split(" at ");
          const [day, month, year] = datePart.split("/").map(Number);
          const [hours, minutes] = timePart.split(":").map(Number);
          return new Date(year, month - 1, day, hours, minutes);
        };
        return parseDate(current.requestDate) > parseDate(latest.requestDate)
          ? current
          : latest;
      }, maintenanceRequestList[0]);
    }

    return {
      notStarted,
      inProgress,
      completed,
      mostRecent: mostRecentRequest ? mostRecentRequest : null,
    };
  }, [maintenanceRequestList]);

  const messages = [
    {
      from: "Elisabeth",
      text: "Hi, would it be possible to fix the faucet in the...",
      time: "31 min ago",
    },
  ];

  const handleResidencePress = (residence: Residence) => {
    console.log("Pressed residence", residence);
    navigation.navigate("Residence Stack", {
      screen: "ResidenceList"
    });
  };

  const handleRetry = () => {
    fetchResidence();
  };

  return (
    <View style={{ flex: 1 }} testID="LandlordDashboard_MainView">
      <Header>
        <ScrollView
          style={{ flex: 1, paddingTop: 15 }}
          testID="LandlordDashboard_ScrollView"
        >
          {loading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginTop: 50,
              }}
            >
              <ActivityIndicator
                size="large"
                color={Color.ButtonBackground}
                testID="LandlordDashboard_LoadingIndicator"
              />
              <Text
                testID="LandlordDashboard_LoadingText"
                style={styles.loadingText}
              >
                Loading...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text
                testID="LandlordDashboard_ErrorMessage"
                style={stylesForNonHeaderScreens.errorText}
              >
                {error}
              </Text>
              <TouchableOpacity
                onPress={handleRetry}
                style={styles.retryButton}
                testID="LandlordDashboard_RetryButton"
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Listed Residences */}
              <Text
                testID="LandlordDashboard_ListedResidencesTitle"
                style={styles.sectionTitle}
              >
                Listed Residences
              </Text>
              <RoundedRectangle testID="LandlordDashboard_ListedResidencesContainer">
                {residenceList.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={
                      appStyles.carouselScrollViewContainer
                    }
                    testID="LandlordDashboard_ResidencesScrollView"
                  >
                    {residenceList.map((residence, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          { alignItems: "center" },
                          { marginHorizontal: 10 },
                        ]}
                        testID={`LandlordDashboard_ResidenceItem_${index}`}
                        onPress={() => handleResidencePress(residence)}
                      >
                        <Image
                          source={{
                            uri: residence.pictures?.[0] || "https://www.forster-profile.ch/fileadmin/_processed_/b/4/csm_21_06_00_lay_Vortex-Lausanne_fcc7b3683d.jpg",                          }}
                          style={appStyles.smallThumbnailImage}
                          testID={`LandlordDashboard_ResidenceImage_${index}`}
                        />
                        <Text
                          style={[
                            appStyles.smallCaptionText,
                            {
                              marginTop: 5,
                              fontSize: FontSizes.ButtonText,
                              fontWeight: "600",
                            },
                          ]}
                          testID={`LandlordDashboard_ResidenceName_${index}`}
                        >
                          {residence.residenceName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text
                    testID="LandlordDashboard_NoResidencesText"
                    style={[
                      styles.noMessages,
                      { marginVertical: 10, textAlign: "center" },
                    ]}
                  >
                    No residences available
                  </Text>
                )}
              </RoundedRectangle>

              {/* Maintenance Issues */}
              <Text
                testID="LandlordDashboard_MaintenanceIssuesTitle"
                style={styles.sectionTitle}
              >
                Maintenance Issues
              </Text>
              <RoundedRectangle testID="LandlordDashboard_MaintenanceIssuesContainer">
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                  testID="LandlordDashboard_MaintenanceIssuesRow"
                >
                  <View
                    style={[
                      appStyles.grayGroupBackground,
                      { flex: 1, marginRight: 8, alignItems: "center" },
                    ]}
                  >
                    <Text
                      style={[
                        appStyles.smallCaptionText,
                        { color: Color.notStarted, fontSize: 16 },
                      ]}
                      testID="LandlordDashboard_NotStartedIssues"
                    >
                      {calculateMaintenanceIssues.notStarted} Not Started
                    </Text>
                    <Text
                      style={[
                        appStyles.smallCaptionText,
                        { color: Color.inProgress, fontSize: 16 },
                      ]}
                      testID="LandlordDashboard_InProgressIssues"
                    >
                      {calculateMaintenanceIssues.inProgress} In Progress
                    </Text>
                    <Text
                      style={[
                        appStyles.smallCaptionText,
                        { color: Color.completed, fontSize: 16 },
                      ]}
                      testID="LandlordDashboard_CompletedIssues"
                    >
                      {calculateMaintenanceIssues.completed} Completed
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (calculateMaintenanceIssues.mostRecent) {
                        navigation.navigate("IssueDetails", {
                          requestID:
                            calculateMaintenanceIssues.mostRecent.requestID,
                        });
                      }
                    }}
                    style={[
                      appStyles.grayGroupBackground,
                      { flex: 1, marginLeft: 8, alignItems: "center" },
                    ]}
                  >
                    <Text
                      style={[styles.mostRecentTitle, { marginBottom: 5 }]}
                      testID="LandlordDashboard_MostRecentTitle"
                    >
                      Most recent one:
                    </Text>
                    <Text
                      style={{ fontSize: 16 }}
                      testID="LandlordDashboard_MostRecentIssue"
                    >
                      {calculateMaintenanceIssues.mostRecent
                        ? calculateMaintenanceIssues.mostRecent.requestTitle
                        : "No recent issues"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </RoundedRectangle>

              {/* Messaging */}
              <Text
                testID="LandlordDashboard_NewMessagesTitle"
                style={styles.sectionTitle}
              >
                New Messages
              </Text>
              <RoundedRectangle testID="LandlordDashboard_NewMessagesContainer">
                {messages.length > 0 ? (
                  messages.slice(0, 2).map((message, index) => (
                    <View
                      key={index}
                      style={appStyles.grayGroupBackground}
                      testID={`LandlordDashboard_Message_${index}`}
                    >
                      <Text
                        style={[
                          appStyles.smallCaptionText,
                          { fontSize: 16, marginBottom: 5 },
                        ]}
                        testID={`LandlordDashboard_MessageText_${index}`}
                      >
                        From {message.from}: {message.text}
                      </Text>
                      <Text
                        style={[
                          appStyles.smallCaptionText,
                          { fontSize: 14, color: "gray" },
                        ]}
                        testID={`LandlordDashboard_MessageTime_${index}`}
                      >
                        {message.time}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text
                    testID="LandlordDashboard_NoMessagesText"
                    style={[
                      styles.noMessages,
                      { textAlign: "center", fontSize: 16, color: "gray" },
                    ]}
                  >
                    You have no other messages
                  </Text>
                )}
                {messages.length === 1 && (
                  <Text
                    testID="LandlordDashboard_NoMessagesText"
                    style={[
                      styles.noMessages,
                      { textAlign: "center", fontSize: 16, color: "gray" },
                    ]}
                  >
                    You have no other messages
                  </Text>
                )}
              </RoundedRectangle>
            </>
          )}
        </ScrollView>
      </Header>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginHorizontal: 15,
  },
  roundedRectangle: {
    backgroundColor: Color.TextInputBackground,
    borderRadius: 15,
    padding: "2%",
    marginHorizontal: 15,
    marginBottom: 20,
  },
  noMessages: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: Color.ButtonBackground,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: Color.ButtonText,
    fontSize: 16,
    fontWeight: "bold",
  },
  mostRecentTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LandlordDashboard;
