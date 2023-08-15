import { Pageable } from 'src/common/pageable.dto';
import { Category } from '../category.enum';

export class DestinationQuery {
  category: Category[];
  query: string;
  pageable: Pageable;
}
