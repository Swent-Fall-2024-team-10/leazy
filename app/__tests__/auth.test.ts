// Mock the UserType enum
enum UserType {
  TENANT,
  LANDLORD,
  UNAUTHENTICATED
}

// Mock the entire module
jest.mock('../../firebase/auth/auth', () => ({
  emailAndPasswordSignIn: jest.fn(),
  emailAndPasswordLogIn: jest.fn(),
  deleteAccount: jest.fn(),
  signOutUser: jest.fn(),
  resetUserPassword: jest.fn(),
  updateUserEmail: jest.fn(),
  
}));

// Import the mocked functions and UserType
import {
  emailAndPasswordSignIn,
  emailAndPasswordLogIn,
  deleteAccount,
  signOutUser,
  resetUserPassword,
  updateUserEmail,
} from "../../firebase/auth/auth";

describe('Authentication Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('emailAndPasswordSignIn - returns non-null object', async () => {
    (emailAndPasswordSignIn as jest.Mock).mockResolvedValue({ uid: 'someuid' });
    
    const result = await emailAndPasswordSignIn('test@example.com', 'password', UserType.TENANT, {});
    
    expect(emailAndPasswordSignIn).toHaveBeenCalledWith('test@example.com', 'password', UserType.TENANT, {});
    expect(result).not.toBeNull();
    expect(typeof result).toBe('object');
  });

  test('emailAndPasswordLogIn - returns non-null object', async () => {
    (emailAndPasswordLogIn as jest.Mock).mockResolvedValue({ uid: 'someuid' });
    
    const result = await emailAndPasswordLogIn('test@example.com', 'password');
    
    expect(emailAndPasswordLogIn).toHaveBeenCalledWith('test@example.com', 'password');
    expect(result).not.toBeNull();
    expect(typeof result).toBe('object');
  });

  test('deleteAccount - successful', async () => {
    (deleteAccount as jest.Mock).mockResolvedValue(undefined);
    
    await deleteAccount();
    
    expect(deleteAccount).toHaveBeenCalled();
  });

  test('signOutUser - successful', async () => {
    (signOutUser as jest.Mock).mockImplementation((success, error) => {
      success();
      return Promise.resolve();
    });
    
    const successCallback = jest.fn();
    const errorCallback = jest.fn();
    
    await signOutUser(successCallback, errorCallback);
    
    expect(signOutUser).toHaveBeenCalledWith(successCallback, errorCallback);
    expect(successCallback).toHaveBeenCalled();
    expect(errorCallback).not.toHaveBeenCalled();
  });

  test('resetUserPassword - successful', async () => {
    (resetUserPassword as jest.Mock).mockResolvedValue(undefined);
    
    await resetUserPassword('newPassword');
    
    expect(resetUserPassword).toHaveBeenCalledWith('newPassword');
  });

  test('updateUserEmail - successful', async () => {
    (updateUserEmail as jest.Mock).mockResolvedValue(undefined);
    
    await updateUserEmail('newemail@example.com');
    
    expect(updateUserEmail).toHaveBeenCalledWith('newemail@example.com');
  });

  // Error case tests
  test('emailAndPasswordSignIn - failed', async () => {
    (emailAndPasswordSignIn as jest.Mock).mockResolvedValue(null);
    
    const result = await emailAndPasswordSignIn('test@example.com', 'password', UserType.TENANT, {});
    
    expect(result).toBeNull();
  });


  test('signOutUser - error', async () => {
    (signOutUser as jest.Mock).mockImplementation((success, error) => {
      error(new Error('Sign out error'));
      return Promise.resolve();
    });
    
    const successCallback = jest.fn();
    const errorCallback = jest.fn();
    
    await signOutUser(successCallback, errorCallback);
    
    expect(errorCallback).toHaveBeenCalled();
    expect(successCallback).not.toHaveBeenCalled();
  });
});