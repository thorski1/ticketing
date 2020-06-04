import express, { Request, Response } from "express";
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	OrderStatus,
	BadRequestError,
} from "@sttickets/common";
import mongoose from "mongoose";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";


const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
	"/api/orders",
	requireAuth,
	[
		body("ticketId")
			.not()
			.isEmpty()
			.custom((input: string) =>
				mongoose.Types.ObjectId.isValid(input)
			)
			.withMessage("Ticket ID must be provided"),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;

		// find ticket user is trying to order in db
		const ticket = await Ticket.findById(ticketId);
		if (!ticket) {
			throw new NotFoundError();
		}
		// maker sure tix is not already reserved
		const isReserved = await ticket.isReserved();
		if (isReserved) {
			throw new BadRequestError(
				"Ticket is already reserved"
			);
		}
		// Calculate exp date on order
		const expiration = new Date();
		expiration.setSeconds(
			expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS
		);
		// Build order, save to DB
		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration,
			ticket
		})
		await order.save()
		// Publish event saying order created
		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			status: order.status,
			userId: order.userId,
			expiresAt: order.expiresAt.toISOString(),
			ticket: {
				id: ticket.id,
				price: ticket.price
			},
			version: order.version
		})
		res.status(201).send(order);
	}
);

export { router as newOrderRouter };
