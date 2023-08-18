import { Description } from './../entities/description.entity';
export class DescriptionResponse {
  id: number;
  creatorNickname: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  images: string[];

  static create(
    creatorNickname: string,
    description: Description,
    storeFileNames: string[],
  ) {
    const response = new DescriptionResponse();
    response.id = description.id;
    response.creatorNickname = creatorNickname;
    response.content = description.content;
    response.createdAt = description.createdAt;
    response.updatedAt = description.updatedAt;
    response.images = storeFileNames;
    return response;
  }
}
