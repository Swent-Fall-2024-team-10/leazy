import { getFirestore, connectFirestoreEmulator, collection, addDoc, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { createSituationReport, removeSituationReport, addSituationReportLayout, getSituationReport } from "../firestore"; // Import your functions
import { Residence, SituationReport } from "../../../types/types";

// Mocking the Firestore functions
jest.mock("firebase/firestore", () => {
  const actual = jest.requireActual("firebase/firestore");

  return {
    ...actual,
    getFirestore: jest.fn(),
    getDoc: jest.fn(),
    updateDoc: jest.fn(),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
  };
});

describe("Firestore functions", () => {
  // Mock Firestore methods
  let db: any;

  beforeAll(() => {
    // Create a mock Firestore instance
    db = { app: {} }; // You can mock whatever is needed from `getFirestore` here
  });

  const residenceMock: Residence = {
    residenceId: "res123",
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
  };

  const situationReportMock: SituationReport = {
    reportDate: "2024-11-25",
    arrivingTenant: "tenant123",
    leavingTenant: "tenant456",
    residenceId: "res123",
    apartmentId: "apt123",
    reportForm: ["field1", "field2"],
  };

  beforeEach(() => {
    // Mock Firestore functions to return the expected values
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => residenceMock,
    });

    (updateDoc as jest.Mock).mockResolvedValue(undefined);
    (addDoc as jest.Mock).mockResolvedValue({
      id: "report123",
    });
    (deleteDoc as jest.Mock).mockResolvedValue(undefined);

    // Mock collection and doc to return valid mock references
    (collection as jest.Mock).mockReturnValue({
      id: "mockCollection",
      path: "mockPath",
    });

    (doc as jest.Mock).mockReturnValue({
      id: "mockDoc",
      path: "mockDocPath",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a situation report when residence exists", async () => {
    await createSituationReport(situationReportMock);

    // Check if the correct Firestore functions were called
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), situationReportMock);
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { situationReportId: "report123" });
  });

  it("should throw error when residence is not found", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => false,
    });

    await expect(createSituationReport(situationReportMock)).rejects.toThrow("Residence not found.");
  });

  it("should remove a situation report", async () => {
    const situationReportId = "report123";
    await removeSituationReport(situationReportId);

    expect(deleteDoc).toHaveBeenCalledWith(expect.anything());
  });

  it("should add situation report layout to residence", async () => {
    const situationReportLayout = ["newField1", "newField2"];
    const residenceId = "res123";

    await addSituationReportLayout(situationReportLayout, residenceId);

    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { situationReportLayout });
  });

  it("should return the situation report layout if it exists", async () => {
    const result = await getSituationReport("res123");

    expect(result).toEqual(["field1", "field2"]);
  });

  it("should return an empty array if the situation report layout doesn't exist", async () => {
    // Mock getResidence to return null layout
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        ...residenceMock,
        situationReportLayout: [],
      }),
    });

    const result = await getSituationReport("res123");

    expect(result).toEqual([]);
  });
});
