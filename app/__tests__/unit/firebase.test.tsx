import { User, Landlord, Tenant } from "../../../types/types";
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
} from "../../../firebase/firestore/firestore";

describe("Firestore Functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    afterEach(() => {
      jest.clearAllMocks(); // Ensure all mocks are reset after each test
    });

    it("should create a new user and return the document ID", async () => {
      const mockUser: User = {
        uid: "123",
        type: "tenant",
        name: "Hola Quetal",
        email: "hola@quetal.com",
        phone: "+41234567890",
        street: "Espagna Street",
        number: "10",
        city: "Barcelona",
        canton: "Catalona",
        zip: "12345",
        country: "Espana",
      };

      const mockDocRef = { id: "mockDocId" };

      // Access mocked functions
      const {
        collection,
        addDoc,
        getFirestore,
      } = require("firebase/firestore");

      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("usersCollectionRef");
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const docId = await createUser(mockUser);

      expect(getFirestore).toHaveBeenCalledWith("mockedApp");
      expect(collection).toHaveBeenCalledWith("mockedFirestore", "users");
      expect(addDoc).toHaveBeenCalledWith("usersCollectionRef", mockUser);
      expect(docId).toBe("mockDocId");
    });

    it("should throw an error if addDoc fails", async () => {
      const mockUser: User = {
        uid: "456",
        type: "landlord",
        name: "Juan Perez",
        email: "juan@perez.com",
        phone: "+41765432109",
        street: "Calle Luna",
        number: "22B",
        city: "Madrid",
        canton: "Madrid",
        zip: "28001",
        country: "España",
      };

      // Access mocked functions
      const { collection, addDoc } = require("firebase/firestore");

      (collection as jest.Mock).mockReturnValue("usersCollectionRef");
      (addDoc as jest.Mock).mockRejectedValue(
        new Error("Failed to add document.")
      );

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

      // Execute function and expect it to throw
      await expect(createUser(invalidUser as User)).rejects.toThrow(
        "Failed to add document."
      );
    });
  });

  describe("getUser", () => {
    it("should return user data and document ID if user is found", async () => {
      const mockUid = "123";
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            id: "mockDocId",
            data: () => ({
              uid: mockUid,
              type: "tenant",
              name: "Hola Quetal",
              email: "hola@quetal.com",
              phone: "+41234567890",
              street: "Espagna Street",
              number: "10",
              city: "Barcelona",
              canton: "Catalona",
              zip: "12345",
              country: "Espana",
            }),
          },
        ],
      };

      // Access mocked functions
      const {
        collection,
        query,
        getDocs,
        where,
        getFirestore,
      } = require("firebase/firestore");

      // Return values
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("usersCollectionRef");
      (query as jest.Mock).mockReturnValue("mockQuery");
      (where as jest.Mock).mockImplementation(() => "whereClause");
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getUser(mockUid);

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "users");
      expect(where).toHaveBeenCalledWith("uid", "==", mockUid);
      expect(query).toHaveBeenCalledWith("usersCollectionRef", "whereClause");
      expect(getDocs).toHaveBeenCalledWith("mockQuery");
      expect(result).toEqual({
        user: {
          uid: mockUid,
          type: "tenant",
          name: "Hola Quetal",
          email: "hola@quetal.com",
          phone: "+41234567890",
          street: "Espagna Street",
          number: "10",
          city: "Barcelona",
          canton: "Catalona",
          zip: "12345",
          country: "Espana",
        },
        userUID: "mockDocId",
      });
    });

    it("should return null if no user is found", async () => {
      const mockUid = "123";
      const mockQuerySnapshot = { empty: true, docs: [] };

      const {
        collection,
        query,
        getDocs,
        where,
        getFirestore,
      } = require("firebase/firestore");

      // Return values
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("usersCollectionRef");
      (query as jest.Mock).mockReturnValue("mockQuery");
      (where as jest.Mock).mockImplementation(() => "whereClause");
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      // Execute function
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
      const { doc, deleteDoc } = require("firebase/firestore");

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

      const { doc, deleteDoc } = require("firebase/firestore");

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

      const {
        collection,
        query,
        getDocs,
        where,
        getFirestore,
      } = require("firebase/firestore");

      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("landlordsCollectionRef");
      (query as jest.Mock).mockReturnValue("mockQuery");
      (where as jest.Mock).mockImplementation(() => "whereClause");
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getLandlord(mockUserId);

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "landlords");
      expect(where).toHaveBeenCalledWith("userId", "==", mockUserId);
      expect(query).toHaveBeenCalledWith(
        "landlordsCollectionRef",
        "whereClause"
      );
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
      const mockUserId = "nonexistent123";
      const mockQuerySnapshot = { empty: true, docs: [] };

      const {
        collection,
        query,
        getDocs,
        where,
        getFirestore,
      } = require("firebase/firestore");

      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("landlordsCollectionRef");
      (query as jest.Mock).mockReturnValue("mockQuery");
      (where as jest.Mock).mockImplementation(() => "whereClause");
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getLandlord(mockUserId);

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "landlords");
      expect(where).toHaveBeenCalledWith("userId", "==", mockUserId);
      expect(query).toHaveBeenCalledWith(
        "landlordsCollectionRef",
        "whereClause"
      );
      expect(getDocs).toHaveBeenCalledWith("mockQuery");
      expect(result).toBeNull();
    });

    it("should throw an error for invalid userId (null)", async () => {
      await expect(getLandlord(null as unknown as string)).rejects.toThrow(
        "Invalid userId"
      );
    });

    it("should throw an error if getDocs fails", async () => {
      const mockUserId = "user123";
      const mockError = new Error("Firestore error");

      const {
        collection,
        query,
        getDocs,
        where,
        getFirestore,
      } = require("firebase/firestore");

      // Return values
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("landlordsCollectionRef");
      (query as jest.Mock).mockReturnValue("mockQuery");
      (where as jest.Mock).mockImplementation(() => "whereClause");
      (getDocs as jest.Mock).mockRejectedValue(mockError);

      await expect(getLandlord(mockUserId)).rejects.toThrow("Firestore error");

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "landlords");
      expect(where).toHaveBeenCalledWith("userId", "==", mockUserId);
      expect(query).toHaveBeenCalledWith(
        "landlordsCollectionRef",
        "whereClause"
      );
      expect(getDocs).toHaveBeenCalledWith("mockQuery");
    });
  });

  describe("updateLandlord", () => {
    it("should successfully update a landlord with full data", async () => {
      const mockUserId = "landlord123";
      const mockLandlordData: Partial<Landlord> = {
        userId: "user123",
        residenceIds: ["res1", "res2"],
      };

      const { doc, updateDoc, getFirestore } = require("firebase/firestore");

      // Return values
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateLandlord(mockUserId, mockLandlordData);

      expect(doc).toHaveBeenCalledWith(
        "mockedFirestore",
        "landlords",
        mockUserId
      );
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", mockLandlordData);
    });

    it("should throw errors for invalid userId or Firestore failures", async () => {
      const validLandlordData: Partial<Landlord> = {
        userId: "user123",
        residenceIds: ["res1"],
      };

      // Test null userId
      await expect(
        updateLandlord(null as unknown as string, validLandlordData)
      ).rejects.toThrow("Invalid userId");

      // Test empty string userId
      await expect(updateLandlord("", validLandlordData)).rejects.toThrow(
        "Invalid userId"
      );

      // Test Firestore update failure
      const mockError = new Error("Firestore update error");
      const { doc, updateDoc, getFirestore } = require("firebase/firestore");

      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
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
      const missingResidenceIds: Partial<Landlord> = {
        userId: "user123",
      };
      await expect(
        updateLandlord(mockUserId, missingResidenceIds)
      ).rejects.toThrow("Invalid landlord data");

      // Test empty landlord data
      const emptyData: Partial<Landlord> = {};
      await expect(updateLandlord(mockUserId, emptyData)).rejects.toThrow(
        "Invalid landlord data"
      );

      // Test missing required fields with other fields present
      const missingRequiredFields = {
        someOtherField: "value",
      } as Partial<Landlord>;
      await expect(
        updateLandlord(mockUserId, missingRequiredFields)
      ).rejects.toThrow("Invalid landlord data");
    });
  });

  describe("deleteLandlord", () => {
    it("should successfully delete a landlord document", async () => {
      const mockUserId = "landlord123";
      const { doc, deleteDoc, getFirestore } = require("firebase/firestore");

      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
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
      const mockUserId = "landlord123";
      const mockError = new Error("Firestore deletion error");
      const { doc, deleteDoc, getFirestore } = require("firebase/firestore");

      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully create a tenant document", async () => {
      const mockTenant: Tenant = {
        userId: "tenant123",
        maintenanceRequests: ["request1", "request2"],
        apartmentId: "apt101",
        residenceId: "res789",
      };

      const { doc, setDoc, getFirestore } = require("firebase/firestore");

      // Return values
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
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
      const mockTenant: Tenant = {
        userId: "tenant123",
        maintenanceRequests: [],
        apartmentId: "apt101",
        residenceId: "res789",
      };
      const mockError = new Error("Firestore creation error");

      const { doc, setDoc, getFirestore } = require("firebase/firestore");

      // Return values
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (doc as jest.Mock).mockReturnValue("mockDocRef");
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

      const {
        collection,
        query,
        getDocs,
        where,
        getFirestore,
      } = require("firebase/firestore");

      // Return values
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("tenantsCollectionRef");
      (query as jest.Mock).mockReturnValue("mockQuery");
      (where as jest.Mock).mockImplementation(() => "whereClause");
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

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
      const mockUserId = "nonexistent123";
      const mockQuerySnapshot = { empty: true, docs: [] };

      const {
        collection,
        query,
        getDocs,
        where,
        getFirestore,
      } = require("firebase/firestore");

      // Return values
      (getFirestore as jest.Mock).mockReturnValue("mockedFirestore");
      (collection as jest.Mock).mockReturnValue("tenantsCollectionRef");
      (query as jest.Mock).mockReturnValue("mockQuery");
      (where as jest.Mock).mockImplementation(() => "whereClause");
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getTenant(mockUserId);

      expect(collection).toHaveBeenCalledWith("mockedFirestore", "tenants");
      expect(where).toHaveBeenCalledWith("userId", "==", mockUserId);
      expect(query).toHaveBeenCalledWith("tenantsCollectionRef", "whereClause");
      expect(getDocs).toHaveBeenCalledWith("mockQuery");
      expect(result).toBeNull();
    });
  });
});
