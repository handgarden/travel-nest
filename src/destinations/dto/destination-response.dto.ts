import { Category } from '../category.enum';
import { Destination } from '../entities/destination.entity';

export class DestinationResponse {
  id: number;
  title: string;
  address: string;
  category: Category;
  creatorNickname: string;
  createdAt: Date;
  updatedAt: Date;

  static async createAsync(destination: Destination) {
    const response = new DestinationResponse();
    response.id = destination.id;
    response.title = destination.title;
    response.address = destination.address;
    response.category = destination.category;
    response.creatorNickname = (await destination.creator).nickname;
    response.createdAt = destination.createdAt;
    response.updatedAt = destination.updatedAt;

    return response;
  }

  static create(creatorNickname: string, destination: Destination) {
    const response = new DestinationResponse();
    response.id = destination.id;
    response.title = destination.title;
    response.address = destination.address;
    response.category = destination.category;
    response.creatorNickname = creatorNickname;
    response.createdAt = destination.createdAt;
    response.updatedAt = destination.updatedAt;

    return response;
  }
}
