import { RefObject, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';


export const useScrollToTop = (scrollRef: RefObject<ScrollView>) => {
    useFocusEffect(
      useCallback(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ y: 0, animated: true });
        }
      }, [])
    );
  };