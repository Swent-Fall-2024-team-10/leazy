import React from "react";
import { View } from "react-native";


interface SpacerProps {
  height: number;
}


export default function Spacer({ height } : SpacerProps) {
  return (
    <View style={{ height: height }} />
  );
}