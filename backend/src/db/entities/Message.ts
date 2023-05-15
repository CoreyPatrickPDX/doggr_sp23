import {Entity, Property, ManyToOne, PrimaryKey} from "@mikro-orm/core";
import type { Rel } from '@mikro-orm/core';
import { User } from "./User.js";

@Entity()
export class Message {
    @PrimaryKey()
    id!: number;

    // The account who sent the message
    @ManyToOne()
    sender_id!: Rel<User>;

    // The account who received the message
    @ManyToOne()
    receiver_id!: Rel<User>;

    // Message being sent
    @Property()
    message!: string;

    @Property()
    sent_at = new Date();
}
