import React, { createContext, useState, useContext, ReactNode } from 'react';

type PictureContextType = {
  pictureList: string[];
  addPicture: (picture: string) => void;
  resetPictureList: () => void;
};

const PictureContext = createContext<PictureContextType | undefined>(undefined);

export const PictureProvider = ({ children }: { children: ReactNode }) => {
  const [pictureList, setPictureList] = useState<string[]>([]);

  const addPicture = (picture: string) => {
    setPictureList((prevList) => [...prevList, picture]);
  };

  const resetPictureList = () => {
    setPictureList([]);
  };

  return (
    <PictureContext.Provider value={{ pictureList, addPicture, resetPictureList }}>
      {children}
    </PictureContext.Provider>
  );
};

export const usePictureContext = () => {
  const context = useContext(PictureContext);
  if (!context) {
    throw new Error("Context used outside of a PictureProvider");
  }
  return context;
};
