import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onSnapshot, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from './AuthContext';
import { Residence, Apartment } from '../../types/types';

type PropertyContextType = {
  residences: Residence[];
  apartments: Apartment[];
  residenceMap: Map<Residence, Apartment[]>;
  isLoading: boolean;
  error?: Error;
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

type PropertyProviderProps = {
  children: ReactNode;
};

export function LandlordProvider({ children }: PropertyProviderProps) {
  const { landlord, isLoading: isAuthLoading } = useAuth();
  const [residences, setResidences] = useState<Residence[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [residenceMap, setResidenceMap] = useState<Map<Residence, Apartment[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState<(() => void)[]>([]);

  useEffect(() => {
    const cleanup = () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
      setUnsubscribeFunctions([]);
    };

    const setupListeners = async () => {
      cleanup();
      
      if (!landlord || isAuthLoading) {
        setResidences([]);
        setApartments([]);
        setResidenceMap(new Map());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const newUnsubscribeFunctions: (() => void)[] = [];

      try {
        const residenceUnsubscribe = onSnapshot(
          query(
            collection(db, 'residences'),
            where('landlordId', '==', landlord.userId)
          ),
          async (residenceSnapshot) => {
            const residencesData: Residence[] = [];
            const apartmentsData: Apartment[] = [];
            const newResidenceMap = new Map<Residence, Apartment[]>();

            for (const doc of residenceSnapshot.docs) {
              const residence = { ...doc.data(), residenceName: doc.id } as Residence;
              residencesData.push(residence);

              const apartmentsSnapshot = await getDocs(
                query(
                  collection(db, 'apartments'),
                  where('residenceId', '==', doc.id)
                )
              );

              const residenceApartments: Apartment[] = [];
              
              apartmentsSnapshot.forEach(apartmentDoc => {
                const apartment = {
                  ...apartmentDoc.data(),
                } as Apartment;
                
                apartmentsData.push(apartment);
                residenceApartments.push(apartment);
              });

              newResidenceMap.set(residence, residenceApartments);
            }

            setResidences(residencesData);
            setApartments(apartmentsData);
            setResidenceMap(newResidenceMap);
          },
          (error) => {
            setError(new Error(`Residences listener error: ${error.message}`));
          }
        );

        newUnsubscribeFunctions.push(residenceUnsubscribe);
        setUnsubscribeFunctions(newUnsubscribeFunctions);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching property data'));
      } finally {
        setIsLoading(false);
      }
    };

    setupListeners();

    return cleanup;
  }, [landlord, isAuthLoading]);

  const value = {
    residences,
    apartments,
    residenceMap,
    isLoading,
    error
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}