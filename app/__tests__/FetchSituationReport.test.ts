import { fetchSituationReportLayout } from '../utils/SituationReport';
import { getResidence } from "../../firebase/firestore/firestore";
import { ResidenceWithId } from "../../types/types";
import { 
    DocumentSnapshot, 
    DocumentData, 
    getFirestore, 
    getDoc, 
    getDocs,
    doc,
    collection,
    query,
    where,
    QuerySnapshot
} from "firebase/firestore";

// Mock Firebase
jest.mock("../../firebase/firestore/firestore", () => ({
    getResidence: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn()
}));

describe('fetchSituationReportLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully fetch and map the situation report layout', async () => {
        // Setup
        const mockResidenceId = 'test-residence-123';
        const mockLayoutId = 'layout1';
        const mockSetLayout = jest.fn();

        // Mock residence data
        const mockResidence: ResidenceWithId = {
            id: mockResidenceId,
            residenceName: "Test Residence",
            street: "Test Street",
            number: "123",
            city: "Test City",
            canton: "Test Canton",
            zip: "12345",
            country: "Test Country",
            landlordId: "landlord-123",
            tenantIds: [],
            laundryMachineIds: [],
            apartments: [],
            tenantCodesID: [],
            situationReportLayout: [mockLayoutId]
        };

        // Mock layout document data
        const mockLayoutData = {
            layout: {
                label: "Kitchen Report",
                value: ["group1"]
            }
        };

        // Mock group data
        const mockGroupData = {
            label: "Appliances",
            value: ["singleton1", "singleton2"]
        };

        // Mock singleton data
        const mockSingleton1Data = {
            label: "Refrigerator",
            value: 5
        };

        const mockSingleton2Data = {
            label: "Microwave",
            value: 4
        };

        // Mock document snapshots
        const mockLayoutSnapshot = {
            exists: () => true,
            data: () => mockLayoutData,
            id: mockLayoutId
        };

        const mockGroupSnapshot = {
            docs: [{
                id: "group1",
                data: () => mockGroupData
            }]
        };

        const mockSingletonSnapshot = {
            docs: [
                {
                    id: "singleton1",
                    data: () => mockSingleton1Data
                },
                {
                    id: "singleton2",
                    data: () => mockSingleton2Data
                }
            ]
        };

        // Setup all mocks
        (getResidence as jest.Mock).mockResolvedValue(mockResidence);
        (getDoc as jest.Mock).mockResolvedValue(mockLayoutSnapshot);
        (getDocs as jest.Mock)
            .mockResolvedValueOnce(mockGroupSnapshot)
            .mockResolvedValueOnce(mockSingletonSnapshot);
        (query as jest.Mock).mockReturnValue({});
        (collection as jest.Mock).mockReturnValue({});
        (doc as jest.Mock).mockReturnValue({});
        (where as jest.Mock).mockReturnValue({});

        // Execute
        await fetchSituationReportLayout(mockResidenceId, mockSetLayout);

        // Verify
        expect(getResidence).toHaveBeenCalledWith(mockResidenceId);
        expect(mockSetLayout).toHaveBeenCalledWith([
            {
                label: "Kitchen Report",
                value: [["Appliances", [
                    ["Refrigerator", 5],
                    ["Microwave", 4]
                ]]]
            }
        ]);

        // Verify Firestore calls
        expect(getDoc).toHaveBeenCalled();
        expect(getDocs).toHaveBeenCalledTimes(2);
    });
});