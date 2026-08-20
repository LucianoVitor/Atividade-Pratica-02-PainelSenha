/**
 * theme.js
 * -----------------------------------------------------------------------
 * Tokens de design centralizados usados por App.js, Cadastro.js,
 * GerarSenha.js e Chamada.js — garante consistência visual em todo o app.
 *
 * Conceito da identidade visual: cada paciente carrega uma COR DE FAIXA
 * ETÁRIA (usada em avatar, borda do card e no ticket de chamada). Essa
 * cor não é decorativa: ela é a mesma variável que determina a
 * especialidade médica, então o usuário aprende a reconhecer visualmente
 * o grupo de atendimento (Infância, Adolescência, Adulto Jovem,
 * Meia-idade, Idoso) em qualquer tela do app.
 * -----------------------------------------------------------------------
 */

export const cores = {
  primaria: '#4F46E5',
  primariaEscura: '#3730A3',
  primariaClara: '#818CF8',
  fundo: '#F1F5F9',
  superficie: '#FFFFFF',
  texto: '#0F172A',
  textoSuave: '#64748B',
  textoClaro: '#94A3B8',
  borda: '#E2E8F0',
  sucesso: '#059669',
  sucessoFundo: '#D1FAE5',
  alerta: '#D97706',
  alertaFundo: '#FEF3C7',
  perigo: '#E11D48',
  perigoFundo: '#FFE4E6',
};

export const gradientes = {
  header: ['#4338CA', '#6D28D9'],
  primario: ['#4F46E5', '#7C3AED'],
  ticket: ['#312E81', '#5B21B6'],
  sucesso: ['#059669', '#10B981'],
  desativado: ['#94A3B8', '#94A3B8'],
};

// Faixas etárias em ordem crescente — cada uma com uma cor de identidade
export const FAIXAS_ETARIAS = [
  { max: 12, nome: 'Infância', icone: 'happy-outline', cor: '#0891B2', fundo: '#CFFAFE' },
  { max: 18, nome: 'Adolescência', icone: 'musical-notes-outline', cor: '#7C3AED', fundo: '#EDE9FE' },
  { max: 40, nome: 'Adulto Jovem', icone: 'leaf-outline', cor: '#0D9488', fundo: '#CCFBF1' },
  { max: 60, nome: 'Meia-idade', icone: 'briefcase-outline', cor: '#D97706', fundo: '#FEF3C7' },
  { max: Infinity, nome: 'Idoso', icone: 'walk-outline', cor: '#E11D48', fundo: '#FFE4E6' },
];

export function obterFaixaEtaria(idade) {
  return FAIXAS_ETARIAS.find((faixa) => idade <= faixa.max);
}

export function obterIniciais(nome) {
  const partes = String(nome).trim().split(/\s+/);
  const primeira = partes[0]?.[0] || '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export function formatarHora(timestamp) {
  const data = new Date(timestamp);
  const hh = String(data.getHours()).padStart(2, '0');
  const mm = String(data.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}
