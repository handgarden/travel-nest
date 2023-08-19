import { PartialType } from '@nestjs/mapped-types';
import { CreateJourneyRequest } from './create-journey-request.dto';

export class UpdateJourneyRequest extends PartialType(CreateJourneyRequest) {}
