import { Subjects, Publisher, PaymentCreatedEvent } from '@sttickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}