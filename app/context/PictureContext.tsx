import React, { createContext, useState, useContext, ReactNode } from 'react';

type PictureContextType = {
  pictureList: string[];
  addPicture: (picture: string) => void;
  resetPictureList: () => void;
  removePicture: (picture: string) => void;
};

const PictureContext = createContext<PictureContextType | undefined>(undefined);

export const PictureProvider = ({ children }: { children: ReactNode }) => {
  const [pictureList, setPictureList] = useState<string[]>([]);

  const addPicture = (picture: string) => {
    setPictureList((prevList) => [...prevList, picture]);
  };

  const removePicture = (picture: string) => {
    setPictureList((prevList) => prevList.filter((item) => item !== picture));
  }

  const resetPictureList = () => {
    setPictureList([]);
  };

  return (
    <PictureContext.Provider value={{ pictureList, addPicture, resetPictureList, removePicture }}>
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
