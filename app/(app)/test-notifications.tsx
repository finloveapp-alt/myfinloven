import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNotifications } from '../../hooks/useNotifications';

export default function TestNotifications() {
  const {
    expoPushToken,
    notification,
    sendTestNotification,
    sendImmediateNotification,
    scheduleDailyNotification,
    cancelDailyNotifications,
  } = useNotifications();

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Sucesso!', 'Notificação de teste agendada para 30 segundos!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar notificação de teste');
      console.error(error);
    }
  };

  const handleImmediateNotification = async () => {
    try {
      await sendImmediateNotification();
      Alert.alert('Sucesso!', 'Notificação imediata enviada!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar notificação imediata');
      console.error(error);
    }
  };

  const handleDailyNotification = async () => {
    try {
      await scheduleDailyNotification();
      Alert.alert('Sucesso!', 'Notificação diária agendada para 09:00!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao agendar notificação diária');
      console.error(error);
    }
  };

  const handleCancelDailyNotifications = async () => {
    try {
      await cancelDailyNotifications();
      Alert.alert('Sucesso!', 'Todas as notificações diárias foram canceladas!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cancelar notificações diárias');
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Teste de Notificações</Text>
        <Text style={styles.subtitle}>MyFinlove Push Notifications</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Status do Token</Text>
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>Push Token:</Text>
          <Text style={styles.tokenText}>
            {expoPushToken ? `${expoPushToken.substring(0, 20)}...` : 'Carregando...'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Testes de Notificação</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleTestNotification}
        >
          <Text style={styles.buttonText}>💕 Notificação de Teste (30s)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleImmediateNotification}
        >
          <Text style={styles.buttonText}>🍟 Notificação Imediata</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dailyButton]}
          onPress={handleDailyNotification}
        >
          <Text style={styles.buttonText}>⏰ Notificação Diária (09:00)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancelDailyNotifications}
        >
          <Text style={styles.buttonText}>❌ Cancelar Notificações Diárias</Text>
        </TouchableOpacity>
      </View>

      {notification && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📨 Última Notificação</Text>
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationTitle}>
              {notification.request.content.title}
            </Text>
            <Text style={styles.notificationBody}>
              {notification.request.content.body}
            </Text>
            <Text style={styles.notificationData}>
              Data: {JSON.stringify(notification.request.content.data)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Informações</Text>
        <Text style={styles.infoText}>
          • As notificações de teste usam o mesmo formato das notificações reais do MyFinlove
        </Text>
        <Text style={styles.infoText}>
          • Teste com o app em background para ver as notificações funcionando
        </Text>
        <Text style={styles.infoText}>
          • O token push é necessário para notificações remotas
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#6c5ce7',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
  },
  tokenContainer: {
    backgroundColor: '#f1f2f6',
    padding: 10,
    borderRadius: 5,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
    marginBottom: 5,
  },
  tokenText: {
    fontSize: 12,
    color: '#2d3436',
    fontFamily: 'monospace',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#00b894',
  },
  secondaryButton: {
    backgroundColor: '#e17055',
  },
  dailyButton: {
    backgroundColor: '#6c5ce7',
  },
  cancelButton: {
    backgroundColor: '#d63031',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6c5ce7',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
  },
  notificationData: {
    fontSize: 12,
    color: '#74b9ff',
    fontFamily: 'monospace',
  },
  infoText: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 5,
    lineHeight: 20,
  },
});