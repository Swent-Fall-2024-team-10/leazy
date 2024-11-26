import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { PictureProvider, usePictureContext } from '../context/PictureContext';

describe('PictureContext', () => {
  // Helper wrapper component
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PictureProvider>{children}</PictureProvider>
  );

  test('provides initial empty picture list', () => {
    const { result } = renderHook(() => usePictureContext(), { wrapper });
    expect(result.current.pictureList).toEqual([]);
  });

  test('adds picture to the list', () => {
    const { result } = renderHook(() => usePictureContext(), { wrapper });
    
    act(() => {
      result.current.addPicture('picture1.jpg');
    });

    expect(result.current.pictureList).toEqual(['picture1.jpg']);
  });

  test('adds multiple pictures to the list', () => {
    const { result } = renderHook(() => usePictureContext(), { wrapper });
    
    act(() => {
      result.current.addPicture('picture1.jpg');
      result.current.addPicture('picture2.jpg');
      result.current.addPicture('picture3.jpg');
    });

    expect(result.current.pictureList).toEqual([
      'picture1.jpg',
      'picture2.jpg',
      'picture3.jpg'
    ]);
  });

  test('removes picture from the list', () => {
    const { result } = renderHook(() => usePictureContext(), { wrapper });
    
    act(() => {
      result.current.addPicture('picture1.jpg');
      result.current.addPicture('picture2.jpg');
    });

    act(() => {
      result.current.removePicture('picture1.jpg');
    });

    expect(result.current.pictureList).toEqual(['picture2.jpg']);
  });

  test('removes picture that does not exist in the list', () => {
    const { result } = renderHook(() => usePictureContext(), { wrapper });
    
    act(() => {
      result.current.addPicture('picture1.jpg');
    });

    act(() => {
      result.current.removePicture('nonexistent.jpg');
    });

    expect(result.current.pictureList).toEqual(['picture1.jpg']);
  });

  test('resets picture list', () => {
    const { result } = renderHook(() => usePictureContext(), { wrapper });
    
    act(() => {
      result.current.addPicture('picture1.jpg');
      result.current.addPicture('picture2.jpg');
    });

    act(() => {
      result.current.resetPictureList();
    });

    expect(result.current.pictureList).toEqual([]);
  });

  test('throws error when used outside provider', () => {
    let error;
    try {
      renderHook(() => usePictureContext());
    } catch (e) {
      error = e;
    }
    
    expect(error).toEqual(
      Error('Context used outside of a PictureProvider')
    );
  });

  test('maintains separate state for each provider instance', () => {
    const wrapper1 = ({ children }: { children: React.ReactNode }) => (
      <PictureProvider>{children}</PictureProvider>
    );
    
    const wrapper2 = ({ children }: { children: React.ReactNode }) => (
      <PictureProvider>{children}</PictureProvider>
    );

    const { result: result1 } = renderHook(() => usePictureContext(), { wrapper: wrapper1 });
    const { result: result2 } = renderHook(() => usePictureContext(), { wrapper: wrapper2 });

    act(() => {
      result1.current.addPicture('picture1.jpg');
    });

    expect(result1.current.pictureList).toEqual(['picture1.jpg']);
    expect(result2.current.pictureList).toEqual([]);
  });
});