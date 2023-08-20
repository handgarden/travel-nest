import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { parseDateFunc } from '../function/parse-date.function';

@ValidatorConstraint({ name: 'customDate', async: false })
export class CustomDate implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    try {
      return parseDateFunc(value) !== null;
    } catch (e) {
      return false;
    }
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
      name: 'isLongerThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: CustomDate,
    });
  };
}
