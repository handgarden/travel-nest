import { DescriptionResponse } from 'src/descriptions/dto/description-response.dto';
import { DestinationResponse } from 'src/destinations/dto/destination-response.dto';

export class JourneyContentResponse {
  journeyId?: number;
  destination: DestinationResponse;
  description: DescriptionResponse;
}
