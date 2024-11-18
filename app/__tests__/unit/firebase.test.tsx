import {
  TUser,
  Landlord,
  Tenant,
  Residence,
  Apartment,
  LaundryMachine,
  MaintenanceRequest,
} from "../../../types/types";
import {
  createUser,
  getUser,
  deleteUser,
  updateUser,
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
  createApartment,
  getApartment,
  updateApartment,
  deleteApartment,
  createMaintenanceRequest,
  getMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  createLaundryMachine,
  getLaundryMachine,
  updateLaundryMachine,
  deleteLaundryMachine,
  add_new_landlord,
  add_new_tenant,
  generate_unique_code,
  validateTenantCode,
  getAllLaundryMachines,
  deleteUsedTenantCodes,
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
      const invalidUser: Partial<TUser> = {
        uid: "789",
        email: "invalid@user.com",
      };
      await expect(createUser(invalidUser as TUser)).rejects.toThrow(
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

      await updateUser(mockUid, mockUserUpdate);

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

      await expect(updateUser(mockUid, mockUserUpdate)).rejects.toThrow(
        "Failed to update document"
      );

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
        updateUser(mockUid, invalidUserUpdate as Partial<TUser>)
      ).rejects.toThrow("Invalid user data");

      expect(doc).toHaveBeenCalledWith("mockedFirestore", "users", mockUid);
      expect(updateDoc).toHaveBeenCalledWith("mockedDocRef", invalidUserUpdate);
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

  describe("createApartment", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (setDoc as jest.Mock).mockResolvedValue(undefined);
    });

    const mockApartment: Apartment = {
      apartmentId: "apt123",
      residenceId: "res456",
      tenants: [],
      maintenanceRequests: [],
    };

    it("should successfully create an apartment document", async () => {
      await createApartment(mockApartment);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "apartments",
        mockApartment.apartmentId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockApartment);
    });

    it("should throw an error if setDoc fails", async () => {
      const mockError = new Error("Failed to create apartment");
      (setDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(createApartment(mockApartment)).rejects.toThrow(
        "Failed to create apartment"
      );

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "apartments",
        mockApartment.apartmentId
      );
      expect(setDoc).toHaveBeenCalledWith("mockDocRef", mockApartment);
    });

    it("should throw an error for invalid apartment data", async () => {
      const invalidApartment = {
        ...mockApartment,
        apartmentId: "",
      };

      await expect(createApartment(invalidApartment)).rejects.toThrow();

      const missingResidenceId: Apartment = {
        apartmentId: "apt123",
        residenceId: "",
        tenants: [],
        maintenanceRequests: [],
      };

      await expect(createApartment(missingResidenceId)).rejects.toThrow();
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

      const result = await getApartment(mockApartmentId);
      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "apartments",
        mockApartmentId
      );
      expect(getDoc).toHaveBeenCalledWith("mockDocRef");
      expect(result).toEqual(mockApartmentData);
    });

    it("should throw an error for invalid apartmentId", async () => {
      await expect(getApartment(null as unknown as string)).rejects.toThrow();
      await expect(getApartment("")).rejects.toThrow();
    });

    it("should return null if the document does not exist", async () => {
      const mockApartmentId = "nonexistent";
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await getApartment(mockApartmentId);

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

      await expect(getApartment(mockApartmentId)).rejects.toThrow(mockError);

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
        updateApartment(null as unknown as string, validApartmentData)
      ).rejects.toThrow();
      await expect(updateApartment("", validApartmentData)).rejects.toThrow();

      const mockError = new Error("Firestore update error");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        updateApartment("apt123", validApartmentData)
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
        updateApartment(mockApartmentId, invalidApartmentData)
      ).rejects.toThrow();
    });

    it("should throw an error for missing apartmentId", async () => {
      const validApartmentData: Partial<Apartment> = {
        residenceId: "res456",
      };
      await expect(
        updateApartment(null as unknown as string, validApartmentData)
      ).rejects.toThrow();
    });

    it("should throw an error for empty string apartmentId", async () => {
      const validApartmentData: Partial<Apartment> = {
        residenceId: "res456",
      };
      await expect(updateApartment("", validApartmentData)).rejects.toThrow();
    });

    it("should successfully update an apartment document with the provided data", async () => {
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      await updateApartment("apt123", { residenceId: "res456" });
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
      await deleteApartment("apt123");
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error if deleteDoc fails", async () => {
      const mockError = new Error("Firestore delete error");
      (deleteDoc as jest.Mock).mockRejectedValue(mockError);
      await expect(deleteApartment("apt123")).rejects.toThrow(mockError);
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error for invalid apartmentId", async () => {
      await expect(
        deleteApartment(null as unknown as string)
      ).rejects.toThrow();
      await expect(deleteApartment("")).rejects.toThrow();
    });
  });

  describe("createMaintenanceRequest", () => {
    it("should successfully create a maintenance request document", async () => {
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await createMaintenanceRequest(mockMaintenanceRequest);

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
        createMaintenanceRequest(mockMaintenanceRequest)
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
        createMaintenanceRequest(
          invalidMaintenanceRequest as MaintenanceRequest
        )
      ).rejects.toThrow();
    });

    it("should throw an error for missing required fields", async () => {
      const missingRequiredFields: Partial<MaintenanceRequest> = {};
      await expect(
        createMaintenanceRequest(missingRequiredFields as MaintenanceRequest)
      ).rejects.toThrow();

      const missingResidenceId: Partial<MaintenanceRequest> = {
        apartmentId: "apt123",
      };
      await expect(
        createMaintenanceRequest(missingResidenceId as MaintenanceRequest)
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

      const result = await getMaintenanceRequest(mockMaintenanceRequestId);
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

      const result = await getMaintenanceRequest(mockMaintenanceRequestId);
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
        getMaintenanceRequest(mockMaintenanceRequestId)
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
        getMaintenanceRequest(null as unknown as string)
      ).rejects.toThrow();
      await expect(getMaintenanceRequest("")).rejects.toThrow();
    });
  });

  describe("updateMaintenanceRequest", () => {
    it("should throw an error for invalid maintenanceRequestId or Firestore failures", async () => {
      const validMaintenanceRequestData: Partial<MaintenanceRequest> = {
        requestID: "mr123",
      };

      await expect(
        updateMaintenanceRequest(
          null as unknown as string,
          validMaintenanceRequestData
        )
      ).rejects.toThrow();

      await expect(
        updateMaintenanceRequest("", validMaintenanceRequestData)
      ).rejects.toThrow();

      const mockError = new Error("Firestore update error");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (updateDoc as jest.Mock).mockRejectedValue(mockError);

      await expect(
        updateMaintenanceRequest("mr123", validMaintenanceRequestData)
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
        updateMaintenanceRequest(
          mockMaintenanceRequestId,
          invalidMaintenanceRequest
        )
      ).rejects.toThrow();

      const missingResidenceId: Partial<MaintenanceRequest> = {
        apartmentId: "apt123",
      };
      await expect(
        updateMaintenanceRequest(mockMaintenanceRequestId, missingResidenceId)
      ).rejects.toThrow();

      const missingApartmentId: Partial<MaintenanceRequest> = {
        requestID: "mr123",
      };
      await expect(
        updateMaintenanceRequest(mockMaintenanceRequestId, missingApartmentId)
      ).rejects.toThrow();
    });

    it("should throw an error for missing maintenanceRequestId", async () => {
      const validMaintenanceRequestData: Partial<MaintenanceRequest> = {
        apartmentId: "apt123",
      };
      await expect(
        updateMaintenanceRequest(
          null as unknown as string,
          validMaintenanceRequestData
        )
      ).rejects.toThrow();

      await expect(
        updateMaintenanceRequest("", validMaintenanceRequestData)
      ).rejects.toThrow();
    });

    it("should successfully update a maintenance request document with the provided data", async () => {
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      await updateMaintenanceRequest("mr123", { apartmentId: "apt123" });
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", {
        apartmentId: "apt123",
      });
    });
  });

  describe("deleteMaintenanceRequest", () => {
    it("should successfully delete a maintenance request document", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      await deleteMaintenanceRequest("mr123");
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error if deleteDoc fails", async () => {
      const mockError = new Error("Firestore delete error");
      (deleteDoc as jest.Mock).mockRejectedValue(mockError);
      await expect(deleteMaintenanceRequest("mr123")).rejects.toThrow(
        mockError
      );
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error for invalid maintenanceRequestId", async () => {
      await expect(
        deleteMaintenanceRequest(null as unknown as string)
      ).rejects.toThrow();
      await expect(deleteMaintenanceRequest("")).rejects.toThrow();
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
      await createLaundryMachine("residence123", mockMachine);
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
        createLaundryMachine("residence123", mockMachine)
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
        createLaundryMachine("residence123", invalidMachine as LaundryMachine)
      ).rejects.toThrow();
    });

    it("should throw an error for missing residenceId", async () => {
      const mockMachine: LaundryMachine = {
        laundryMachineId: "machine123",
        isAvailable: true,
        isFunctional: true,
      };
      await expect(
        createLaundryMachine(null as unknown as string, mockMachine)
      ).rejects.toThrow();
      await expect(createLaundryMachine("", mockMachine)).rejects.toThrow();
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

      const result = await getLaundryMachine("residence123", "machine123");

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "residences/residence123/laundryMachines",
        "machine123"
      );
      expect(result).toEqual(mockMachine);
    });

    it("should throw an error for invalid laundry machineId", async () => {
      await expect(
        getLaundryMachine("residence123", null as unknown as string)
      ).rejects.toThrow();
      await expect(getLaundryMachine("residence123", "")).rejects.toThrow();
    });

    it("should throw an error for missing residenceId", async () => {
      await expect(
        getLaundryMachine(null as unknown as string, "machine123")
      ).rejects.toThrow();
      await expect(getLaundryMachine("", "machine123")).rejects.toThrow();
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

      await updateLaundryMachine(
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
        updateLaundryMachine(
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
        updateLaundryMachine(
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
        updateLaundryMachine("residence123", "", mockMachineUpdate)
      ).rejects.toThrow();
    });

    it("should throw an error for missing residenceId", async () => {
      const mockMachineUpdate: Partial<LaundryMachine> = {
        isAvailable: false,
      };
      await expect(
        updateLaundryMachine(
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
        updateLaundryMachine("", "machine123", mockMachineUpdate)
      ).rejects.toThrow();
    });
  });

  describe("deleteLaundryMachine", () => {
    it("should successfully delete a laundry machine document", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      await deleteLaundryMachine("residence123", "machine123");
      expect(deleteDoc).toHaveBeenCalledWith("mockDocRef");
    });

    it("should throw an error if deleteDoc fails", async () => {
      const mockError = new Error("Firestore delete error");
      (deleteDoc as jest.Mock).mockRejectedValue(mockError);
      await expect(
        deleteLaundryMachine("residence123", "machine123")
      ).rejects.toThrow(mockError);
    });

    it("should throw an error for invalid laundry machineId", async () => {
      await expect(
        deleteLaundryMachine("residence123", null as unknown as string)
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

      const result = await getAllLaundryMachines("residence123");
      expect(result).toEqual(mockMachines);
    });

    it("should throw an error for invalid residenceId", async () => {
      await expect(
        getAllLaundryMachines(null as unknown as string)
      ).rejects.toThrow("Invalid residence ID");

      await expect(getAllLaundryMachines("")).rejects.toThrow(
        "Invalid residence ID"
      );
    });

    it("should throw an error if getDocs fails", async () => {
      const mockError = new Error("Firestore error");
      (getDocs as jest.Mock).mockRejectedValue(mockError);

      await expect(getAllLaundryMachines("residence123")).rejects.toThrow(
        mockError
      );
    });

    it("should return an empty array if no laundry machines are found", async () => {
      const mockQuerySnapshot = {
        forEach: (callback: (doc: any) => void) => {}, // Empty forEach implementation
      };

      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getAllLaundryMachines("residence123");
      expect(result).toEqual([]);
    });
  });

  describe("generate_unique_code", () => {
    it("should successfully generate a unique code", async () => {
      // Mock successful responses
      const mockResidenceSnapshot = {
        empty: false,
        docs: [
          {
            id: "res123",
            data: () => ({
              residenceId: "res123",
            }),
          },
        ],
      };

      const mockApartmentSnapshot = {
        empty: false,
        docs: [
          {
            id: "apt123",
            data: () => ({
              apartmentId: "apt123",
              residenceId: "res123",
            }),
          },
        ],
      };

      const mockDocRef = {
        id: "tenantCode123",
      };

      // Set up mocks
      (getDocs as jest.Mock)
        .mockResolvedValueOnce(mockResidenceSnapshot) // For residence query
        .mockResolvedValueOnce(mockApartmentSnapshot); // For apartment query

      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      // Call function
      const result = await generate_unique_code("res123", "apt123");

      // Verify result is a 6 digit string
      expect(result).toMatch(/^\d{6}$/);

      // Verify correct collection queries were made
      expect(collection).toHaveBeenCalledWith(expect.anything(), "residences");
      expect(collection).toHaveBeenCalledWith(expect.anything(), "apartments");
      expect(collection).toHaveBeenCalledWith(expect.anything(), "tenantCodes");

      // Verify tenant code was added
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          apartmentId: "apt123",
          residenceId: "res123",
          used: false,
          tenantCode: expect.any(String),
        })
      );

      // Verify residence was updated with new tenant code ID
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
        tenantCodesID: arrayUnion("tenantCode123"),
      });
    });

    it("should throw an error if the residence doesn't exist", async () => {
      (getDocs as jest.Mock).mockResolvedValue({ empty: true });

      await expect(generate_unique_code("res123", "apt123")).rejects.toThrow(
        "No matching residence found for the given residence ID"
      );
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
            }),
          },
        ],
      };

      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await validateTenantCode("123456");
      expect(result).toBe("code123");
    });

    it("should return null if the code is invalid", async () => {
      (getDocs as jest.Mock).mockResolvedValue({ empty: true });

      const result = await validateTenantCode("invalid");
      expect(result).toBeNull();
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

      const result = await deleteUsedTenantCodes();
      expect(result).toBe(2);
      expect(deleteDoc).toHaveBeenCalledTimes(2);
    });

    it("should throw an error if the deletion fails", async () => {
      const mockError = new Error("Deletion failed");
      (getDocs as jest.Mock).mockRejectedValue(mockError);

      await expect(deleteUsedTenantCodes()).rejects.toThrow(mockError);
    });
  });
});
