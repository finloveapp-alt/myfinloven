import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFallbacks } from '@/utils/styles';

export default function PoliticasPrivacidade() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#b687fe', '#8a63d2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Políticas de Privacidade</Text>
        <Text style={styles.headerSubtitle}>MyFinlove</Text>
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.intro}>
            Nossa missão no MyFinlove é auxiliá-lo a gerenciar suas finanças pessoais com praticidade e segurança. Estamos totalmente comprometidos em proteger a sua privacidade e manter a transparência sobre como tratamos seus dados pessoais.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Como o MyFinlove trata seus dados pessoais?</Text>
          <Text style={styles.sectionText}>
            Entendemos a importância de manter um registro completo de suas despesas e receitas para uma gestão financeira eficaz. Do nosso lado, valorizamos a confiança que você deposita em nós ao compartilhar suas informações.
            {'\n\n'}
            A gente tem um compromisso com a segurança dos seus dados, cumprindo rigorosamente as leis de proteção de dados, incluindo a Lei Geral de Proteção de Dados (LGPD), e adotando as melhores práticas de gestão e governança.
            {'\n\n'}
            Então fique tranquilo! Tratamos suas informações com responsabilidade e valorizamos profundamente nossos usuários.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Quais dados exatamente usamos?</Text>
          <Text style={styles.sectionText}>
            Você nos fornece alguns dados e nós coletamos outros, sempre respeitando a sua privacidade e protegendo os seus dados pessoais.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Dados fornecidos por você:</Text>
          <Text style={styles.sectionText}>
            Quando você utiliza nossa plataforma ou interage de alguma forma conosco (como canais de atendimento), você nos fornece algumas informações como nome, e-mail, data de nascimento e outros.
            {'\n\n'}
            Nem todos esses dados são obrigatórios e você escolhe se quer fornece-los ou não.
            {'\n\n'}
            Você também insere na nossa plataforma seus dados financeiros como despesas, receitas, contas, cartões e outros. Esses dados são a matéria prima para nosso app e os transformamos em informações claras e objetivas para você estar no controle das suas finanças.
            {'\n\n'}
            Podemos, ainda, utilizar algumas informações para envio de comunicações e e-mails marketing de divulgação dos nossos produtos e serviços.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Por que coletamos seus dados?</Text>
          <Text style={styles.sectionText}>
            Coletamos dados pessoais para:
            {'\n\n'}
            • Fornecer os serviços contratados e funcionalidades da plataforma;
            {'\n'}
            • Melhorar sua experiência no uso do aplicativo;
            {'\n'}
            • Garantir sua segurança, confirmando sua identidade;
            {'\n'}
            • Realizar análises técnicas e comerciais para correção de bugs e aprimoramento contínuo do MyFinlove;
            {'\n'}
            • Enviar comunicações promocionais e informativas, desde que autorizado por você;
            {'\n'}
            • Cumprir obrigações legais e regulatórias aplicáveis.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Vocês enviam minhas informações para mais alguém?</Text>
          <Text style={styles.sectionText}>
            Nós NÃO compartilhamos os seus dados com ninguém. Sabemos da importância da sua privacidade financeira e temos discrição quanto a isso.
            {'\n\n'}
            Mas é importante ressaltar que pode ser necessário enviar informações para os órgãos reguladores ou autoridades, quando nos solicitarem ou a lei assim determinar. Apenas!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Meus dados realmente estão protegidos no MyFinlove?</Text>
          <Text style={styles.sectionText}>
            Nós adotamos as melhores práticas e tecnologias ao tratar os seus dados pessoais, pensando sempre na sua proteção e garantindo a sua segurança.
            {'\n\n'}
            Adotamos medidas técnicas, administrativas e organizacionais de segurança para evitar o acesso não autorizado, destruição, perda, alteração ou qualquer outra forma de tratamento irregular ou ilícito.
            {'\n\n'}
            Utilizamos ferramentas para identificar e prevenir vulnerabilidades em nossos sistemas e possuímos um rigoroso controle de acesso aos dados pessoais, onde somente as pessoas autorizadas podem acessá-los.
            {'\n\n'}
            Todos os dados são criptografados no tráfego de rede.
            {'\n\n'}
            Então, sim, seus dados estão protegidos conosco!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Pagamentos no MyFinlove</Text>
          <Text style={styles.sectionText}>
            Os pagamentos relacionados à assinatura Premium são realizados exclusivamente pelas plataformas Apple Pay (iOS) e Google Pay (Android). O MyFinlove não coleta nem armazena dados de cartões ou informações financeiras relacionadas aos pagamentos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Posso excluir minha conta quando eu quiser?</Text>
          <Text style={styles.sectionText}>
            Sim, sem complicação! Dentro do app, no seu perfil, você tem uma opção para excluir sua conta e, consequentemente, todos os seus dados.
            {'\n\n'}
            Ao solicitar a exclusão da sua conta, todos os seus dados serão completamente removidos de nossos servidores em até 30 dias, incluindo:
            {'\n\n'}
            • Dados pessoais (nome, email, informações de perfil)
            {'\n'}
            • Registros financeiros (transações, categorias personalizadas)
            {'\n'}
            • Configurações e preferências
            {'\n'}
            • Metas e planejamentos financeiros
            {'\n\n'}
            Para solicitar a exclusão, acesse o menu "Perfil" no aplicativo e selecione a opção "Excluir minha conta", ou envie um email para dev@myfinlove.com com o assunto "Solicitação de exclusão de conta".
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Meus dados podem ser excluídos automaticamente?</Text>
          <Text style={styles.sectionText}>
            Sim, por falta de acesso. Se você NÃO acessar a plataforma por mais de 6 MESES, sua conta e dos seus dados serão excluídos automaticamente.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Notificações e uso do Expo Notifications</Text>
          <Text style={styles.sectionText}>
            O MyFinlove utiliza a tecnologia Expo Notifications para o envio de notificações push aos usuários. Essa ferramenta nos permite enviar lembretes úteis, como avisos para registrar transações, alertas de metas financeiras e outras comunicações importantes relacionadas ao uso do aplicativo.
            {'\n\n'}
            Para isso, o Expo Notifications coleta exclusivamente o token do seu dispositivo, necessário para que as notificações sejam enviadas corretamente. Nenhum dado pessoal sensível ou conteúdo financeiro é compartilhado com terceiros.
            {'\n\n'}
            Você pode, a qualquer momento, desativar as notificações push acessando as configurações do seu dispositivo móvel. Isso não afetará o funcionamento do aplicativo, apenas impedirá o recebimento dos lembretes automáticos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Seus controles de privacidade</Text>
          <Text style={styles.sectionText}>
            Lembre-se que os dados pessoais são seus e você poderá acessá-los a qualquer momento.
            {'\n\n'}
            A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) garante a você determinados direitos e garantias em relação aos seus dados pessoais. Assim, caso queira, poderá entrar em contato conosco e apresentar as suas solicitações de exercício de direitos.
            {'\n\n'}
            • Confirmação e Acesso: Você pode solicitar confirmação sobre o tratamento e acessar seus dados pessoais armazenados;
            {'\n'}
            • Correção: Pode solicitar a atualização ou correção de informações incompletas, incorretas ou desatualizadas;
            {'\n'}
            • Exclusão: Você pode solicitar a exclusão definitiva dos seus dados diretamente pelo aplicativo;
            {'\n'}
            • Portabilidade: Caso precise, pode solicitar seus dados pessoais em formato acessível enviando um e-mail para dev@myfinlove.com;
            {'\n'}
            • Revogação do consentimento: Você pode revogar o consentimento fornecido anteriormente para o uso de seus dados, estando ciente das consequências dessa ação;
            {'\n'}
            • Informações sobre compartilhamento: Tem direito a solicitar informações sobre eventual compartilhamento de seus dados com autoridades, quando houver;
            {'\n'}
            • Revisão de decisões automatizadas: Pode solicitar esclarecimentos ou revisões sobre decisões automatizadas relacionadas ao tratamento de seus dados pessoais.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contato e suporte</Text>
          <Text style={styles.sectionText}>
            Em caso de dúvidas, esclarecimentos ou solicitações relacionadas à sua privacidade, por favor entre em contato conosco pelo e-mail: dev@myfinlove.com.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre esta Política</Text>
          <Text style={styles.sectionText}>
            Ao se cadastrar no MyFinlove, você declara ter lido, compreendido e concordado integralmente com os termos desta Política de Privacidade.
            {'\n\n'}
            Esta política poderá ser atualizada periodicamente. Informaremos você sobre alterações significativas diretamente pelo aplicativo ou por e-mail cadastrado.
            {'\n\n'}
            Agradecemos a confiança depositada no MyFinlove!
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 MyFinlove - Transformando a gestão financeira de casais 💕
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontFamily: fontFallbacks.bold,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
    fontFamily: fontFallbacks.regular,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontFamily: fontFallbacks.regular,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b687fe',
    marginBottom: 12,
    fontFamily: fontFallbacks.bold,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    fontFamily: fontFallbacks.regular,
    textAlign: 'justify',
  },
  footer: {
    marginTop: 30,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: fontFallbacks.regular,
  },
}); 