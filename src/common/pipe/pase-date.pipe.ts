import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string, metadata: ArgumentMetadata): Date {
    if (!value) {
      throw new BadRequestException('date missing');
    }

    const parseDate = new Date(value);

    if (isNaN(parseDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    console.log(parseDate);
    return parseDate;
  }
}
