import { Length } from 'class-validator';

export class UpdateCommentRequest {
  @Length(10, 300)
  comment: string;
}
