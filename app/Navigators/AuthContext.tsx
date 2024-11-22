import { User as FirebaseUser } from 'firebase/auth';
import { TUser, Tenant, Landlord } from '../../types/types';
import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

type AuthContextType = {
  firebaseUser: FirebaseUser | null;
  user: TUser | null;
  tenantData: Tenant | null;
  landlordData: Landlord | null;
  isLoading: boolean;
  error?: Error;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
  firebaseUser: FirebaseUser | null;
  fetchUser: (uid: string) => Promise<{ user: TUser; userUID: string } | null>;
  fetchTenant: (uid: string) => Promise<{ tenant: Tenant; tenantUID: string } | null>;
  fetchLandlord: (uid: string) => Promise<{ landlord: Landlord; landlordUID: string } | null>;
};

export function AuthProvider({
  children,
  firebaseUser: initialFirebaseUser,
  fetchUser,
  fetchTenant,
  fetchLandlord
}: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(initialFirebaseUser);
  const [user, setUser] = useState<TUser | null>(null);
  const [tenantData, setTenantData] = useState<Tenant | null>(null);
  const [landlordData, setLandlordData] = useState<Landlord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();

  // Effect to initialize user data and set up snapshot listeners
  useEffect(() => {
    let tenantUnsubscribe: (() => void) | undefined;
    let landlordUnsubscribe: (() => void) | undefined;

    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Clean up existing listeners
        if (tenantUnsubscribe) tenantUnsubscribe();
        if (landlordUnsubscribe) landlordUnsubscribe();

        if (firebaseUser) {
          const userData = await fetchUser(firebaseUser.uid);
          
          if (userData) {
            setUser(userData.user);

            if (userData.user.type === 'tenant') {
              // Initial fetch
              const tenantData = await fetchTenant(userData.user.uid);
              if (tenantData) {
                setTenantData(tenantData.tenant);
                
                // Set up tenant snapshot listener
                tenantUnsubscribe = onSnapshot(
                  doc(db, 'tenants', tenantData.tenantUID),
                  (snapshot) => {
                    if (snapshot.exists()) {
                      setTenantData(snapshot.data() as Tenant);
                    } else {
                      setTenantData(null);
                    }
                  },
                  (error) => {
                    setError(new Error(`Tenant listener error: ${error.message}`));
                  }
                );
              }
            } else if (userData.user.type === 'landlord') {
              // Initial fetch
              const landlordData = await fetchLandlord(firebaseUser.uid);
              if (landlordData) {
                setLandlordData(landlordData.landlord);
                
                // Set up landlord snapshot listener
                landlordUnsubscribe = onSnapshot(
                  doc(db, 'landlords', landlordData.landlordUID),
                  (snapshot) => {
                    if (snapshot.exists()) {
                      setLandlordData(snapshot.data() as Landlord);
                    } else {
                      setLandlordData(null);
                    }
                  },
                  (error) => {
                    setError(new Error(`Landlord listener error: ${error.message}`));
                  }
                );
              }
            }
          }
        } else {
          setUser(null);
          setTenantData(null);
          setLandlordData(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    // Cleanup function
    return () => {
      if (tenantUnsubscribe) tenantUnsubscribe();
      if (landlordUnsubscribe) landlordUnsubscribe();
    };
  }, [firebaseUser, fetchUser, fetchTenant, fetchLandlord]);

  useEffect(() => {
    setFirebaseUser(initialFirebaseUser);
  }, [initialFirebaseUser]);

  const value = {
    firebaseUser,
    user,
    tenantData,
    landlordData,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}