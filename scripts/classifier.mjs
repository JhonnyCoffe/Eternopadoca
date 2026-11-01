export function classifySubject(text) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('design') || lower.includes('desenho')) return 'design';
  if (lower.includes('bug') || lower.includes('erro')) return 'bugfix';
  if (lower.includes('chat') || lower.includes('conversa')) return 'chat';
  if (lower.includes('nota') || lower.includes('anotacao')) return 'anotacao';
  if (lower.includes('plano') || lower.includes('planejamento')) return 'planejamento';
  return 'geral';
}
