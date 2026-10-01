import PageHeading from '../components/PageHeading';
import RequisitionTable from '../components/RequisitionTable';

export default function Requisitions() {
  return (
    <>
      <PageHeading
        eyebrow="Fila de trabalho"
        title="Requisições"
      />
      <RequisitionTable />
    </>
  );
}
