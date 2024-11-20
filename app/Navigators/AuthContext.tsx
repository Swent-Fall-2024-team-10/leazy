import { User as FirebaseUser } from "firebase/auth";
import { TUser, Tenant, Landlord } from "../../types/types";
import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

type AuthContextType = {
  firebaseUser: FirebaseUser | null;
  user: TUser | null;
  tenant: Tenant | null;
  landlord: Landlord | null;
  isLoading: boolean;
  error?: Error;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
  firebaseUser: FirebaseUser | null;
  fetchUser: (uid: string) => Promise<TUser | null>;
  fetchTenant: (uid: string) => Promise<Tenant | null>;
  fetchLandlord: (uid: string) => Promise<Landlord | null>;
};

export function AuthProvider({
  children,
  firebaseUser: initialFirebaseUser,
  fetchUser,
  fetchTenant,
  fetchLandlord,
}: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(
    initialFirebaseUser
  );
  const [user, setUser] = useState<TUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();

  // Effect to initialize user data and set up snapshot listeners
  useEffect(() => {
    let tenantUnsubscribe: (() => void) | undefined;
    let landlordUnsubscribe: (() => void) | undefined;

    const loadUser = async () => {
      setIsLoading(true);
      try {
        // Clean up existing listeners
        if (tenantUnsubscribe) tenantUnsubscribe();
        if (landlordUnsubscribe) landlordUnsubscribe();

        if (firebaseUser) {
          const user = await fetchUser(firebaseUser.uid);

          if (user) {
            setUser(user);

            if (user.type === "tenant") {
              // Initial fetch
              const tenant = await fetchTenant(user.uid);
              if (tenant) {
                setTenant(tenant);

                // Set up tenant snapshot listener
                tenantUnsubscribe = onSnapshot(
                  doc(db, "tenants", tenant.userId),
                  (snapshot) => {
                    if (snapshot.exists()) {
                      setTenant(snapshot.data() as Tenant);
                    } else {
                      setTenant(null);
                    }
                  },
                  (error) => {
                    setError(
                      new Error(`Tenant listener error: ${error.message}`)
                    );
                  }
                );
              }
            } else if (user.type === "landlord") {
              // Initial fetch
              const landlord = await fetchLandlord(firebaseUser.uid);
              if (landlord) {
                setLandlord(landlord);

                // Set up landlord snapshot listener
                landlordUnsubscribe = onSnapshot(
                  doc(db, "landlords", landlord.userId),
                  (snapshot) => {
                    if (snapshot.exists()) {
                      setLandlord(snapshot.data() as Landlord);
                    } else {
                      setLandlord(null);
                    }
                  },
                  (error) => {
                    setError(
                      new Error(`Landlord listener error: ${error.message}`)
                    );
                  }
                );
              }
            }
          }
        } else {
          setUser(null);
          setTenant(null);
          setLandlord(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

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
    tenant,
    landlord,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
