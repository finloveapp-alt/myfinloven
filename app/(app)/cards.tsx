import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Plus, CreditCard, X, BarChart, Menu, PlusCircle, Receipt, Home, Bell, Info, ExternalLink, Wallet } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { fontFallbacks } from '@/utils/styles';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cardsService, Card, CardTransaction } from '@/lib/services/cardsService';
import { Svg, Path, Defs, RadialGradient, Stop, LinearGradient, G } from 'react-native-svg';

// Componente para exibir ícones das bandeiras usando SVGs da react-credit-cards-2
const CardBrandIcon = ({ brand }: { brand: string }) => {
  const getCardBrandSvg = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <svg width="24" height="16" viewBox="0 0 512 166" xmlns="http://www.w3.org/2000/svg">
            <path d="M264.794187,112.479491 C264.502072,89.4485616 285.31908,76.5955198 301.001021,68.9544172 C317.113447,61.1134466 322.525254,56.0860008 322.463756,49.0752507 C322.340760,38.3438833 309.610714,33.608552 297.695514,33.4240586 C276.909255,33.1011951 264.824935,39.0357336 255.215903,43.5250736 L247.728545,8.4866975 C257.368326,4.04348087 275.218065,0.169118972 293.728905,-1.42108547e-14 C337.177106,-1.42108547e-14 365.604468,21.4473605 365.758213,54.7023002 C365.927332,96.9051709 307.381419,99.2420876 307.781154,118.10654 C307.919524,123.825836 313.377455,129.929494 325.338778,131.482313 C331.257942,132.26641 347.600985,132.866014 366.1272,124.333193 L373.399315,158.23386 C363.43667,161.86223 350.629752,165.336857 334.686445,165.336857 C293.790403,165.336857 265.024803,143.597382 264.794187,112.479491 M443.2762,162.415711 C435.342982,162.415711 428.655096,157.788001 425.672452,150.685004 L363.605789,2.49066122 L407.023242,2.49066122 L415.663684,26.3671852 L468.720918,26.3671852 L473.732989,2.49066122 L512,2.49066122 L478.60669,162.415711 L443.2762,162.415711 M449.349108,119.213501 L461.879287,59.1608912 L427.56351,59.1608912 L449.349108,119.213501 M212.152063,162.415711 L177.928533,2.49066122 L219.301183,2.49066122 L253.509339,162.415711 L212.152063,162.415711 M150.94637,162.415711 L107.88253,53.5645907 L90.4632755,146.118792 C88.4184734,156.450423 80.3468861,162.415711 71.3835806,162.415711 L0.983964927,162.415711 L0,157.772626 C14.4519849,154.636238 30.8718996,149.578043 40.81917,144.166236 C46.9074533,140.860729 48.6447661,137.970332 50.6434448,130.113987 L83.6370188,2.49066122 L127.36196,2.49066122 L194.394571,162.415711 L150.94637,162.415711" fill="#FFFFFF" transform="translate(256.000000, 82.668428) scale(1, -1) translate(-256.000000, -82.668428)"/>
          </svg>
        );
      case 'mastercard':
        return (
          <svg width="24" height="16" viewBox="0 0 512 397" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FF5F00" d="M186.596 33.807h138.301v248.502h-138.301z"/>
            <path d="M195.377 158.058c0-50.491 23.709-95.274 60.15-124.251-26.782-21.074-60.589-33.807-97.469-33.807-87.371 0-158.058 70.687-158.058 158.058s70.687 158.058 158.058 158.058c36.88 0 70.687-12.732 97.469-33.807-36.441-28.538-60.15-73.76-60.15-124.251z" fill="#EB001B"/>
            <path d="M511.493 158.058c0 87.371-70.687 158.058-158.058 158.058-36.88 0-70.687-12.732-97.469-33.807 36.88-28.977 60.15-73.76 60.15-124.251s-23.709-95.274-60.15-124.251c26.782-21.074 60.589-33.807 97.469-33.807 87.371 0 158.058 71.126 158.058 158.058z" fill="#F79E1B"/>
          </svg>
        );
      case 'american express':
      case 'amex':
        return (
          <svg width="24" height="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient cx="17.541%" cy="17.466%" fx="17.541%" fy="17.466%" r="91.237%" id="a">
                <stop stopColor="#65BCF1" offset="0%"/>
                <stop stopColor="#23ADE3" offset="45.46%"/>
                <stop stopColor="#0DA6E0" offset="50%"/>
                <stop stopColor="#0551C3" offset="100%"/>
              </radialGradient>
            </defs>
            <path fill="url(#a)" d="M0 0h512v512h-512z"/>
            <path d="M45.791 220.935l-9.773-23.813-9.717 23.813h19.489zm215.289-9.483c-1.962 1.191-4.283 1.231-7.063 1.231h-17.345v-13.268h17.581c2.488 0 5.084.112 6.771 1.077 1.852.87 2.998 2.722 2.998 5.281 0 2.611-1.09 4.712-2.942 5.679zm123.739 9.483l-9.881-23.813-9.827 23.813h19.707z" fill="#fff"/>
          </svg>
        );
      case 'diners club':
      case 'diners':
        return (
          <svg width="24" height="16" viewBox="0 0 512 134" xmlns="http://www.w3.org/2000/svg">
            <path d="M99.285 133.86c36.446.177 69.715-29.659 69.715-65.955 0-39.689-33.269-67.122-69.715-67.111h-31.365c-36.882-.011-67.241 27.429-67.241 67.111 0 36.305 30.358 66.133 67.241 65.955h31.365" fill="#006095"/>
            <path d="M81.909 103.247v-72.072c14.517 5.557 24.823 19.583 24.847 36.033-.024 16.454-10.33 30.471-24.847 36.038m-52.522-36.038c.033-16.441 10.322-30.458 24.831-36.032v72.055c-14.509-5.569-24.798-19.578-24.831-36.024m38.679-60.915c-33.702.011-61.011 27.273-61.02 60.915.008 33.639 27.318 60.895 61.02 60.905 33.713-.01 61.028-27.266 61.033-60.905-.005-33.642-27.319-60.904-61.033-60.915" fill="#fff"/>
          </svg>
        );
      case 'discover':
        return (
          <svg width="24" height="16" viewBox="0 0 512 86" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient x1="20.442%" y1="10.599%" x2="89.245%" y2="83.53%" id="a">
                <stop stopColor="#E25429" offset="0%"/>
                <stop stopColor="#F99D3E" offset="100%"/>
              </linearGradient>
            </defs>
            <path d="M270.356.365c-23.982 0-43.44 18.735-43.44 41.858 0 24.583 18.612 42.96 43.44 42.96 24.208 0 43.321-18.62 43.321-42.478 0-23.716-18.986-42.34-43.321-42.34z" fill="url(#a)"/>
            <path d="M23.746 1.891h-23.353v81.454h23.232c12.325 0 21.24-2.921 29.059-9.398 9.278-7.695 14.781-19.298 14.781-31.289 0-24.048-17.965-40.766-43.719-40.766z" fill="#0B1015"/>
          </svg>
        );
      case 'elo':
        return (
          <svg width="24" height="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <g fillRule="evenodd">
              <path d="M256 0c141.385 0 256 114.615 256 256 0 141.386-114.615 256-256 256s-256-114.614-256-256c0-141.385 114.615-256 256-256" fill="#0E0E11"/>
              <path d="M180.042 237.583l-78.524 33.837c-.122-1.353-.189-2.721-.189-4.106 0-24.839 20.135-44.974 44.974-44.974 13.438 0 25.499 5.898 33.739 15.243z" fill="#fff"/>
            </g>
          </svg>
        );
      case 'hipercard':
        return (
          <svg width="24" height="16" viewBox="0 0 512 123" xmlns="http://www.w3.org/2000/svg">
            <path d="M374.118 80.842c-6.943 6.797-26.434 8.728-24.44-7.52 1.656-13.495 16.348-16.363 32.273-14.414-1.184 7.381-2.542 16.755-7.833 21.934z" fill="#fff"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="16" rx="2" fill="#E5E7EB"/>
            <rect x="2" y="2" width="20" height="12" rx="1" fill="#F9FAFB"/>
          </svg>
        );
    }
  };

  return (
    <View style={{ marginLeft: 8 }}>
      {getCardBrandSvg(brand)}
    </View>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = width * 0.6;
const cardHeight = 160.4;

// Definição de temas
const themes = {
  feminine: {
    primary: '#b687fe',
    secondary: '#8B5CF6',
    accent: '#FF3B30',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#0073ea',
    text: '#333333'
  },
  masculine: {
    primary: '#0073ea',
    secondary: '#3c79e6',
    accent: '#FF3B30',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#8B5CF6',
    text: '#333333'
  }
};

// Função para obter o tema inicial
const getInitialTheme = () => {
  // Verificar primeiro se há um tema global definido
  if (global.dashboardTheme === 'masculine') {
    return themes.masculine;
  }
  
  // Se não houver tema global, usar o tema padrão feminino
  return themes.feminine;
};

export default function Cards() {
  const [theme, setTheme] = useState(getInitialTheme());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardType, setCardType] = useState('credit'); // 'credit' ou 'debit'
  const [selectedType, setSelectedType] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#b687fe');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  
  // Estados para dados reais
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardTransactions, setCardTransactions] = useState<CardTransaction[]>([]);
  const [addingCard, setAddingCard] = useState(false);

  // Função para detectar bandeira do cartão automaticamente
  const detectCardBrand = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (/^4[0-9]{0,}/.test(cleanNumber)) {
      return 'visa';
    }
    if (/^(5[1-5][0-9]{0,}|2[2-7][0-9]{0,})/.test(cleanNumber)) {
      return 'mastercard';
    }
    if (/^3[47][0-9]{0,}/.test(cleanNumber)) {
      return 'american express';
    }
    if (/^3(?:0[0-5]|[68][0-9])[0-9]{0,}/.test(cleanNumber)) {
      return 'diners club';
    }
    if (/^6(?:011|5[0-9]{2})[0-9]{0,}/.test(cleanNumber)) {
      return 'discover';
    }
    if (/^(401178|401179|438935|457631|457632|431274|451416|457393|504175|627780|636297|636368|636369|636370|636371|636372|636373|636374|636375|636376|636377|636378|636379|636380|636381|636382|636383|636384|636385|636386|636387|636388|636389|636390|636391|636392|636393|636394|636395|636396|636397|636398|636399|637095|637568|637599|637609|637612|637767|637780|637781|637782|637783|637784|637785|637786|637787|637788|637789|637790|637791|637792|637793|637794|637795|637796|637797|637798|637799|637800|637801|637802|637803|637804|637805|637806|637807|637808|637809|637810|637811|637812|637813|637814|637815|637816|637817|637818|637819|637820|637821|637822|637823|637824|637825|637826|637827|637828|637829|637830|637831|637832|637833|637834|637835|637836|637837|637838|637839|637840|637841|637842|637843|637844|637845|637846|637847|637848|637849|637850|637851|637852|637853|637854|637855|637856|637857|637858|637859|637860|637861|637862|637863|637864|637865|637866|637867|637868|637869|637870|637871|637872|637873|637874|637875|637876|637877|637878|637879|637880|637881|637882|637883|637884|637885|637886|637887|637888|637889|637890|637891|637892|637893|637894|637895|637896|637897|637898|637899|650031|650032|650033|650034|650035|650036|650037|650038|650039|650040|650041|650042|650043|650044|650045|650046|650047|650048|650049|650050|650051|650052|650053|650054|650055|650056|650057|650058|650059|650060|650061|650062|650063|650064|650065|650066|650067|650068|650069|650070|650071|650072|650073|650074|650075|650076|650077|650078|650079|650080|650081|650082|650083|650084|650085|650086|650087|650088|650089|650090|650091|650092|650093|650094|650095|650096|650097|650098|650099|650100|650101|650102|650103|650104|650105|650106|650107|650108|650109|650110|650111|650112|650113|650114|650115|650116|650117|650118|650119|650120|650121|650122|650123|650124|650125|650126|650127|650128|650129|650130|650131|650132|650133|650134|650135|650136|650137|650138|650139|650140|650141|650142|650143|650144|650145|650146|650147|650148|650149|650150|650151|650152|650153|650154|650155|650156|650157|650158|650159|650160|650161|650162|650163|650164|650165|650166|650167|650168|650169|650170|650171|650172|650173|650174|650175|650176|650177|650178|650179|650180|650181|650182|650183|650184|650185|650186|650187|650188|650189|650190|650191|650192|650193|650194|650195|650196|650197|650198|650199|650200|650201|650202|650203|650204|650205|650206|650207|650208|650209|650210|650211|650212|650213|650214|650215|650216|650217|650218|650219|650220|650221|650222|650223|650224|650225|650226|650227|650228|650229|650230|650231|650232|650233|650234|650235|650236|650237|650238|650239|650240|650241|650242|650243|650244|650245|650246|650247|650248|650249|650250|650251|650252|650253|650254|650255|650256|650257|650258|650259|650260|650261|650262|650263|650264|650265|650266|650267|650268|650269|650270|650271|650272|650273|650274|650275|650276|650277|650278|650279|650280|650281|650282|650283|650284|650285|650286|650287|650288|650289|650290|650291|650292|650293|650294|650295|650296|650297|650298|650299|650300|650301|650302|650303|650304|650305|650306|650307|650308|650309|650310|650311|650312|650313|650314|650315|650316|650317|650318|650319|650320|650321|650322|650323|650324|650325|650326|650327|650328|650329|650330|650331|650332|650333|650334|650335|650336|650337|650338|650339|650340|650341|650342|650343|650344|650345|650346|650347|650348|650349|650350|650351|650352|650353|650354|650355|650356|650357|650358|650359|650360|650361|650362|650363|650364|650365|650366|650367|650368|650369|650370|650371|650372|650373|650374|650375|650376|650377|650378|650379|650380|650381|650382|650383|650384|650385|650386|650387|650388|650389|650390|650391|650392|650393|650394|650395|650396|650397|650398|650399|650400|650401|650402|650403|650404|650405|650406|650407|650408|650409|650410|650411|650412|650413|650414|650415|650416|650417|650418|650419|650420|650421|650422|650423|650424|650425|650426|650427|650428|650429|650430|650431|650432|650433|650434|650435|650436|650437|650438|650439|650440|650441|650442|650443|650444|650445|650446|650447|650448|650449|650450|650451|650452|650453|650454|650455|650456|650457|650458|650459|650460|650461|650462|650463|650464|650465|650466|650467|650468|650469|650470|650471|650472|650473|650474|650475|650476|650477|650478|650479|650480|650481|650482|650483|650484|650485|650486|650487|650488|650489|650490|650491|650492|650493|650494|650495|650496|650497|650498|650499|650500|650501|650502|650503|650504|650505|650506|650507|650508|650509|650510|650511|650512|650513|650514|650515|650516|650517|650518|650519|650520|650521|650522|650523|650524|650525|650526|650527|650528|650529|650530|650531|650532|650533|650534|650535|650536|650537|650538|650539|650540|650541|650542|650543|650544|650545|650546|650547|650548|650549|650550|650551|650552|650553|650554|650555|650556|650557|650558|650559|650560|650561|650562|650563|650564|650565|650566|650567|650568|650569|650570|650571|650572|650573|650574|650575|650576|650577|650578|650579|650580|650581|650582|650583|650584|650585|650586|650587|650588|650589|650590|650591|650592|650593|650594|650595|650596|650597|650598|650599|650600|650601|650602|650603|650604|650605|650606|650607|650608|650609|650610|650611|650612|650613|650614|650615|650616|650617|650618|650619|650620|650621|650622|650623|650624|650625|650626|650627|650628|650629|650630|650631|650632|650633|650634|650635|650636|650637|650638|650639|650640|650641|650642|650643|650644|650645|650646|650647|650648|650649|650650|650651|650652|650653|650654|650655|650656|650657|650658|650659|650660|650661|650662|650663|650664|650665|650666|650667|650668|650669|650670|650671|650672|650673|650674|650675|650676|650677|650678|650679|650680|650681|650682|650683|650684|650685|650686|650687|650688|650689|650690|650691|650692|650693|650694|650695|650696|650697|650698|650699|650700|650701|650702|650703|650704|650705|650706|650707|650708|650709|650710|650711|650712|650713|650714|650715|650716|650717|650718|650719|650720|650721|650722|650723|650724|650725|650726|650727|650728|650729|650730|650731|650732|650733|650734|650735|650736|650737|650738|650739|650740|650741|650742|650743|650744|650745|650746|650747|650748|650749|650750|650751|650752|650753|650754|650755|650756|650757|650758|650759|650760|650761|650762|650763|650764|650765|650766|650767|650768|650769|650770|650771|650772|650773|650774|650775|650776|650777|650778|650779|650780|650781|650782|650783|650784|650785|650786|650787|650788|650789|650790|650791|650792|650793|650794|650795|650796|650797|650798|650799|650800|650801|650802|650803|650804|650805|650806|650807|650808|650809|650810|650811|650812|650813|650814|650815|650816|650817|650818|650819|650820|650821|650822|650823|650824|650825|650826|650827|650828|650829|650830|650831|650832|650833|650834|650835|650836|650837|650838|650839|650840|650841|650842|650843|650844|650845|650846|650847|650848|650849|650850|650851|650852|650853|650854|650855|650856|650857|650858|650859|650860|650861|650862|650863|650864|650865|650866|650867|650868|650869|650870|650871|650872|650873|650874|650875|650876|650877|650878|650879|650880|650881|650882|650883|650884|650885|650886|650887|650888|650889|650890|650891|650892|650893|650894|650895|650896|650897|650898|650899|650900|650901|650902|650903|650904|650905|650906|650907|650908|650909|650910|650911|650912|650913|650914|650915|650916|650917|650918|650919|650920|650921|650922|650923|650924|650925|650926|650927|650928|650929|650930|650931|650932|650933|650934|650935|650936|650937|650938|650939|650940|650941|650942|650943|650944|650945|650946|650947|650948|650949|650950|650951|650952|650953|650954|650955|650956|650957|650958|650959|650960|650961|650962|650963|650964|650965|650966|650967|650968|650969|650970|650971|650972|650973|650974|650975|650976|650977|650978|650979|650980|650981|650982|650983|650984|650985|650986|650987|650988|650989|650990|650991|650992|650993|650994|650995|650996|650997|650998|650999|651000)/.test(cleanNumber)) {
      return 'elo';
    }
    if (/^(38[0-9]{2}|60[0-9]{2})/.test(cleanNumber)) {
      return 'hipercard';
    }
    
    return '';
  };

  // useEffect para carregar o tema com base no gênero do usuário
  useEffect(() => {
    fetchUserTheme();
    loadUserCards();
  }, []);

  // useEffect para atualizar as cores padrão quando o tema mudar
  useEffect(() => {
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
  }, [theme]);

  // Carregar cartões do usuário
  const loadUserCards = async () => {
    try {
      setLoading(true);
      const userCards = await cardsService.getUserCards();
      setCards(userCards);
      
      // Carregar transações do primeiro cartão se existir
      if (userCards.length > 0) {
        const transactions = await cardsService.getCardTransactions(userCards[0].id);
        setCardTransactions(transactions);
      } else {
        // Se não há cartões, usar transações mock para demonstração
        setCardTransactions(mockTransactions);
      }
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      // Em caso de erro, usar dados mock para não quebrar a interface
      setCardTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  // Dados mock para transações (mantido para quando não há cartões)
  const mockTransactions = [
    {
      id: '1',
      description: 'Apartamento',
      transaction_date: '2021-04-21',
      amount: 120,
      transaction_type: 'expense' as const,
      icon: '🏢'
    },
    {
      id: '2',
      description: 'Pagamento',
      transaction_date: '2021-04-18',
      amount: 150,
      transaction_type: 'income' as const,
      icon: '💳'
    },
    {
      id: '3',
      description: 'Compra Online',
      transaction_date: '2021-04-19',
      amount: 75,
      transaction_type: 'expense' as const,
      icon: '🛍️'
    },
    {
      id: '4',
      description: 'Pagamento',
      transaction_date: '2021-04-18',
      amount: 150,
      transaction_type: 'income' as const,
      icon: '💳'
    }
  ];

  // Função para buscar o tema baseado no perfil do usuário
  const fetchUserTheme = async () => {
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
        .select('gender')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Erro ao buscar perfil do usuário:', userError);
        return;
      }
      
      console.log('Perfil do usuário obtido do banco:', userProfile);
      
      // Definir o tema com base no gênero do usuário
      if (userProfile && userProfile.gender) {
        const gender = userProfile.gender.toLowerCase();
        
        if (gender === 'masculino' || gender === 'homem' || gender === 'male' || gender === 'm') {
          console.log('Aplicando tema masculino (azul) com base no perfil');
          updateTheme('masculine');
        } else if (gender === 'feminino' || gender === 'mulher' || gender === 'female' || gender === 'f') {
          console.log('Aplicando tema feminino (rosa) com base no perfil');
          updateTheme('feminine');
        } else {
          // Se o gênero no perfil não for reconhecido, tentar obter dos metadados da sessão
          const userMetadata = session.user.user_metadata;
          const metadataGender = userMetadata?.gender || '';
          
          console.log('Verificando gênero dos metadados:', metadataGender);
          
          if (metadataGender && typeof metadataGender === 'string') {
            const metaGenderLower = metadataGender.toLowerCase();
            
            if (metaGenderLower === 'masculino' || metaGenderLower === 'homem' || 
                metaGenderLower === 'male' || metaGenderLower === 'm') {
              console.log('Aplicando tema masculino (azul) com base nos metadados');
              updateTheme('masculine');
            } else if (metaGenderLower === 'feminino' || metaGenderLower === 'mulher' || 
                       metaGenderLower === 'female' || metaGenderLower === 'f') {
              console.log('Aplicando tema feminino (rosa) com base nos metadados');
              updateTheme('feminine');
            } else {
              // Usar o tema global ou padrão se o gênero nos metadados também não for reconhecido
              if (global.dashboardTheme === 'masculine') {
                updateTheme('masculine');
                console.log('Aplicando tema masculino (azul) da variável global');
              } else {
                updateTheme('feminine');
                console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
              }
            }
          } else {
            // Usar o tema global ou padrão se não houver gênero nos metadados
            if (global.dashboardTheme === 'masculine') {
              updateTheme('masculine');
              console.log('Aplicando tema masculino (azul) da variável global');
            } else {
              updateTheme('feminine');
              console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
            }
          }
        }
      } else {
        // Se não encontrou perfil ou gênero no perfil, tentar obter dos metadados da sessão
        const userMetadata = session.user.user_metadata;
        const metadataGender = userMetadata?.gender || '';
        
        console.log('Perfil não encontrado. Verificando gênero dos metadados:', metadataGender);
        
        if (metadataGender && typeof metadataGender === 'string') {
          const metaGenderLower = metadataGender.toLowerCase();
          
          if (metaGenderLower === 'masculino' || metaGenderLower === 'homem' || 
              metaGenderLower === 'male' || metaGenderLower === 'm') {
            console.log('Aplicando tema masculino (azul) com base nos metadados');
            updateTheme('masculine');
          } else if (metaGenderLower === 'feminino' || metaGenderLower === 'mulher' || 
                     metaGenderLower === 'female' || metaGenderLower === 'f') {
            console.log('Aplicando tema feminino (rosa) com base nos metadados');
            updateTheme('feminine');
          } else {
            // Usar o tema global ou padrão se o gênero nos metadados não for reconhecido
            if (global.dashboardTheme === 'masculine') {
              updateTheme('masculine');
              console.log('Aplicando tema masculino (azul) da variável global');
            } else {
              updateTheme('feminine');
              console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
            }
          }
        } else {
          // Usar o tema global ou padrão se não houver gênero nos metadados
          if (global.dashboardTheme === 'masculine') {
            updateTheme('masculine');
            console.log('Aplicando tema masculino (azul) da variável global');
          } else {
            updateTheme('feminine');
            console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao definir tema:', error);
    }
  };

  // Função para salvar o tema no AsyncStorage
  const saveThemeToStorage = async (themeValue: string) => {
    try {
      await AsyncStorage.setItem('@MyFinlove:theme', themeValue);
      console.log('Tema salvo no AsyncStorage:', themeValue);
    } catch (error) {
      console.error('Erro ao salvar tema no AsyncStorage:', error);
    }
  };

  // Função para atualizar o tema e garantir que seja persistido
  const updateTheme = (newTheme: 'feminine' | 'masculine') => {
    if (newTheme === 'masculine') {
      setTheme(themes.masculine);
      global.dashboardTheme = 'masculine';
      saveThemeToStorage('masculine');
    } else {
      setTheme(themes.feminine);
      global.dashboardTheme = 'feminine';
      saveThemeToStorage('feminine');
    }
  };

  // useEffect para carregar o tema do AsyncStorage no início, caso não esteja definido globalmente
  useEffect(() => {
    const loadThemeFromStorage = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@MyFinlove:theme');
        if (storedTheme === 'masculine' && theme !== themes.masculine) {
          updateTheme('masculine');
        } else if (storedTheme === 'feminine' && theme !== themes.feminine) {
          updateTheme('feminine');
        }
      } catch (error) {
        console.error('Erro ao carregar tema do AsyncStorage:', error);
      }
    };
    
    loadThemeFromStorage();
  }, []);

  // Implementar função de adicionar cartão real
  const handleAddCard = async () => {
    if (!cardNumber || !cardName || !bankName || !cardLimit || !cardType) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }
    
    if (!selectedType) {
      Alert.alert('Atenção', 'Número do cartão inválido ou bandeira não reconhecida');
      return;
    }
    
    try {
      setAddingCard(true);
      
      const newCard = await cardsService.createCard({
        name: `Cartão ${selectedType.toUpperCase()}`,
        card_number: cardNumber,
        card_holder_name: cardName,
        bank_name: bankName,
        card_limit: cardLimit,
        card_type: selectedType,
        is_credit: cardType === 'credit',
        credit_limit: 1000,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });
      
      Alert.alert('Sucesso', 'Cartão adicionado com sucesso!');
      setIsModalVisible(false);
      resetForm();
      loadUserCards(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o cartão');
    } finally {
      setAddingCard(false);
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setCardName('');
    setBankName('');
    setCardLimit('');
    setCardType('credit');
    setSelectedType('');
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
  };

  // Função para formatar data de transação
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Cartões</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          decelerationRate="fast"
          snapToInterval={cardWidth + 16}
          style={styles.cardsScroll}
        >
          <TouchableOpacity 
            style={styles.addCardButton}
            onPress={() => setIsModalVisible(true)}
          >
            <View style={styles.addCardContent}>
              <Plus size={20} color={theme.primary} />
              <Text style={[styles.addCardText, { color: theme.primary }]}>Adicionar novo cartão</Text>
            </View>
          </TouchableOpacity>

          {loading ? (
            <View style={[styles.card, { backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ marginTop: 8, color: '#666' }}>Carregando...</Text>
            </View>
          ) : (
            cards.map((card, index) => (
              <LinearGradient
                key={card.id}
                colors={[card.primary_color, card.secondary_color]}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity 
                  style={styles.cardContent}
                  onPress={() => router.push('/(app)/card-detail')}
                >
                  <View style={styles.cardHeader}>
                    <CreditCard size={24} color="#ffffff" />
                    <Text style={styles.cardType}>{card.card_type.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.cardBalance}>
                    R$ {card.current_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.cardNumber}>{cardsService.formatCardNumber(card.card_number)}</Text>
                  <View style={styles.viewDetailsContainer}>
                    <Text style={styles.viewDetailsText}>Toque para ver detalhes</Text>
                    <View style={styles.viewDetailsIcon}>
                      <Text style={styles.viewDetailsIconText}>👆</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            ))
          )}

          {/* Cartões mock para demonstração quando não há cartões reais */}
          {!loading && cards.length === 0 && (
            <>
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity 
                  style={styles.cardContent}
                  onPress={() => router.push('/(app)/card-detail')}
                >
                  <View style={styles.cardHeader}>
                    <CreditCard size={24} color="#ffffff" />
                    <Text style={styles.cardType}>mastercard</Text>
                  </View>
                  <Text style={styles.cardBalance}>R$ 875,46</Text>
                  <Text style={styles.cardNumber}>124 987 324 ***</Text>
                  <View style={styles.viewDetailsContainer}>
                    <Text style={styles.viewDetailsText}>Toque para ver detalhes</Text>
                    <View style={styles.viewDetailsIcon}>
                      <Text style={styles.viewDetailsIconText}>👆</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </LinearGradient>

              <LinearGradient
                colors={theme === themes.masculine ? [theme.shared, '#0056b3'] : ['#0073ea', '#0056b3']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity 
                  style={styles.cardContent}
                  onPress={() => router.push('/(app)/card-detail')}
                >
                  <View style={styles.cardHeader}>
                    <CreditCard size={24} color="#ffffff" />
                    <Text style={styles.cardType}>VISA</Text>
                  </View>
                  <Text style={styles.cardBalance}>R$ 560,00</Text>
                  <Text style={styles.cardNumber}>753 926 768 ***</Text>
                  <View style={styles.viewDetailsContainer}>
                    <Text style={styles.viewDetailsText}>Toque para ver detalhes</Text>
                    <View style={styles.viewDetailsIcon}>
                      <Text style={styles.viewDetailsIconText}>👆</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </>
          )}
        </ScrollView>

        <View style={styles.transactionSection}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTitle}>Histórico de Transações</Text>
            <TouchableOpacity style={styles.filterButton}>
              <View style={styles.filterDots}>
                <View style={styles.filterDot} />
                <View style={styles.filterDot} />
              </View>
            </TouchableOpacity>
          </View>

          {cardTransactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
              <View style={[styles.transactionIcon, { backgroundColor: transaction.transaction_type === 'expense' ? '#FFE2E6' : '#E3F5FF' }]}>
                <Text style={styles.transactionIconText}>{transaction.icon || (transaction.transaction_type === 'expense' ? '💸' : '💰')}</Text>
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>
                  {formatTransactionDate(transaction.transaction_date)}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.transaction_type === 'expense' ? theme.expense : theme.income }
              ]}>
                {transaction.transaction_type === 'expense' ? '-' : '+'}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/dashboard')}
        >
          <BarChart size={24} color="#999" />
          <Text style={styles.navText}>Dashboard</Text>
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
          <View style={[styles.addButtonInner, { backgroundColor: theme.primary }]}>
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
        >
          <CreditCard size={24} color={theme.primary} />
          <Text style={[styles.navText, { color: theme.primary }]}>Cartões</Text>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <CreditCard size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Cartões</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Cartões de crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/accounts');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <Wallet size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Contas</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar contas</Text>
                </TouchableOpacity>
              </View>

              {/* Terceira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    // Navegação para sobre
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <Info size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Sobre</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Informações</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.replace('/(auth)/login');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <ExternalLink size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Logout</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Sair do aplicativo</Text>
                </TouchableOpacity>

                <View style={styles.menuItem}>
                  {/* Item vazio para manter o alinhamento */}
                </View>
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

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Novo Cartão</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <TextInput
                style={styles.input}
                placeholder="Nome do Banco"
                value={bankName}
                onChangeText={setBankName}
                autoCapitalize="characters"
                placeholderTextColor="#666"
              />

              <View style={styles.cardNumberInputContainer}>
                {selectedType && (
                  <View style={styles.cardBrandIcon}>
                    <CardBrandIcon brand={selectedType} />
                  </View>
                )}
                <TextInput
                  style={[styles.input, styles.cardNumberInput, selectedType && styles.cardNumberInputWithIcon]}
                  placeholder="Número do Cartão"
                  value={cardNumber}
                  onChangeText={(text) => {
                    // Remove tudo que não é número
                    const numericValue = text.replace(/[^0-9]/g, '');
                    // Aplica máscara de cartão (XXXX XXXX XXXX XXXX)
                    let formattedValue = '';
                    for (let i = 0; i < numericValue.length && i < 16; i++) {
                      if (i > 0 && i % 4 === 0) {
                        formattedValue += ' ';
                      }
                      formattedValue += numericValue[i];
                    }
                    setCardNumber(formattedValue);
                    
                    // Detectar bandeira automaticamente
                    const detectedBrand = detectCardBrand(formattedValue);
                    setSelectedType(detectedBrand);
                  }}
                  keyboardType="numeric"
                  maxLength={19}
                  placeholderTextColor="#666"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nome no Cartão"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="characters"
                placeholderTextColor="#666"
              />

              <TextInput
                style={styles.input}
                placeholder="Limite do Cartão (R$)"
                value={cardLimit}
                onChangeText={(text) => {
                  // Remove tudo que não é número
                  const numericValue = text.replace(/[^0-9]/g, '');
                  // Formata como moeda brasileira
                  if (numericValue) {
                    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    });
                    setCardLimit(formattedValue);
                  } else {
                    setCardLimit('');
                  }
                }}
                keyboardType="numeric"
                placeholderTextColor="#666"
              />

              <View style={styles.rowInputs}>
                <TouchableOpacity
                  style={[
                    styles.cardTypeOption, 
                    { flex: 1, marginRight: 8 },
                    cardType === 'credit' && [styles.selectedCardType, { backgroundColor: theme.primary }]
                  ]}
                  onPress={() => setCardType('credit')}
                >
                  <Text style={[
                    styles.cardTypeText,
                    cardType === 'credit' && styles.selectedCardTypeText
                  ]}>Crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cardTypeOption, 
                    { flex: 1, marginLeft: 8, width: 0 },
                    cardType === 'debit' && [styles.selectedCardType, { backgroundColor: theme.primary }]
                  ]}
                  onPress={() => setCardType('debit')}
                >
                  <Text style={[
                    styles.cardTypeText,
                    cardType === 'debit' && styles.selectedCardTypeText
                  ]}>Débito</Text>
                </TouchableOpacity>
              </View>

              {/* Seletor de Cores */}
              <View style={styles.colorSection}>
                <Text style={styles.colorSectionTitle}>Cores do Cartão</Text>
                
                <View style={styles.colorSelectors}>
                  <View style={styles.colorSelectorContainer}>
                    <Text style={styles.colorLabel}>Cor Principal</Text>
                    <View style={styles.colorOptions}>
                      {[
                        '#b687fe', '#8B5CF6', '#0073ea', '#3c79e6',
                        '#FF3B30', '#FF9500', '#34C759', '#00C7BE',
                        '#5856D6', '#AF52DE', '#FF2D92', '#A2845E'
                      ].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            primaryColor === color && styles.selectedColorOption
                          ]}
                          onPress={() => setPrimaryColor(color)}
                        >
                          {primaryColor === color && (
                            <View style={styles.colorCheckmark}>
                              <Text style={styles.colorCheckmarkText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.colorSelectorContainer}>
                    <Text style={styles.colorLabel}>Cor Secundária</Text>
                    <View style={styles.colorOptions}>
                      {[
                        '#8B5CF6', '#b687fe', '#3c79e6', '#0073ea',
                        '#FF6B35', '#FFB800', '#30D158', '#40E0D0',
                        '#7C3AED', '#C77DFF', '#FF69B4', '#D2691E'
                      ].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            secondaryColor === color && styles.selectedColorOption
                          ]}
                          onPress={() => setSecondaryColor(color)}
                        >
                          {secondaryColor === color && (
                            <View style={styles.colorCheckmark}>
                              <Text style={styles.colorCheckmarkText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Preview do Gradiente */}
                <View style={styles.gradientPreviewContainer}>
                  <Text style={styles.colorLabel}>Preview do Cartão</Text>
                  <LinearGradient
                    colors={[primaryColor, secondaryColor]}
                    style={styles.gradientPreview}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.previewCardContent}>
                      <View style={styles.previewCardHeader}>
                        <CreditCard size={20} color="#ffffff" />
                        <Text style={styles.previewCardType}>
                          {selectedType || 'CARTÃO'}
                        </Text>
                      </View>
                      <Text style={styles.previewCardBalance}>R$ 0,00</Text>
                      <Text style={styles.previewCardNumber}>
                        {cardNumber || '**** **** **** ****'}
                      </Text>
                      <Text style={styles.previewCardName}>
                        {bankName || 'NOME DO BANCO'}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[
                styles.addCardModalButton, 
                { 
                  backgroundColor: addingCard ? '#ccc' : theme.primary,
                  opacity: addingCard ? 0.7 : 1
                }
              ]}
              onPress={handleAddCard}
              disabled={addingCard}
            >
              {addingCard ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.addButtonText}>Adicionando...</Text>
                </View>
              ) : (
                <Text style={styles.addButtonText}>Adicionar Cartão</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    marginBottom: 80,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#131313',
  },
  cardsScroll: {
    paddingLeft: 16,
  },
  cardsContainer: {
    paddingRight: 16,
    paddingVertical: 16,
  },
  addCardButton: {
    width: cardWidth * 0.8,
    height: cardHeight,
    backgroundColor: '#f5f7fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderStyle: 'dashed',
    padding: 12,
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardType: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBalance: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 8,
    letterSpacing: 0.5,
  },
  cardNumber: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    letterSpacing: 2,
  },
  transactionSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  transactionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#131313',
  },
  filterButton: {
    padding: 8,
  },
  filterDots: {
    flexDirection: 'row',
    gap: 4,
  },
  filterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f7fa',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionIconText: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    color: '#131313',
    marginBottom: 4,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#131313',
  },
  closeButton: {
    padding: 8,
  },
  cardTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f7fa',
    marginHorizontal: 8,
  },
  selectedCardType: {
    backgroundColor: '#b687fe',
  },
  cardTypeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedCardTypeText: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#131313',
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 24,
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
    backgroundColor: '#b687fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  viewDetailsIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsIconText: {
    fontSize: 16,
  },
  addCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardText: {
    color: '#b687fe',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  addCardModalButton: {
    backgroundColor: '#b687fe',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeFullButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  colorSection: {
    marginBottom: 24,
  },
  colorSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#131313',
    marginBottom: 8,
  },
  colorSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorSelectorContainer: {
    width: '48%',
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#131313',
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 4,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    marginRight: 4,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  colorCheckmark: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCheckmarkText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#333',
  },
  gradientPreviewContainer: {
    marginBottom: 24,
  },
  gradientPreview: {
    height: 190,
    borderRadius: 16,
    padding: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  previewCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewCardType: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewCardBalance: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 8,
    letterSpacing: 0.5,
  },
  previewCardNumber: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    letterSpacing: 2,
  },
  previewCardName: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    letterSpacing: 2,
  },
  modalScrollView: {
    flex: 1,
    marginBottom: 24,
  },
  detectedBrandContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
  },
  detectedBrandText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  cardNumberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  cardBrandIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumberInput: {
    flex: 1,
    backgroundColor: 'transparent',
    marginBottom: 0,
  },
  cardNumberInputWithIcon: {
    paddingLeft: 48,
  },
}); 