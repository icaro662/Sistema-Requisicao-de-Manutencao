import { RequisitionPriority } from '../../core/enums/priority.enum';
import { RequisitionStatus } from '../../core/enums/status.enum';
export class RequisitionDto { id: string; number: string; status: RequisitionStatus; priority: RequisitionPriority; description: string; photoUrl: string | null; }
