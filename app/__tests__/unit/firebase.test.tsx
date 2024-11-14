import { User, Landlord, Tenant, Residence } from "../../../types/types";
import {
  createUser,
  getUser,
  deleteUser,
  createLandlord,
  getLandlord,
  updateLandlord,
  deleteLandlord,
  createTenant,
  getTenant,
  updateTenant,
  deleteTenant,
  createResidence,
  getResidence,
  updateResidence,
  deleteResidence,
} from "../../../firebase/firestore/firestore";

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

const mockUser: User = {
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

describe("Firestore Functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    beforeEach(() => {
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("usersCollectionRef");
    });

    const setupMocks = (addDocResult: any) => {
      (addDoc as jest.Mock).mockImplementationOnce(() => addDocResult);
    };

    it("should create a new user and return the document ID", async () => {
      setupMocks(Promise.resolve({ id: "mockDocId" }));

      const docId = await createUser(mockUser);

      expect(getFirestore).toHaveBeenCalledWith("mockedApp");
      expect(collection).toHaveBeenCalledWith("mockedFirestore", "users");
      expect(addDoc).toHaveBeenCalledWith("usersCollectionRef", mockUser);
      expect(docId).toBe("mockDocId");
    });

    it("should throw an error if addDoc fails", async () => {
      setupMocks(Promise.reject(new Error("Failed to add document.")));

      await expect(createUser(mockUser)).rejects.toThrow(
        "Failed to add document."
      );

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "users");
      expect(addDoc).toHaveBeenCalledWith("usersCollectionRef", mockUser);
    });

    it("should throw an error if user data is invalid", async () => {
      const invalidUser: Partial<User> = {
        uid: "789",
        email: "invalid@user.com",
      };
      await expect(createUser(invalidUser as User)).rejects.toThrow(
        "Cannot read properties of undefined (reading 'id')"
      );
    });
  });

  describe("getUser", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("usersCollectionRef");
      (query as jest.Mock).mockReturnValue("mockQuery");
      (where as jest.Mock).mockImplementation(() => "whereClause");
    });

    const setupGetDocsMock = (querySnapshot: any) => {
      (getDocs as jest.Mock).mockResolvedValue(querySnapshot);
    };

    it("should return user data and document ID if user is found", async () => {
      const mockUid = mockUser.uid;
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            id: "mockDocId",
            data: () => mockUser,
          },
        ],
      };

      setupGetDocsMock(mockQuerySnapshot);

      const result = await getUser(mockUid);

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "users");
      expect(where).toHaveBeenCalledWith("uid", "==", mockUid);
      expect(query).toHaveBeenCalledWith("usersCollectionRef", "whereClause");
      expect(getDocs).toHaveBeenCalledWith("mockQuery");
      expect(result).toEqual({
        user: mockUser,
        userUID: "mockDocId",
      });
    });

    it("should return null if no user is found", async () => {
      const mockUid = mockUser.uid;
      const mockQuerySnapshot = { empty: true, docs: [] };

      setupGetDocsMock(mockQuerySnapshot);

      const result = await getUser(mockUid);

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "users");
      expect(where).toHaveBeenCalledWith("uid", "==", mockUid);
      expect(query).toHaveBeenCalledWith("usersCollectionRef", "whereClause");
      expect(getDocs).toHaveBeenCalledWith("mockQuery");
      expect(result).toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("should delete a user document by UID", async () => {
      const mockUid = "123";
      // Return values
      (doc as jest.Mock).mockReturnValue("mockedDocRef");
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      // Execute function
      await deleteUser(mockUid);
      expect(doc).toHaveBeenCalledWith("mockedFirestore", "users", mockUid);
      expect(deleteDoc).toHaveBeenCalledWith("mockedDocRef");
    });

    it("should throw an error if deleteDoc fails", async () => {
      const mockUid = "456";

      (doc as jest.Mock).mockReturnValue("mockedDocRef");
      (deleteDoc as jest.Mock).mockRejectedValue(
        new Error("Failed to delete document")
      );

      await expect(deleteUser(mockUid)).rejects.toThrow(
        "Failed to delete document"
      );

      expect(doc).toHaveBeenCalledWith("mockedFirestore", "users", mockUid);
      expect(deleteDoc).toHaveBeenCalledWith("mockedDocRef");
    });
  });

  describe("createLandlord", () => {
    it("should create a new landlord and return the userId", async () => {
      const mockLandlord: Landlord = {
        userId: "landlord123",
        residenceIds: ["res1", "res2"],
      };

      const { collection, doc, setDoc } = require("firebase/firestore");

      (collection as jest.Mock).mockReturnValue("landlordsCollectionRef");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const returnedUserId = await createLandlord(mockLandlord);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        mockLandlord.userId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockLandlord);
      expect(returnedUserId).toBe("landlord123");
    });

    it("should throw an error if landlord data is invalid", async () => {
      const invalidLandlord: Partial<Landlord> = {
        // Missing required fields like 'userId', 'residenceIds'
        residenceIds: ["res5"],
      };

      // Execute function and expect it to throw
      await expect(createLandlord(invalidLandlord as Landlord)).rejects.toThrow(
        "Invalid landlord data"
      );

      // Ensure Firestore methods are not called
      const {
        getFirestore,
        collection,
        doc,
        setDoc,
      } = require("firebase/firestore");
      expect(getFirestore).not.toHaveBeenCalled();
      expect(collection).not.toHaveBeenCalled();
      expect(doc).not.toHaveBeenCalled();
      expect(setDoc).not.toHaveBeenCalled();
    });
  });
  describe("getLandlord", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (collection as jest.Mock).mockReturnValue("landlordsCollectionRef");
    });

    const setupGetDocsMock = (querySnapshot: any) => {
      (getDocs as jest.Mock).mockResolvedValue(querySnapshot);
    };

    it("should return landlord data and document ID if landlord is found", async () => {
      const mockUserId = "user123";
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            id: "landlord789",
            data: () => ({
              userId: mockUserId,
              residenceIds: ["res1", "res2", "res3"],
            }),
          },
        ],
      };

      setupGetDocsMock(mockQuerySnapshot);

      const result = await getLandlord(mockUserId);

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "landlords");
      expect(getDocs).toHaveBeenCalledWith("mockQuery");
      expect(result).toEqual({
        landlord: {
          userId: mockUserId,
          residenceIds: ["res1", "res2", "res3"],
        },
        landlordUID: "landlord789",
      });
    });

    it("should return null if no landlord is found", async () => {
      const mockQuerySnapshot = { empty: true, docs: [] };

      setupGetDocsMock(mockQuerySnapshot);

      const result = await getLandlord("nonexistent123");

      expect(result).toBeNull();
    });

    it("should throw an error for invalid userId", async () => {
      await expect(getLandlord(null as unknown as string)).rejects.toThrow(
        "Invalid userId"
      );
    });

    it("should throw an error if getDocs fails", async () => {
      const mockError = new Error("Firestore error");

      (getDocs as jest.Mock).mockRejectedValue(mockError);

      await expect(getLandlord("user123")).rejects.toThrow("Firestore error");
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

      await updateLandlord(mockUserId, validLandlordData);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        mockUserId
      );
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", validLandlordData);
    });

    it("should throw an error for invalid userId", async () => {
      await expect(
        updateLandlord(null as unknown as string, validLandlordData)
      ).rejects.toThrow("Invalid userId");

      await expect(updateLandlord("", validLandlordData)).rejects.toThrow(
        "Invalid userId"
      );
    });

    it("should throw an error if Firestore update fails", async () => {
      const mockError = new Error("Firestore update error");
      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        updateLandlord("validId", validLandlordData)
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
        updateLandlord(mockUserId, { userId: "user123" } as Partial<Landlord>)
      ).rejects.toThrow("Invalid landlord data");

      // Test empty landlord data
      await expect(
        updateLandlord(mockUserId, {} as Partial<Landlord>)
      ).rejects.toThrow("Invalid landlord data");

      // Test missing required fields with other fields present
      await expect(
        updateLandlord(mockUserId, {
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
      await deleteLandlord(mockUserId);
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
      await expect(deleteLandlord(mockUserId)).rejects.toThrow(
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

    (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
    (doc as jest.Mock).mockReturnValue("mockDocRef");

    it("should successfully create a tenant document", async () => {
      (setDoc as jest.Mock).mockResolvedValue(undefined);
      await createTenant(mockTenant);
      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "tenants",
        mockTenant.userId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockTenant);
    });

    it("should throw an error if creation fails", async () => {
      //update the mockTenant object to have an empty maintenanceRequests array
      mockTenant.maintenanceRequests = [];
      const mockError = new Error("Firestore creation error");

      (setDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(createTenant(mockTenant)).rejects.toThrow(
        "Firestore creation error"
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "tenants",
        mockTenant.userId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockTenant);
    });
  });

  describe("getTenant", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (collection as jest.Mock).mockReturnValue("tenantsCollectionRef");
      (query as jest.Mock).mockReturnValue("mockQuery");
      (where as jest.Mock).mockReturnValue("whereClause");
    });

    const setupGetDocsMock = (querySnapshot: any) => {
      (getDocs as jest.Mock).mockResolvedValue(querySnapshot);
    };

    it("should return tenant data and document ID if tenant is found", async () => {
      const mockUserId = "tenant123";
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            id: "mockTenantDocId",
            data: () => ({
              userId: mockUserId,
              maintenanceRequests: ["request1", "request2"],
              apartmentId: "apt101",
              residenceId: "res789",
            }),
          },
        ],
      };

      setupGetDocsMock(mockQuerySnapshot);
      const result = await getTenant(mockUserId);
      expect(collection).toHaveBeenCalledWith("mockedFirestore", "tenants");
      expect(where).toHaveBeenCalledWith("userId", "==", mockUserId);
      expect(query).toHaveBeenCalledWith("tenantsCollectionRef", "whereClause");
      expect(getDocs).toHaveBeenCalledWith("mockQuery");
      expect(result).toEqual({
        tenant: {
          userId: mockUserId,
          maintenanceRequests: ["request1", "request2"],
          apartmentId: "apt101",
          residenceId: "res789",
        },
        tenantUID: "mockTenantDocId",
      });
    });

    it("should return null if no tenant is found", async () => {
      const mockQuerySnapshot = { empty: true, docs: [] };

      setupGetDocsMock(mockQuerySnapshot);

      const result = await getTenant("nonexistent123");

      expect(result).toBeNull();
    });
  });

  describe("updateTenant", () => {
    (doc as jest.Mock).mockReturnValue("mockDocRef");
    const mockUid = "tenant123";

    it("should successfully update a tenant document with the provided data", async () => {
      const mockTenantData = { apartmentId: "apt456" };
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      await updateTenant(mockUid, mockTenantData);
      expect(doc).toHaveBeenCalledWith("mockedFirestore", "tenants", mockUid);
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", mockTenantData);
    });

    it("should throw an error if updateDoc fails", async () => {
      const mockTenantData = { residenceId: "res789" };
      const mockError = new Error("Failed to update document");

      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(updateTenant(mockUid, mockTenantData)).rejects.toThrow(
        "Failed to update document"
      );

      expect(doc).toHaveBeenCalledWith("mockedFirestore", "tenants", mockUid);
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", mockTenantData);
    });
  });

  describe("deleteTenant", () => {
    const mockUserId = "tenant123";
    (doc as jest.Mock).mockReturnValue("mockDocRef");
    it("should successfully delete a tenant document by UID", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await deleteTenant(mockUserId);

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

      await expect(deleteTenant(mockUserId)).rejects.toThrow(
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

  jest.mock("../../../firebase/firestore/firestore", () => ({
    createUser: jest.fn(),
    createTenant: jest.fn().mockResolvedValue(undefined), // Mock tenant creation
  }));

  jest.mock("../../../firebase/firebase", () => ({
    auth: {
      currentUser: {
        uid: "testAuthUserId",
      },
    },
  }));

  jest.mock("firebase/firestore", () => ({
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    collection: jest.fn(),
    updateDoc: jest.fn(),
    addDoc: jest.fn(),
    arrayUnion: jest.fn((value) => value),
  }));

  describe("createResidence", () => {
    const mockResidence = {
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

    it("should successfully create a residence document with the provided data", async () => {
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await createResidence(mockResidence);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences",
        mockResidence.residenceId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockResidence);
    });

    it("should throw an error if setDoc fails", async () => {
      const mockError = new Error("Failed to create document");

      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (setDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(createResidence(mockResidence)).rejects.toThrow(
        "Failed to create document"
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences",
        mockResidence.residenceId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockResidence);
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

      const result = await getResidence(mockResidenceId);

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

      const resultForNonExistentDoc = await getResidence(mockResidenceId);
      expect(resultForNonExistentDoc).toBeNull();

      // Mock a failed getDoc call
      const mockError = new Error("Failed to retrieve document");
      (getDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(getResidence(mockResidenceId)).rejects.toThrow(
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
        updateResidence(null as unknown as string, validResidenceData)
      ).rejects.toThrow("Failed to update document");

      // Test empty string residenceId
      await expect(updateResidence("", validResidenceData)).rejects.toThrow(
        "Failed to update document"
      );

      // Test Firestore update failure
      const mockError = new Error("Firestore update error");

      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        updateResidence("res123", validResidenceData)
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
      await expect(updateResidence(mockResidenceId, emptyData)).rejects.toThrow(
        "Firestore update error"
      );

      // Test missing required fields
      const missingRequiredFields = {
        street: "New Street",
      } as Partial<Residence>;
      await expect(
        updateResidence(mockResidenceId, missingRequiredFields)
      ).rejects.toThrow("Firestore update error");
    });
  });

  describe("deleteResidence", () => {
    it("should successfully delete a residence document or handle errors", async () => {
      const mockResidenceId = "res123";

      // Mock successful deletion
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await deleteResidence(mockResidenceId);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences",
        mockResidenceId
      );
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");

      // Mock Firestore delete failure
      const mockError = new Error("Firestore delete error");
      (deleteDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(deleteResidence(mockResidenceId)).rejects.toThrow(
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
      await expect(deleteResidence(null as unknown as string)).rejects.toThrow(
        "Firestore delete error"
      );

      // Test empty string residenceId
      await expect(deleteResidence("")).rejects.toThrow(
        "Firestore delete error"
      );
    });
  });
});
