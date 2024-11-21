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
  arrayUnion,
} = require("firebase/firestore");

const mockUser: TUser = {
  uid: "123",
  type: "tenant",
  name: "Test User",
  email: "test@user.com",
  phone: "+123456789",
  street: "Main Street",
  number: "42",
  city: "Test City",
  canton: "Test Canton",
  zip: "00000",
  country: "Test Country",
};

const mockLandlord: Landlord = {
  userId: "landlord123",
  residenceIds: ["res1", "res2"],
};

const mockResidence: Residence = {
  residenceId: "res123",
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
};

const mockMaintenanceRequest: MaintenanceRequest = {
  requestID: "test-id",
  tenantId: "test-tenant-id",
  residenceId: "test-residence-id",
  apartmentId: "test-apartment-id",
  openedBy: "test-user",
  requestTitle: "Test Request",
  requestDate: "2024-03-21",
  requestDescription: "Test description",
  picture: [],
  requestStatus: "notStarted",
};

const mockLaundryMachine: LaundryMachine = {
  laundryMachineId: "testMachineId",
  isAvailable: true,
  isFunctional: true,
};

const mockApartment: Apartment = {
  apartmentId: "apt123",
  residenceId: "res456",
  tenants: [],
  maintenanceRequests: [],
};

describe("Firestore Functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user without error", async () => {
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(firestore.createUser(mockUser)).resolves.toBeUndefined();

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "users",
        mockUser.uid
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockUser);
    });

    it("should throw an error if setDoc fails", async () => {
      const error = new Error("Failed to set document.");
      (setDoc as jest.Mock).mockRejectedValueOnce(error);

      await expect(firestore.createUser(mockUser)).rejects.toThrow(
        "Failed to set document."
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "users",
        mockUser.uid
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockUser);
    });
  });

  describe("getUser", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
    });

    it("should return user data if user is found", async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => mockUser,
      };
      (getDoc as jest.Mock).mockResolvedValueOnce(mockDocSnap);

      const result = await firestore.getUser(mockUser.uid);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "users",
        mockUser.uid
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toEqual(mockUser);
    });

    it("should return null if no user is found", async () => {
      const mockDocSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValueOnce(mockDocSnap);

      const result = await firestore.getUser(mockUser.uid);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "users",
        mockUser.uid
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("should delete a user document by UID", async () => {
      const mockUid = "123";
      (doc as jest.Mock).mockReturnValue("mockedDocRef");
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await firestore.deleteUser(mockUid);
      expect(doc).toHaveBeenCalledWith("mockedFirestore", "users", mockUid);
      expect(deleteDoc).toHaveBeenCalledWith("mockedDocRef");
    });

    it("should throw an error if deleteDoc fails", async () => {
      const mockUid = "456";

      (doc as jest.Mock).mockReturnValue("mockedDocRef");
      (deleteDoc as jest.Mock).mockRejectedValue(
        new Error("Failed to delete document")
      );

      await expect(firestore.deleteUser(mockUid)).rejects.toThrow(
        "Failed to delete document"
      );

      expect(doc).toHaveBeenCalledWith("mockedFirestore", "users", mockUid);
      expect(deleteDoc).toHaveBeenCalledWith("mockedDocRef");
    });
  });

  describe("updateUser", () => {
    it("should update a user document by UID", async () => {
      const mockUid = "123";
      const mockUserUpdate: Partial<TUser> = {
        name: "Updated Name",
        email: "updated@email.com",
        phone: "123-456-7890",
      };

      (doc as jest.Mock).mockReturnValue("mockedDocRef");
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await firestore.updateUser(mockUid, mockUserUpdate);

      expect(doc).toHaveBeenCalledWith("mockedFirestore", "users", mockUid);
      expect(updateDoc).toHaveBeenCalledWith("mockedDocRef", mockUserUpdate);
    });

    it("should throw an error if updateDoc fails", async () => {
      const mockUid = "123";
      const mockUserUpdate: Partial<TUser> = {
        name: "Updated Name",
      };

      (doc as jest.Mock).mockReturnValue("mockedDocRef");
      (updateDoc as jest.Mock).mockRejectedValue(
        new Error("Failed to update document")
      );

      await expect(
        firestore.updateUser(mockUid, mockUserUpdate)
      ).rejects.toThrow("Failed to update document");

      expect(doc).toHaveBeenCalledWith("mockedFirestore", "users", mockUid);
      expect(updateDoc).toHaveBeenCalledWith("mockedDocRef", mockUserUpdate);
    });

    it("should throw an error if user data is invalid", async () => {
      const mockUid = "123";
      const invalidUserUpdate = {
        invalidField: "some value",
      };

      (doc as jest.Mock).mockReturnValue("mockedDocRef");
      (updateDoc as jest.Mock).mockRejectedValue(
        new Error("Invalid user data")
      );

      await expect(
        firestore.updateUser(mockUid, invalidUserUpdate as Partial<TUser>)
      ).rejects.toThrow("Invalid user data");

      expect(doc).toHaveBeenCalledWith("mockedFirestore", "users", mockUid);
      expect(updateDoc).toHaveBeenCalledWith("mockedDocRef", invalidUserUpdate);
    });
  });

  describe("createLandlord", () => {
    beforeEach(() => {
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
    });

    it("should create a new landlord without error", async () => {
      (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(
        firestore.createLandlord(mockLandlord)
      ).resolves.toBeUndefined();

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        mockLandlord.userId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockLandlord);
    });

    it("should throw an error if setDoc fails", async () => {
      const error = new Error("Failed to set document.");
      (setDoc as jest.Mock).mockRejectedValueOnce(error);

      await expect(firestore.createLandlord(mockLandlord)).rejects.toThrow(
        "Failed to set document."
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        mockLandlord.userId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockLandlord);
    });
  });

  describe("getLandlord", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
    });

    it("should return landlord data if landlord is found", async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => mockLandlord,
      };
      (getDoc as jest.Mock).mockResolvedValueOnce(mockDocSnap);

      const result = await firestore.getLandlord(mockLandlord.userId);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        mockLandlord.userId
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toEqual(mockLandlord);
    });

    it("should return null if no landlord is found", async () => {
      const mockDocSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValueOnce(mockDocSnap);

      const result = await firestore.getLandlord("nonexistent123");

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        "nonexistent123"
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toBeNull();
    });

    it("should throw an error for invalid userId", async () => {
      await expect(
        firestore.getLandlord(null as unknown as string)
      ).rejects.toThrow("Invalid userId");
    });

    it("should throw an error if getDoc fails", async () => {
      const mockError = new Error("Firestore error");
      (getDoc as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(firestore.getLandlord("user123")).rejects.toThrow(
        "Firestore error"
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        "user123"
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
    });
  });

  describe("updateLandlord", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
    });

    const validLandlordData: Partial<Landlord> = {
      userId: "user123",
      residenceIds: ["res1", "res2"],
    };

    it("should successfully update a landlord with full data", async () => {
      const mockUserId = "landlord123";

      await firestore.updateLandlord(mockUserId, validLandlordData);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        mockUserId
      );
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", validLandlordData);
    });

    it("should throw an error for invalid userId", async () => {
      await expect(
        firestore.updateLandlord(null as unknown as string, validLandlordData)
      ).rejects.toThrow("Invalid userId");

      await expect(
        firestore.updateLandlord("", validLandlordData)
      ).rejects.toThrow("Invalid userId");
    });

    it("should throw an error if Firestore update fails", async () => {
      const mockError = new Error("Firestore update error");
      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        firestore.updateLandlord("validId", validLandlordData)
      ).rejects.toThrow("Firestore update error");

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        "validId"
      );
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", validLandlordData);
    });

    it("should throw errors for invalid landlord data", async () => {
      const mockUserId = "landlord123";

      // Test missing residenceIds
      await expect(
        firestore.updateLandlord(mockUserId, {
          userId: "user123",
        } as Partial<Landlord>)
      ).rejects.toThrow("Invalid landlord data");

      // Test empty landlord data
      await expect(
        firestore.updateLandlord(mockUserId, {} as Partial<Landlord>)
      ).rejects.toThrow("Invalid landlord data");

      // Test missing required fields with other fields present
      await expect(
        firestore.updateLandlord(mockUserId, {
          someOtherField: "value",
        } as Partial<Landlord>)
      ).rejects.toThrow("Invalid landlord data");
    });
  });

  describe("deleteLandlord", () => {
    const mockUserId = "landlord123";

    (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
    (doc as jest.Mock).mockReturnValue("mockDocRef");

    it("should successfully delete a landlord document", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      await firestore.deleteLandlord(mockUserId);
      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        mockUserId
      );
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error if deletion fails", async () => {
      const mockError = new Error("Firestore deletion error");
      (deleteDoc as jest.Mock).mockRejectedValue(mockError);
      await expect(firestore.deleteLandlord(mockUserId)).rejects.toThrow(
        "Firestore deletion error"
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        mockUserId
      );
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });
  });

  describe("createTenant", () => {
    const mockTenant: Tenant = {
      userId: "tenant123",
      maintenanceRequests: ["request1", "request2"],
      apartmentId: "apt101",
      residenceId: "res789",
    };

    beforeEach(() => {
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
    });

    it("should successfully create a tenant document", async () => {
      (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(firestore.createTenant(mockTenant)).resolves.toBeUndefined();

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "tenants",
        mockTenant.userId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockTenant);
    });

    it("should log an error if creation fails", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockError = new Error("Firestore creation error");

      (setDoc as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(firestore.createTenant(mockTenant)).resolves.toBeUndefined();

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "tenants",
        mockTenant.userId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockTenant);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error creating tenant profile:",
        mockError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("getTenant", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
    });

    it("should return tenant data if tenant is found", async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          userId: "tenant123",
          maintenanceRequests: ["request1", "request2"],
          apartmentId: "apt101",
          residenceId: "res789",
        }),
      };
      (getDoc as jest.Mock).mockResolvedValueOnce(mockDocSnap);

      const result = await firestore.getTenant("tenant123");

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "tenants",
        "tenant123"
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toEqual({
        userId: "tenant123",
        maintenanceRequests: ["request1", "request2"],
        apartmentId: "apt101",
        residenceId: "res789",
      });
    });

    it("should return null if no tenant is found", async () => {
      const mockDocSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValueOnce(mockDocSnap);

      const result = await firestore.getTenant("nonexistent123");

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "tenants",
        "nonexistent123"
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toBeNull();
    });
  });

  describe("updateTenant", () => {
    (doc as jest.Mock).mockReturnValue("mockDocRef");
    const mockUid = "tenant123";

    it("should successfully update a tenant document with the provided data", async () => {
      const mockTenantData = { apartmentId: "apt456" };
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      await firestore.updateTenant(mockUid, mockTenantData);
      expect(doc).toHaveBeenCalledWith("mockedFirestore", "tenants", mockUid);
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", mockTenantData);
    });

    it("should throw an error if updateDoc fails", async () => {
      const mockTenantData = { residenceId: "res789" };
      const mockError = new Error("Failed to update document");

      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        firestore.updateTenant(mockUid, mockTenantData)
      ).rejects.toThrow("Failed to update document");

      expect(doc).toHaveBeenCalledWith("mockedFirestore", "tenants", mockUid);
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", mockTenantData);
    });
  });

  describe("deleteTenant", () => {
    const mockUserId = "tenant123";
    (doc as jest.Mock).mockReturnValue("mockDocRef");
    it("should successfully delete a tenant document by UID", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await firestore.deleteTenant(mockUserId);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "tenants",
        mockUserId
      );
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error if deleteDoc fails", async () => {
      const mockError = new Error("Failed to delete document");

      (deleteDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(firestore.deleteTenant(mockUserId)).rejects.toThrow(
        "Failed to delete document"
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "tenants",
        mockUserId
      );
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });
  });

  describe("createResidence", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("residencesCollectionRef");
    });

    it("should successfully create a residence document with the provided data", async () => {
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

    it("should throw an error if addDoc fails", async () => {
      const mockError = new Error("Failed to create document");
      (addDoc as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(firestore.createResidence(mockResidence)).rejects.toThrow(
        "Failed to create document"
      );

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "residences");
      expect(addDoc).toHaveBeenCalledWith(
        "residencesCollectionRef",
        mockResidence
      );
    });

    it("should throw an error if residenceId is missing", async () => {
      const invalidResidence = { ...mockResidence, residenceId: "" };

      await expect(firestore.createResidence(invalidResidence)).rejects.toThrow(
        "Invalid residence ID."
      );

      expect(collection).not.toHaveBeenCalled();
      expect(addDoc).not.toHaveBeenCalled();
    });
  });

  describe("getResidence", () => {
    (doc as jest.Mock).mockReturnValue("mockDocRef");
    it("should return residence data if the document exists", async () => {
      const mockResidenceId = "res123";
      const mockResidenceData = {
        residenceId: "res123",
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
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue(mockResidenceData),
      });

      const result = await firestore.getResidence(mockResidenceId);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences",
        mockResidenceId
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toEqual(mockResidenceData);
    });

    it("should return null if the document does not exist and handle errors", async () => {
      const mockResidenceId = "res123";

      // Mock non-existent document
      (getDoc as jest.Mock).mockResolvedValue({
        exists: jest.fn().mockReturnValue(false),
      });

      const resultForNonExistentDoc = await firestore.getResidence(
        mockResidenceId
      );
      expect(resultForNonExistentDoc).toBeNull();

      // Mock a failed getDoc call
      const mockError = new Error("Failed to retrieve document");
      (getDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(firestore.getResidence(mockResidenceId)).rejects.toThrow(
        "Failed to retrieve document"
      );
    });
  });

  describe("updateResidence", () => {
    it("should throw errors for invalid residenceId or Firestore failures", async () => {
      const validResidenceData: Partial<Residence> = {
        street: "New Street",
        city: "Zurich",
      };

      // Test null residenceId
      await expect(
        firestore.updateResidence(null as unknown as string, validResidenceData)
      ).rejects.toThrow("Failed to update document");

      // Test empty string residenceId
      await expect(
        firestore.updateResidence("", validResidenceData)
      ).rejects.toThrow("Failed to update document");

      // Test Firestore update failure
      const mockError = new Error("Firestore update error");

      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        firestore.updateResidence("res123", validResidenceData)
      ).rejects.toThrow("Firestore update error");

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences",
        "res123"
      );
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", validResidenceData);
    });

    it("should throw errors for invalid residence data", async () => {
      const mockResidenceId = "res123";

      // Test empty residence data
      const emptyData: Partial<Residence> = {};
      await expect(
        firestore.updateResidence(mockResidenceId, emptyData)
      ).rejects.toThrow("Firestore update error");

      // Test missing required fields
      const missingRequiredFields = {
        street: "New Street",
      } as Partial<Residence>;
      await expect(
        firestore.updateResidence(mockResidenceId, missingRequiredFields)
      ).rejects.toThrow("Firestore update error");
    });
  });

  describe("deleteResidence", () => {
    it("should successfully delete a residence document or handle errors", async () => {
      const mockResidenceId = "res123";

      // Mock successful deletion
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await firestore.deleteResidence(mockResidenceId);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences",
        mockResidenceId
      );
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");

      // Mock Firestore delete failure
      const mockError = new Error("Firestore delete error");
      (deleteDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(firestore.deleteResidence(mockResidenceId)).rejects.toThrow(
        "Firestore delete error"
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences",
        mockResidenceId
      );
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error for invalid residenceId", async () => {
      // Test null residenceId
      await expect(
        firestore.deleteResidence(null as unknown as string)
      ).rejects.toThrow("Firestore delete error");

      // Test empty string residenceId
      await expect(firestore.deleteResidence("")).rejects.toThrow(
        "Firestore delete error"
      );
    });
  });

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

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "apartments");
      expect(addDoc).toHaveBeenCalledWith(
        "apartmentsCollectionRef",
        mockApartment
      );
    });

    it("should throw an error for invalid apartment data", async () => {
      const invalidApartment = {
        ...mockApartment,
        apartmentId: "",
      };

      await expect(firestore.createApartment(invalidApartment)).rejects.toThrow(
        "Invalid apartment data"
      );

      const missingResidenceId: Apartment = {
        ...mockApartment,
        residenceId: "",
      };

      await expect(
        firestore.createApartment(missingResidenceId)
      ).rejects.toThrow("Invalid apartment data");

      expect(collection).not.toHaveBeenCalled();
      expect(addDoc).not.toHaveBeenCalled();
    });
  });

  describe("getApartment", () => {
    it("should return apartment data if the document exists", async () => {
      const mockApartmentId = "apt123";
      const mockApartmentData = {
        apartmentId: "apt123",
        residenceId: "res456",
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockApartmentData,
      });

      const result = await firestore.getApartment(mockApartmentId);
      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "apartments",
        mockApartmentId
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toEqual(mockApartmentData);
    });

    it("should throw an error for invalid apartmentId", async () => {
      await expect(
        firestore.getApartment(null as unknown as string)
      ).rejects.toThrow();
      await expect(firestore.getApartment("")).rejects.toThrow();
    });

    it("should return null if the document does not exist", async () => {
      const mockApartmentId = "nonexistent";
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await firestore.getApartment(mockApartmentId);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "apartments",
        mockApartmentId
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toBeNull();
    });

    it("should throw an error if getDoc fails", async () => {
      const mockApartmentId = "apt123";
      const mockError = new Error("Failed to get apartment");
      (getDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(firestore.getApartment(mockApartmentId)).rejects.toThrow(
        mockError
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "apartments",
        mockApartmentId
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
    });
  });

  describe("updateApartment", () => {
    it("should throw an error for invalid apartmentId or Firestore failures", async () => {
      const validApartmentData: Partial<Apartment> = {
        apartmentId: "apt123",
      };

      await expect(
        firestore.updateApartment(null as unknown as string, validApartmentData)
      ).rejects.toThrow();
      await expect(
        firestore.updateApartment("", validApartmentData)
      ).rejects.toThrow();

      const mockError = new Error("Firestore update error");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        firestore.updateApartment("apt123", validApartmentData)
      ).rejects.toThrow(mockError);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "apartments",
        "apt123"
      );
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", validApartmentData);
    });

    it("should throw an error for invalid apartment data", async () => {
      const mockApartmentId = "apt123";
      const invalidApartmentData: Partial<Apartment> = {};
      await expect(
        firestore.updateApartment(mockApartmentId, invalidApartmentData)
      ).rejects.toThrow();
    });

    it("should throw an error for missing apartmentId", async () => {
      const validApartmentData: Partial<Apartment> = {
        residenceId: "res456",
      };
      await expect(
        firestore.updateApartment(null as unknown as string, validApartmentData)
      ).rejects.toThrow();
    });

    it("should throw an error for empty string apartmentId", async () => {
      const validApartmentData: Partial<Apartment> = {
        residenceId: "res456",
      };
      await expect(
        firestore.updateApartment("", validApartmentData)
      ).rejects.toThrow();
    });

    it("should successfully update an apartment document with the provided data", async () => {
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      await firestore.updateApartment("apt123", { residenceId: "res456" });
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", {
        residenceId: "res456",
      });
    });

    it("should throw an error if updateDoc fails", async () => {
      const mockError = new Error("Firestore update error");
      (updateDoc as jest.Mock).mockRejectedValue(mockError);
    });
  });

  describe("deleteApartment", () => {
    it("should successfully delete an apartment document", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      await firestore.deleteApartment("apt123");
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error if deleteDoc fails", async () => {
      const mockError = new Error("Firestore delete error");
      (deleteDoc as jest.Mock).mockRejectedValue(mockError);
      await expect(firestore.deleteApartment("apt123")).rejects.toThrow(
        mockError
      );
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error for invalid apartmentId", async () => {
      await expect(
        firestore.deleteApartment(null as unknown as string)
      ).rejects.toThrow();
      await expect(firestore.deleteApartment("")).rejects.toThrow();
    });
  });

  describe("createMaintenanceRequest", () => {
    it("should successfully create a maintenance request document", async () => {
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await firestore.createMaintenanceRequest(mockMaintenanceRequest);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "maintenanceRequests",
        mockMaintenanceRequest.requestID
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockMaintenanceRequest);
    });

    it("should throw an error if setDoc fails", async () => {
      const mockError = new Error("Failed to create maintenance request");
      (setDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        firestore.createMaintenanceRequest(mockMaintenanceRequest)
      ).rejects.toThrow("Failed to create maintenance request");

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "maintenanceRequests",
        mockMaintenanceRequest.requestID
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockMaintenanceRequest);
    });

    it("should throw an error for invalid maintenance request data", async () => {
      const invalidMaintenanceRequest: Partial<MaintenanceRequest> = {};
      await expect(
        firestore.createMaintenanceRequest(
          invalidMaintenanceRequest as MaintenanceRequest
        )
      ).rejects.toThrow();
    });

    it("should throw an error for missing required fields", async () => {
      const missingRequiredFields: Partial<MaintenanceRequest> = {};
      await expect(
        firestore.createMaintenanceRequest(
          missingRequiredFields as MaintenanceRequest
        )
      ).rejects.toThrow();

      const missingResidenceId: Partial<MaintenanceRequest> = {
        apartmentId: "apt123",
      };
      await expect(
        firestore.createMaintenanceRequest(
          missingResidenceId as MaintenanceRequest
        )
      ).rejects.toThrow();
    });
  });

  describe("getMaintenanceRequest", () => {
    it("should return maintenance request data if the document exists", async () => {
      const mockMaintenanceRequestId = "mr123";
      const mockMaintenanceRequestData = {
        requestID: "mr123",
        apartmentId: "apt123",
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockMaintenanceRequestData,
      });

      const result = await firestore.getMaintenanceRequest(
        mockMaintenanceRequestId
      );
      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "maintenanceRequests",
        mockMaintenanceRequestId
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toEqual(mockMaintenanceRequestData);
    });

    it("should return null if the document does not exist", async () => {
      const mockMaintenanceRequestId = "nonexistent";
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await firestore.getMaintenanceRequest(
        mockMaintenanceRequestId
      );
      expect(result).toBeNull();

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "maintenanceRequests",
        mockMaintenanceRequestId
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error if getDoc fails", async () => {
      const mockMaintenanceRequestId = "mr123";
      const mockError = new Error("Failed to get maintenance request");
      (getDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        firestore.getMaintenanceRequest(mockMaintenanceRequestId)
      ).rejects.toThrow(mockError);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "maintenanceRequests",
        mockMaintenanceRequestId
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error for invalid maintenanceRequestId", async () => {
      await expect(
        firestore.getMaintenanceRequest(null as unknown as string)
      ).rejects.toThrow();
      await expect(firestore.getMaintenanceRequest("")).rejects.toThrow();
    });
  });

  describe("updateMaintenanceRequest", () => {
    it("should throw an error for invalid maintenanceRequestId or Firestore failures", async () => {
      const validMaintenanceRequestData: Partial<MaintenanceRequest> = {
        requestID: "mr123",
      };

      await expect(
        firestore.updateMaintenanceRequest(
          null as unknown as string,
          validMaintenanceRequestData
        )
      ).rejects.toThrow();

      await expect(
        firestore.updateMaintenanceRequest("", validMaintenanceRequestData)
      ).rejects.toThrow();

      const mockError = new Error("Firestore update error");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        firestore.updateMaintenanceRequest("mr123", validMaintenanceRequestData)
      ).rejects.toThrow(mockError);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "maintenanceRequests",
        "mr123"
      );
      expect(updateDoc).toHaveBeenCalledWith(
        "mockDocRef",
        validMaintenanceRequestData
      );
    });

    it("should throw an error for invalid maintenance request data", async () => {
      const mockMaintenanceRequestId = "mr123";
      const invalidMaintenanceRequest: Partial<MaintenanceRequest> = {};
      await expect(
        firestore.updateMaintenanceRequest(
          mockMaintenanceRequestId,
          invalidMaintenanceRequest
        )
      ).rejects.toThrow();

      const missingResidenceId: Partial<MaintenanceRequest> = {
        apartmentId: "apt123",
      };
      await expect(
        firestore.updateMaintenanceRequest(
          mockMaintenanceRequestId,
          missingResidenceId
        )
      ).rejects.toThrow();

      const missingApartmentId: Partial<MaintenanceRequest> = {
        requestID: "mr123",
      };
      await expect(
        firestore.updateMaintenanceRequest(
          mockMaintenanceRequestId,
          missingApartmentId
        )
      ).rejects.toThrow();
    });

    it("should throw an error for missing maintenanceRequestId", async () => {
      const validMaintenanceRequestData: Partial<MaintenanceRequest> = {
        apartmentId: "apt123",
      };
      await expect(
        firestore.updateMaintenanceRequest(
          null as unknown as string,
          validMaintenanceRequestData
        )
      ).rejects.toThrow();

      await expect(
        firestore.updateMaintenanceRequest("", validMaintenanceRequestData)
      ).rejects.toThrow();
    });

    it("should successfully update a maintenance request document with the provided data", async () => {
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      await firestore.updateMaintenanceRequest("mr123", {
        apartmentId: "apt123",
      });
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", {
        apartmentId: "apt123",
      });
    });
  });

  describe("deleteMaintenanceRequest", () => {
    it("should successfully delete a maintenance request document", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      await firestore.deleteMaintenanceRequest("mr123");
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error if deleteDoc fails", async () => {
      const mockError = new Error("Firestore delete error");
      (deleteDoc as jest.Mock).mockRejectedValue(mockError);
      await expect(firestore.deleteMaintenanceRequest("mr123")).rejects.toThrow(
        mockError
      );
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error for invalid maintenanceRequestId", async () => {
      await expect(
        firestore.deleteMaintenanceRequest(null as unknown as string)
      ).rejects.toThrow();
      await expect(firestore.deleteMaintenanceRequest("")).rejects.toThrow();
    });
  });

  describe("createLaundryMachine", () => {
    it("should successfully create a laundry machine document", async () => {
      (setDoc as jest.Mock).mockResolvedValue(undefined);
      const mockMachine: LaundryMachine = {
        laundryMachineId: "machine123",
        isAvailable: true,
        isFunctional: true,
      };
      await firestore.createLaundryMachine("residence123", mockMachine);
      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences/residence123/laundryMachines",
        "machine123"
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockMachine);
    });

    it("should throw an error if setDoc fails", async () => {
      const mockError = new Error("Firestore setDoc error");
      (setDoc as jest.Mock).mockRejectedValue(mockError);
      const mockMachine: LaundryMachine = {
        laundryMachineId: "machine123",
        isAvailable: true,
        isFunctional: true,
      };
      await expect(
        firestore.createLaundryMachine("residence123", mockMachine)
      ).rejects.toThrow(mockError);
      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences/residence123/laundryMachines",
        "machine123"
      );
    });

    it("should throw an error for invalid laundry machine data", async () => {
      const invalidMachine = {
        isAvailable: true,
        isFunctional: true,
      };
      await expect(
        firestore.createLaundryMachine(
          "residence123",
          invalidMachine as LaundryMachine
        )
      ).rejects.toThrow();
    });

    it("should throw an error for missing residenceId", async () => {
      const mockMachine: LaundryMachine = {
        laundryMachineId: "machine123",
        isAvailable: true,
        isFunctional: true,
      };
      await expect(
        firestore.createLaundryMachine(null as unknown as string, mockMachine)
      ).rejects.toThrow();
      await expect(
        firestore.createLaundryMachine("", mockMachine)
      ).rejects.toThrow();
    });
  });

  describe("getLaundryMachine", () => {
    it("should return laundry machine data if the document exists", async () => {
      const mockMachine: LaundryMachine = {
        laundryMachineId: "machine123",
        isAvailable: true,
        isFunctional: true,
      };

      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockMachine,
      });

      const result = await firestore.getLaundryMachine(
        "residence123",
        "machine123"
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences/residence123/laundryMachines",
        "machine123"
      );
      expect(result).toEqual(mockMachine);
    });

    it("should throw an error for invalid laundry machineId", async () => {
      await expect(
        firestore.getLaundryMachine("residence123", null as unknown as string)
      ).rejects.toThrow();
      await expect(
        firestore.getLaundryMachine("residence123", "")
      ).rejects.toThrow();
    });

    it("should throw an error for missing residenceId", async () => {
      await expect(
        firestore.getLaundryMachine(null as unknown as string, "machine123")
      ).rejects.toThrow();
      await expect(
        firestore.getLaundryMachine("", "machine123")
      ).rejects.toThrow();
    });
  });

  describe("updateLaundryMachine", () => {
    it("should successfully update a laundry machine document", async () => {
      const mockResidenceId = "residence123";
      const mockMachineId = "machine123";
      const mockMachineUpdate: Partial<LaundryMachine> = {
        laundryMachineId: mockMachineId,
        isAvailable: false,
        isFunctional: true,
      };

      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await firestore.updateLaundryMachine(
        mockResidenceId,
        mockMachineId,
        mockMachineUpdate
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        `residences/${mockResidenceId}/laundryMachines`,
        mockMachineId
      );
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", mockMachineUpdate);
    });

    it("should throw an error for invalid laundry machine data", async () => {
      const invalidMachine = {
        invalidField: true,
      };
      await expect(
        firestore.updateLaundryMachine(
          "residence123",
          "machine123",
          invalidMachine as Partial<LaundryMachine>
        )
      ).rejects.toThrow();
    });

    it("should throw an error for missing laundry machineId", async () => {
      const mockMachineUpdate: Partial<LaundryMachine> = {
        isAvailable: false,
      };
      await expect(
        firestore.updateLaundryMachine(
          "residence123",
          null as unknown as string,
          mockMachineUpdate
        )
      ).rejects.toThrow();
    });

    it("should throw an error for empty string laundry machineId", async () => {
      const mockMachineUpdate: Partial<LaundryMachine> = {
        isAvailable: false,
      };
      await expect(
        firestore.updateLaundryMachine("residence123", "", mockMachineUpdate)
      ).rejects.toThrow();
    });

    it("should throw an error for missing residenceId", async () => {
      const mockMachineUpdate: Partial<LaundryMachine> = {
        isAvailable: false,
      };
      await expect(
        firestore.updateLaundryMachine(
          null as unknown as string,
          "machine123",
          mockMachineUpdate
        )
      ).rejects.toThrow();
    });

    it("should throw an error for empty string residenceId", async () => {
      const mockMachineUpdate: Partial<LaundryMachine> = {
        isAvailable: false,
      };
      await expect(
        firestore.updateLaundryMachine("", "machine123", mockMachineUpdate)
      ).rejects.toThrow();
    });
  });

  describe("deleteLaundryMachine", () => {
    it("should successfully delete a laundry machine document", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      await firestore.deleteLaundryMachine("residence123", "machine123");
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error if deleteDoc fails", async () => {
      const mockError = new Error("Firestore delete error");
      (deleteDoc as jest.Mock).mockRejectedValue(mockError);
      await expect(
        firestore.deleteLaundryMachine("residence123", "machine123")
      ).rejects.toThrow(mockError);
    });

    it("should throw an error for invalid laundry machineId", async () => {
      await expect(
        firestore.deleteLaundryMachine(
          "residence123",
          null as unknown as string
        )
      ).rejects.toThrow();
    });
  });

  describe("getAllLaundryMachines", () => {
    it("should return an array of laundry machine data", async () => {
      const mockMachines = [
        {
          laundryMachineId: "machine1",
          isAvailable: true,
          isFunctional: true,
        },
        {
          laundryMachineId: "machine2",
          isAvailable: false,
          isFunctional: true,
        },
      ];

      const mockQuerySnapshot = {
        forEach: (callback: (doc: any) => void) => {
          mockMachines.forEach((machine) => {
            callback({
              data: () => machine,
            });
          });
        },
      };

      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await firestore.getAllLaundryMachines("residence123");
      expect(result).toEqual(mockMachines);
    });

    it("should throw an error for invalid residenceId", async () => {
      await expect(
        firestore.getAllLaundryMachines(null as unknown as string)
      ).rejects.toThrow("Invalid residence ID");

      await expect(firestore.getAllLaundryMachines("")).rejects.toThrow(
        "Invalid residence ID"
      );
    });

    it("should throw an error if getDocs fails", async () => {
      const mockError = new Error("Firestore error");
      (getDocs as jest.Mock).mockRejectedValue(mockError);

      await expect(
        firestore.getAllLaundryMachines("residence123")
      ).rejects.toThrow(mockError);
    });

    it("should return an empty array if no laundry machines are found", async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: any) => void) => {}, // Empty forEach implementation
      };

      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await firestore.getAllLaundryMachines("residence123");
      expect(result).toEqual([]);
    });
  });

  describe("generate_unique_code", () => {
    const mockResidenceUID = "res123";
    const mockApartmentUID = "apt123";
    const mockTenantCodeId = "tenantCode123";

    const mockTenantCode: TenantCode = {
      tenantCode: "123456",
      apartmentId: mockApartmentUID,
      residenceId: mockResidenceUID,
      used: false,
    };

    let updateResidenceMock: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      // Spy on updateResidence and mock its implementation
      updateResidenceMock = jest.spyOn(firestore, "updateResidence");
    });

    afterEach(() => {
      // Restore the original implementation after each test
      updateResidenceMock.mockRestore();
    });

    it("should successfully generate a unique code", async () => {
      // Mock Firestore methods
      (collection as jest.Mock).mockReturnValueOnce("tenantCodesCollectionRef");

      const mockDocRef = { id: mockTenantCodeId };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);
      (doc as jest.Mock).mockReturnValueOnce("residenceDocRef");

      const mockResidenceData: Residence = {
        residenceId: mockResidenceUID,
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
      };

      const mockResidenceSnap = {
        exists: () => true,
        data: () => mockResidenceData,
      };
      (getDoc as jest.Mock).mockResolvedValueOnce(mockResidenceSnap);

      (firestore.updateResidence as jest.Mock).mockResolvedValueOnce(undefined);

      // Call the function
      const tenantCode = await firestore.generate_unique_code(
        mockResidenceUID,
        mockApartmentUID
      );

      expect(tenantCode).toMatch(/^\d{6}$/);

      expect(collection).toHaveBeenCalledWith(db, "tenantCodes");
      expect(addDoc).toHaveBeenCalledWith(
        "tenantCodesCollectionRef",
        expect.objectContaining({
          apartmentId: mockApartmentUID,
          residenceId: mockResidenceUID,
          used: false,
          tenantCode: expect.any(String),
        })
      );

      expect(doc).toHaveBeenCalledWith(db, "residences", mockResidenceUID);
      expect(getDoc).toHaveBeenCalledWith("residenceDocRef");
    });

    it("should throw an error if the residence doesn't exist", async () => {
      (collection as jest.Mock).mockReturnValueOnce("tenantCodesCollectionRef");
      const mockDocRef = { id: mockTenantCodeId };
      (addDoc as jest.Mock).mockResolvedValueOnce(mockDocRef);

      (doc as jest.Mock).mockReturnValueOnce("residenceDocRef");

      const mockResidenceSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValueOnce(mockResidenceSnap);

      await expect(
        firestore.generate_unique_code(mockResidenceUID, mockApartmentUID)
      ).rejects.toThrow(
        `Residence with UID: ${mockResidenceUID} not found in the residences collection`
      );
      expect(firestore.updateResidence).not.toHaveBeenCalled();
    });
  });

  describe("validateTenantCode", () => {
    it("should successfully validate a tenant code", async () => {
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            id: "code123",
            data: () => ({
              tenantCode: "123456",
              used: false,
              residenceId: "res123",
              apartmentId: "apt123",
            }),
          },
        ],
      };

      // Mock Firestore methods
      const mockCollectionRef = "tenantCodesCollectionRef";
      const mockWhereClause = "mockWhereClause";
      const mockQuery = "mockQuery";

      // Mock the Firestore functions
      (collection as jest.Mock).mockReturnValueOnce(mockCollectionRef);
      (where as jest.Mock).mockReturnValueOnce(mockWhereClause);
      (query as jest.Mock).mockReturnValueOnce(mockQuery);
      (getDocs as jest.Mock).mockResolvedValueOnce(mockQuerySnapshot);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      // Call the function
      const result = await firestore.validateTenantCode("123456");

      // Assertions
      expect(result).toEqual({
        residenceId: "res123",
        apartmentId: "apt123",
        tenantCodeUID: "code123",
      });

      // Validate the where call
      expect(where).toHaveBeenCalledWith("tenantCode", "==", "123456");

      // Validate the query call
      expect(query).toHaveBeenCalledWith(mockCollectionRef, mockWhereClause);

      // Ensure getDocs is called with the query
      expect(getDocs).toHaveBeenCalledWith(mockQuery);

      // Ensure updateDoc is called to mark the tenant code as used
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { used: true });
    });

    it("should throw an error if the code is invalid", async () => {
      (getDocs as jest.Mock).mockResolvedValue({ empty: true });
      await expect(firestore.validateTenantCode("invalid")).rejects.toThrow(
        "Code not found"
      );

      expect(getDocs).toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it("should throw an error if the code is already used", async () => {
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            id: "code123",
            data: () => ({
              tenantCode: "123456",
              used: true,
              residenceId: "res123",
              apartmentId: "apt123",
            }),
          },
        ],
      };

      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);
      await expect(firestore.validateTenantCode("123456")).rejects.toThrow(
        "Code already used"
      );

      expect(getDocs).toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it("should throw an error if the code is missing a residenceId", async () => {
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            id: "code123",
            data: () => ({
              tenantCode: "123456",
              used: false,
              residenceId: null,
              apartmentId: "apt123",
            }),
          },
        ],
      };

      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);
      await expect(firestore.validateTenantCode("123456")).rejects.toThrow(
        "This code doesn't reference a residence. Please contact your landlord."
      );
      expect(getDocs).toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it("should throw an error if the code is missing an apartmentId", async () => {
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            id: "code123",
            data: () => ({
              tenantCode: "123456",
              used: false,
              residenceId: "res123",
              apartmentId: null,
            }),
          },
        ],
      };

      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      await expect(firestore.validateTenantCode("123456")).rejects.toThrow(
        "This code doesn't reference an apartment. Please contact your landlord."
      );

      expect(getDocs).toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  describe("deleteUsedTenantCodes", () => {
    it("should successfully delete used tenant codes", async () => {
      const mockDocs = [{ id: "code1" }, { id: "code2" }];

      const mockQuerySnapshot = {
        docs: mockDocs,
        size: 2,
      };

      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await firestore.deleteUsedTenantCodes();
      expect(result).toBe(2);
      expect(deleteDoc).toHaveBeenCalledTimes(2);
    });

    it("should throw an error if the deletion fails", async () => {
      const mockError = new Error("Deletion failed");
      (getDocs as jest.Mock).mockRejectedValue(mockError);

      await expect(firestore.deleteUsedTenantCodes()).rejects.toThrow(
        mockError
      );
    });
  });
});
