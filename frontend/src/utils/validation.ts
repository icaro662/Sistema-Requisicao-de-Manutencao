export interface FieldError {
  [field: string]: string;
}

const EMAIL_RE = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_RE = /^[a-zA-ZÀ-ÖØ-öø-ÿ' ]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'O e-mail é obrigatório.';
  if (email.length > 255) return 'O e-mail deve ter no máximo 255 caracteres.';
  if (!EMAIL_RE.test(email.trim())) return 'Formato de e-mail inválido. Use exemplo@exemplo.com (apenas letras, números, pontos e hífens).';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'A senha é obrigatória.';
  if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (password.length > 72) return 'A senha deve ter no máximo 72 caracteres.';
  if (!/[a-z]/.test(password)) return 'A senha deve conter pelo menos uma letra minúscula.';
  if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula.';
  if (!/\d/.test(password)) return 'A senha deve conter pelo menos um número.';
  if (!/[^a-zA-Z0-9]/.test(password)) return 'A senha deve conter pelo menos um caractere especial (!@#$%...).';
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'O nome é obrigatório.';
  if (name.trim().length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
  if (name.trim().length > 100) return 'O nome deve ter no máximo 100 caracteres.';
  if (!NAME_RE.test(name.trim())) return 'O nome deve conter apenas letras e espaços (sem números ou caracteres especiais).';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return null;
  if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(phone.trim())) return 'Formato de telefone inválido. Use (00) 00000-0000.';
  return null;
}

export function validateLoginForm(email: string, password: string): FieldError {
  const errors: FieldError = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function validateRegisterForm(name: string, email: string, password: string, phone: string): FieldError {
  const errors: FieldError = {};
  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const phoneError = validatePhone(phone);
  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (phoneError) errors.phone = phoneError;
  return errors;
}

export function validateRequisitionForm(locationId: string, categoryId: string, description: string, whatsapp: string, photo: File | null): FieldError {
  const errors: FieldError = {};
  const phoneError = validatePhone(whatsapp);

  if (!locationId) errors.locationId = 'O local é obrigatório.';
  if (!categoryId) errors.categoryId = 'A categoria é obrigatória.';
  if (!description.trim()) errors.description = 'A descrição é obrigatória.';
  else if (description.trim().length < 10) errors.description = 'A descrição deve ter pelo menos 10 caracteres.';
  else if (description.trim().length > 2000) errors.description = 'A descrição deve ter no máximo 2.000 caracteres.';
  if (phoneError) errors.requesterWhatsapp = phoneError;
  if (photo && !['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) errors.photo = 'A foto deve estar no formato JPEG, PNG ou WebP.';
  if (photo && photo.size > 5 * 1024 * 1024) errors.photo = 'A foto deve ter no máximo 5 MB.';

  return errors;
}
