import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import Animated, { 
  ZoomIn,
  useAnimatedStyle,
  withTiming,
  ReduceMotion,
} from 'react-native-reanimated';
const WAVEFORM_WIDTH = Dimensions.get('window').width * 0.8;
const BAR_WIDTH = 5;
const BAR_GAP = 10;
export const MIN_HEIGHT = 10;
// Calculate how many bars can fit in the container
export const MAX_BARS = Math.floor((WAVEFORM_WIDTH - 20) / (BAR_WIDTH + BAR_GAP));

interface WaveformVisualizerProps {
  metering: number | null;
  isRecording: boolean;
  noiseThresholdExceeded: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  metering, 
  isRecording,
  noiseThresholdExceeded
}) => {
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const waveformRef = useRef({ 
    data: Array(MAX_BARS).fill(MIN_HEIGHT),
    currentIndex: 0
  });

  // Initialize with minimum height bars
  useEffect(() => {
    setWaveformData(Array(MAX_BARS).fill(MIN_HEIGHT));
  }, []);

  // Update waveform data
  useEffect(() => {
    if (metering !== null && isRecording && !noiseThresholdExceeded) {
      // Convert to decibels using the same formula as SnitchModeScreen
      const decibelLevel = Math.max(0, ((metering + 160) / 160) * 120);
      
      // Scale the decibel level to a visual height (between MIN_HEIGHT and 100)
      const normalizedLevel = Math.max(
        MIN_HEIGHT,
        (decibelLevel / 120) * 100
      );
      
      // Update circular buffer
      const newData = [...waveformRef.current.data];
      newData[waveformRef.current.currentIndex] = normalizedLevel;
      
      waveformRef.current.currentIndex = 
        (waveformRef.current.currentIndex + 1) % MAX_BARS;
      
      waveformRef.current.data = newData;
      setWaveformData(newData);
    }
  }, [metering, isRecording, noiseThresholdExceeded]);

  return (
    <View style={styles.container}>
      <View style={styles.waveformContainer}>
        {waveformData.map((level, index) => (
          <Animated.View
            key={`${index}-${level}`}
            testID={`waveform-bar-${index}`}
            entering={ZoomIn.duration(150)}
            style={[
              styles.bar,
              {
                height: level,
                backgroundColor: noiseThresholdExceeded ? '#FF4444' : '#2F4F4F',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    width: WAVEFORM_WIDTH,
    overflow: 'hidden',
    marginVertical: 20,
    borderRadius: 10,
    padding: 10,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BAR_GAP,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 200,
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
});