import {
    emailAndPasswordSignIn,
    emailAndPasswordLogIn,
    deleteAccount,
    signOutUser,
    resetUserPassword,
    updateUserEmail,
    UserType,
  } from '../../firebase/auth/auth';
  import { auth } from '../../firebase/firebase';
  import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    deleteUser,
    signOut,
    updatePassword,
    updateEmail,
  } from 'firebase/auth';
  
  // Mock the Firebase auth functions
  jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    deleteUser: jest.fn(),
    signOut: jest.fn(),
    updatePassword: jest.fn(),
    updateEmail: jest.fn(),
  }));
  
  // Mock the Firebase auth instance
  jest.mock('../../firebase/firebase', () => ({
    auth: {
      currentUser: null,
    },
  }));
  
  describe('Authentication Functions', () => {
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
      (auth as any).currentUser = null;
    });
  
    describe('emailAndPasswordSignIn', () => {
      it('should successfully create a new user', async () => {
        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
          user: mockUser,
        });
  
        const result = await emailAndPasswordSignIn('test@example.com', 'password123');
        
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          auth,
          'test@example.com',
          'password123'
        );
        expect(result).toEqual(mockUser);
      });
  
      it('should return null on error', async () => {
        const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
          new Error('Firebase error')
        );
      
        const result = await emailAndPasswordSignIn('test@example.com', 'password123');
      
        expect(result).toBeNull();
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          auth,
          'test@example.com',
          'password123'
        );
      
        mockConsoleLog.mockRestore(); // Restore the original console.log
      });
    });      
      
  
    describe('emailAndPasswordLogIn', () => {
      it('should successfully log in user', async () => {
        (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
          user: mockUser,
        });
  
        const result = await emailAndPasswordLogIn('test@example.com', 'password123');
        
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          auth,
          'test@example.com',
          'password123'
        );
        expect(result).toEqual(mockUser);
      });
  
      it('should throw error on failed login', async () => {
        const error = new Error('Invalid credentials');
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(error);
  
        await expect(
          emailAndPasswordLogIn('test@example.com', 'wrongpassword')
        ).rejects.toThrow('Invalid credentials');
      });
    });
  
    describe('deleteAccount', () => {
      it('should successfully delete user account when user is logged in', async () => {
        (auth as any).currentUser = mockUser;
        (deleteUser as jest.Mock).mockResolvedValueOnce(undefined);
  
        await deleteAccount();
        
        expect(deleteUser).toHaveBeenCalledWith(mockUser);
      });
  
      it('should not call deleteUser when no user is logged in', async () => {
        console.log = jest.fn(); // Mock console.log
        await deleteAccount();
        
        expect(deleteUser).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith("User is not signed in");
      });
    });
  
    describe('signOutUser', () => {
      const mockSuccessCallback = jest.fn();
      const mockErrorCallback = jest.fn();
  
      it('should successfully sign out user and call success callback', async () => {
        (auth as any).currentUser = mockUser;
        (signOut as jest.Mock).mockResolvedValueOnce(undefined);
  
        await signOutUser(mockSuccessCallback, mockErrorCallback);
        
        expect(signOut).toHaveBeenCalledWith(auth);
        expect(mockSuccessCallback).toHaveBeenCalled();
        expect(mockErrorCallback).not.toHaveBeenCalled();
      });
  
      it('should call error callback when sign out fails', async () => {
        (auth as any).currentUser = mockUser;
        const error = new Error('Sign out failed');
        (signOut as jest.Mock).mockRejectedValueOnce(error);
  
        await signOutUser(mockSuccessCallback, mockErrorCallback);
        
        expect(signOut).toHaveBeenCalledWith(auth);
        expect(mockSuccessCallback).not.toHaveBeenCalled();
        expect(mockErrorCallback).toHaveBeenCalledWith(error);
      });
  
      it('should not attempt to sign out when no user is logged in', async () => {
        console.log = jest.fn(); // Mock console.log
        await signOutUser(mockSuccessCallback, mockErrorCallback);
        
        expect(signOut).not.toHaveBeenCalled();
        expect(mockSuccessCallback).not.toHaveBeenCalled();
        expect(mockErrorCallback).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith("User is not signed in");
      });
    });
  
    describe('resetUserPassword', () => {
      it('should successfully update password when user is logged in', async () => {
        (auth as any).currentUser = mockUser;
        (updatePassword as jest.Mock).mockResolvedValueOnce(undefined);
  
        await resetUserPassword('newPassword123');
        
        expect(updatePassword).toHaveBeenCalledWith(mockUser, 'newPassword123');
      });
  
      it('should not attempt to update password when no user is logged in', async () => {
        await resetUserPassword('newPassword123');
        
        expect(updatePassword).not.toHaveBeenCalled();
      });
    });
  
    describe('updateUserEmail', () => {
      it('should successfully update email when user is logged in', async () => {
        (auth as any).currentUser = mockUser;
        (updateEmail as jest.Mock).mockResolvedValueOnce(undefined);
  
        await updateUserEmail('newemail@example.com');
        
        expect(updateEmail).toHaveBeenCalledWith(mockUser, 'newemail@example.com');
      });
  
      it('should not attempt to update email when no user is logged in', async () => {
        await updateUserEmail('newemail@example.com');
        
        expect(updateEmail).not.toHaveBeenCalled();
      });
    });
  
    describe('UserType enum', () => {
      it('should have correct values', () => {
        expect(UserType.TENANT).toBe('Tenant');
        expect(UserType.LANDLORD).toBe('Landlord');
        expect(UserType.UNAUTHENTICATED).toBe('Unauthenticated');
      });
    });
  });