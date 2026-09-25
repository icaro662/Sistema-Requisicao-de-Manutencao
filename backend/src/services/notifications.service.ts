import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  notifyRequisitionCreated(requisitionId: string): void {
    this.logger.log(`Notification queued for requisition ${requisitionId}`);
  }
}
