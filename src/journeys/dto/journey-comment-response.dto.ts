import { JourneyComment } from '../entities/journey-comment';

export class JourneyCommentResponse {
  id: number;
  creatorNickname: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;

  static create(nickname: string, comment: JourneyComment) {
    const response = new JourneyCommentResponse();
    response.id = comment.id;
    response.content = comment.content;
    response.creatorNickname = nickname;
    response.createdAt = comment.createdAt;
    response.updatedAt = comment.updatedAt;
    return response;
  }
}
