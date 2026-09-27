export function passwordResetEmailTemplate(resetUrl: string, userName: string): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #183247;">
      <h2 style="color: #102a43; margin-bottom: 8px;">Redefinição de Senha</h2>
      <p style="color: #52636b;">Olá, <strong>${userName}</strong>!</p>
      <p style="color: #52636b; line-height: 1.6;">
        Recebemos uma solicitação para redefinir a senha da sua conta. Clique no link abaixo para escolher uma nova senha:
      </p>
      <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #102a43; color: #ffffff; text-decoration: none; border-radius: 7px; font-weight: 600;">
        Redefinir Senha
      </a>
      <p style="color: #91a09f; font-size: 12px; line-height: 1.5;">
        Este link expira em 1 hora. Se você não solicitou esta alteração, ignore este e-mail.
      </p>
      <p style="color: #91a09f; font-size: 12px; margin-top: 24px; border-top: 1px solid #e1e8e7; padding-top: 16px;">
        Central de Operações de Manutenção
      </p>
    </div>
  `;
}
