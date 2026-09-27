import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/Toast';
import { validateLoginForm, type FieldError } from '../utils/validation';
import AuthAside from '../components/AuthAside';

export default function LoginPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});

  const mutation = useMutation({
    mutationFn: () => authService.login(form),
    onSuccess: (result) => {
      signIn(result);
      setPendingRole(result.user.role ?? '');
    },
    onError: (reason) => { showToast(apiErrorMessage(reason)); },
  });

  useEffect(() => {
    if (!pendingRole) return;
    if (pendingRole === 'solicitante') navigate('/my-requisitions');
    else if (pendingRole === 'executor') navigate('/executor');
    else if (pendingRole === 'gestor') navigate('/manager');
    else navigate('/');
  }, [pendingRole, navigate]);

  const validateField = (field: 'email' | 'password', value: string) => {
    const errors = validateLoginForm(
      field === 'email' ? value : form.email,
      field === 'password' ? value : form.password,
    );
    setFieldErrors((previous) => {
      const next = { ...previous };
      if (errors[field]) { next[field] = errors[field]; } else { delete next[field]; }
      return next;
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const errors = validateLoginForm(form.email, form.password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    mutation.mutate();
  };

  return (
    <main className="login-page">
      <AuthAside />
      <form className="login-card" onSubmit={submit} noValidate>
        <p className="eyebrow">Bem-vindo de volta</p>
        <h2>Entrar no sistema</h2>
        <p className="muted">Use suas credenciais de acesso.</p>
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
          {mutation.isPending ? 'Entrando...' : 'Entrar'}
          <ArrowUpRight size={17} />
        </button>
        <p className="auth-switch">
          Ainda não possui uma conta?{' '}
          <Link to="/register">Criar cadastro</Link>
        </p>
        <p className="auth-switch">
          <Link to="/forgot-password">Esqueci a senha</Link>
        </p>
      </form>
    </main>
  );
}
