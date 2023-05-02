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

	//READ
	app.search<{Body: { email: string}}>("/users", async (req, reply) => {
		const {email} = req.body;

		try {
			const theUser = await req.em.findOne(User, {email});
			console.log(theUser);
			reply.send(theUser);
		} catch (err) {
			console.error(err);
			reply.status(500)
				.send(err);
		}
	});

	//UPDATE
	app.put<{Body: {email:string, name:string, petType:string}}>("/users", async (req, reply) =>{
		const {email, name, petType} = req.body;

		const userToChange = await req.em.findOne(User, {email});
		userToChange.name = name;
		userToChange.petType = petType;

		// This is how we persist our JS object changes to the database itself
		await req.em.flush();
		console.log(userToChange);
		reply.send(userToChange);
	});

	// D
	app.delete<{Body: { email: string }}>("/users", async(req, reply) => {
		const {email} = req.body;

		// using reference is enough, no need for a fully initialized entity
		const userToDelete = await req.em.findOne(User, {email});

		await req.em.remove(userToDelete).flush();
		reply.send();

	});

}
export default DoggrRoutes;
