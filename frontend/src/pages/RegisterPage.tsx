import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/Toast';
import { validateRegisterForm, type FieldError } from '../utils/validation';
import type { RegisterInput } from '../types';
import AuthAside from '../components/AuthAside';

export default function RegisterPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<RegisterInput>({ name: '', email: '', password: '', phone: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});

  const mutation = useMutation({
    mutationFn: () => authService.register(form),
    onSuccess: (result) => { signIn(result); navigate('/my-requisitions'); },
    onError: (reason) => { showToast(apiErrorMessage(reason)); },
  });

  const validateField = (field: 'name' | 'email' | 'password' | 'phone', value: string) => {
    const errors = validateRegisterForm(
      field === 'name' ? value : form.name,
      field === 'email' ? value : form.email,
      field === 'password' ? value : form.password,
      field === 'phone' ? value : form.phone ?? '',
    );
    setFieldErrors((previous) => {
      const next = { ...previous };
      if (errors[field]) { next[field] = errors[field]; } else { delete next[field]; }
      return next;
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const errors = validateRegisterForm(form.name, form.email, form.password, form.phone ?? '');
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    mutation.mutate();
  };

  return (
    <main className="login-page">
      <AuthAside />
      <form className="login-card" onSubmit={submit} noValidate>
        <p className="eyebrow">Novo acesso</p>
        <h2>Criar cadastro</h2>
        <p className="muted">Preencha seus dados para começar.</p>
        <label>
          Nome
          <input type="text" value={form.name}
            onChange={(event) => {
              const value = event.target.value;
              setForm({ ...form, name: value });
              if (fieldErrors.name) validateField('name', value);
            }}
            onBlur={() => validateField('name', form.name)}
            placeholder="Seu nome completo" aria-invalid={Boolean(fieldErrors.name)} />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </label>
        <label>
          E-mail
          <input type="email" value={form.email}
            onChange={(event) => {
              const value = event.target.value;
              setForm({ ...form, email: value });
              if (fieldErrors.email) validateField('email', value);
            }}
            onBlur={() => validateField('email', form.email)}
            placeholder="voce@empresa.com" aria-invalid={Boolean(fieldErrors.email)} />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </label>
        <label>
          Telefone{' '}<span className="optional">(opcional)</span>
          <input type="tel" value={form.phone ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              setForm({ ...form, phone: value });
              if (fieldErrors.phone) validateField('phone', value);
            }}
            onBlur={() => validateField('phone', form.phone ?? '')}
            placeholder="(00) 00000-0000" aria-invalid={Boolean(fieldErrors.phone)} />
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
        </label>
        <label>
          Senha
          <input type="password" value={form.password}
            onChange={(event) => {
              const value = event.target.value;
              setForm({ ...form, password: value });
              if (fieldErrors.password) validateField('password', value);
            }}
            onBlur={() => validateField('password', form.password)}
            placeholder="Mínimo de 8 caracteres" aria-invalid={Boolean(fieldErrors.password)} />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </label>
        <button className="primary-button" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Criando cadastro...' : 'Criar cadastro'}
          <ArrowUpRight size={17} />
        </button>
        <p className="auth-switch">
          Já possui uma conta?{' '}
          <Link to="/login">Entrar</Link>
        </p>
      </form>
    </main>
  );
}
