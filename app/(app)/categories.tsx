import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Edit3, 
  Trash2,
  ChevronDown,
  Check
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definição de temas
const themes = {
  feminine: {
    primary: '#b687fe',
    secondary: '#8B5CF6',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    transfer: '#FF9500',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e1e5e9'
  },
  masculine: {
    primary: '#0073ea',
    secondary: '#3c79e6',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    transfer: '#FF9500',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e1e5e9'
  }
};

// Interface para categoria
interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'expense' | 'income' | 'transfer';
  created_at: string;
}

// Lista de ícones disponíveis
const availableIcons = [
  '🍎', '🍕', '🍔', '🛒', '🏠', '💡', '💻', '📱', '🚗', '⛽',
  '🎓', '📚', '🏥', '💊', '🎬', '🎮', '📺', '🎵', '💰', '💸',
  '💳', '🏦', '✈️', '🏨', '👕', '👟', '🎯', '🎪', '🎨', '🎭',
  '🏃', '🏋️', '⚽', '🏀', '🎾', '🏊', '🚲', '🏍️', '🚌', '🚕',
  '🍽️', '☕', '🍺', '🍷', '🎂', '🍰', '🍫', '🍭', '🌮', '🍜'
];

export default function CategoriesScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState(themes.masculine);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📝');
  const [newCategoryType, setNewCategoryType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [typeDropdownVisible, setTypeDropdownVisible] = useState(false);
  const [iconDropdownVisible, setIconDropdownVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar tema
  useEffect(() => {
    loadTheme();
  }, []);

  // Carregar categorias
  useEffect(() => {
    loadCategories();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('@MyFinlove:theme');
      if (storedTheme) {
        setTheme(storedTheme === 'feminine' ? themes.feminine : themes.masculine);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar categorias:', error);
        Alert.alert('Erro', 'Não foi possível carregar as categorias.');
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('📝');
    setNewCategoryType('expense');
    setTypeDropdownVisible(false);
    setIconDropdownVisible(false);
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
    setNewCategoryType(category.type);
    setTypeDropdownVisible(false);
    setIconDropdownVisible(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('📝');
    setNewCategoryType('expense');
    setTypeDropdownVisible(false);
    setIconDropdownVisible(false);
  };

  const saveCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome da categoria.');
      return;
    }

    try {
      setSaving(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      if (editingCategory) {
        // Editar categoria existente
        const { error } = await supabase
          .from('categories')
          .update({
            name: newCategoryName.trim(),
            icon: newCategoryIcon,
            type: newCategoryType,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) {
          console.error('Erro ao atualizar categoria:', error);
          Alert.alert('Erro', 'Não foi possível atualizar a categoria.');
          return;
        }

        Alert.alert('Sucesso', 'Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
        const { error } = await supabase
          .from('categories')
          .insert([{
            user_id: session.user.id,
            name: newCategoryName.trim(),
            icon: newCategoryIcon,
            type: newCategoryType
          }]);

        if (error) {
          console.error('Erro ao criar categoria:', error);
          Alert.alert('Erro', 'Não foi possível criar a categoria.');
          return;
        }

        Alert.alert('Sucesso', 'Categoria criada com sucesso!');
      }

      closeModal();
      loadCategories();
    } catch (error) {
      console.error('Erro inesperado:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category: Category) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a categoria "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', category.id);

              if (error) {
                console.error('Erro ao excluir categoria:', error);
                Alert.alert('Erro', 'Não foi possível excluir a categoria.');
                return;
              }

              Alert.alert('Sucesso', 'Categoria excluída com sucesso!');
              loadCategories();
            } catch (error) {
              console.error('Erro inesperado:', error);
              Alert.alert('Erro', 'Ocorreu um erro inesperado.');
            }
          }
        }
      ]
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'expense': return theme.expense;
      case 'income': return theme.income;
      case 'transfer': return theme.transfer;
      default: return theme.textSecondary;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'expense': return 'Despesa';
      case 'income': return 'Receita';
      case 'transfer': return 'Transferência';
      default: return type;
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categorias</Text>
        <TouchableOpacity 
          onPress={openAddModal}
          style={styles.addButton}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Lista de Categorias */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>Carregando categorias...</Text>
          </View>
        ) : categories.length > 0 ? (
          <View style={styles.categoriesList}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={[styles.categoryType, { color: getTypeColor(category.type) }]}>
                      {getTypeLabel(category.type)}
                    </Text>
                  </View>
                </View>
                <View style={styles.categoryActions}>
                  <TouchableOpacity 
                    onPress={() => openEditModal(category)}
                    style={styles.actionButton}
                  >
                    <Edit3 size={20} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => deleteCategory(category)}
                    style={styles.actionButton}
                  >
                    <Trash2 size={20} color={theme.expense} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyTitle}>Nenhuma categoria encontrada</Text>
            <Text style={styles.emptyDescription}>
              Crie sua primeira categoria para organizar suas transações
            </Text>
            <TouchableOpacity 
              onPress={openAddModal}
              style={styles.emptyButton}
            >
              <Plus size={20} color="#FFF" />
              <Text style={styles.emptyButtonText}>Criar Categoria</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal de Adicionar/Editar Categoria */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <X size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Nome da Categoria */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome da Categoria</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Ex: Alimentação, Transporte..."
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              {/* Tipo da Categoria */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo</Text>
                <TouchableOpacity 
                  style={styles.selectInput}
                  onPress={() => setTypeDropdownVisible(!typeDropdownVisible)}
                >
                  <View style={styles.selectContent}>
                    <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(newCategoryType) }]} />
                    <Text style={styles.selectText}>{getTypeLabel(newCategoryType)}</Text>
                  </View>
                  <ChevronDown size={20} color={theme.textSecondary} />
                </TouchableOpacity>
                
                {typeDropdownVisible && (
                  <View style={styles.dropdown}>
                    {(['expense', 'income', 'transfer'] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.dropdownOption,
                          newCategoryType === type && styles.dropdownOptionSelected
                        ]}
                        onPress={() => {
                          setNewCategoryType(type);
                          setTypeDropdownVisible(false);
                        }}
                      >
                        <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(type) }]} />
                        <Text style={[
                          styles.dropdownOptionText,
                          newCategoryType === type && styles.dropdownOptionTextSelected
                        ]}>
                          {getTypeLabel(type)}
                        </Text>
                        {newCategoryType === type && (
                          <Check size={16} color={theme.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Ícone da Categoria */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ícone</Text>
                <TouchableOpacity 
                  style={styles.selectInput}
                  onPress={() => setIconDropdownVisible(!iconDropdownVisible)}
                >
                  <View style={styles.selectContent}>
                    <Text style={styles.selectedIcon}>{newCategoryIcon}</Text>
                    <Text style={styles.selectText}>Ícone selecionado</Text>
                  </View>
                  <ChevronDown size={20} color={theme.textSecondary} />
                </TouchableOpacity>
                
                {iconDropdownVisible && (
                  <View style={styles.iconsDropdown}>
                    <ScrollView style={styles.iconsScrollView} showsVerticalScrollIndicator={true}>
                      <View style={styles.iconsGrid}>
                        {availableIcons.map((icon, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.iconOption,
                              newCategoryIcon === icon && styles.iconOptionSelected
                            ]}
                            onPress={() => {
                              setNewCategoryIcon(icon);
                              setIconDropdownVisible(false);
                            }}
                          >
                            <Text style={styles.iconOptionText}>{icon}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Botões do Modal */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={saveCategory}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Salvando...' : (editingCategory ? 'Atualizar' : 'Criar')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.textSecondary,
  },
  categoriesList: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  categoryType: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.card,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.card,
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectText: {
    fontSize: 16,
    color: theme.text,
  },
  selectedIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dropdownOptionSelected: {
    backgroundColor: `${theme.primary}10`,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: theme.text,
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: theme.primary,
    fontWeight: '600',
  },
  iconsDropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.card,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconsScrollView: {
    padding: 8,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: theme.background,
  },
  iconOptionSelected: {
    backgroundColor: theme.primary,
  },
  iconOptionText: {
    fontSize: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: theme.textSecondary,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});