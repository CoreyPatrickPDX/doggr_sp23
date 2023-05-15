import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import {User} from "../entities/User.js";
import {Message} from "../entities/Message.js";

export class MessageSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		em.create(Message, {
			sender_id: 1,
			receiver_id: 2,
			message: "Dog"
		});

		em.create(Message, {
			sender_id: 2,
			receiver_id: 1,
			message: "cat"
		});
	}
}
