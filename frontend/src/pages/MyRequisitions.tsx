import PageHeading from '../components/PageHeading';
import RequisitionTable from '../components/RequisitionTable';

export default function MyRequisitions() {
  return (
    <>
      <PageHeading eyebrow="Área do Solicitante" title="Minhas Requisições" />
      <RequisitionTable />
    </>
  );
}
