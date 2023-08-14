import { PartialType } from '@nestjs/mapped-types';
import { CreateDestinationRequest } from './create-destination-request.dto';

export class UpdateDestinationRequest extends PartialType(
  CreateDestinationRequest,
) {}
