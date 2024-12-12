import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onSnapshot, doc, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from './AuthContext';
import { Residence, Apartment } from '../../types/types';

type ResidenceWithId = Residence & { id: string };
type ApartmentWithId = Apartment & { id: string };

type PropertyContextType = {
  residences: ResidenceWithId[];
  apartments: ApartmentWithId[];
  residenceMap: Map<ResidenceWithId, ApartmentWithId[]>;
  isLoading: boolean;
  error?: Error;
};

export const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

type PropertyProviderProps = {
  children: ReactNode;
};

export function LandlordProvider({ children }: PropertyProviderProps) {
  const { landlord, isLoading: isAuthLoading } = useAuth();
  const [residences, setResidences] = useState<ResidenceWithId[]>([]);
  const [apartments, setApartments] = useState<ApartmentWithId[]>([]);
  const [residenceMap, setResidenceMap] = useState<Map<ResidenceWithId, ApartmentWithId[]>>(new Map());
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
        // Get all residences for the landlord
        const residencesQuery = query(
          collection(db, 'residences'),
          where('landlordId', '==', landlord.userId)
        );

        // Set up residence listener
        const residenceUnsubscribe = onSnapshot(residencesQuery, (residenceSnapshot) => {
          const residencesData: ResidenceWithId[] = residenceSnapshot.docs.map(doc => ({
            ...(doc.data() as Residence),
            id: doc.id
          }));
          setResidences(residencesData);

          // Create a query for all apartments belonging to any of these residences
          if (residencesData.length > 0) {
            const residenceIds = residencesData.map(residence => residence.id);
            const apartmentsQuery = query(
              collection(db, 'apartments'),
              where('residenceId', 'in', residenceIds)
            );

            // Set up apartments listener
            const apartmentsUnsubscribe = onSnapshot(apartmentsQuery, (apartmentsSnapshot) => {
              const apartmentsData: ApartmentWithId[] = apartmentsSnapshot.docs.map(doc => ({
                ...(doc.data() as Apartment),
                id: doc.id
              }));
              setApartments(apartmentsData);

              // Update residence map
              const newResidenceMap = new Map<ResidenceWithId, ApartmentWithId[]>();
              residencesData.forEach(residence => {
                const residenceApartments = apartmentsData.filter(
                  apartment => apartment.residenceId === residence.id
                );
                newResidenceMap.set(residence, residenceApartments);
              });
              setResidenceMap(newResidenceMap);
            }, 
            (error) => {
              setError(new Error(`Apartments listener error: ${error.message}`));
            });

            newUnsubscribeFunctions.push(apartmentsUnsubscribe);
          }
        }, 
        (error) => {
          setError(new Error(`Residences listener error: ${error.message}`));
        });

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