import { collection, addDoc, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { addSituationReport,  getSituationReport ,addSituationReportLayout, getSituationReportLayout, getApartment, updateApartment } from "../../firebase/firestore/firestore"; // Import your functions
import { Apartment, Residence, SituationReport } from "../../types/types";

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
  };

  const apartmentMock: Apartment = {
    apartmentName: "apt123",
    residenceId: "res123",
    tenants: ["tenant123"],
    maintenanceRequests: ["request123"],
    situationReportId: ["report123"],
  };

  const situationReportMock: SituationReport = {
    reportDate: "2024-11-25",
    arrivingTenant: "tenant123",
    leavingTenant: "tenant456",
    residenceId : "res123",
    apartmentId: "apt123",
    reportForm: "field1",
    remarks: "Test remarks",
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
    await addSituationReport(situationReportMock, "apt123");

    expect(addDoc).toHaveBeenCalledWith(expect.anything(), { situationReport: situationReportMock });
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { situationReportId: ["report123"] });
  });

  it("should add situation report layout to residence", async () => {
    const situationReportLayout = ["newField1", "newField2"];
    const residenceId = "res123";

    await addSituationReportLayout(situationReportLayout, residenceId);

    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { situationReportLayout });
  });

  it("should return the situation report layout if it exists", async () => {
    const situationReportLayout = ["newField1", "newField2"];
    const residenceId = "res123";

    await addSituationReportLayout(situationReportLayout, residenceId);

    const result = await getSituationReportLayout("res123");

    expect(result).toEqual(["field1", "field2"]);
  });

  it("getSituationReport should return the situation report if it exists", async () => {
    const apartmentId = "apt123";
    const situationReport = {
      ...situationReportMock,
    };

    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => apartmentMock,
    });

    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => situationReport,
    });

    const result = await getSituationReport(apartmentId);

    expect(result).toEqual(situationReport);

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

    const result = await getSituationReportLayout("res123");

    expect(result).toEqual([]);
  });
});
