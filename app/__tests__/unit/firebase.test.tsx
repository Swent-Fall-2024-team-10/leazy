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
  add_new_tenant,
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
});
