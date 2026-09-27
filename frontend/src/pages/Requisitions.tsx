import { ClipboardList } from 'lucide-react';
import PageHeading from '../components/PageHeading';
import RequisitionTable from '../components/RequisitionTable';

export default function Requisitions() {
  return (
    <>
      <PageHeading
        eyebrow="Fila de trabalho"
        title="Requisições"
        action={
          <button className="primary-button compact" disabled title="O endpoint de criação ainda não está disponível">
            <ClipboardList size={16} /> Nova solicitação
          </button>
        }
      />
      <RequisitionTable />
    </>
  );
}
