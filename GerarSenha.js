import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { cores, gradientes, obterFaixaEtaria, obterIniciais } from './theme';

/**
 * GerarSenha.js
 * -----------------------------------------------------------------------
 * REGRA DE NEGÓCIO — especialidade médica automática por faixa etária:
 *   0–12 anos  -> Pediatria ou Neuropediatria           (Infância)
 *   13–18 anos -> Endocrinologia Pediátrica ou Psiquiatria Infantil    (Adolescência)
 *   19–40 anos -> Dermatologia ou Ginecologia/Urologia   (Adulto Jovem)
 *   41–60 anos -> Cardiologia ou Ortopedia               (Meia-idade)
 *   60+ anos   -> Geriatria ou Oftalmologia              (Idoso)
 *
 * Prioridade: crianças (≤12) e idosos (≥60) têm atendimento prioritário
 * (ECA e Estatuto do Idoso).
 *
 * O usuário SELECIONA o paciente na lista (cartão com cor da faixa etária)
 * e confirma a geração da senha no resumo exibido abaixo.
 * -----------------------------------------------------------------------
 */

export function definirEspecialidade(idade, sexo) {
  if (idade <= 12) return idade % 2 === 0 ? 'Pediatria' : 'Neuropediatria';
  if (idade <= 18) return idade % 2 === 0 ? 'Endocrinologia Pediátrica' : 'Psiquiatria Infantil e Adolescente';
  if (idade <= 40) {
    if (sexo === 'Feminino') return 'Ginecologia';
    if (sexo === 'Masculino') return 'Urologia';
    return 'Dermatologia';
  }
  if (idade <= 60) return idade % 2 === 0 ? 'Cardiologia' : 'Ortopedia';
  return idade % 2 === 0 ? 'Geriatria' : 'Oftalmologia';
}

export function ehPrioritario(idade) {
  return idade <= 12 || idade >= 60;
}

export default function GerarSenha({ pacientes, onGerarSenha }) {
  const [selecionadoId, setSelecionadoId] = useState(null);

  const pacienteSelecionado = pacientes.find((p) => p.id === selecionadoId) || null;
  const especialidadePrevia = pacienteSelecionado
    ? definirEspecialidade(pacienteSelecionado.idade, pacienteSelecionado.sexo)
    : null;
  const prioridadePrevia = pacienteSelecionado ? ehPrioritario(pacienteSelecionado.idade) : false;
  const faixaSelecionada = pacienteSelecionado ? obterFaixaEtaria(pacienteSelecionado.idade) : null;

  function confirmarGeracao() {
    if (!pacienteSelecionado) return;
    onGerarSenha(pacienteSelecionado, especialidadePrevia, prioridadePrevia);
    setSelecionadoId(null);
  }

  return (
    <View>
      <View style={styles.introCard}>
        <View style={styles.introIconeCirculo}>
          <Ionicons name="pricetags" size={18} color={cores.primaria} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.introTitulo}>Selecione um paciente</Text>
          <Text style={styles.introTexto}>A especialidade e a prioridade são calculadas pela idade.</Text>
        </View>
      </View>

      {pacientes.length === 0 ? (
        <View style={styles.cardVazio}>
          <Ionicons name="file-tray-outline" size={30} color={cores.textoClaro} />
          <Text style={styles.vazio}>Nenhum paciente aguardando senha.</Text>
          <Text style={styles.vazioSub}>Cadastre alguém na aba "Cadastro" primeiro.</Text>
        </View>
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const especialidade = definirEspecialidade(item.idade, item.sexo);
            const prioritario = ehPrioritario(item.idade);
            const faixa = obterFaixaEtaria(item.idade);
            const selecionado = item.id === selecionadoId;

            return (
              <TouchableOpacity
                style={[
                  styles.itemPaciente,
                  { borderLeftColor: faixa.cor },
                  selecionado && { borderColor: faixa.cor, backgroundColor: faixa.fundo },
                ]}
                onPress={() => setSelecionadoId(selecionado ? null : item.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.avatar, { backgroundColor: faixa.cor }]}>
                  <Text style={styles.avatarTexto}>{obterIniciais(item.nome)}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.nome}>{item.nome}</Text>
                  <Text style={styles.detalhe}>
                    {item.idade} anos • {faixa.nome}
                  </Text>
                  <View style={styles.linhaTags}>
                    <View style={[styles.tagEspecialidade, { backgroundColor: faixa.fundo }]}>
                      <Text style={[styles.tagEspecialidadeTexto, { color: faixa.cor }]}>{especialidade}</Text>
                    </View>
                    {prioritario && (
                      <View style={styles.tagPrioridade}>
                        <Ionicons name="star" size={10} color={cores.perigo} />
                        <Text style={styles.tagPrioridadeTexto}>Prioritário</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Ionicons
                  name={selecionado ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selecionado ? faixa.cor : cores.borda}
                />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {pacienteSelecionado && (
        <View style={[styles.resumoCard, { borderColor: faixaSelecionada.cor }]}>
          <View style={styles.resumoHeaderLinha}>
            <Ionicons name="clipboard-outline" size={18} color={faixaSelecionada.cor} />
            <Text style={styles.resumoTitulo}>Confirmar emissão de senha</Text>
          </View>

          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Paciente</Text>
            <Text style={styles.resumoValor}>{pacienteSelecionado.nome}</Text>
          </View>
          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Especialidade</Text>
            <Text style={styles.resumoValor}>{especialidadePrevia}</Text>
          </View>
          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Prioridade</Text>
            <Text style={[styles.resumoValor, prioridadePrevia && { color: cores.perigo }]}>
              {prioridadePrevia ? '⭐ Sim (criança ou idoso)' : 'Não'}
            </Text>
          </View>

          <TouchableOpacity onPress={confirmarGeracao} activeOpacity={0.88}>
            <LinearGradient colors={gradientes.primario} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.botaoGerar}>
              <Ionicons name="ticket-outline" size={18} color="#FFFFFF" />
              <Text style={styles.botaoGerarTexto}>Gerar Senha</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#312E81',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  introIconeCirculo: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitulo: { fontSize: 15, fontWeight: '800', color: cores.texto },
  introTexto: { fontSize: 12, color: cores.textoSuave, marginTop: 2 },

  cardVazio: {
    backgroundColor: cores.superficie,
    borderRadius: 18,
    paddingVertical: 30,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderStyle: 'dashed',
  },
  vazio: { color: cores.texto, fontSize: 13, fontWeight: '700', marginTop: 2 },
  vazioSub: { color: cores.textoClaro, fontSize: 12 },

  itemPaciente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
    borderWidth: 2,
    borderLeftWidth: 4,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  nome: { fontSize: 14.5, fontWeight: '700', color: cores.texto },
  detalhe: { fontSize: 11.5, color: cores.textoSuave, marginTop: 1, marginBottom: 7 },
  linhaTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagEspecialidade: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagEspecialidadeTexto: { fontSize: 10.5, fontWeight: '800' },
  tagPrioridade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: cores.perigoFundo,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagPrioridadeTexto: { fontSize: 10.5, fontWeight: '800', color: cores.perigo },

  resumoCard: {
    backgroundColor: cores.superficie,
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: '#312E81',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  resumoHeaderLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  resumoTitulo: { fontSize: 15, fontWeight: '800', color: cores.texto },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: cores.fundo,
  },
  resumoLabel: { fontSize: 12.5, color: cores.textoSuave, fontWeight: '600' },
  resumoValor: { fontSize: 12.5, color: cores.texto, fontWeight: '700' },
  botaoGerar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 16,
  },
  botaoGerarTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
