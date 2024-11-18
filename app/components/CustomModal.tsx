import React from 'react';
import { Modal } from 'react-native';

interface CustomModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  testID?: string;
  transparent: boolean;
}

// wrap the modal in a custom one
// so the mocking does not create conflicts
const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onRequestClose,
  children,
  testID = 'customModal',
  transparent,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={transparent}
      onRequestClose={onRequestClose}
      testID={testID}
    >
      {children}
    </Modal>
  );
};

export default CustomModal;
