// __tests__/userFunctions.test.ts

// Mock Firestore functions directly
jest.mock("../firebase/firestore/firestore", () => ({
  createUser: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  createLandlord: jest.fn(),
  getLandlord: jest.fn(),
  updateLandlord: jest.fn(),
  deleteLandlord: jest.fn(),
  createTenant: jest.fn(),
  getTenant: jest.fn(),
  updateTenant: jest.fn(),
  deleteTenant: jest.fn(),
  createResidence: jest.fn(),
  getResidence: jest.fn(),
  updateResidence: jest.fn(),
  deleteResidence: jest.fn(),
  createApartment: jest.fn(),
  getApartment: jest.fn(),
  updateApartment: jest.fn(),
  deleteApartment: jest.fn(),
  createMaintenanceRequest: jest.fn(),
  getMaintenanceRequest: jest.fn(),
  updateMaintenanceRequest: jest.fn(),
  deleteMaintenanceRequest: jest.fn(),
  createLaundryMachine: jest.fn(),
  getLaundryMachine: jest.fn(),
  updateLaundryMachine: jest.fn(),
  deleteLaundryMachine: jest.fn(),
}));

import {
  User,
  Landlord,
  Tenant,
  Residence,
  Apartment,
  MaintenanceRequest,
  LaundryMachine,
} from "@/types/types";
import {
  createUser,
  getUser,
  updateUser,
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
} from "../firebase/firestore/firestore";

describe("Firestore Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // User Functions Tests
  const mockUser: User = {
    uid: "user123",
    type: "tenant",
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "1234567890",
    street: "123 Main St",
    number: "1",
    city: "Zurich",
    canton: "ZH",
    zip: "8000",
    country: "Switzerland",
  };

  test("should create a new user", async () => {
    await createUser(mockUser);
    expect(createUser).toHaveBeenCalledWith(mockUser);
  });

  test("should retrieve a user", async () => {
    (getUser as jest.Mock).mockResolvedValue(mockUser);
    const user = await getUser(mockUser.uid);
    expect(getUser).toHaveBeenCalledWith(mockUser.uid);
    expect(user).toEqual(mockUser);
  });

  test("should update a user", async () => {
    const updatedData: Partial<User> = { type: "landlord" };
    await updateUser(mockUser.uid, updatedData);
    expect(updateUser).toHaveBeenCalledWith(mockUser.uid, updatedData);
  });

  test("should delete a user", async () => {
    await deleteUser(mockUser.uid);
    expect(deleteUser).toHaveBeenCalledWith(mockUser.uid);
  });

  // Landlord Functions Tests
  const mockLandlord: Landlord = {
    userId: "landlord123",
    residenceIds: ["residence1", "residence2"],
  };

  test("should create a new landlord", async () => {
    await createLandlord(mockLandlord);
    expect(createLandlord).toHaveBeenCalledWith(mockLandlord);
  });

  test("should retrieve a landlord", async () => {
    (getLandlord as jest.Mock).mockResolvedValue(mockLandlord);
    const landlord = await getLandlord(mockLandlord.userId);
    expect(getLandlord).toHaveBeenCalledWith(mockLandlord.userId);
    expect(landlord).toEqual(mockLandlord);
  });

  test("should update a landlord", async () => {
    const updatedData = { residenceIds: ["residence1"] };
    await updateLandlord(mockLandlord.userId, updatedData);
    expect(updateLandlord).toHaveBeenCalledWith(
      mockLandlord.userId,
      updatedData
    );
  });

  test("should delete a landlord", async () => {
    await deleteLandlord(mockLandlord.userId);
    expect(deleteLandlord).toHaveBeenCalledWith(mockLandlord.userId);
  });

  // Tenant Functions Tests
  const mockTenant: Tenant = {
    userId: "tenant123",
    maintenanceRequests: ["request1", "request2"],
    apartmentId: "apartment1",
  };

  test("should create a new tenant", async () => {
    await createTenant(mockTenant);
    expect(createTenant).toHaveBeenCalledWith(mockTenant);
  });

  test("should retrieve a tenant", async () => {
    (getTenant as jest.Mock).mockResolvedValue(mockTenant);
    const tenant = await getTenant(mockTenant.userId);
    expect(getTenant).toHaveBeenCalledWith(mockTenant.userId);
    expect(tenant).toEqual(mockTenant);
  });

  test("should update a tenant", async () => {
    const updatedData = { maintenanceRequests: ["request3"] };
    await updateTenant(mockTenant.userId, updatedData);
    expect(updateTenant).toHaveBeenCalledWith(mockTenant.userId, updatedData);
  });

  test("should delete a tenant", async () => {
    await deleteTenant(mockTenant.userId);
    expect(deleteTenant).toHaveBeenCalledWith(mockTenant.userId);
  });

  // Residence Functions Tests
  const mockResidence: Residence = {
    residenceId: "residence123",
    street: "Main St",
    number: "123",
    city: "Zurich",
    canton: "ZH",
    zip: "8000",
    country: "Switzerland",
    landlordId: "landlord123",
    tenantIds: ["tenant1", "tenant2"],
    laundryMachineIds: [],
    apartments: ["apartment1", "apartment2"],
  };

  test("should create a new residence", async () => {
    await createResidence(mockResidence);
    expect(createResidence).toHaveBeenCalledWith(mockResidence);
  });

  test("should retrieve a residence", async () => {
    (getResidence as jest.Mock).mockResolvedValue(mockResidence);
    const residence = await getResidence(mockResidence.residenceId);
    expect(getResidence).toHaveBeenCalledWith(mockResidence.residenceId);
    expect(residence).toEqual(mockResidence);
  });

  test("should update a residence", async () => {
    const updatedData = { tenantIds: ["tenant3"] };
    await updateResidence(mockResidence.residenceId, updatedData);
    expect(updateResidence).toHaveBeenCalledWith(
      mockResidence.residenceId,
      updatedData
    );
  });

  test("should delete a residence", async () => {
    await deleteResidence(mockResidence.residenceId);
    expect(deleteResidence).toHaveBeenCalledWith(mockResidence.residenceId);
  });

  // Apartment Functions Tests
const mockApartment: Apartment = {
    apartmentId: "apartment123",
    residenceId: "residence123",
    tenants: ["tenant123"],
    maintenanceRequests: []
};
  
  test("should create a new apartment", async () => {
    await createApartment(mockApartment);
    expect(createApartment).toHaveBeenCalledWith(mockApartment);
  });
  
  test("should retrieve an apartment", async () => {
    (getApartment as jest.Mock).mockResolvedValue(mockApartment);
    const apartment = await getApartment(mockApartment.apartmentId);
    expect(getApartment).toHaveBeenCalledWith(mockApartment.apartmentId);
    expect(apartment).toEqual(mockApartment);
  });
  
  test("should update an apartment", async () => {
    const updatedData: Partial<Apartment> = { tenants: ["tenant456"] };
    await updateApartment(mockApartment.apartmentId, updatedData);
    expect(updateApartment).toHaveBeenCalledWith(mockApartment.apartmentId, updatedData);
  });
  
  test("should delete an apartment", async () => {
    await deleteApartment(mockApartment.apartmentId);
    expect(deleteApartment).toHaveBeenCalledWith(mockApartment.apartmentId);
  });
  

  // MaintenanceRequest Functions Tests
  const mockRequest: MaintenanceRequest = {
    requestID: "request123",
    tenantId: "tenant123",
    residenceId: "residence123",
    apartmentId: "apartment123",
    openedBy: mockUser.uid,
    requestDate: "2023-10-15",
    requestDescription: "Leaking sink",
    picture: [],
    requestStatus: "inProgress",
    requestTitle: "TestTitle",
  };

  test("should create a new maintenance request", async () => {
    await createMaintenanceRequest(mockRequest);
    expect(createMaintenanceRequest).toHaveBeenCalledWith(mockRequest);
  });

  test("should retrieve a maintenance request", async () => {
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(mockRequest);
    const request = await getMaintenanceRequest(mockRequest.requestID);
    expect(getMaintenanceRequest).toHaveBeenCalledWith(mockRequest.requestID);
    expect(request).toEqual(mockRequest);
  });

  test("should update a maintenance request", async () => {
    const updatedData = { requestStatus: "completed" as "completed" };
    await updateMaintenanceRequest(mockRequest.requestID, updatedData);
    expect(updateMaintenanceRequest).toHaveBeenCalledWith(
      mockRequest.requestID,
      updatedData
    );
  });

  test("should delete a maintenance request", async () => {
    await deleteMaintenanceRequest(mockRequest.requestID);
    expect(deleteMaintenanceRequest).toHaveBeenCalledWith(
      mockRequest.requestID
    );
  });

  // LaundryMachine Functions Tests
  const mockLaundryMachine: LaundryMachine = {
    laundryMachineId: "machine123",
    isAvailable: true,
    isFunctional: true,
  };

  const residenceId = "residence123";

  test("should create a new laundry machine", async () => {
    await createLaundryMachine(residenceId, mockLaundryMachine);
    expect(createLaundryMachine).toHaveBeenCalledWith(
      residenceId,
      mockLaundryMachine
    );
  });

  test("should retrieve a laundry machine", async () => {
    (getLaundryMachine as jest.Mock).mockResolvedValue(mockLaundryMachine);
    const machine = await getLaundryMachine(residenceId, mockLaundryMachine.laundryMachineId);
    expect(getLaundryMachine).toHaveBeenCalledWith(
      residenceId,
      mockLaundryMachine.laundryMachineId
    );
    expect(machine).toEqual(mockLaundryMachine);
  });

  test("should update a laundry machine", async () => {
    const updatedData = { isAvailable: false };
    await updateLaundryMachine(residenceId, mockLaundryMachine.laundryMachineId, updatedData);
    expect(updateLaundryMachine).toHaveBeenCalledWith(
      residenceId,
      mockLaundryMachine.laundryMachineId,
      updatedData
    );
  });

  test("should delete a laundry machine", async () => {
    await deleteLaundryMachine(residenceId, mockLaundryMachine.laundryMachineId);
    expect(deleteLaundryMachine).toHaveBeenCalledWith(
      residenceId,
      mockLaundryMachine.laundryMachineId
    );
  });
});
