import { APIGatewayEvent } from 'aws-lambda';

export function handler(event: APIGatewayEvent) {
  
  // console.log(new Product({name: 'Farinha'}));
  return event;
}