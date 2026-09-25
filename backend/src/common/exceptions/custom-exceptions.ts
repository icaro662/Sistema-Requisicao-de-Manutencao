import { BadRequestException, NotFoundException } from '@nestjs/common';

export class ResourceNotFoundException extends NotFoundException {}
export class InvalidTransitionException extends BadRequestException {}
