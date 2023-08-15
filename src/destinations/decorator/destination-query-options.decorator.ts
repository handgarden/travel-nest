import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { Pageable } from 'src/common/pageable.dto';
import { DestinationQuery } from '../dto/destination-query.dto';
import { Category } from '../category.enum';

export const DestinationQueryOptions = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    const queryObj = request.query;

    const destinationQuery = new DestinationQuery();

    destinationQuery.query = parseQuery(queryObj.query);

    destinationQuery.pageable = new Pageable(queryObj.page, queryObj.size);

    destinationQuery.category = parseCategory(queryObj.category);

    return destinationQuery;
  },
);

const parseQuery = (query: any) => {
  if (typeof query === 'string') {
    return query;
  }

  return '';
};

const parseCategory = (category: any) => {
  if (typeof category === 'string') {
    return [Category[category.toUpperCase()]];
  }

  if (category instanceof Array) {
    return category
      .filter((c) => !!Category[c.toUpperCase()])
      .map((c: any) => Category[c.toUpperCase()]);
  }

  return [];
};
