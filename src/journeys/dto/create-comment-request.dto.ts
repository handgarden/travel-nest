import { Length } from 'class-validator';

export class CreateCommentRequest {
  @Length(10, 300)
  comment: string;
}
