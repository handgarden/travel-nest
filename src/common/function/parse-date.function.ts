import { BadRequestException } from '@nestjs/common';

export class DateFormatError extends Error {
  constructor() {
    super('date format error');
  }
}

export const parseDateFunc = (value: string) => {
  if (!value) {
    throw new DateFormatError();
  }

  if (typeof value !== 'string') {
    throw new DateFormatError();
  }

  const splitDate = value.split('-');

  if (splitDate.length !== 3) {
    throw new DateFormatError();
  }

  const year = parseInt(splitDate[0]);
  const month = parseInt(splitDate[1]);
  const day = parseInt(splitDate[2]);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new DateFormatError();
  }

  if (month > 12 || month < 1 || day < 1 || day > 31) {
    throw new DateFormatError();
  }

  const parseDate = new Date();
  parseDate.setFullYear(year);
  parseDate.setMonth(month - 1, day);

  if (isNaN(parseDate.getTime())) {
    throw new DateFormatError();
  }

  return parseDate;
};
