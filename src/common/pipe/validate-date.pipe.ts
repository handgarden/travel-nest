import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as moment from 'moment';
import { DateFormat } from '../date-format';

@Injectable()
export class ValidateDatePipe implements PipeTransform<string> {
  transform(value: string): string {
    const date = moment(value, DateFormat.DATE);
    const valid = date.isValid();
    if (!valid) {
      throw new BadRequestException('invlid date format');
    }
    return value;
  }
}
