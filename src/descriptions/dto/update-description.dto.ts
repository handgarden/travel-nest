import { PartialType } from '@nestjs/mapped-types';
import { CreateDescriptionRequest } from './create-description.dto';

export class UpdateDescriptionDto extends PartialType(
  CreateDescriptionRequest,
) {}
