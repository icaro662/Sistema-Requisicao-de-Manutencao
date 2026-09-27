import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiErrorMessage } from '../services/api';
import { authService } from '../services/authService';
import { useToast } from '../components/Toast';
import { validatePassword } from '../utils/validation';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { showToast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authService.resetPassword(token, password),
    onSuccess: (result) => {
      setIsSuccess(true);
      showToast(result.message, 'success');
      setTimeout(() => navigate('/login'), 3000);
    },
    onError: (reason) => showToast(apiErrorMessage(reason)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      showToast(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      showToast('As senhas não coincidem.');
      return;
    }
    mutation.mutate();
  };

  if (!token) {
    return <main className="login-page">
      <div className="login-aside">
        <div className="brand-mark">M</div>
        <p className="eyebrow">Operações de manutenção</p>
        <h1>Link inválido</h1>
        <p className="login-copy">O link de redefinição é inválido ou expirou. Solicite um novo link.</p>
      </div>
      <div className="login-card">
        <p className="form-error">Token não encontrado na URL.</p>
        <Link to="/forgot-password" className="primary-button">Solicitar novo link</Link>
      </div>
    </main>;
  }

  return <main className="login-page">
    <div className="login-aside">
      <div className="brand-mark">M</div>
      <p className="eyebrow">Operações de manutenção</p>
      <h1>Nova senha</h1>
      <p className="login-copy">Escolha uma nova senha para sua conta.</p>
    </div>
    <form className="login-card" onSubmit={submit} noValidate>
      <p className="eyebrow">Redefinir senha</p>
      <h2>Criar nova senha</h2>
      <p className="muted">A senha deve ter pelo menos 8 caracteres, com maiúscula, minúscula, número e caractere especial.</p>

      <label>Nova senha
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo de 8 caracteres"
        />
      </label>
      <label>Confirmar senha
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repita a nova senha"
        />
      </label>

      {isSuccess ? (
        <p className="auth-switch">
          <Link to="/login"><ArrowLeft size={14} /> Ir para o login</Link>
        </p>
      ) : (
        <>
          <button className="primary-button" disabled={mutation.isPending}>
            {mutation.isPending ? 'Redefinindo...' : 'Redefinir senha'} <KeyRound size={17} />
          </button>

          <p className="auth-switch">
            <Link to="/login"><ArrowLeft size={14} /> Voltar para o login</Link>
          </p>
        </>
      )}
    </form>
  </main>;
}
