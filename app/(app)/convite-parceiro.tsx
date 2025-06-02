import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  Switch 
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fontFallbacks } from '@/utils/styles';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ConviteParceiro() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isAvatar, setIsAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleSendInvitation = async () => {
    // Validação baseada no tipo (avatar ou parceiro real)
    if (isAvatar) {
      if (!name || !name.trim()) {
        Alert.alert('Erro', 'Por favor, informe o nome do avatar');
        return;
      }
    } else {
      if (!email || !email.trim()) {
        Alert.alert('Erro', 'Por favor, informe o email do seu parceiro');
        return;
      }
    }
    
    setLoading(true);
    try {
      // Obter usuário atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Falha ao obter usuário atual. Por favor, faça login novamente.');
      }
      
      const currentUserId = session.user.id;
      
      // Buscar o perfil do usuário atual
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', currentUserId)
        .single();
        
      if (profileError) {
        throw new Error('Falha ao obter seu perfil. Por favor, tente novamente.');
      }
      
      if (isAvatar) {
        // Lógica para criar avatar (sem envio de email)
        const invitationToken = Math.random().toString(36).substring(2, 15) + 
          Math.random().toString(36).substring(2, 15);
        
        // Criar registro na tabela couples para avatar
        const { data: coupleData, error: coupleError } = await supabase
          .from('couples')
          .insert({
            user1_id: currentUserId,
            invitation_token: invitationToken,
            invitation_email: null, // Avatar não tem email
            status: 'active', // Avatar é ativado imediatamente
            is_avatar: true,
            avatar_name: name.trim() // Armazenar o nome do avatar
          })
          .select('id')
          .single();
          
        if (coupleError) {
          throw new Error('Falha ao criar avatar.');
        }
        
        Alert.alert(
          'Avatar Criado',
          `O avatar "${name}" foi criado com sucesso! Agora você pode atribuir gastos e receitas a ele.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
        
      } else {
        // Lógica original para convite real
        const invitationToken = Math.random().toString(36).substring(2, 15) + 
          Math.random().toString(36).substring(2, 15);
        
        // Criar registro na tabela couples
        const { data: coupleData, error: coupleError } = await supabase
          .from('couples')
          .insert({
            user1_id: currentUserId,
            invitation_token: invitationToken,
            invitation_email: email.trim().toLowerCase(),
            status: 'pending',
            is_avatar: false
          })
          .select('id')
          .single();
          
        if (coupleError) {
          throw new Error('Falha ao criar convite. Verifique se o email é válido.');
        }
        
        // Enviar convite por email usando a Edge Function
        const inviteResponse = await fetch(`${supabase.supabaseUrl}/functions/v1/send-couple-invitation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            partnerEmail: email.trim().toLowerCase(),
            inviterName: currentUserProfile.name || 'Seu parceiro',
            inviterId: currentUserId,
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
          `Um convite foi enviado para ${email}. Seu parceiro receberá instruções para aceitar o convite.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
      
    } catch (error) {
      console.error('Erro ao processar:', error);
      Alert.alert('Erro', error.message || 'Falha ao processar. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LinearGradient
      colors={['#ffffff', 'rgba(182,135,254,0.2)']}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isAvatar ? 'Criar Avatar' : 'Convidar Parceiro'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: isAvatar 
                ? 'https://img.freepik.com/free-vector/user-avatar-profile-icon-vector-illustration_276184-162.jpg?w=1380'
                : 'https://img.freepik.com/free-vector/couple-planning-budget-together_74855-5466.jpg?w=1380&t=st=1684430660~exp=1684431260~hmac=84097f1d4a2da09976795a95e9d8e9dc0436c259dbc266d70a99e7ca5b2b881a'
            }} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            {isAvatar 
              ? 'Crie um avatar para organizar gastos e receitas de forma categorizada.'
              : 'Convide seu parceiro para compartilhar finanças e organizar o orçamento juntos.'
            }
          </Text>
          
          {/* Toggle Avatar */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Criar Avatar</Text>
            <Switch
              value={isAvatar}
              onValueChange={setIsAvatar}
              trackColor={{ false: '#E0E0E0', true: '#b687fe' }}
              thumbColor={isAvatar ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          {/* Campo Nome (sempre visível) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {isAvatar ? 'Nome do Avatar' : 'Nome do Parceiro (opcional)'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={isAvatar ? 'Ex: Gastos Pessoais, Investimentos...' : 'Nome do seu parceiro'}
              value={name}
              onChangeText={setName}
            />
          </View>
          
          {/* Campo Email (só aparece quando não é avatar) */}
          {!isAvatar && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email do Parceiro</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o email do seu parceiro"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          )}
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendInvitation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isAvatar ? 'Criar Avatar' : 'Enviar Convite'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
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
  button: {
    backgroundColor: '#b687fe',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
}); 