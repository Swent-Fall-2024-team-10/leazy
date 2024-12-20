import { collection, addDoc, doc, deleteDoc, getDoc, updateDoc, getDocFromServer, getDocFromCache } from "firebase/firestore";
import { addSituationReport, getSituationReport, addSituationReportLayout, getSituationReportLayout, getApartment, updateApartment } from "../../../../firebase/firestore/firestore";
import { Apartment, Residence, SituationReport } from "../../../../types/types";
import { db } from "../../../../firebase/firebase";

// Mock the Firebase db
jest.mock("../../../../firebase/firebase", () => ({
  db: {
    app: {}
  }
}));

// Mock the network store
jest.mock("../../../../app/stores/NetworkStore", () => ({
  useNetworkStore: {
    getState: () => ({
      isOnline: true
    })
  }
}));

// Mocking the Firestore functions
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  getDoc: jest.fn(),
  getDocFromServer: jest.fn(),
  getDocFromCache: jest.fn(),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  memoryLocalCache: jest.fn(),
  initializeFirestore: jest.fn(),
}));

describe("Firestore functions", () => {
  const residenceMock: Residence = {
    residenceName: "Residence 1",
    street: "123 Main St",
    number: "10",
    city: "Fribourg",
    canton: "Fribourg",
    zip: "1700",
    country: "Switzerland",
    landlordId: "landlord123",
    tenantIds: ["tenant123"],
    laundryMachineIds: ["laundry123"],
    apartments: ["apt123"],
    tenantCodesID: ["code123"],
    situationReportLayout: ["field1", "field2"],
    pictures: []
  };

  const apartmentMock: Apartment = {
    apartmentName: "apt123",
    residenceId: "res123",
    tenants: ["tenant123"],
    maintenanceRequests: ["request123"],
    situationReportId: [], // Initialize with empty array
  };

  const situationReportMock: SituationReport = {
    reportDate: "2024-11-25",
    arrivingTenant: "tenant123",
    leavingTenant: "tenant456",
    residenceId: "res123",
    apartmentId: "apt123",
    reportForm: "field1",
    remarks: "Test remarks",
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock doc to return a proper DocumentReference
    (doc as jest.Mock).mockReturnValue({
      id: "mockDoc",
      path: "mockDocPath",
      type: 'document',
      firestore: db,
      parent: {},
      converter: null,
    });

    // Mock collection to return a proper CollectionReference
    (collection as jest.Mock).mockReturnValue({
      id: "mockCollection",
      path: "mockPath",
      type: 'collection',
      firestore: db,
      parent: null,
    });

    // Mock addDoc to return a proper DocumentReference
    (addDoc as jest.Mock).mockResolvedValue({
      id: "report123",
      type: 'document',
      firestore: db,
      parent: {},
      converter: null,
    });

    // Mock getDocFromServer for successful server response
    (getDocFromServer as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => apartmentMock,
    });

    // Mock getDocFromCache as fallback
    (getDocFromCache as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => apartmentMock,
    });

    // Mock updateDoc
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
  });

  it("should create a situation report when residence exists", async () => {
    await addSituationReport(situationReportMock, "apt123");

    // Verify addDoc was called with correct collection reference and data
    expect(collection).toHaveBeenCalledWith(db, "filledReports");
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      { situationReport: situationReportMock }
    );

    // Verify updateDoc was called with correct document reference and data
    expect(doc).toHaveBeenCalled();
    
    // Since we're starting with an empty situationReportId array, the update should only contain the new report
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      { situationReportId: ["report123"] }
    );
  });

  it("should add situation report layout to residence", async () => {
    const situationReportLayout = ["newField1", "newField2"];
    const residenceId = "res123";

    await addSituationReportLayout(situationReportLayout, residenceId);

    expect(doc).toHaveBeenCalledWith(db, "residences", residenceId);
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      { situationReportLayout }
    );
  });

  it("should return the situation report layout if it exists", async () => {
    // Mock getDocFromServer for residence data
    (getDocFromServer as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        ...residenceMock,
        situationReportLayout: ["field1", "field2"]
      }),
    });

    const result = await getSituationReportLayout("res123");
    expect(result).toEqual(["field1", "field2"]);
  });

  it("should return an empty array if the situation report layout doesn't exist", async () => {
    // Mock getDocFromServer for residence data with empty layout
    (getDocFromServer as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        ...residenceMock,
        situationReportLayout: []
      }),
    });

    const result = await getSituationReportLayout("res123");
    expect(result).toEqual([]);
  });
});