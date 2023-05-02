import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import app from "./app.js";
import {User} from "./db/entities/User.js";
import {ICreateUsersBody} from "./types.js";

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

	app.route<{Body:{email:string}}>({
		method: "SEARCH",
		url: "/users",

		handler: async (req, reply) => {
			const {email} = req.body;
			try {
				const theUser =req.em.find(User, {email});
				console.log(theUser);
				reply.send(theUser);
			} catch (err){
				console.log(err);
				reply.status(500).send(err);
			}
		}
	});
	
	app.post<{Body: ICreateUsersBody}>("/users", async (req, reply) => {
		const { name, email, petType} = req.body;
		
		try {
			const newUser = await req.em.create(User, {
				name,
				email,
				petType
			});
			
			await req.em.flush();
			
			console.log("Created new user:", newUser);
			return reply.send(newUser);
		} catch (err) {
			console.log("Failed to create new user", err.message);
			return reply.status(500).send({message: err.message});
		}
		
	});
}
export default DoggrRoutes;
