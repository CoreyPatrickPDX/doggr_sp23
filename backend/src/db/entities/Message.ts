import { Entity, Property, Unique, OneToMany, Collection, Cascade } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity.js";
import { User } from "./User.js";

@Entity({ tableName: "users"})
export class Message extends BaseEntity {
    // who sent the message
    @Property()
    sender!: User;

    // who received the message
    @Property()
    receiver!: User;
}
