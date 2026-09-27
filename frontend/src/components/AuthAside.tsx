import { Activity, ShieldCheck } from 'lucide-react';

export default function AuthAside() {
  return (
    <div className="login-aside">
      <div className="brand-mark">M</div>

      <p className="eyebrow">
        Operações de manutenção
      </p>

      <h1>
        Faça cada solicitação avançar.
      </h1>

      <p className="login-copy">
        Um espaço de trabalho para as equipes organizarem,
        encaminharem e concluírem as atividades que mantêm
        seus locais funcionando.
      </p>

      <div className="signal-list">
        <span>
          <Activity size={16} />
          Visão operacional em tempo real
        </span>

        <span>
          <ShieldCheck size={16} />
          Acesso baseado em perfil
        </span>
      </div>
    </div>
  );
}
