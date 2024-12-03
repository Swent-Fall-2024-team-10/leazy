import {
  TUser,
  Landlord,
  Tenant,
  Residence,
  Apartment,
  LaundryMachine,
  MaintenanceRequest,
  TenantCode,
} from "../../types/types";
import * as firestore from "../../firebase/firestore/firestore";
import { db } from "../../firebase/firebase";
import { Timestamp } from "firebase/firestore";

const {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
} = require("firebase/firestore");

const mockApartment: Apartment = {
  apartmentName: "apt123",
  residenceId: "res456",
  tenants: [],
  maintenanceRequests: [],
  situationReportId: "",
};

const mockResidence: Residence = {
  residenceName: "Test Residence",
  street: "Main St",
  number: "42",
  city: "Zurich",
  canton: "ZH",
  zip: "8000",
  country: "Switzerland",
  landlordId: "landlord123",
  tenantIds: ["tenant1", "tenant2"],
  laundryMachineIds: ["laundry1", "laundry2"],
  apartments: ["apt1", "apt2"],
  tenantCodesID: ["code1", "code2"],
  situationReportLayout: [],
};

jest.spyOn(console, "error").mockImplementation(() => {});

describe("Firestore Functions", () => {
  describe("createApartment", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("apartmentsCollectionRef");
    });

    it("should successfully create an apartment document", async () => {
      const mockDocRef = { id: "generatedDocId" };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);

      const docId = await firestore.createApartment(mockApartment);

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "apartments");
      expect(addDoc).toHaveBeenCalledWith(
        "apartmentsCollectionRef",
        mockApartment
      );
      expect(docId).toBe("generatedDocId");
    });

    it("should throw an error if addDoc fails", async () => {
      const mockError = new Error("Failed to create apartment");
      (addDoc as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(firestore.createApartment(mockApartment)).rejects.toThrow(
        "Failed to create apartment"
      );
    });

    it("should throw an error for invalid apartment data", async () => {
      const invalidApartment = {
        ...mockApartment,
        apartmentName: "",
      };

      await expect(firestore.createApartment(invalidApartment)).rejects.toThrow(
        "Invalid apartment data"
      );

      const missingResidenceId = {
        ...mockApartment,
        residenceId: "",
      };

      await expect(
        firestore.createApartment(missingResidenceId)
      ).rejects.toThrow("Invalid apartment data");
    });
  });

  describe("getApartment", () => {
    it("should return apartment data if document exists", async () => {
      const mockDocRef = "testDocRef";
      const firestoreId = "apt123";
      
      (doc as jest.Mock).mockReturnValue(mockDocRef);
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockApartment,
      });

      const result = await firestore.getApartment(firestoreId);
      
      expect(doc).toHaveBeenCalledWith("mockedFirestore", "apartments", firestoreId);
      expect(result).toEqual(mockApartment);
    });

    it("should return null if document doesn't exist", async () => {
      const firestoreId = "nonexistent";
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await firestore.getApartment(firestoreId);
      expect(result).toBeNull();
    });
  });

  describe("createResidence", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("residencesCollectionRef");
    });

    it("should successfully create a residence document", async () => {
      const mockDocRef = { id: "generatedDocId" };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);

      const docId = await firestore.createResidence(mockResidence);

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "residences");
      expect(addDoc).toHaveBeenCalledWith(
        "residencesCollectionRef",
        mockResidence
      );
      expect(docId).toBe("generatedDocId");
    });

    it("should throw an error if residence name is missing", async () => {
      const invalidResidence = { ...mockResidence, residenceName: "" };

      await expect(firestore.createResidence(invalidResidence)).rejects.toThrow(
        "Invalid residence ID."
      );
    });
  });

  describe("getResidence", () => {
    it("should return residence data if document exists", async () => {
      const firestoreId = "res123";
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockResidence,
      });

      const result = await firestore.getResidence(firestoreId);
      
      expect(doc).toHaveBeenCalledWith("mockedFirestore", "residences", firestoreId);
      expect(result).toEqual(mockResidence);
    });

    it("should return null if document doesn't exist", async () => {
      const firestoreId = "nonexistent";
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await firestore.getResidence(firestoreId);
      expect(result).toBeNull();
    });
  });

  describe("updateResidence", () => {
    let mockDocRef: string;

    beforeEach(() => {
      mockDocRef = "mockDocRef";
      (doc as jest.Mock).mockReturnValue(mockDocRef);
    });

    it("should successfully update a residence", async () => {
      const firestoreId = "res123";
      const updateData: Partial<Residence> = {
        street: "New Street",
      };

      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await firestore.updateResidence(firestoreId, updateData);
      
      expect(doc).toHaveBeenCalledWith("mockedFirestore", "residences", firestoreId);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, updateData);
    });

    it("should handle update errors", async () => {
      const firestoreId = "res123";
      const updateData: Partial<Residence> = {
        street: "New Street",
      };

      (updateDoc as jest.Mock).mockRejectedValue(new Error("Update failed"));

      await expect(
        firestore.updateResidence(firestoreId, updateData)
      ).rejects.toThrow("Update failed");
    });
});
});