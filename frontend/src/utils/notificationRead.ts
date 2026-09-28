/**
 * Estado de leitura das notificações, guardado por navegador/usuário.
 * É o mesmo armazenamento usado pelo sino do topo: marcar como lido em uma
 * tela também limpa o contador do sino.
 */
const STORAGE_PREFIX = 'manutencao:notificacoes-lidas:';
const MAX_STORED_IDS = 300;

export function notificationStorageKey(userId?: string) {
  return `${STORAGE_PREFIX}${userId ?? 'anonimo'}`;
}

export function loadReadIds(userId?: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(notificationStorageKey(userId)) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function persistReadIds(userId: string | undefined, ids: string[]) {
  try {
    localStorage.setItem(notificationStorageKey(userId), JSON.stringify(ids.slice(-MAX_STORED_IDS)));
  } catch {
    // Storage unavailable (private browsing): the badge just resets on reload.
  }
}
