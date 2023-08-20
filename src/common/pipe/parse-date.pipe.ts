import { DateFormatError } from './../function/parse-date.function';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { parseDateFunc } from '../function/parse-date.function';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string): Date {
    try {
      return parseDateFunc(value);
    } catch (e) {
      if (e instanceof DateFormatError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }
}
