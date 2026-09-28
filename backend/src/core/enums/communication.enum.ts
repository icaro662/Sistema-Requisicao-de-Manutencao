/** Canal usado para entregar uma comunicação ao destinatário. */
export enum CommunicationChannel {
  /** Notificação exibida no sistema (sino/tela de notificações). */
  APPLICATION = 'aplicacao',
  /** Mensagem enviada por e-mail. */
  EMAIL = 'email',
}

/** Resultado do envio de uma comunicação. */
export enum CommunicationOutcome {
  /** Entregue com sucesso. */
  SENT = 'enviado',
  /** Falha no envio (SMTP indisponível, endereço inválido, etc.). */
  FAILED = 'falha',
  /** Envio desativado na configuração (MAIL_ENABLED=false): conteúdo registrado sem disparo. */
  DISABLED = 'desativado',
}
