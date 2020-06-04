import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@sttickets/common";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("returns 404 when purchasing order that doesn't exist", async () => {
	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin())
		.send({
			token: "aksjdflkajs",
			orderId: new mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});
it("returns 401 when purchasing order that doesn't belong to user", async () => {
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 20,
		status: OrderStatus.Created,
	});
	order.save();

	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin())
		.send({
			token: "aksjdflkajs",
			orderId: order.id,
		})
		.expect(401);
});

it("returns 400 when purchasing a cancelled order", async () => {
	const userId = mongoose.Types.ObjectId().toHexString();
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 20,
		status: OrderStatus.Cancelled,
	});
	order.save();

	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin(userId))
		.send({
			token: "aksjdflkajs",
			orderId: order.id,
		})
		.expect(400);
});

