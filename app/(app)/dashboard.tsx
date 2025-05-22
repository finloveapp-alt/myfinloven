import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  Animated,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { fontFallbacks } from '@/utils/styles';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  ChevronRight, 
  BarChart, 
  Receipt, 
  PlusCircle, 
  CreditCard, 
  Home,
  Calendar,
  Target,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  LogOut,
  Menu,
  PieChart,
  Clock,
  Tag,
  Wallet,
  Info,
  ExternalLink,
  Bell,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react-native';

// Definição de temas
const themes = {
  feminine: {
    primary: '#b687fe',
    primaryGradient: ['#b687fe', '#9157ec'],
    secondary: '#8B5CF6',
    accent: '#FF3B30',
    positive: '#4CD964',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#0073ea',
    progressTrack: '#f0f0f0'
  },
  masculine: {
    primary: '#0073ea',
    primaryGradient: ['#0073ea', '#0056b3'],
    secondary: '#3c79e6',
    accent: '#FF3B30',
    positive: '#4CD964',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#8B5CF6',
    progressTrack: '#f0f0f0'
  }
};

// Interface para o objeto de perfil de usuário
interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: string;
  avatar_url?: string;
  profile_picture_url?: string;
  account_type?: string;
}

export default function Dashboard() {
  const [theme, setTheme] = useState(themes.feminine);
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [partnerUser, setPartnerUser] = useState<UserProfile | null>(null);
  const [profilePictureModalVisible, setProfilePictureModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [isUserInviter, setIsUserInviter] = useState(false);
  const [isInviteAvatar, setIsInviteAvatar] = useState(false); // Novo estado para marcar convite como avatar
  const [avatarPassword, setAvatarPassword] = useState(''); // Adicionar novamente o estado para senha
  
  useEffect(() => {
    // Verifica se existe um tema definido globalmente
    if (global.dashboardTheme === 'masculine') {
      setTheme(themes.masculine);
      console.log('Dashboard: Aplicando tema masculino (azul)');
    } else {
      setTheme(themes.feminine);
      console.log('Dashboard: Aplicando tema feminino (rosa)');
    }
    
    // Buscar informações do usuário atual e seu parceiro
    fetchUserAndPartner();
  }, []);
  
  // Função para buscar o usuário atual e seu parceiro
  const fetchUserAndPartner = async () => {
    try {
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      if (!session?.user) {
        console.log('Nenhuma sessão de usuário encontrada');
        return;
      }
      
      const userId = session.user.id;
      
      // Buscar o perfil do usuário atual
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Erro ao buscar perfil do usuário:', userError);
        return;
      }
      
      console.log('Perfil do usuário obtido do banco:', userProfile);
      
      // Verificar se o usuário é um convidador (user1_id em algum registro de couples)
      const { data: userAsInviter, error: inviterError } = await supabase
        .from('couples')
        .select('id')
        .eq('user1_id', userId)
        .limit(1);
        
      if (inviterError) {
        console.error('Erro ao verificar se usuário é convidador:', inviterError);
      }
      
      const isInviter = userAsInviter && userAsInviter.length > 0;
      console.log('Usuário é convidador:', isInviter);
      setIsUserInviter(isInviter);
      
      if (userProfile) {
        // Certifique-se de que account_type seja sempre 'individual' quando não for 'couple'
        const accountType = userProfile.account_type === 'couple' ? 'couple' : 'individual';
        
        console.log('Perfil do usuário carregado:', {
          id: userProfile.id,
          account_type_raw: userProfile.account_type,
          account_type_processed: accountType,
          isInviter: isInviter
        });
        
        setCurrentUser({
          id: userProfile.id,
          name: userProfile.name || 'Usuário',
          email: userProfile.email || '',
          gender: userProfile.gender || '',
          account_type: accountType,
          profile_picture_url: userProfile.profile_picture_url || null,
          avatar_url: userProfile.profile_picture_url || (userProfile.gender?.toLowerCase() === 'homem' ? 
            'https://randomuser.me/api/portraits/men/36.jpg' : 
            'https://randomuser.me/api/portraits/women/44.jpg')
        });
      }
      
      // Buscar relacionamento de casal
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active')
        .limit(1);
        
      if (coupleError) {
        console.error('Erro ao buscar relacionamento de casal:', coupleError);
        return;
      }
      
      // Verificar se encontrou algum casal ativo
      if (coupleData && coupleData.length > 0) {
        // Usar o primeiro casal ativo encontrado
        const activeCoupleData = coupleData[0];
        
        // Determinar o ID do parceiro
        const partnerId = activeCoupleData.user1_id === userId ? activeCoupleData.user2_id : activeCoupleData.user1_id;
        
        if (partnerId) {
          // Buscar o perfil do parceiro
          const { data: partnerProfile, error: partnerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerId)
            .single();
            
          if (partnerError) {
            console.error('Erro ao buscar perfil do parceiro:', partnerError);
            return;
          }
          
          if (partnerProfile) {
            setPartnerUser({
              id: partnerProfile.id,
              name: partnerProfile.name || 'Parceiro',
              email: partnerProfile.email || '',
              gender: partnerProfile.gender || '',
              profile_picture_url: partnerProfile.profile_picture_url || null,
              avatar_url: partnerProfile.profile_picture_url || (partnerProfile.gender?.toLowerCase() === 'homem' ? 
                'https://randomuser.me/api/portraits/men/42.jpg' : 
                'https://randomuser.me/api/portraits/women/33.jpg')
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  // Funções para navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  // Formatar nome do mês atual
  const formatMonthName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long' });
  };

  // Capitalize primeira letra
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Nomes baseados no tema
  const primaryPerson = theme === themes.masculine ? 'João' : 'Maria';
  const secondaryPerson = theme === themes.masculine ? 'Maria' : 'João';
  
  // Dados das transações
  const transactions = [
    {
      icon: '🥕',
      backgroundColor: '#FFEEE2',
      title: 'Mercado',
      subtitle: `Mercado por ${secondaryPerson}`,
      amount: 'R$ 50',
      paymentMethod: 'Dinheiro'
    },
    {
      icon: '⛽',
      backgroundColor: '#E3F5FF',
      title: 'Combustível',
      subtitle: `Posto Shell - ${primaryPerson}`,
      amount: 'R$ 120',
      paymentMethod: 'Cartão de crédito'
    },
    {
      icon: '🍽️',
      backgroundColor: '#FFE2E6',
      title: 'Restaurante',
      subtitle: 'Almoço Compartilhado',
      amount: 'R$ 85',
      paymentMethod: 'Pix'
    }
  ];
  
  // Funções para navegar entre transações
  const goToPreviousTransaction = () => {
    setCurrentTransactionIndex(prev => 
      prev === 0 ? transactions.length - 1 : prev - 1
    );
  };
  
  const goToNextTransaction = () => {
    setCurrentTransactionIndex(prev => 
      prev === transactions.length - 1 ? 0 : prev + 1
    );
  };

  // Gerar datas para a linha do tempo
  const generateTimelineDates = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dates = [];
    
    // Gerar 7 datas começando do primeiro dia do mês
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(firstDay);
      currentDate.setDate(firstDay.getDate() + i);
      dates.push(currentDate);
    }
    
    return dates;
  };

  // Formatar data para exibição
  const formatDateForTimeline = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Função para selecionar imagem da galeria
  const pickImage = async () => {
    try {
      // Importar ImagePicker dinamicamente apenas quando a função for chamada
      const ImagePicker = Platform.OS !== 'web' 
        ? await import('expo-image-picker') 
        : null;
      
      if (!ImagePicker) {
        Alert.alert('Não suportado', 'Essa funcionalidade não está disponível nesta plataforma.');
        return;
      }

      // Solicitar permissão para acessar a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua galeria.');
        return;
      }

      // Abrir seletor de imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  // Função para tirar foto com a câmera
  const takePhoto = async () => {
    try {
      // Importar ImagePicker dinamicamente apenas quando a função for chamada
      const ImagePicker = Platform.OS !== 'web' 
        ? await import('expo-image-picker') 
        : null;
      
      if (!ImagePicker) {
        Alert.alert('Não suportado', 'Essa funcionalidade não está disponível nesta plataforma.');
        return;
      }

      // Solicitar permissão para acessar a câmera
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua câmera.');
        return;
      }

      // Abrir câmera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  // Função para fazer upload da imagem para o Storage do Supabase
  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      // Obter sessão do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Falha ao obter sessão do usuário');
      }

      // Converter imagem para blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Gerar nome de arquivo único
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
      const filePath = `profile_pictures/${fileName}`;

      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from('user_uploads')
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: urlData } = await supabase.storage
        .from('user_uploads')
        .getPublicUrl(filePath);

      // Atualizar perfil do usuário com URL da imagem
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: urlData.publicUrl })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setImageUrl(urlData.publicUrl);
      setCurrentUser(prev => prev ? {
        ...prev,
        profile_picture_url: urlData.publicUrl,
        avatar_url: urlData.publicUrl
      } : null);

      Alert.alert('Sucesso', 'Sua foto de perfil foi atualizada com sucesso!');
      setProfilePictureModalVisible(false);
      
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      Alert.alert('Erro', 'Não foi possível fazer o upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  // Alternativa para upload de foto em ambiente web
  const handleImageInputChange = async (event) => {
    try {
      if (Platform.OS === 'web' && event.target.files && event.target.files.length > 0) {
        setUploading(true);
        const file = event.target.files[0];
        await uploadImage(URL.createObjectURL(file));
      }
    } catch (error) {
      console.error('Erro ao processar arquivo web:', error);
      Alert.alert('Erro', 'Não foi possível processar o arquivo');
      setUploading(false);
    }
  };

  // Função para enviar convite
  const handleSendInvitation = async () => {
    if (!inviteEmail || !inviteEmail.trim()) {
      Alert.alert('Erro', 'Por favor, informe o email do convidado');
      return;
    }
    
    // Validar senha se for avatar
    if (isInviteAvatar && (!avatarPassword || avatarPassword.length < 6)) {
      Alert.alert('Erro', 'Por favor, defina uma senha com pelo menos 6 caracteres para o avatar');
      return;
    }
    
    setInviting(true);
    try {
      if (!currentUser) {
        throw new Error('Nenhum usuário logado');
      }
      
      // Gerar token único para o convite
      const invitationToken = Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15);
      
      if (isInviteAvatar) {
        try {
          // Para avatar, cria um usuário real no Supabase através de uma chamada direta ao backend
          // Usar a senha informada pelo usuário em vez de gerar uma aleatória
          console.log('Criando usuário avatar...');
          
          // Primeiro criar uma entrada pendente na tabela couples
          const { data: coupleData, error: coupleError } = await supabase
            .from('couples')
            .insert({
              user1_id: currentUser.id,
              invitation_token: invitationToken,
              invitation_email: inviteEmail.trim().toLowerCase(),
              status: 'pending',
              is_avatar: true
            })
            .select('id')
            .single();
            
          if (coupleError) {
            throw new Error('Falha ao criar registro inicial para o avatar');
          }
          
          // Variável para armazenar o ID do usuário avatar
          let avatarUserId;
          
          // Tentar criar o avatar através do método de sign up normal
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: inviteEmail.trim().toLowerCase(),
            password: avatarPassword, // Usar senha digitada pelo usuário
            options: {
              data: {
                is_avatar: true,
                created_by: currentUser.id,
                couple_id: coupleData.id
              }
            }
          });
          
          if (authError) {
            // Se o erro for de email já em uso, tentar fazer login com as credenciais fornecidas
            if (authError.message.includes('Email already registered')) {
              console.log('Email já registrado, tentando fazer login...');
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: inviteEmail.trim().toLowerCase(),
                password: avatarPassword
              });
              
              if (signInError) {
                throw new Error(`Erro ao autenticar com email existente: ${signInError.message}. Verifique a senha ou use outro email.`);
              }
              
              // Login bem sucedido, obter o ID do usuário
              avatarUserId = signInData.user.id;
              console.log('Login bem sucedido com usuário existente:', avatarUserId);
              
              // Verificar se este usuário já está em um casal
              const { data: existingCouple, error: coupleCheckError } = await supabase
                .from('couples')
                .select('id, status')
                .or(`user1_id.eq.${avatarUserId},user2_id.eq.${avatarUserId}`)
                .not('status', 'eq', 'rejected')
                .limit(1);
              
              if (coupleCheckError) {
                console.error('Erro ao verificar casal existente:', coupleCheckError);
              }
              
              if (existingCouple && existingCouple.length > 0 && existingCouple[0].status === 'active') {
                throw new Error('Este avatar já está vinculado a outro usuário.');
              }
              
              // Fazer logout para não afetar a sessão atual
              await supabase.auth.signOut();
            } else {
              throw new Error(`Erro ao criar conta para avatar: ${authError.message}`);
            }
          } else {
            // Signup bem sucedido
            avatarUserId = authData.user.id;
            console.log('Usuário avatar criado:', avatarUserId);
          }
          
          // Verificar se o perfil já existe antes de criar
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', avatarUserId)
            .single();
          
          if (profileCheckError && profileCheckError.code !== 'PGRST116') {
            // PGRST116 significa que não encontrou, que é o esperado
            console.error('Erro ao verificar perfil existente:', profileCheckError);
          }
          
          // Só criar o perfil se ele não existir
          if (!existingProfile) {
            console.log('Criando perfil para o avatar...');
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: avatarUserId,
                email: inviteEmail.trim().toLowerCase(),
                name: `Avatar (${inviteEmail.split('@')[0]})`,
                account_type: 'avatar',
                gender: currentUser.gender === 'masculino' ? 'feminino' : 'masculino' // Gênero oposto ao usuário atual
              });
              
            if (profileError) {
              console.error('Erro ao criar perfil do avatar:', profileError);
              throw new Error('Falha ao criar perfil do avatar');
            }
          } else {
            console.log('Perfil do avatar já existe, pulando criação');
          }
          
          // Atualizar o registro couples com o user2_id
          const { error: updateError } = await supabase
            .from('couples')
            .update({
              user2_id: avatarUserId,
              status: 'active'
            })
            .eq('id', coupleData.id);
            
          if (updateError) {
            throw new Error('Falha ao atualizar o relacionamento do avatar');
          }
          
          // Enviar uma solicitação para confirmar o email automaticamente através de uma Edge Function
          const confirmResponse = await fetch(`${supabase.supabaseUrl}/functions/v1/confirm-avatar-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              avatarId: avatarUserId,
              avatarEmail: inviteEmail.trim().toLowerCase()
            })
          });
          
          if (!confirmResponse.ok) {
            console.warn('Aviso: Não foi possível confirmar o email do avatar automaticamente');
          }
          
          Alert.alert(
            'Avatar Criado',
            `O avatar "${inviteEmail}" foi criado com sucesso e já está vinculado à sua conta.`,
            [{ text: 'OK', onPress: () => {
              setInviteModalVisible(false);
              setIsInviteAvatar(false);
              setAvatarPassword('');
              // Atualizar os dados do usuário e parceiro
              fetchUserAndPartner();
            }}]
          );
          
          // Limpar a senha ao concluir com sucesso
          setAvatarPassword('');
          
        } catch (error) {
          console.error('Erro ao criar avatar:', error);
          Alert.alert('Erro', error.message || 'Falha ao criar o avatar');
          setInviting(false);
          return;
        }
      } else {
        // Fluxo normal para convites de usuários reais
        try {
          const { data: coupleData, error: coupleError } = await supabase
            .from('couples')
            .insert({
              user1_id: currentUser.id,
              invitation_token: invitationToken,
              invitation_email: inviteEmail.trim().toLowerCase(),
              status: 'pending',
              is_avatar: false
            })
            .select('id')
            .single();
            
          if (coupleError) {
            throw new Error('Falha ao criar registro. Verifique se o email é válido.');
          }
          
          // Enviar convite por email para usuários reais
          const inviteResponse = await fetch(`${supabase.supabaseUrl}/functions/v1/send-couple-invitation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              partnerEmail: inviteEmail.trim().toLowerCase(),
              inviterName: currentUser.name || 'Seu parceiro',
              inviterId: currentUser.id,
              invitationToken: invitationToken,
              coupleId: coupleData.id
            })
          });
          
          if (!inviteResponse.ok) {
            const errorData = await inviteResponse.json();
            throw new Error(`Falha ao enviar convite: ${errorData.error || 'Erro desconhecido'}`);
          }
          
          Alert.alert(
            'Convite Enviado',
            `Um convite foi enviado para ${inviteEmail}. Seu convidado receberá instruções para aceitar o convite.`,
            [{ text: 'OK', onPress: () => {
              setInviteModalVisible(false);
              setIsInviteAvatar(false);
            }}]
          );
        } catch (error) {
          console.error('Erro ao enviar convite:', error);
          Alert.alert('Erro', error.message || 'Falha ao enviar o convite');
          setInviting(false);
          return;
        }
      }
      
      setInviteEmail('');
      setInviting(false);
    } catch (error) {
      console.error('Erro ao processar operação:', error);
      Alert.alert('Erro', error.message || 'Falha ao processar a operação. Por favor, tente novamente.');
      setInviting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <ScrollView>
        {/* Header Section */}
        <LinearGradient
          colors={[theme.primaryGradient[0], theme.primaryGradient[1]]}
          style={styles.headerContainer}
        >
          <SafeAreaView style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.profileInfo}>
                <TouchableOpacity onPress={() => setProfilePictureModalVisible(true)}>
                  <Image
                    source={{ uri: currentUser?.profile_picture_url || (theme === themes.masculine 
                      ? 'https://randomuser.me/api/portraits/men/36.jpg'
                      : 'https://randomuser.me/api/portraits/women/44.jpg') }}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
                <View style={styles.monthSelectorContainer}>
                  <TouchableOpacity style={styles.monthNavButton} onPress={goToPreviousMonth}>
                    <ArrowLeft size={22} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.monthText}>{capitalizeFirstLetter(formatMonthName(currentMonth))}</Text>
                  <TouchableOpacity style={styles.monthNavButton} onPress={goToNextMonth}>
                    <ArrowRight size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.logoutButton}
                  onPress={() => {
                    router.replace('/(auth)/login');
                  }}
                  accessibilityLabel="Botão de logout"
                  accessibilityHint="Pressione para sair do aplicativo"
                >
                  <LogOut size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.balanceSection}>
              <View style={styles.balanceHeaderRow}>
                <View style={styles.balanceHeaderItem}>
                  <View style={styles.balanceIconCircle}>
                    <Check size={16} color="#fff" />
                  </View>
                  <Text style={styles.balanceHeaderText}>Inicial</Text>
                </View>
                
                <View style={styles.balanceHeaderItem}>
                  <View style={[styles.balanceIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.5)' }]}>
                    <DollarSign size={16} color="#fff" />
                  </View>
                  <Text style={styles.balanceHeaderText}>Saldo</Text>
                </View>
                
                <View style={styles.balanceHeaderItem}>
                  <View style={styles.balanceIconCircle}>
                    <Clock size={16} color="#fff" />
                  </View>
                  <Text style={styles.balanceHeaderText}>Previsto</Text>
                </View>
              </View>
              
              <View style={styles.balanceValueRow}>
                <View style={styles.balanceValueItem}>
                  <Text style={styles.balanceAmountSmall}>R$ 0,00</Text>
                </View>
                <View style={[styles.balanceValueItem, styles.balanceValueCenterItem]}>
                  <Text style={styles.balanceAmountLarge}>R$ 0,00</Text>
                </View>
                <View style={styles.balanceValueItem}>
                  <Text style={styles.balanceAmountSmall}>R$ 0,00</Text>
                </View>
              </View>
              
              <View style={styles.dateSelector}>
                <View style={styles.dateTimeline}>
                  <View style={styles.timelineLine} />
                  {generateTimelineDates(currentMonth).map((date, index) => (
                    <View key={index} style={styles.dateItem}>
                      <View style={styles.dateDot} />
                      <Text style={styles.dateText}>{formatDateForTimeline(date)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.usersRow}>
              {currentUser && (
                <Image
                  source={{ uri: currentUser.avatar_url || (theme === themes.masculine 
                    ? 'https://randomuser.me/api/portraits/men/36.jpg'
                    : 'https://randomuser.me/api/portraits/women/44.jpg') }}
                  style={styles.userAvatar}
                />
              )}
              
              {partnerUser && (
                <Image
                  source={{ uri: partnerUser.avatar_url || (theme === themes.masculine 
                    ? 'https://randomuser.me/api/portraits/women/33.jpg'
                    : 'https://randomuser.me/api/portraits/men/42.jpg') }}
                  style={styles.userAvatar}
                />
              )}
              
              {/* Botão de adicionar usuário apenas se o usuário atual for um convidador ou não tiver um par */}
              {console.log('Renderização condicional do botão +:', { 
                currentUser: currentUser,
                currentUserAccountType: currentUser?.account_type,
                shouldShowButton: currentUser?.account_type !== 'couple',
                isNull: currentUser?.account_type === null,
                isUndefined: currentUser?.account_type === undefined,
                isTypeOfString: typeof currentUser?.account_type === 'string',
                comparison: currentUser?.account_type === 'couple',
                isUserInviter: isUserInviter
              })}
              
              {/* Mostrar o botão se o usuário for um convidador (independente do account_type) */}
              {currentUser && isUserInviter && (
                <TouchableOpacity 
                  style={styles.addUserAvatar}
                  onPress={() => setInviteModalVisible(true)}
                >
                  <Text style={styles.addUserText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Financial Cards - Receitas, Despesas, Débitos e Créditos */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScrollContainer}
        >
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Pressable 
              style={({pressed}) => [
                styles.financialCard, 
                { backgroundColor: theme.card },
                pressed && styles.financialCardPressed
              ]}
              onPressIn={() => setPressedCard('receitas')}
              onPressOut={() => {
                setPressedCard(null);
                router.push('/historico-receitas');
              }}
            >
              <Text style={styles.cardLabel}>Receitas</Text>
              <Text style={styles.cardAmount}>R$ 5.000</Text>
              <Text style={styles.cardChangePositive}>+10% desde Março</Text>
            </Pressable>

            <Pressable 
              style={({pressed}) => [
                styles.financialCard, 
                { backgroundColor: theme.card },
                pressed && styles.financialCardPressed
              ]}
              onPressIn={() => setPressedCard('despesas')}
              onPressOut={() => {
                setPressedCard(null);
                router.push('/historico-despesas');
              }}
            >
              <Text style={styles.cardLabel}>Despesas</Text>
              <Text style={styles.cardAmount}>R$ 1.880</Text>
              <Text style={styles.cardChangeNegative}>-3,2% desde Março</Text>
            </Pressable>
            
            <Pressable 
              style={({pressed}) => [
                styles.card, 
                { backgroundColor: theme.card },
                pressed && styles.cardPressed
              ]}
              onPressIn={() => setPressedCard('debitos')}
              onPressOut={() => {
                setPressedCard(null);
                router.push('/historico-debitos');
              }}
            >
              <Text style={styles.cardLabel}>Débitos</Text>
              <Text style={styles.cardAmount}>R$ 2.350</Text>
              <Text style={styles.cardChangeNegative}>+5,7% desde Março</Text>
            </Pressable>
            
            <Pressable 
              style={({pressed}) => [
                styles.card, 
                { backgroundColor: theme.card },
                pressed && styles.cardPressed
              ]}
              onPressIn={() => setPressedCard('creditos')}
              onPressOut={() => {
                setPressedCard(null);
                router.push('/historico-creditos');
              }}
            >
              <Text style={styles.cardLabel}>Créditos</Text>
              <Text style={styles.cardAmount}>R$ 3.200</Text>
              <Text style={styles.cardChangePositive}>+8,3% desde Março</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Transaction List */}
        <View style={[styles.transactionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas Transações</Text>
            <TouchableOpacity onPress={goToNextTransaction}>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionWrapper}>
            <TouchableOpacity onPress={goToPreviousTransaction} style={styles.transactionNavButton}>
              <ChevronRight size={20} color="#999" style={{transform: [{rotate: '180deg'}] as any}} />
            </TouchableOpacity>
            
            <View style={styles.transaction}>
              <View style={[styles.transactionIconContainer, {backgroundColor: transactions[currentTransactionIndex].backgroundColor}]}>
                <Text style={styles.transactionIcon}>{transactions[currentTransactionIndex].icon}</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{transactions[currentTransactionIndex].title}</Text>
                {currentTransactionIndex === 2 ? (
                  <>
                    <Text style={styles.transactionSubtitle}>Almoço - Compartilhado</Text>
                  </>
                ) : (
                  <Text style={styles.transactionSubtitle}>{transactions[currentTransactionIndex].subtitle}</Text>
                )}
              </View>
              <View style={styles.transactionAmountContainer}>
                <Text style={styles.transactionAmount}>{transactions[currentTransactionIndex].amount}</Text>
                <Text style={styles.transactionType}>{transactions[currentTransactionIndex].paymentMethod}</Text>
              </View>
            </View>
            
            <TouchableOpacity onPress={goToNextTransaction} style={styles.transactionNavButton}>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.paginationDots}>
            {transactions.map((_, index) => (
              <View 
                key={index}
                style={[styles.paginationDot, 
                  index === currentTransactionIndex ? 
                  { backgroundColor: theme.secondary, width: 20 } : 
                  { backgroundColor: '#e0e0e0' }
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Resumo do Mês */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resumo do Mês</Text>
          </View>

          <View style={styles.summaryItem}>
            <DollarSign size={18} color={theme.primary} />
            <Text style={styles.summaryLabel}>Saldo total atual:</Text>
            <Text style={styles.summaryValue}>R$ 3.120,00</Text>
          </View>

          <TouchableOpacity 
            style={[styles.summaryItem, styles.clickableItem]}
            onPress={() => router.push('/historico-receitas')}
            activeOpacity={0.7}
          >
            <ArrowDownCircle size={18} color={theme.income} />
            <Text style={styles.summaryLabel}>Receitas totais do mês:</Text>
            <Text style={[styles.summaryValue, {color: theme.income}]}>R$ 5.000,00</Text>
            <ChevronRight size={16} color="#999" style={styles.chevronIcon} />
          </TouchableOpacity>

          <View style={styles.summaryItem}>
            <ArrowUpCircle size={18} color={theme.expense} />
            <Text style={styles.summaryLabel}>Despesas totais do mês:</Text>
            <Text style={[styles.summaryValue, {color: theme.expense}]}>R$ 1.880,00</Text>
          </View>
        </View>

        {/* Gastos por Pessoa */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gastos por Pessoa (até hoje)</Text>
          </View>

          <View style={styles.personExpense}>
            <View style={styles.personExpenseHeader}>
              <Text style={styles.personName}>{primaryPerson}:</Text>
              <Text style={styles.personAmount}>R$ 860,00</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: theme.primary, width: '45%' }]} />
            </View>
          </View>

          <View style={styles.personExpense}>
            <View style={styles.personExpenseHeader}>
              <Text style={styles.personName}>{secondaryPerson}:</Text>
              <Text style={styles.personAmount}>R$ 1.020,00</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: theme === themes.masculine ? theme.shared : theme.primary, width: '54%' }]} />
            </View>
          </View>

          <View style={styles.personExpense}>
            <View style={styles.personExpenseHeader}>
              <Text style={styles.personName}>Compartilhado:</Text>
              <Text style={styles.personAmount}>R$ 1.200,00</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: theme.shared, width: '63%' }]} />
            </View>
          </View>
        </View>

        {/* Contas a Pagar & Cartões */}
        <TouchableOpacity onPress={() => router.push('/expenses')} activeOpacity={0.8}>
          <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}> 
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contas a Pagar & Cartões</Text>
              <ChevronRight size={20} color="#999" />
            </View>
            <View style={styles.billItem}>
              <View style={[styles.billIconContainer, {backgroundColor: '#FFE2E6'}]}>
                <CreditCard size={20} color="#FF5A6E" />
              </View>
              <View style={styles.billDetails}>
                <Text style={styles.billTitle}>Cartão Nubank</Text>
                <Text style={styles.billDate}>Vence em 10 Abr</Text>
              </View>
              <Text style={styles.billAmount}>R$ 783,50</Text>
            </View>
            <View style={styles.billItem}>
              <View style={[styles.billIconContainer, {backgroundColor: '#E3F5FF'}]}>
                <Receipt size={20} color="#0095FF" />
              </View>
              <View style={styles.billDetails}>
                <Text style={styles.billTitle}>Aluguel</Text>
                <Text style={styles.billDate}>Débito automático · 05 Abr</Text>
              </View>
              <Text style={styles.billAmount}>R$ 1.200,00</Text>
            </View>
            <View style={styles.billItem}>
              <View style={[styles.billIconContainer, {backgroundColor: '#FFF6E3'}]}>
                <Receipt size={20} color="#FFB627" />
              </View>
              <View style={styles.billDetails}>
                <Text style={styles.billTitle}>Internet</Text>
                <Text style={styles.billDate}>Boleto · 15 Abr</Text>
              </View>
              <Text style={styles.billAmount}>R$ 120,00</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Metas Financeiras */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas Financeiras</Text>
            <TouchableOpacity>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Target size={18} color={theme.primary} />
                <Text style={styles.goalTitle}>Economizar R$ 1.000/mês</Text>
              </View>
              <Text style={styles.goalPercentage}>65%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: theme.primary, width: '65%' }]} />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Target size={18} color={theme.secondary} />
                <Text style={styles.goalTitle}>Fundo para carro novo</Text>
              </View>
              <Text style={styles.goalAmount}>R$ 12.000 <Text style={styles.goalTarget}>/ R$ 25.000</Text></Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: theme.secondary, width: '48%' }]} />
            </View>
          </View>
        </View>

        {/* Calendário Financeiro - Preview */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card, marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Calendário Financeiro</Text>
            <TouchableOpacity>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarPreview}>
            <View style={styles.calendarRow}>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>5</Text>
                <View style={[styles.calendarEvent, {backgroundColor: '#E3F5FF'}]}></View>
              </View>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>6</Text>
              </View>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>7</Text>
              </View>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>8</Text>
              </View>
              <View style={[styles.calendarDay, styles.calendarDayToday]}>
                <Text style={styles.calendarDayTextToday}>9</Text>
                <View style={[styles.calendarEvent, {backgroundColor: '#FFE2E6'}]}></View>
              </View>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>10</Text>
                <View style={[styles.calendarEvent, {backgroundColor: '#FFE2E6'}]}></View>
              </View>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>11</Text>
              </View>
            </View>

            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#FFE2E6'}]} />
                <Text style={styles.legendText}>Faturas de cartão</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#E3F5FF'}]} />
                <Text style={styles.legendText}>Débito automático</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#FFF6E3'}]} />
                <Text style={styles.legendText}>Boletos</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.navItem}>
          <BarChart size={24} color={theme.primary} />
          <Text style={[styles.navText, { color: theme.primary }]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setMenuModalVisible(true)}
        >
          <Menu size={24} color="#999" />
          <Text style={styles.navText}>Menu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(app)/registers')}
        >
          <View style={styles.addButtonInner}>
            <PlusCircle size={32} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push('/(app)/notifications')}
        >
          <Receipt size={24} color="#999" />
          <Text style={styles.navText}>Notificações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push('/(app)/cards')}
        >
          <CreditCard size={24} color="#999" />
          <Text style={styles.navText}>Cartões</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuModalVisible}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <View style={styles.menuModalContainer}>
          <View style={[styles.menuModalContent, { backgroundColor: theme.card }]}>
            <View style={styles.menuHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setMenuModalVisible(false)}
              >
                <Text style={[styles.closeButtonText, { color: theme.primary }]}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuGrid}>
              {/* Primeira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/dashboard');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <Home size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Dashboard</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Visão geral</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/registers');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <PlusCircle size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Novo Registro</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Adicionar transação</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/notifications');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <Bell size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Notificações</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Alertas e avisos</Text>
                </TouchableOpacity>
              </View>

              {/* Segunda linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/planning' as any);
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <BarChart size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Planejamento</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Orçamentos e metas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/cards');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <CreditCard size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Cartões</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Cartões de crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/expenses');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <Wallet size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Contas a Pagar</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar pagamentos</Text>
                </TouchableOpacity>
              </View>

              {/* Terceira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/accounts');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <Wallet size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Contas</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar contas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/receitas');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <ArrowUpCircle size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Receitas</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar receitas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.replace('/(auth)/login');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <ExternalLink size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Logout</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Sair do aplicativo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.closeFullButton, { backgroundColor: theme.primary }]}
              onPress={() => setMenuModalVisible(false)}
            >
              <Text style={styles.closeFullButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Profile Picture Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profilePictureModalVisible}
        onRequestClose={() => setProfilePictureModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar Foto de Perfil</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setProfilePictureModalVisible(false)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.uploadingText}>Enviando sua foto...</Text>
              </View>
            ) : (
              <>
                <View style={styles.currentPhotoContainer}>
                  <Image 
                    source={{ 
                      uri: currentUser?.profile_picture_url || (theme === themes.masculine 
                        ? 'https://randomuser.me/api/portraits/men/36.jpg'
                        : 'https://randomuser.me/api/portraits/women/44.jpg')
                    }}
                    style={styles.currentPhoto} 
                  />
                </View>
                
                {Platform.OS === 'web' ? (
                  <View style={styles.webButtonContainer}>
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: theme.primary }]}
                      onPress={() => {
                        // Disparar o input file via JS
                        const fileInput = document.getElementById('profile-picture-input');
                        if (fileInput) fileInput.click();
                      }}
                    >
                      <View style={styles.buttonContent}>
                        <Upload size={24} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Escolher Foto</Text>
                      </View>
                    </TouchableOpacity>
                    
                    {/* Input file oculto para web */}
                    {Platform.OS === 'web' && (
                      <input
                        type="file"
                        id="profile-picture-input"
                        accept="image/*"
                        onChange={handleImageInputChange}
                        style={{ display: 'none' }}
                      />
                    )}
                  </View>
                ) : (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: theme.primary }]}
                      onPress={takePhoto}
                    >
                      <View style={styles.buttonContent}>
                        <Camera size={24} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Tirar Foto</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: theme.secondary }]}
                      onPress={pickImage}
                    >
                      <View style={styles.buttonContent}>
                        <ImageIcon size={24} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Escolher Foto</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Convite */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isInviteAvatar ? 'Criar Avatar' : 'Convidar Usuário'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setInviteModalVisible(false);
                  setIsInviteAvatar(false);
                  setAvatarPassword(''); // Limpar a senha ao fechar
                }}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {inviting ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.uploadingText}>
                  {isInviteAvatar ? 'Criando avatar...' : 'Enviando convite...'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  {isInviteAvatar 
                    ? 'Crie um avatar para representar uma conta virtual no sistema. O avatar será vinculado diretamente à sua conta.'
                    : 'Convide alguém para compartilhar finanças e organizar o orçamento juntos.'}
                </Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    {isInviteAvatar ? 'Email do Avatar' : 'Email do Convidado'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={isInviteAvatar ? "Digite o email do avatar" : "Digite o email"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                  />
                  {isInviteAvatar && (
                    <Text style={styles.passwordHint}>
                      O avatar será criado automaticamente e vinculado à sua conta.
                    </Text>
                  )}
                </View>
                
                {/* Adicionar opção de avatar */}
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setIsInviteAvatar(!isInviteAvatar)}
                >
                  <View style={[styles.checkbox, isInviteAvatar ? { backgroundColor: theme.primary, borderColor: theme.primary } : {}]}>
                    {isInviteAvatar && <Check size={16} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Marcar este convite como avatar</Text>
                </TouchableOpacity>
                
                {/* Campo de senha para o avatar */}
                {isInviteAvatar && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Senha do Avatar</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite uma senha para o avatar"
                      secureTextEntry={true}
                      value={avatarPassword}
                      onChangeText={setAvatarPassword}
                    />
                    <Text style={styles.passwordHint}>
                      Esta senha será usada para acessar a conta do avatar. Mínimo de 6 caracteres.
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={[styles.inviteButton, { backgroundColor: theme.primary }]}
                  onPress={handleSendInvitation}
                >
                  <Text style={styles.inviteButtonText}>
                    {isInviteAvatar ? 'Criar Avatar' : 'Enviar Convite'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  financialCard: {
    width: 170,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 18,
    paddingBottom: 8,
    marginRight: 8,
    height: 120,
    overflow: 'hidden',
    transform: [{ translateY: 0 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      }
    }),
  },
  financialCardPressed: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      android: {
        elevation: 8,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      default: {}
    }),
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    paddingBottom: 5,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(8px)',
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 10px rgba(255, 255, 255, 0.1)',
      }
    }),
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 10,
    borderRadius: 20,
    transform: [{ scale: 1 }],
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(255, 255, 255, 0.15)',
      }
    }),
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }
    }),
  },
  budgetTitle: {
    fontSize: 20,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: 'white',
  },
  budgetSubtitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'rgba(255,255,255,0.8)',
  },
  monthSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  monthText: {
    color: 'white',
    marginHorizontal: 10,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    fontSize: 18,
    textAlign: 'center',
  },
  monthNavButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1 }],
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(255, 255, 255, 0.15)',
      }
    }),
  },
  balanceSection: {
    marginBottom: 16,
    marginTop: 30,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(8px)',
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 10px rgba(255, 255, 255, 0.1)',
      }
    }),
  },
  balanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  balanceHeaderItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  balanceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
      }
    }),
  },
  balanceHeaderText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'white',
    marginTop: 2,
  },
  balanceValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  balanceValueItem: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  balanceValueCenterItem: {
    flex: 1.2,
    alignItems: 'center',
  },
  balanceAmountSmall: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'white',
    textAlign: 'center',
  },
  balanceAmountLarge: {
    fontSize: 36,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  usersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 12,
    marginTop: 6,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'white',
    marginLeft: -10,
  },
  addUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addUserText: {
    color: 'white',
    fontSize: 18,
  },
  // Section Container
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    transform: [{ translateY: 0 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      }
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Summary Items
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Person Expense
  personExpense: {
    marginBottom: 15,
  },
  personExpenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  personName: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  personAmount: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Financial Cards
  summaryCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    width: 170,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 18,
    paddingBottom: 8,
    marginRight: 8,
    height: 120,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      }
    }),
  },
  cardPressed: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      android: {
        elevation: 8,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      default: {}
    }),
  },
  cardLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 8,
    flexShrink: 1,
  },
  cardAmount: {
    fontSize: 24,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 2,
    flexShrink: 1,
  },
  cardChangePositive: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#4CD964',
    flexShrink: 1,
    flexWrap: 'nowrap',
    marginBottom: 0,
  },
  cardChangeNegative: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#FF3B30',
    flexShrink: 1,
    flexWrap: 'nowrap',
    marginBottom: 0,
  },
  // Bills
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  billIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billDetails: {
    flex: 1,
  },
  billTitle: {
    fontSize: 15,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  billDate: {
    fontSize: 13,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  billAmount: {
    fontSize: 15,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Transaction
  transactionContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    transform: [{ translateY: 0 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      }
    }),
  },
  transactionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  transaction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    justifyContent: 'space-between',
  },
  transactionNavButton: {
    padding: 10,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEEE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionIcon: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 2,
    marginRight: 10,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  transactionSubtitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  transactionAmountContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginLeft: 5,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  transactionType: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },

  rejectButton: {
    // Removido a cor de fundo fixa, será aplicada dinamicamente
  },
  approveButton: {
    // Removido a cor de fundo fixa, será aplicada dinamicamente
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    // Removido a cor de fundo fixa, será aplicada dinamicamente
  },
  // Budget Overview
  overviewContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    transform: [{ translateY: 0 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      }
    }),
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginBottom: 5,
  },
  statAmount: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  spentAmount: {
    // Removido referência direta de cor
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  trackingText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#4CD964',
  },
  // Goals
  goalItem: {
    marginBottom: 15,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
    marginLeft: 8,
  },
  goalPercentage: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  goalAmount: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  goalTarget: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  // Calendar
  calendarPreview: {
    marginTop: 10,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayToday: {
    backgroundColor: '#f0f0f0',
  },
  calendarDayText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
  },
  calendarDayTextToday: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  calendarEvent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
  },
  calendarLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  navItem: {
    alignItems: 'center',
    width: 60,
  },
  navText: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#999',
    marginTop: 4,
  },
  activeNavText: {
    // Removido referência direta de cor
  },
  addButton: {
    marginTop: -30,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: themes.feminine.primary,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }
    }),
  },
  cardsScrollContainer: {
    paddingLeft: 16,
    paddingRight: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  // Já definido acima como summaryCardsContainer
  
  // Estilo financialCard já definido acima
  
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
    marginBottom: 8,
  },
  cardPercentage: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  // Menu Modal Styles
  menuModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuModalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  menuGrid: {
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuItem: {
    width: '30%',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuItemTitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    textAlign: 'center',
    opacity: 0.8,
  },
  closeFullButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    marginTop: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  closeFullButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  dateSelector: {
    marginTop: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  dateTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 8,
    height: 24,
  },
  timelineLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    left: 4,
    right: 4,
    top: 4,
    zIndex: 1,
  },
  dateItem: {
    alignItems: 'center',
    zIndex: 2,
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 10,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'white',
    textAlign: 'center',
    marginTop: 2,
  },
  clickableItem: {
    position: 'relative',
    paddingRight: 24,
    backgroundColor: 'rgba(179, 136, 255, 0.05)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 4,
  },
  chevronIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  currentPhotoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  currentPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    gap: 20,
  },
  photoButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#ffffff',
  },
  uploadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    height: 100,
  },
  uploadingText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
    marginTop: 15,
  },
  webButtonContainer: {
    paddingHorizontal: 10,
    marginTop: 0,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  inviteButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inviteButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
  },
  passwordHint: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
}); 