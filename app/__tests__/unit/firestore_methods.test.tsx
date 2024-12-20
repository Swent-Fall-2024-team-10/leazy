import {
    TUser,
    Landlord,
    Tenant,
    Residence,
    Apartment,
    LaundryMachine,
    MaintenanceRequest,
    TenantCode,
    News
  } from "../../../types/types";
  import { db } from "../../../firebase/firebase";
  import { Timestamp } from "firebase/firestore";
  import * as firestore from "../../../firebase/firestore/firestore";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import { useNetworkStore } from "../../../app/stores/NetworkStore";
  
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
    getDocFromServer,
    getDocFromCache,
    arrayRemove,
    arrayUnion,
    onSnapshot,
    serverTimestamp
  } = require("firebase/firestore");
  
  // Mock all the external dependencies
  jest.mock('firebase/firestore', () => ({
    memoryLocalCache: jest.fn(),
    initializeFirestore: jest.fn(),
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    getDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    deleteDoc: jest.fn(),
    updateDoc: jest.fn(),
    getDocFromServer: jest.fn(),
    getDocFromCache: jest.fn(),
    arrayRemove: jest.fn(),
    arrayUnion: jest.fn(),
    onSnapshot: jest.fn(),
    serverTimestamp: jest.fn()
  }));
  
  jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    getAllKeys: jest.fn()
  }));
  
  jest.mock('../../../app/stores/NetworkStore', () => ({
    useNetworkStore: {
      getState: jest.fn()
    }
  }));

  const mockApartment: Apartment = {
    apartmentName: "A101",
    residenceId: "res123",
    tenants: [],
    maintenanceRequests: [],
    situationReportId: []
  };
  
  const mockResidence: Residence = {
    residenceName: "Test Residence",
    street: "Test Street",
    number: "123",
    city: "Test City",
    canton: "TC",
    zip: "12345",
    country: "Test Country",
    landlordId: "landlord123",
    tenantIds: [],
    laundryMachineIds: [],
    apartments: [],
    tenantCodesID: [],
    situationReportLayout: [],
    pictures: []
  };
  
  const mockUser: TUser = {
    uid: "user123",
    type: "tenant",
    name: "Test User",
    email: "test@test.com",
    phone: "1234567890",
    street: "Test Street",
    number: "123",
    city: "Test City",
    canton: "TC",
    zip: "12345",
    country: "Test Country"
  };
  
  const mockLandlord: Landlord = {
    userId: "landlord123",
    residenceIds: ["res123"]
  };
  
  const mockTenant: Tenant = {
    userId: "tenant123",
    maintenanceRequests: [],
    apartmentId: "apt123",
    residenceId: "res123"
  };
  
  const mockMaintenanceRequest: MaintenanceRequest = {
    requestID: "req123",
    tenantId: "tenant123",
    residenceId: "res123",
    apartmentId: "apt123",
    openedBy: "tenant123",
    requestTitle: "Fix Leak",
    requestDate: new Date().toISOString(),
    requestDescription: "Water leak in bathroom",
    picture: [],
    requestStatus: "notStarted"
  };
  
  const mockTimestamp = {
    seconds: 1234567890,
    nanoseconds: 0
  };
  
  const mockLaundryMachine: LaundryMachine = {
    laundryMachineId: "machine123",
    isAvailable: true,
    isFunctional: true,
    occupiedBy: "",
    startTime: mockTimestamp as Timestamp,
  estimatedFinishTime: mockTimestamp as Timestamp,
    notificationScheduled: false
  };
  
  const mockTenantCode: TenantCode = {
    tenantCode: "123456",
    apartmentId: "apt123",
    residenceId: "res123",
    used: false
  };
  
  const mockNews: News = {
    maintenanceRequestID: "req123",
    SenderID: "sender123",
    ReceiverID: "receiver123",
    title: "Maintenance Update",
    content: "Your request has been processed",
    isRead: false,
    createdAt: mockTimestamp as Timestamp,
    ReadAt: null,
    UpdatedAt: mockTimestamp as Timestamp,
    type: "informational"
  };
  
  // Spy on console.error to prevent error output during tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
  
  describe('Firebase Utils Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (useNetworkStore.getState as jest.Mock).mockReturnValue({ isOnline: true });
    });
  
    describe('Apartment Operations', () => {
      it('should create an apartment successfully', async () => {
        const mockDocRef = { id: 'newApartmentId' };
        (collection as jest.Mock).mockReturnValue('apartmentsCollection');
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
  
        const result = await firestore.createApartment(mockApartment);
  
        expect(result).toBe('newApartmentId');
        expect(collection).toHaveBeenCalledWith(db, 'apartments');
        expect(addDoc).toHaveBeenCalledWith('apartmentsCollection', mockApartment);
      });
  
      it('should get an apartment successfully', async () => {
        const apartmentId = 'apt123';
        (getDocFromServer as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockApartment
        });
  
        const result = await firestore.getApartment(apartmentId);
  
        expect(result).toEqual(mockApartment);
        expect(doc).toHaveBeenCalledWith(db, 'apartments', apartmentId);
      });
  
      it('should update an apartment successfully', async () => {
        const apartmentId = 'apt123';
        const update = { apartmentName: 'Updated Name' };
        (doc as jest.Mock).mockReturnValue('apartmentDoc');
        (updateDoc as jest.Mock).mockResolvedValue(undefined);
  
        await firestore.updateApartment(apartmentId, update);
  
        expect(doc).toHaveBeenCalledWith(db, 'apartments', apartmentId);
        expect(updateDoc).toHaveBeenCalledWith('apartmentDoc', update);
      });
    });
  
    describe('Residence Operations', () => {
      it('should create a residence successfully', async () => {
        const mockDocRef = { id: 'newResidenceId' };
        (collection as jest.Mock).mockReturnValue('residencesCollection');
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
  
        const result = await firestore.createResidence(mockResidence);
  
        expect(result).toBe('newResidenceId');
        expect(collection).toHaveBeenCalledWith(db, 'residences');
        expect(addDoc).toHaveBeenCalledWith('residencesCollection', mockResidence);
      });
  
      it('should get a residence successfully', async () => {
        const residenceId = 'res123';
        (getDocFromServer as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockResidence
        });
  
        const result = await firestore.getResidence(residenceId);
  
        expect(result).toEqual(mockResidence);
        expect(doc).toHaveBeenCalledWith(db, 'residences', residenceId);
      });
  
      it('should update a residence successfully', async () => {
        const residenceId = 'res123';
        const update = { residenceName: 'Updated Name' };
        (doc as jest.Mock).mockReturnValue('residenceDoc');
        (updateDoc as jest.Mock).mockResolvedValue(undefined);
  
        await firestore.updateResidence(residenceId, update);
  
        expect(doc).toHaveBeenCalledWith(db, 'residences', residenceId);
        expect(updateDoc).toHaveBeenCalledWith('residenceDoc', update);
      });
    });
  
    describe('User Operations', () => {
      it('should create a user successfully', async () => {
        (doc as jest.Mock).mockReturnValue('userDoc');
        (setDoc as jest.Mock).mockResolvedValue(undefined);
  
        await firestore.createUser(mockUser);
  
        expect(doc).toHaveBeenCalledWith(db, 'users', mockUser.uid);
        expect(setDoc).toHaveBeenCalledWith('userDoc', mockUser);
      });
  
      it('should get a user successfully', async () => {
        const userId = 'user123';
        (getDocFromServer as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockUser
        });
  
        const result = await firestore.getUser(userId);
  
        expect(result).toEqual(mockUser);
        expect(doc).toHaveBeenCalledWith(db, 'users', userId);
      });
    });
  
    describe('Offline Operations', () => {
      beforeEach(() => {
        (useNetworkStore.getState as jest.Mock).mockReturnValue({ isOnline: false });
      });
  
      it('should save to offline storage when creating apartment offline', async () => {
        await firestore.createApartment(mockApartment);
  
        expect(AsyncStorage.setItem).toHaveBeenCalled();
        expect(addDoc).not.toHaveBeenCalled();
      });
  
      it('should save to offline storage when updating residence offline', async () => {
        const residenceId = 'res123';
        const update = { residenceName: 'Updated Name' };
  
        await firestore.updateResidence(residenceId, update);
  
        expect(AsyncStorage.setItem).toHaveBeenCalled();
        expect(updateDoc).not.toHaveBeenCalled();
      });
  
      it('should handle offline document retrieval', async () => {
        const docId = 'doc123';
        (getDocFromServer as jest.Mock).mockRejectedValue(new Error('Network error'));
        (getDocFromCache as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockUser
        });
  
        const result = await firestore.getUser(docId);
  
        expect(result).toEqual(mockUser);
        expect(getDocFromCache).toHaveBeenCalled();
      });
    });
  
    describe('Error Handling', () => {
      it('should handle failed apartment creation', async () => {
        (addDoc as jest.Mock).mockRejectedValue(new Error('Creation failed'));
  
        await expect(firestore.createApartment(mockApartment))
          .rejects
          .toThrow('Creation failed');
      });
  
      it('should handle failed residence update', async () => {
        const residenceId = 'res123';
        const update = { residenceName: 'Updated Name' };
        (updateDoc as jest.Mock).mockRejectedValue(new Error('Update failed'));
  
        await expect(firestore.updateResidence(residenceId, update))
          .rejects
          .toThrow('Update failed');
      });
  
      it('should handle non-existent documents', async () => {
        const docId = 'nonexistent';
        (getDocFromServer as jest.Mock).mockResolvedValue({
          exists: () => false,
          data: () => null
        });
  
        const result = await firestore.getUser(docId);
        expect(result).toBeNull();
      });
    });
  });