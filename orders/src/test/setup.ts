import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signin(): string[]
        }
    }
}

jest.mock("../nats-wrapper")

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = "asdf"
    mongo = new MongoMemoryServer()
    const mongoUri = await mongo.getUri()

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
})

beforeEach(async () => {
    jest.clearAllMocks()
    const collections = await  mongoose.connection.db.collections()

    for (let collection of collections) {
        await collection.deleteMany({});
    }
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})

global.signin = () => {
    // build JWT payload
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: "test@test.com"
    }
    // create jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!)
    //build sessions obj
    const session = {jwt: token}
    // turn session in json
    const sessionJSON = JSON.stringify(session)
    // take json/encode as base64
    const base64 = Buffer.from(sessionJSON).toString("base64")
    // return string of cookie w/ encoded data
    return [`express:sess=${base64}`]
}