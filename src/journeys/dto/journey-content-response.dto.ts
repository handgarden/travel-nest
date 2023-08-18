import { DescriptionResponse } from 'src/descriptions/dto/description-response.dto';
import { DestinationResponse } from 'src/destinations/dto/destination-response.dto';

export class JourneyContentResponse {
  destination: DestinationResponse;
  description: DescriptionResponse;
}
