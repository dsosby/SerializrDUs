import { date, identifier, serializable } from 'serializr';
import { discriminatedUnion } from './discriminatedUnions';
import { loadable, Loadable, LoadableUpdate } from './loadable';

export type Address = string;

/** Custom serializer for UserEmail discriminated union */
const userEmail = () => discriminatedUnion(VerifiedEmail, UnverifiedEmail);
/** Example where developer forgets to add a new type. If used, deserializing will throw runtime exception */
const badUserEmail = () => discriminatedUnion(UnverifiedEmail);

export class VerifiedEmail {
    static readonly type = 'verified';
    @serializable readonly type = VerifiedEmail.type;
    @serializable address: Address;
    @serializable(date()) verificationDate: Date;
    nonSerializedTag = Symbol('NotSerialized');

    constructor(address: Address,
                verificationDate: Date) {
        this.address = address;
        this.verificationDate = verificationDate;
    }
}

export class UnverifiedEmail {
    static readonly type = 'unverified';
    @serializable readonly type = UnverifiedEmail.type;
    @serializable address: Address;
    nonSerializedTag = Symbol('NotSerialized');

    constructor(address: Address) {
        this.address = address;
    }
}

export type UserEmail = VerifiedEmail | UnverifiedEmail;

export class Note {
    @serializable(identifier()) id: string;
    @serializable text: string;

    constructor(id: string, text: string) {
        this.id  = id;
        this.text = text;
    }
}

export class User {
    @serializable name: string;
    @serializable(userEmail()) email: UserEmail;
    @serializable(loadable(Note)) note: Loadable<Note> = Loadable.NotStarted();
    @serializable(loadable(Note)) noteUpdate: LoadableUpdate = Loadable.NotStarted();

    constructor(name: string,
                email: UserEmail) {
        this.name = name;
        this.email = email;
    }
}
