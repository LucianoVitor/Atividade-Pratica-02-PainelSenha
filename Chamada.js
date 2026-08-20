import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { cores, gradientes, obterFaixaEtaria, formatarHora } from './theme';

/**
 * Chamada.js
 * -----------------------------------------------------------------------
 * Painel visual (o "elemento de assinatura" do app): um ticket em destaque
 * que mostra a senha chamada no momento dentro de um gradiente escuro,
 * com um leve "pulso" animado toda vez que uma nova senha é chamada —
 * chamando a atenção de quem está de olho no painel, como uma tela de
 * recepção de verdade.
 *
 * A fila (`filaSenhas`) chega já ordenada por prioridade a partir do
 * App.js; cada item recebe a cor da faixa etária do paciente, mantendo a
 * mesma linguagem visual usada em Cadastro.js e GerarSenha.js.
 * -----------------------------------------------------------------------
 */
export default function Chamada({ filaSenhas, senhaAtual, historicoChamadas, onChamarProxima }) {
  const escala = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!senhaAtual) return;
    escala.setValue(0.92);
    Animated.spring(escala, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [senhaAtual?.codigo]);

  const faixaAtual = senhaAtual ? obterFaixaEtaria(senhaAtual.idade) : null;

  return (
    <View>
      {/* Ticket em destaque */}
      <Animated.View style={{ transform: [{ scale: escala }] }}>
        <LinearGradient colors={gradientes.ticket} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.painelPrincipal}>
          <View style={styles.painelLabelLinha}>
            <Ionicons name="volume-high" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.painelLabel}>SENHA ATUAL</Text>
          </View>

          {senhaAtual ? (
            <>
              <Text style={styles.painelSenha}>{senhaAtual.codigo}</Text>
              <Text style={styles.painelNome}>{senhaAtual.nome}</Text>
              <View style={styles.painelTagsLinha}>
                <View style={[styles.painelTagEspecialidade, faixaAtual && { backgroundColor: faixaAtual.cor }]}>
                  <Text style={styles.painelTagEspecialidadeTexto}>{senhaAtual.especialidade}</Text>
                </View>
                {senhaAtual.prioritario && (
                  <View style={styles.painelTagPrioridade}>
                    <Ionicons name="star" size={11} color="#FFFFFF" />
                    <Text style={styles.painelTagPrioridadeTexto}>Prioritário</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              <Ionicons name="megaphone-outline" size={34} color="rgba(255,255,255,0.35)" style={{ marginTop: 6 }} />
              <Text style={styles.painelVazio}>Nenhuma senha chamada ainda</Text>
            </>
          )}
        </LinearGradient>
      </Animated.View>

      <TouchableOpacity
        onPress={onChamarProxima}
        disabled={filaSenhas.length === 0}
        activeOpacity={0.88}
        style={{ marginBottom: 22 }}
      >
        <LinearGradient
          colors={filaSenhas.length === 0 ? gradientes.desativado : gradientes.sucesso}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.botaoChamar}
        >
          <Ionicons name="megaphone" size={18} color="#FFFFFF" />
          <Text style={styles.botaoChamarTexto}>Chamar Próxima Senha</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Fila de espera, já ordenada por prioridade */}
      <View style={styles.subtituloLinha}>
        <Text style={styles.subtitulo}>Fila de espera</Text>
        <View style={styles.contadorBadge}>
          <Text style={styles.contadorBadgeTexto}>{filaSenhas.length}</Text>
        </View>
      </View>

      {filaSenhas.length === 0 ? (
        <View style={styles.cardVazio}>
          <Ionicons name="checkmark-done-outline" size={28} color={cores.textoClaro} />
          <Text style={styles.vazio}>Nenhuma senha aguardando no momento.</Text>
        </View>
      ) : (
        <FlatList
          data={filaSenhas}
          keyExtractor={(item) => item.codigo}
          scrollEnabled={false}
          renderItem={({ item, index }) => {
            const faixa = obterFaixaEtaria(item.idade);
            return (
              <View style={[styles.itemFila, { borderLeftColor: faixa.cor }]}>
                <View style={[styles.posicao, { backgroundColor: faixa.fundo }]}>
                  <Text style={[styles.posicaoTexto, { color: faixa.cor }]}>{index + 1}º</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemCodigoLinha}>
                    <Text style={styles.itemCodigo}>{item.codigo}</Text>
                    {item.prioritario && <Ionicons name="star" size={12} color={cores.perigo} />}
                  </View>
                  <Text style={styles.itemDetalhe}>
                    {item.nome} • {item.especialidade}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Histórico das últimas senhas chamadas */}
      {historicoChamadas.length > 0 && (
        <>
          <Text style={[styles.subtitulo, { marginTop: 6, marginBottom: 10 }]}>Últimas chamadas</Text>
          <View style={styles.historicoCard}>
            {historicoChamadas.map((item, i) => (
              <View
                key={item.codigo + item.hora}
                style={[styles.itemHistorico, i === historicoChamadas.length - 1 && { borderBottomWidth: 0 }]}
              >
                <Ionicons name="time-outline" size={14} color={cores.textoClaro} />
                <Text style={styles.itemHistoricoCodigo}>{item.codigo}</Text>
                <Text style={styles.itemHistoricoNome}>{item.nome}</Text>
                <Text style={styles.itemHistoricoHora}>{formatarHora(item.hora)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  subtituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  subtitulo: { fontSize: 15, fontWeight: '800', color: cores.texto },
  contadorBadge: { backgroundColor: cores.primariaClara, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2 },
  contadorBadgeTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  cardVazio: {
    backgroundColor: cores.superficie,
    borderRadius: 18,
    paddingVertical: 26,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderStyle: 'dashed',
    marginBottom: 4,
  },
  vazio: { color: cores.textoClaro, fontSize: 12.5, fontWeight: '500' },

  painelPrincipal: {
    borderRadius: 22,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#312E81',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  painelLabelLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  painelLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11.5, fontWeight: '800', letterSpacing: 2.5 },
  painelSenha: { color: '#FFFFFF', fontSize: 52, fontWeight: '800', letterSpacing: 1 },
  painelNome: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '700', marginTop: 6 },
  painelVazio: { color: 'rgba(255,255,255,0.55)', fontSize: 14, marginTop: 10, fontWeight: '500' },
  painelTagsLinha: { flexDirection: 'row', gap: 8, marginTop: 14 },
  painelTagEspecialidade: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  painelTagEspecialidadeTexto: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' },
  painelTagPrioridade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(225,29,72,0.85)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  painelTagPrioridadeTexto: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' },

  botaoChamar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  botaoChamarTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  itemFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  posicao: {
    minWidth: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  posicaoTexto: { fontSize: 12, fontWeight: '800' },
  itemCodigoLinha: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  itemCodigo: { fontSize: 14.5, fontWeight: '800', color: cores.texto },
  itemDetalhe: { fontSize: 11.5, color: cores.textoSuave, marginTop: 2 },

  historicoCard: {
    backgroundColor: cores.superficie,
    borderRadius: 16,
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  itemHistorico: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: cores.fundo,
  },
  itemHistoricoCodigo: { fontSize: 12.5, fontWeight: '800', color: cores.texto },
  itemHistoricoNome: { fontSize: 12.5, color: cores.textoSuave, flex: 1 },
  itemHistoricoHora: { fontSize: 11, color: cores.textoClaro, fontWeight: '600' },
});
