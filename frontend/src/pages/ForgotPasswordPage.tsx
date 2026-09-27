import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiErrorMessage } from '../services/api';
import { authService } from '../services/authService';
import { useToast } from '../components/Toast';
import { validateEmail } from '../utils/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: () => authService.forgotPassword(email),
    onSuccess: (result) => {
      showToast(result.message, 'success');
    },
    onError: (reason) => showToast(apiErrorMessage(reason)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      showToast(emailError);
      return;
    }
    mutation.mutate();
  };

  return <main className="login-page">
    <div className="login-aside">
      <div className="brand-mark">M</div>
      <p className="eyebrow">Operações de manutenção</p>
      <h1>Recuperar acesso</h1>
      <p className="login-copy">Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.</p>
    </div>
    <form className="login-card" onSubmit={submit} noValidate>
      <p className="eyebrow">Esqueci a senha</p>
      <h2>Recuperar senha</h2>
      <p className="muted">Enviaremos um link de redefinição para o seu e-mail.</p>

      <label>E-mail
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@empresa.com"
        />
      </label>

      <button className="primary-button" disabled={mutation.isPending}>
        {mutation.isPending ? 'Enviando...' : 'Enviar link'} <KeyRound size={17} />
      </button>

      <p className="auth-switch">
        <Link to="/login"><ArrowLeft size={14} /> Voltar para o login</Link>
      </p>
    </form>
  </main>;
}
