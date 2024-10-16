// __tests__/userFunctions.test.ts

import { User } from "@/types/types";
import { createUser, getUser, updateUser, deleteUser } from "../firebase/firestore/firestore";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// Mock Firestore functions directly
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

describe("Firestore User Functions", () => {
  const mockUser = {
    uid: "user123",
    type: "tenant" as "tenant",
    details: {
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "1234567890",
      address: {
        street: "123 Main St",
        number: "1",
        city: "Zurich",
        canton: "ZH",
        zip: "8000",
        country: "Switzerland",
      },
    },
  };

  const mockUserRef = { id: "user123" };

  beforeEach(() => {
    // Reset all mocks before each test to prevent data leakage between tests
    jest.clearAllMocks();
    (doc as jest.Mock).mockReturnValue(mockUserRef);
  });

  it("should create a new user", async () => {
    await createUser(mockUser);
    expect(setDoc).toHaveBeenCalledWith(mockUserRef, mockUser);
  });

  it("should retrieve a user", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => mockUser,
    });

    const user = await getUser(mockUser.uid);
    expect(getDoc).toHaveBeenCalledWith(mockUserRef);
    expect(user).toEqual(mockUser);
  });

  it("should return null if user does not exist", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => false,
    });

    const user = await getUser("nonexistent");
    expect(user).toBeNull();
  });

  it("should update an existing user", async () => {
    const updateData: Partial<User> = { type: "landlord" };
    await updateUser(mockUser.uid, updateData);
    expect(updateDoc).toHaveBeenCalledWith(mockUserRef, updateData);
  });

  it("should delete a user", async () => {
    await deleteUser(mockUser.uid);
    expect(deleteDoc).toHaveBeenCalledWith(mockUserRef);
  });
});
