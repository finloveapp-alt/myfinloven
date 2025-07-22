import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configuração do Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '319741722569-3m0tb6r9gc31efgqebvhjvp00eim7nvk.apps.googleusercontent.com', // Web client ID do Firebase
    offlineAccess: true, // Para obter refresh token
    forceCodeForRefreshToken: true, // Para forçar o código de autorização
    profileImageSize: 120, // Tamanho da imagem do perfil
  });
};

// Função para fazer login com Google
export const signInWithGoogle = async () => {
  try {
    // Verificar se o Google Play Services está disponível
    await GoogleSignin.hasPlayServices();
    
    // Fazer login
    const userInfo = await GoogleSignin.signIn();
    
    // Obter tokens separadamente
    const tokens = await GoogleSignin.getTokens();
    
    return {
      success: true,
      user: userInfo,
      idToken: tokens.idToken,
      accessToken: tokens.accessToken
    };
  } catch (error: any) {
    console.error('Erro no login com Google:', error);
    
    return {
      success: false,
      error: error.message || 'Erro desconhecido no login com Google'
    };
  }
};

// Função para fazer logout
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error: any) {
    console.error('Erro no logout do Google:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido no logout do Google'
    };
  }
};

// Função para verificar se o usuário está logado
export const isSignedInToGoogle = async () => {
  try {
    const currentUser = await GoogleSignin.getCurrentUser();
    return currentUser !== null;
  } catch (error) {
    console.error('Erro ao verificar status de login:', error);
    return false;
  }
};

// Função para obter informações do usuário atual
export const getCurrentGoogleUser = async () => {
  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    return userInfo;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};