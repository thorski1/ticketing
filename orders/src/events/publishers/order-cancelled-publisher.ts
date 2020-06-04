import {
	Publisher,
	OrderCancelledEvent,
	Subjects,
} from "@sttickets/common";

export class OrderCancelledPublisher extends Publisher<
	OrderCancelledEvent
> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
