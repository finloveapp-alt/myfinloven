import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Users, UserCircle } from 'lucide-react-native';
import BottomNavigation from '@/components/BottomNavigation';

const theme = {
  primary: '#b687fe',
  card: '#ffffff',
};

export default function Home() {
  const modes = [
    {
      id: 1,
      title: 'Individual',
      description: 'Use o app sozinho e simule um parceiro com avatar',
      icon: User,
      color: '#b687fe',
    },
    {
      id: 2,
      title: 'Casal Conectado',
      description: 'Sincronize dados em tempo real com seu parceiro',
      icon: Users,
      color: '#0073ea',
    },
    {
      id: 3,
      title: 'Simulação com Avatar',
      description: 'Gerencie gastos como casal marcando despesas manualmente',
      icon: UserCircle,
      color: '#ff6b6b',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8f0ff']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Escolha seu modo</Text>
          <Text style={styles.subtitle}>Como você quer usar o MyFinlove?</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {modes.map((mode) => (
            <TouchableOpacity key={mode.id} style={styles.card}>
              <View style={[styles.iconContainer, { backgroundColor: mode.color }]}>
                <mode.icon size={24} color="#fff" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{mode.title}</Text>
                <Text style={styles.cardDescription}>{mode.description}</Text>
              </View>
              <TouchableOpacity
                style={[styles.selectButton, { backgroundColor: mode.color }]}
              >
                <Text style={styles.selectButtonText}>Selecionar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
      
      <BottomNavigation theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    marginBottom: 80,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    color: '#131313',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
      }
    }),
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardContent: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#131313',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    lineHeight: 20,
  },
  selectButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
});