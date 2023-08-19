import { JourneyContentResponse } from './journey-content-response.dto';
export class JourneyResponse {
  id: number;
  creatorNickname: string;
  journeyContents: JourneyContentResponse[];
  title: string;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}
