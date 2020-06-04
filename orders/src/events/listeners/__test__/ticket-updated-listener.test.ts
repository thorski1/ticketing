import { TicketUpdatedEvent } from "@sttickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client)
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    })
    await ticket.save()
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: "race",
        price: 10000,
        userId: "asdkfjjkl"
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
	return { listener, data, msg, ticket };
};

it("finds, updates, saves tix", async () => {
	const { listener, data, msg, ticket } = await setup();
	await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.version).toEqual(data.version)
    
});

it("acks the message", async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if evt has skipped version number", async () => {
    const {msg, data, listener, ticket} = await setup()

    data.version = 10
    try {
        await listener.onMessage(data, msg)
    } catch (error) {
        
    }
    expect(msg.ack).not.toHaveBeenCalled()

})
