import React from "react";
import { render } from "@testing-library/react-native";
import CustomBubble from "../screens/issues_tenant/CustomBubble";

describe('CustomBubble', () => {
    it('renders with correct styles', () => {
      const props = {
        wrapperStyle: {},
        textStyle: {},
        timeTextStyle: {},
      };
  
      const { getByTestId } = render(<CustomBubble {...props} />);
      const bubble = getByTestId('chat-bubble');
      
      expect(bubble).toBeTruthy();
    });
  });