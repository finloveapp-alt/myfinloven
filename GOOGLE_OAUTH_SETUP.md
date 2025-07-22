# Configuração do Google OAuth para Android

Este guia explica como configurar o Google OAuth para funcionar corretamente no aplicativo Android.

## Pré-requisitos

1. **Google Cloud Console**: Você precisa ter um projeto no Google Cloud Console
2. **Supabase**: Projeto configurado com autenticação Google habilitada

## Passos para Configuração

### 1. Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure dois tipos de cliente:

   **Cliente Android:**
   - Application type: Android
   - Package name: `com.myfinlove.app`
   - SHA-1 certificate fingerprint: (obtenha executando o comando abaixo)

   **Cliente Web:**
   - Application type: Web application
   - Authorized redirect URIs: `https://[SEU-PROJETO-SUPABASE].supabase.co/auth/v1/callback`

### 2. Obter SHA-1 Fingerprint

Para desenvolvimento (debug keystore):
```bash
cd android/app
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Para produção, use sua keystore de release.

### 3. Configurar Supabase

1. No dashboard do Supabase, vá para "Authentication" > "Providers"
2. Habilite o Google provider
3. Adicione o Client ID e Client Secret do **cliente web** criado no Google Cloud Console
4. Configure a URL de redirecionamento: `https://[SEU-PROJETO-SUPABASE].supabase.co/auth/v1/callback`

### 4. Atualizar Arquivos de Configuração

**Arquivo: `android/app/google-services.json`**
- Baixe este arquivo do Google Cloud Console
- Substitua o arquivo atual pelos dados reais do seu projeto

**Arquivo: `lib/google-config.ts`**
- Atualize `webClientId` com o Client ID do **cliente web**
- **Nota**: `androidClientId` não é mais necessário nas versões atuais do react-native-google-signin

**Arquivo: `app.json`**
- Configure o esquema de URL para deep linking (já configurado)

### 5. Exemplo de Configuração

```typescript
// lib/google-config.ts
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: 'SEU-WEB-CLIENT-ID.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};
```

## Testando a Configuração

1. Execute o aplicativo no dispositivo Android ou emulador
2. Toque no botão "Continuar com Google"
3. Deve abrir a tela nativa de seleção de conta do Google
4. Após selecionar a conta, o usuário deve ser autenticado no Supabase

## Troubleshooting

### Erro: "DEVELOPER_ERROR"
Este erro indica problemas na configuração do Google Sign-In. Siga estes passos:

1. **Verificar SHA-1 Fingerprint**:
   - SHA-1 atual do projeto (debug/release): `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - SHA-1 adicional no google-services.json: `66:4D:D9:53:40:5C:06:68:69:33:90:4C:15:86:F8:D5:AD:18:9B:71`
   - Confirme se ambos os SHA-1 estão registrados no Firebase Console
   - Package name deve ser: `com.myfinlove.app`

2. **Verificar Client IDs**:
   - Web Client ID: `319741722569-3m0tb6r9gc31efgqebvhjvp00eim7nvk.apps.googleusercontent.com`
   - Deve estar configurado no `google-config.ts` (androidClientId não é mais necessário)

3. **Verificar google-services.json**:
   - Arquivo deve estar em `android/app/google-services.json`
   - Deve conter o package name correto: `com.myfinlove.app`
   - Deve ter os client IDs corretos

4. **Rebuild do projeto**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo run:android
   ```

### Erro: "Sign in failed"
- Verifique se o Google Services está configurado corretamente
- Confirme se os Client IDs estão corretos

### Erro no Supabase
- Verifique se o provider Google está habilitado
- Confirme se o Client ID e Secret do cliente web estão corretos

## Arquivos Importantes

- `android/app/google-services.json` - Configuração do Google Services
- `lib/google-config.ts` - Configuração do Google Sign-In
- `app/(auth)/login-form.tsx` - Implementação do login
- `app.json` - Configuração do Expo
- `android/app/build.gradle` - Plugin do Google Services
- `android/build.gradle` - Classpath do Google Services

## Notas Importantes

1. **Segurança**: Nunca commite credenciais reais no repositório
2. **Ambiente**: Use diferentes projetos/credenciais para desenvolvimento e produção
3. **Deep Linking**: O esquema `myfinlove://` está configurado para redirecionamentos
4. **Permissões**: As permissões necessárias já estão configuradas no `app.json`