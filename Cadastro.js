import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { cores, gradientes, obterFaixaEtaria, obterIniciais } from './theme';

/**
 * Cadastro.js
 * Formulário para Nome, Idade e Sexo (botões rápidos com ícone) + lista de
 * pacientes cadastrados. Cada card exibe um avatar com as iniciais do
 * paciente, colorido de acordo com a faixa etária (mesma cor usada em
 * GerarSenha.js e Chamada.js), reforçando a identidade visual do app.
 */

const OPCOES_SEXO = [
  { valor: 'Masculino', icone: 'male' },
  { valor: 'Feminino', icone: 'female' },
  { valor: 'Outro', icone: 'person' },
];

export default function Cadastro({ onCadastrar, pacientes }) {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState(null);

  function limparFormulario() {
    setNome('');
    setIdade('');
    setSexo(null);
  }

  function handleCadastrar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe o nome do paciente.');
      return;
    }
    const idadeNum = parseInt(idade, 10);
    if (isNaN(idadeNum) || idadeNum < 0 || idadeNum > 120) {
      Alert.alert('Atenção', 'Informe uma idade válida.');
      return;
    }
    if (!sexo) {
      Alert.alert('Atenção', 'Selecione o sexo do paciente.');
      return;
    }

    onCadastrar({ nome: nome.trim(), idade: idadeNum, sexo });
    limparFormulario();
    Alert.alert('Paciente cadastrado 🎉', 'Vá até a aba "Gerar Senha" para emitir a senha dele.');
  }

  return (
    <View>
      <View style={styles.card}>
        <View style={styles.cardHeaderLinha}>
          <View style={styles.cardIconeCirculo}>
            <Ionicons name="person-add" size={18} color={cores.primaria} />
          </View>
          <Text style={styles.titulo}>Novo Paciente</Text>
        </View>

        <Text style={styles.label}>Nome completo</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={17} color={cores.textoClaro} style={styles.inputIcone} />
          <TextInput
            style={styles.input}
            placeholder="Ex: Maria da Silva"
            placeholderTextColor={cores.textoClaro}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <Text style={styles.label}>Idade</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="calendar-outline" size={17} color={cores.textoClaro} style={styles.inputIcone} />
          <TextInput
            style={styles.input}
            placeholder="Ex: 34"
            placeholderTextColor={cores.textoClaro}
            value={idade}
            onChangeText={setIdade}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        <Text style={styles.label}>Sexo</Text>
        <View style={styles.opcoesLinha}>
          {OPCOES_SEXO.map((opcao) => {
            const ativo = sexo === opcao.valor;
            return (
              <TouchableOpacity
                key={opcao.valor}
                style={[styles.opcaoBotao, ativo && styles.opcaoBotaoAtivo]}
                onPress={() => setSexo(opcao.valor)}
                activeOpacity={0.8}
              >
                <Ionicons name={opcao.icone} size={16} color={ativo ? '#FFFFFF' : cores.textoSuave} />
                <Text style={[styles.opcaoTexto, ativo && styles.opcaoTextoAtivo]}>{opcao.valor}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={handleCadastrar} activeOpacity={0.88}>
          <LinearGradient colors={gradientes.primario} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.botaoPrimario}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.botaoPrimarioTexto}>Cadastrar Paciente</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.subtituloLinha}>
        <Text style={styles.subtitulo}>Pacientes cadastrados</Text>
        <View style={styles.contadorBadge}>
          <Text style={styles.contadorBadgeTexto}>{pacientes.length}</Text>
        </View>
      </View>

      {pacientes.length === 0 ? (
        <View style={styles.cardVazio}>
          <Ionicons name="people-outline" size={30} color={cores.textoClaro} />
          <Text style={styles.vazio}>Nenhum paciente cadastrado ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={[...pacientes].reverse()}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const faixa = obterFaixaEtaria(item.idade);
            return (
              <View style={[styles.itemPaciente, { borderLeftColor: faixa.cor }]}>
                <View style={[styles.avatar, { backgroundColor: faixa.cor }]}>
                  <Text style={styles.avatarTexto}>{obterIniciais(item.nome)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <Text style={styles.itemDetalhe}>
                    {item.idade} anos • {item.sexo} • {faixa.nome}
                  </Text>
                </View>
                <View style={[styles.statusBadge, item.temSenha ? styles.statusOk : styles.statusPendente]}>
                  <Ionicons
                    name={item.temSenha ? 'checkmark-circle' : 'time-outline'}
                    size={12}
                    color={item.temSenha ? cores.sucesso : cores.alerta}
                  />
                  <Text style={[styles.statusTexto, { color: item.temSenha ? cores.sucesso : cores.alerta }]}>
                    {item.temSenha ? 'Emitida' : 'Pendente'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#312E81',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  cardHeaderLinha: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  cardIconeCirculo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontSize: 17, fontWeight: '800', color: cores.texto },
  subtituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  subtitulo: { fontSize: 15, fontWeight: '800', color: cores.texto },
  contadorBadge: { backgroundColor: cores.primariaClara, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2 },
  contadorBadgeTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  label: { fontSize: 12.5, fontWeight: '700', color: cores.textoSuave, marginBottom: 6, marginTop: 14 },
  inputWrap: { position: 'relative', justifyContent: 'center' },
  inputIcone: { position: 'absolute', left: 14, zIndex: 1 },
  input: {
    backgroundColor: cores.fundo,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingLeft: 40,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: cores.borda,
    color: cores.texto,
  },
  opcoesLinha: { flexDirection: 'row', gap: 8 },
  opcaoBotao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  opcaoBotaoAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  opcaoTexto: { fontSize: 12.5, fontWeight: '700', color: cores.textoSuave },
  opcaoTextoAtivo: { color: '#FFFFFF' },

  botaoPrimario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 22,
  },
  botaoPrimarioTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  cardVazio: {
    backgroundColor: cores.superficie,
    borderRadius: 18,
    paddingVertical: 30,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderStyle: 'dashed',
  },
  vazio: { color: cores.textoClaro, fontSize: 13, fontWeight: '500' },

  itemPaciente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
    borderLeftWidth: 4,
    gap: 12,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  itemNome: { fontSize: 14.5, fontWeight: '700', color: cores.texto },
  itemDetalhe: { fontSize: 11.5, color: cores.textoSuave, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: cores.fundo,
  },
  statusOk: { backgroundColor: cores.sucessoFundo },
  statusPendente: { backgroundColor: cores.alertaFundo },
  statusTexto: { fontSize: 10.5, fontWeight: '800' },
});
