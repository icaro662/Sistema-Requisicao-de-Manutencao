import type { RequisitionPriority } from './requisitions';

export interface ExecutionRecord {
    id: string;
    requisitionId: string;
    requisition?: {
        id: string;
        number: string;
        description?: string;
        locationId?: string;
        categoryId?: string;
        priority?: RequisitionPriority;
        photoUrl?: string;
    };
    executorId: string;
    executorName: string;
    executionDescription: string;
    serviceDate: string;
    materialsUsed?: string;
    observations?: string;
    photoUrl?: string;
    createdAt: string;
    updatedAt: string;
}
export interface RegisterExecutionInput {
    executionDescription: string;
    materialsUsed?: string;
    observations?: string;
    photoUrl?: string;
}
