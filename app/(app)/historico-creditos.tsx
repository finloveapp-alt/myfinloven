import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, Search } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { fontFallbacks } from '@/utils/styles';

export default function HistoricoCreditos() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('Todos');
  const [filterDate, setFilterDate] = useState('2025 (Ano todo)');
  const [selectedType, setSelectedType] = useState('Despesas');
  const router = useRouter();
  
  // Função para voltar à página anterior
  const goBack = () => {
    router.push('/dashboard');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cabeçalho */}
      <LinearGradient
        colors={['#b687fe', '#9157ec']}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerContent}>
          <TouchableOpacity 
            onPress={goBack} 
            style={styles.backButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Créditos</Text>
          <View style={{ width: 24 }} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Filtro por Tipo */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Tipo</Text>
          <View style={styles.typeFilterContainer}>            
            <TouchableOpacity 
              style={[
                styles.typeFilterButton, 
                selectedType === 'Despesas' && styles.typeFilterButtonActive
              ]}
              onPress={() => setSelectedType('Despesas')}
            >
              <Text style={[
                styles.typeFilterText,
                selectedType === 'Despesas' && styles.typeFilterTextActive
              ]}>Despesas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.typeFilterButton, 
                selectedType === 'Receitas' && styles.typeFilterButtonActive
              ]}
              onPress={() => setSelectedType('Receitas')}
            >
              <Text style={[
                styles.typeFilterText,
                selectedType === 'Receitas' && styles.typeFilterTextActive
              ]}>Receitas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtro de Pessoa */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Pessoa</Text>
          <View style={styles.personFilterContainer}>
            <TouchableOpacity 
              style={[
                styles.personFilterButton, 
                selectedPerson === 'Todos' && styles.personFilterButtonActive
              ]}
              onPress={() => setSelectedPerson('Todos')}
            >
              <Text style={[
                styles.personFilterText,
                selectedPerson === 'Todos' && styles.personFilterTextActive
              ]}>Todos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.personFilterButton, 
                selectedPerson === 'Ana' && styles.personFilterButtonActive
              ]}
              onPress={() => setSelectedPerson('Ana')}
            >
              <Text style={[
                styles.personFilterText,
                selectedPerson === 'Ana' && styles.personFilterTextActive
              ]}>Ana</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.personFilterButton, 
                selectedPerson === 'João' && styles.personFilterButtonActive
              ]}
              onPress={() => setSelectedPerson('João')}
            >
              <Text style={[
                styles.personFilterText,
                selectedPerson === 'João' && styles.personFilterTextActive
              ]}>João</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtro de Data */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Data</Text>
          <TouchableOpacity style={styles.dateSelector}>
            <Calendar size={20} color="#b687fe" style={styles.calendarIcon} />
            <Text style={styles.dateText}>{filterDate}</Text>
          </TouchableOpacity>
        </View>

        {/* Campo de Pesquisa */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Pesquisar</Text>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Pesquisar ${selectedType.toLowerCase()}...`}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Card de Resumo */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValueTotal}>R$ 0</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Utilizado</Text>
              <Text style={styles.summaryValuePaid}>R$ 0</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Disponível</Text>
              <Text style={styles.summaryValuePending}>R$ 0</Text>
            </View>
          </View>
        </View>

        {/* Mensagem quando não há dados */}
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Nenhum crédito encontrado para os filtros selecionados.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#555',
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 12,
  },
  calendarIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
  },
  personFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  personFilterButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 8,
  },
  personFilterButtonActive: {
    backgroundColor: '#b687fe',
  },
  personFilterText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#555',
  },
  personFilterTextActive: {
    color: 'white',
  },
  typeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeFilterButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 8,
  },
  typeFilterButtonActive: {
    backgroundColor: '#b687fe',
  },
  typeFilterText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#555',
  },
  typeFilterTextActive: {
    color: 'white',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#555',
    marginBottom: 8,
  },
  summaryValueTotal: {
    fontSize: 24,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  summaryValuePaid: {
    fontSize: 24,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#4CD964', // Verde para valores utilizados
  },
  summaryValuePending: {
    fontSize: 24,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#b687fe', // Roxo para valores disponíveis
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 