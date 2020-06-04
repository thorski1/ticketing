import { TicketCreatedEvent } from '@sttickets/common'
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // create instance of listener
    const listener = new TicketCreatedListener(natsWrapper.client)
    // create fake data event
    const data: TicketCreatedEvent["data"] = {
			id: new mongoose.Types.ObjectId().toHexString(),
			version: 0,
			price: 10,
			title: "concert",
			userId: new mongoose.Types.ObjectId().toHexString(),
		};
    // create fake msg event
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, data, msg}
};

it("creates and saves ticket", async () => {
    const {listener, data, msg} = await setup()
    // call onMessage fn with data {} + message {}
    await listener.onMessage(data, msg)
    // write assertion to make sure tix was created
    const ticket = await Ticket.findById(data.id)
    expect(ticket).toBeDefined()
    expect(ticket!.title).toEqual(data.title)
    expect(ticket!.price).toEqual(data.price)
});

it("acks the message", async () => {
    const {listener, data, msg} = await setup()
    // call onMessage fn with data {} + message {}
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
    
    // write assertion to make sure ack fn was called

});
