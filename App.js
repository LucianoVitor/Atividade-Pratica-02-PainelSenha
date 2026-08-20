import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Cadastro from './Cadastro';
import GerarSenha from './GerarSenha';
import Chamada from './Chamada';
import { cores, gradientes } from './theme';

/**
 * App.js
 * -----------------------------------------------------------------------
 * TELA ÚNICA (Single Screen) do PainelSenha.
 * Não há React Navigation nem múltiplas rotas: a troca de "tela" acontece
 * apenas através do estado local `activeTab`, que controla qual componente
 * é renderizado condicionalmente dentro da mesma View raiz.
 *
 * Estados compartilhados, centralizados aqui e passados via props:
 *   - pacientes:         lista de pacientes cadastrados
 *   - filaSenhas:        fila de senhas aguardando chamada (ordenada por prioridade)
 *   - senhaAtual:        senha exibida no painel de chamada no momento
 *   - historicoChamadas: últimas senhas já chamadas
 * -----------------------------------------------------------------------
 */

const ABAS = [
  { key: 'cadastro', label: 'Cadastro', icone: 'people' },
  { key: 'senha', label: 'Gerar Senha', icone: 'pricetags' },
  { key: 'chamada', label: 'Chamada', icone: 'megaphone' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [pacientes, setPacientes] = useState([]);
  const [filaSenhas, setFilaSenhas] = useState([]);
  const [senhaAtual, setSenhaAtual] = useState(null);
  const [historicoChamadas, setHistoricoChamadas] = useState([]);
  const [contadores, setContadores] = useState({ P: 0, N: 0 });

  function adicionarPaciente(dadosPaciente) {
    const novoPaciente = { ...dadosPaciente, id: Date.now().toString(), temSenha: false };
    setPacientes((prev) => [...prev, novoPaciente]);
  }

  function ordenarPorPrioridade(lista) {
    return [...lista].sort((a, b) => {
      if (a.prioritario !== b.prioritario) return a.prioritario ? -1 : 1;
      return a.hora - b.hora;
    });
  }

  function gerarSenhaParaPaciente(paciente, especialidade, prioritario) {
    const tipo = prioritario ? 'P' : 'N';
    const novoNumero = contadores[tipo] + 1;
    const codigo = `${tipo}${String(novoNumero).padStart(3, '0')}`;

    const novaSenha = {
      codigo,
      pacienteId: paciente.id,
      nome: paciente.nome,
      idade: paciente.idade,
      sexo: paciente.sexo,
      especialidade,
      prioritario,
      hora: Date.now(),
    };

    setContadores((prev) => ({ ...prev, [tipo]: novoNumero }));
    setFilaSenhas((filaAtual) => ordenarPorPrioridade([...filaAtual, novaSenha]));
    setPacientes((prev) => prev.map((p) => (p.id === paciente.id ? { ...p, temSenha: true } : p)));
  }

  function chamarProxima() {
    if (filaSenhas.length === 0) return;
    const [proxima, ...resto] = filaSenhas;
    setSenhaAtual(proxima);
    setFilaSenhas(resto);
    setHistoricoChamadas((h) => [proxima, ...h].slice(0, 8));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header fixo em gradiente */}
      <LinearGradient colors={gradientes.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerIconeCirculo}>
          <Ionicons name="medkit" size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitulo}>PainelSenha</Text>
          <Text style={styles.headerSubtitulo}>Cadastro, emissão e chamada de senhas</Text>
        </View>
      </LinearGradient>

      {/* Barra de abas personalizadas — controla a renderização condicional abaixo */}
      <View style={styles.tabsContainer}>
        {ABAS.map((aba) => (
          <AbaBotao
            key={aba.key}
            label={aba.label}
            icone={aba.icone}
            ativo={activeTab === aba.key}
            onPress={() => setActiveTab(aba.key)}
          />
        ))}
      </View>

      {/* Conteúdo da tela única — muda apenas o componente renderizado */}
      <ScrollView
        style={styles.conteudo}
        contentContainerStyle={styles.conteudoContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'cadastro' && <Cadastro onCadastrar={adicionarPaciente} pacientes={pacientes} />}

        {activeTab === 'senha' && (
          <GerarSenha pacientes={pacientes.filter((p) => !p.temSenha)} onGerarSenha={gerarSenhaParaPaciente} />
        )}

        {activeTab === 'chamada' && (
          <Chamada
            filaSenhas={filaSenhas}
            senhaAtual={senhaAtual}
            historicoChamadas={historicoChamadas}
            onChamarProxima={chamarProxima}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AbaBotao({ label, icone, ativo, onPress }) {
  if (ativo) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.tabBotaoWrap}>
        <LinearGradient colors={gradientes.primario} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tabBotaoAtivo}>
          <Ionicons name={icone} size={16} color="#FFFFFF" />
          <Text style={styles.tabTextoAtivo}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.tabBotaoWrap, styles.tabBotao]}>
      <Ionicons name={`${icone}-outline`} size={16} color={cores.textoSuave} />
      <Text style={styles.tabTexto}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.fundo },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 18,
    paddingBottom: 26,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerIconeCirculo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitulo: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: 0.2 },
  headerSubtitulo: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2, fontWeight: '500' },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 5,
    gap: 4,
    elevation: 6,
    shadowColor: '#312E81',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  tabBotaoWrap: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  tabBotao: { paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  tabBotaoAtivo: { paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  tabTexto: { fontSize: 11.5, fontWeight: '700', color: cores.textoSuave },
  tabTextoAtivo: { fontSize: 11.5, fontWeight: '700', color: '#FFFFFF' },

  conteudo: { flex: 1 },
  conteudoContainer: { padding: 18, paddingTop: 22, paddingBottom: 40 },
});
