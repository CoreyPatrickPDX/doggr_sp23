import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import app from "./app.js";
import {User} from "./db/entities/User.js";

async function DoggrRoutes(app:FastifyInstance, _options = {}) {
	if (!app) {
		throw new Error("Fastify instance has no value during routes construction");
	}
	
	app.get("/hello", async (req: FastifyRequest, reply: FastifyReply) => {
		return 'hello';
	});
	
	app.get("/dbTest", async (req, reply) => {
		return req.em.find(User, {});
	});
	
	app.post<{
		Body: {
			name: string,
			email: string,
			petType: string,
		},
		Reply: {
			message: string,
		}
	}>("/users", async (req, reply: FastifyReply) => {
		// Fish data out of request (auto converts from json)
		const {name, email, petType} = req.body;
		
		try {
			// Get our manager from the plugin we wrote
			const newUser = await req.em.create(User, {
				name,
				email,
				petType
			});
			
			// This will immediately update the real database.  You can store up several changes and flush only once
			// NOTE THE AWAIT -- do not forget it or weirdness abounds
			await req.em.flush();
			
			console.log("Created new user:", newUser);
			return reply.send(newUser);
		} catch (err) {
			console.log("Failed to create new user: ", err.message);
			return reply.status(500).send({ message: err.message});
		}
	});
}
export default DoggrRoutes;
