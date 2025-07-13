import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFallbacks } from '@/utils/styles';

export default function TermosDeUso() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#b687fe', '#8a63d2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Termos de Uso</Text>
        <Text style={styles.headerSubtitle}>MyFinlove</Text>
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.intro}>
            Estes Termos de Uso regem o uso do aplicativo MyFinlove nas versões Web, iOS e Android. Ao criar sua conta e utilizar os nossos serviços, você concorda expressamente com estes Termos de Uso e com a nossa Política de Privacidade.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. COMO UTILIZAR O MYFINLOVE</Text>
          <Text style={styles.sectionText}>
            Para utilizar o MyFinlove é necessário realizar um cadastro informando alguns dados pessoais básicos, como nome e e-mail. Para detalhes sobre como tratamos suas informações pessoais, consulte nossa Política de Privacidade.
            {'\n\n'}
            Esses Termos e nossa Política de Privacidade serão aplicáveis em todos os seus acessos ao MyFinlove.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. QUEM PODE UTILIZAR</Text>
          <Text style={styles.sectionText}>
            O MyFinlove é destinado exclusivamente ao controle financeiro pessoal de pessoas físicas, com foco especial em casais que desejam gerenciar suas finanças de forma colaborativa.
            {'\n\n'}
            • Usuários com idade igual ou superior a 18 anos podem usar o MyFinlove livremente.
            {'\n\n'}
            • Usuários entre 16 e 18 anos incompletos devem rever estes termos com seus representantes legais antes do uso.
            {'\n\n'}
            • Usuários menores de 16 anos só podem utilizar nossos serviços com autorização expressa dos representantes legais.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. CADASTRO, LOGIN E SEGURANÇA</Text>
          <Text style={styles.sectionText}>
            Para criar uma conta no MyFinlove, será necessário fornecer um e-mail válido ou utilizar autenticação via Google. Você é responsável por manter suas credenciais de acesso (login e senha) em segurança e sigilo.
            {'\n\n'}
            O MyFinlove oferece funcionalidades específicas para casais, incluindo convites por e-mail para conectar parceiros e compartilhamento de dados financeiros. Ambos os usuários são responsáveis pela segurança de suas respectivas contas.
            {'\n\n'}
                         Caso haja suspeita de uso indevido, entre em contato imediatamente com nosso suporte: dev@myfinlove.com.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. PLANO GRATUITO E SUAS LIMITAÇÕES</Text>
          <Text style={styles.sectionText}>
            O plano gratuito oferece:
            {'\n\n'}
            • Até 45 registros financeiros por mês (entradas, despesas e transferências).
            {'\n'}
            • Até 2 cartões e 2 contas bancárias cadastradas.
            {'\n'}
            • Até 10 categorias personalizadas.
            {'\n'}
            • Limitação para criação de até 2 metas financeiras.
            {'\n'}
            • Funcionalidades básicas de compartilhamento entre casais.
            {'\n\n'}
            Para remover essas limitações, o usuário poderá contratar a versão Premium através dos métodos nativos de pagamento das plataformas Apple (Apple Pay) e Android (Google Pay).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. PLANO PREMIUM E PAGAMENTOS</Text>
          <Text style={styles.sectionText}>
            O Plano Premium permite:
            {'\n\n'}
            • Registro ilimitado de transações financeiras.
            {'\n'}
            • Categorias e metas ilimitadas.
            {'\n'}
            • Relatórios financeiros detalhados e avançados.
            {'\n'}
            • Gestão completa e detalhada dos investimentos.
            {'\n'}
            • Funcionalidades avançadas de colaboração para casais.
            {'\n'}
            • Análises personalizadas de gastos por pessoa.
            {'\n'}
            • Sincronização em tempo real entre parceiros.
            {'\n\n'}
            A contratação do Plano Premium é feita diretamente por meio das plataformas de pagamento da App Store (Apple Pay) e Google Play Store (Google Pay), sendo estas responsáveis pela gestão das transações financeiras.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. RESPONSABILIDADE LIMITADA</Text>
          <Text style={styles.sectionText}>
            O MyFinlove não é uma instituição financeira e não oferece aconselhamento financeiro profissional. Todas as decisões financeiras tomadas pelo usuário são de sua exclusiva responsabilidade, não podendo o MyFinlove ou seus desenvolvedores serem responsabilizados por eventuais danos, prejuízos ou perdas financeiras.
            {'\n\n'}
            As funcionalidades de compartilhamento entre casais são oferecidas como ferramenta de organização financeira, cabendo aos usuários a responsabilidade pela veracidade e precisão das informações compartilhadas.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. DADOS PESSOAIS E PRIVACIDADE</Text>
          <Text style={styles.sectionText}>
            Coletamos e utilizamos apenas dados essenciais para fornecer nossos serviços, como detalhado na nossa Política de Privacidade. Não compartilhamos seus dados pessoais com terceiros sem seu consentimento, exceto se solicitado por órgãos legais e reguladores.
            {'\n\n'}
            Para funcionalidades de casais, os dados são compartilhados apenas entre os usuários conectados através do sistema de convites do aplicativo, sempre com consentimento explícito de ambas as partes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. SEGURANÇA DOS DADOS</Text>
          <Text style={styles.sectionText}>
            Garantimos proteção e segurança dos seus dados através de criptografia e medidas técnicas rigorosas. Contudo, o usuário deve colaborar mantendo suas credenciais seguras e não compartilhando-as com terceiros.
            {'\n\n'}
            Utilizamos o Supabase como plataforma de backend, que oferece criptografia de ponta a ponta e conformidade com padrões internacionais de segurança.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. EXCLUSÃO DE CONTAS E DADOS</Text>
          <Text style={styles.sectionText}>
            Você pode excluir sua conta diretamente no aplicativo a qualquer momento. Contas inativas por mais de 6 meses podem ser automaticamente excluídas pelo sistema.
            {'\n\n'}
            Em relacionamentos conectados, a exclusão de uma conta não afeta automaticamente a conta do parceiro, mas pode impactar as funcionalidades de compartilhamento.
            {'\n\n'}
            Todos os dados são permanentemente removidos de nossos servidores em até 30 dias após a solicitação de exclusão.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. DIREITOS AUTORAIS E PROPRIEDADE INTELECTUAL</Text>
          <Text style={styles.sectionText}>
            O MyFinlove e todo seu conteúdo são protegidos por direitos autorais. A reprodução não autorizada de qualquer conteúdo é proibida e sujeita às medidas legais cabíveis.
            {'\n\n'}
            O aplicativo é desenvolvido utilizando tecnologias React Native, Expo e Supabase, respeitando todas as licenças e termos de uso das respectivas plataformas.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. FUNCIONALIDADES ESPECÍFICAS PARA CASAIS</Text>
          <Text style={styles.sectionText}>
            O MyFinlove oferece funcionalidades exclusivas para casais, incluindo:
            {'\n\n'}
            • Sistema de convites por e-mail para conectar parceiros.
            {'\n'}
            • Compartilhamento de transações e contas financeiras.
            {'\n'}
            • Metas financeiras colaborativas.
            {'\n'}
            • Análises de gastos por pessoa.
            {'\n'}
            • Sincronização em tempo real de dados.
            {'\n\n'}
            Ambos os usuários devem concordar com estes termos para utilizar as funcionalidades colaborativas. A desconexão pode ser solicitada a qualquer momento por qualquer uma das partes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. ALTERAÇÕES NOS TERMOS DE USO</Text>
          <Text style={styles.sectionText}>
            Reservamos o direito de atualizar periodicamente esses Termos de Uso. Informaremos qualquer alteração importante via e-mail ou notificações no aplicativo.
            {'\n\n'}
            O uso continuado do MyFinlove após as alterações constitui aceitação dos novos termos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. CONTATO E SUPORTE</Text>
          <Text style={styles.sectionText}>
                         Em caso de dúvidas ou esclarecimentos, entre em contato conosco pelo e-mail: dev@myfinlove.com.
            {'\n\n'}
            Ao se cadastrar e utilizar o MyFinlove, você declara compreender e concordar integralmente com esses Termos.
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