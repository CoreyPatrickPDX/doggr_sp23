import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import { Match } from "./db/entities/Match.js";
import {User} from "./db/entities/User.js";
import {ICreateUsersBody} from "./types.js";
import {Message} from "./db/entities/Message.js";

import dotenv from "dotenv";
import badWordFilter from "./plugins/bad_word_filter";
dotenv.config();

async function DoggrRoutes(app: FastifyInstance, _options = {}) {
	if (!app) {
		throw new Error("Fastify instance has no value during routes construction");
	}
	
	app.get('/hello', async (request: FastifyRequest, reply: FastifyReply) => {
		return 'hello';
	});
	
	app.get("/dbTest", async (request: FastifyRequest, reply: FastifyReply) => {
		return request.em.find(User, {});
	});
	

	
	// Core method for adding generic SEARCH http method
	// app.route<{Body: { email: string}}>({
	// 	method: "SEARCH",
	// 	url: "/users",
	//
	// 	handler: async(req, reply) => {
	// 		const { email } = req.body;
	//
	// 		try {
	// 			const theUser = await req.em.findOne(User, { email });
	// 			console.log(theUser);
	// 			reply.send(theUser);
	// 		} catch (err) {
	// 			console.error(err);
	// 			reply.status(500).send(err);
	// 		}
	// 	}
	// });
	
	// CRUD
	// C
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
	app.search("/users", async (req, reply) => {
		const { email } = req.body;
		
		try {
			const theUser = await req.em.findOne(User, { email });
			console.log(theUser);
			reply.send(theUser);
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});
	
	// UPDATE
	app.put<{Body: ICreateUsersBody}>("/users", async(req, reply) => {
		const { name, email, petType} = req.body;
		
		const userToChange = await req.em.findOne(User, {email});
		userToChange.name = name;
		userToChange.petType = petType;
		
		// Reminder -- this is how we persist our JS object changes to the database itself
		await req.em.flush();
		console.log(userToChange);
		reply.send(userToChange);
		
	});
	
	// DELETE
	app.delete<{ Body: {email}}>("/users", async(req, reply) => {
		const { email } = req.body;
		
		try {
			const theUser = await req.em.findOne(User, { email });
			
			await req.em.remove(theUser).flush();
			console.log(theUser);
			reply.send(theUser);
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});

	// CREATE MATCH ROUTE
	app.post<{Body: { email: string, matchee_email: string }}>("/match", async (req, reply) => {
		const { email, matchee_email } = req.body;

		try {
			// make sure that the matchee exists & get their user account
			const matchee = await req.em.findOne(User, { email: matchee_email });
			// do the same for the matcher/owner
			const owner = await req.em.findOne(User, { email });

			//create a new match between them
			const newMatch = await req.em.create(Match, {
				owner,
				matchee
			});

			//persist it to the database
			await req.em.flush();
			// send the match back to the user
			return reply.send(newMatch);
		} catch (err) {
			console.error(err);
			return reply.status(500).send(err);
		}

	});

	// CREATE MESSAGE ROUTES
	// eslint-disable-next-line max-len
	app.post<{Body: { sender: string, receiver: string, message: string }}>("/messages", async (req, reply) => {
		const { sender, receiver, message } = req.body;

		try {
			if(badWordFilter(!message)) throw Error("Please refrain from using bad words.");
			try {
				// make sure that the matchee exists & get their user account
				const sender_id = await req.em.findOne(User, { email: sender });
				// do the same for the matcher/owner
				const receiver_id = await req.em.findOne(User, { email: receiver });

				//create a new match between them
				const newMessage = await req.em.create(Message, {
					sender_id,
					receiver_id,
					message
				});

				//persist it to the database
				await req.em.flush();
				// send the match back to the user
				return reply.send(newMessage);
			} catch (err) {
				console.error(err);
				return reply.status(500).send(err);
			}
		} catch(err){
			console.error(err);
			return reply.status(500).send(err);
		}


	});

	// READ ALL MESSAGES SENT TO ME
	app.search<{Body: { receiver: string }}>("/messages", async (req, reply) => {
		const { receiver } = req.body;

		try {
			const theUser = await req.em.findOne(User, {email: receiver});
			const theMessages = await req.em.find(Message, { receiver_id: theUser });
			console.log(theMessages);
			reply.send(theMessages);
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});

	// READ ALL MESSAGES I'VE SENT
	app.search<{Body: { sender: string }}>("/messages/sent", async (req, reply) => {
		const { sender } = req.body;

		try {
			const theUser = await req.em.findOne(User, {email: sender});
			const theMessages = await req.em.find(Message, { sender_id: theUser });
			console.log(theMessages);
			reply.send(theMessages);
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});

	// UPDATE
	app.put<{Body: { messageId: number, message: string }}>("/messages", async(req, reply) => {
		const { messageId, message} = req.body;
		try {
			if (badWordFilter(!message)) throw Error("Please refrain from using bad words.");
			try {
				const messageToChange = await req.em.findOne(Message, {id: messageId});
				messageToChange.message = message;

				// Reminder -- this is how we persist our JS object changes to the database itself
				await req.em.flush();
				console.log(messageToChange);
				reply.send(messageToChange);
			} catch (err) {
				console.error(err);
				reply.status(500).send(err);
			}
		}catch(err){
			console.error(err);
			return reply.status(500).send(err);
		}


	});

	// DELETE A MESSAGE
	app.delete<{ Body: {messageId: number, password: string}}>("/messages", async(req, reply) => {
		const { messageId, password } = req.body;

		try{
			if(password !== process.env.ADMIN_PASS) throw Error("Wrong Password");
			try {
				const theMessage = await req.em.findOne(Message, { id: messageId });

				await req.em.remove(theMessage).flush();
				console.log(theMessage);
				reply.send(theMessage);
			} catch (err) {
				console.error(err);
				reply.status(500).send(err);
			}
		} catch (err) {
			console.error(err);
			reply.status(401).send(err);
		}

	});

	// DELETE ALL SENT MESSAGES
	app.delete<{ Body: {sender: string, password: string}}>("/messages/all", async(req, reply) => {
		const { sender, password } = req.body;
		try {
			if (password !== process.env.ADMIN_PASS) throw Error("Wrong Password");
			try {
				const sender_id = await req.em.findOne(User, {email: sender});

				const theMessages = await req.em.find(Message, {sender_id});

				reply.send(theMessages);
				for (const theMessage of theMessages) {
					await req.em.remove(theMessage).flush();
					console.log(theMessage);
				}

			} catch (err) {
				console.error(err);
				reply.status(500).send(err);
			}
		} catch (err) {
			console.error(err);
			reply.status(401).send(err);
		}
	});
}

export default DoggrRoutes;
