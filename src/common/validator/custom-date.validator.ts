import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import * as moment from 'moment';
import { DateFormat } from '../date-format';

@ValidatorConstraint({ name: 'customDate', async: false })
export class CustomDate implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    return moment(value, DateFormat.DEFAULT).isValid();
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `${validationArguments.targetName} date format error`;
  }
}

export function IsCustomDate(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isCustomDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: CustomDate,
    });
  };
}
