import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@sttickets/common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
