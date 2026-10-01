import type { RequisitionStatus } from './requisitions';

export interface Notification {
    id: string;
    message: string;
    requisitionId: string;
    requisitionNumber: string;
    status: RequisitionStatus;
    createdAt: string;
    read: boolean;
}
export type CommunicationChannel = 'aplicacao' | 'email';
export type CommunicationOutcome = 'enviado' | 'falha' | 'desativado';
export interface Communication {
    id: string;
    requisitionId?: string | null;
    requisitionNumber?: string | null;
    recipientId?: string | null;
    recipientName: string;
    recipientEmail?: string | null;
    channel: CommunicationChannel;
    subject: string;
    body: string;
    outcome: CommunicationOutcome;
    detail?: string | null;
    createdAt: string;
}
