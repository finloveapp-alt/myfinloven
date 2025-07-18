import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';

interface GoalReachedModalProps {
  visible: boolean;
  onClose: () => void;
  goalTitle: string;
  goalAmount: number;
}

const { width } = Dimensions.get('window');

const GoalReachedModal: React.FC<GoalReachedModalProps> = ({
  visible,
  onClose,
  goalTitle,
  goalAmount
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <Text style={styles.emoji}>🏆💕</Text>
            <Text style={styles.title}>Vocês são o casal meta!</Text>
            <Text style={styles.message}>
              Meta {goalTitle} concluída! Agora é planejar a próxima conquista a dois ✈️💕
            </Text>
            <Text style={styles.amount}>
              R$ {goalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.okButton} onPress={onClose}>
            <Text style={styles.okButtonText}>Que demais! 🎉</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  content: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CD964',
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: '#4CD964',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  okButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GoalReachedModal;