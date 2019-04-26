import { Clazz, PropSchema, serialize, deserialize, serializable, date, getDefaultModelSchema, identifier, ModelSchema } from 'serializr';
import { LoadError, Loadable, LoadableUpdate, NotStarted, InProgress, Available } from './loadable';
// Thoughts from here: https://github.com/mobxjs/serializr/issues/65

// Implementing custom serializr supporting DUs with 'type' field
interface UnionClazz {
    new(...args: any): {};
    type: string;
}

function discriminatedUnion<U extends UnionClazz>(...unionClazzes: UnionClazz[]) {
    return {
        serializer: (sourcePropertyValue: U): any => serialize(sourcePropertyValue),
        deserializer: (jsonValue: any, callback: (err: any, result: {}) => void): void => {
            if (jsonValue === undefined || jsonValue === null) {
                return jsonValue;
            }

            // jsonValue is something that should be shaped like a U - but may not be
            // If it is a bad type, a runtime error will throw

            const discriminate = jsonValue.type;
            const clazz = unionClazzes.find(c => c.type === discriminate); 
            if (!clazz) {
                callback(`Unknown type: ${discriminate}`, {});
            } else {
                deserialize(clazz, jsonValue, callback);
            }
        }
    }
}

// Sample scenario - a user object with an email that is either verified or unverified

type Address = string;

class VerifiedEmail {
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

class Note {
    @serializable(identifier()) id: string;
    @serializable text: string;

    constructor(id: string, text: string) {
        this.id  = id;
        this.text = text;
    }
}

class UnverifiedEmail {
    static readonly type = 'unverified';
    @serializable readonly type = UnverifiedEmail.type;
    @serializable address: Address;
    nonSerializedTag = Symbol('NotSerialized');

    constructor(address: Address) {
        this.address = address;
    }
}

type UserEmail = VerifiedEmail | UnverifiedEmail;
/** Custom serializer for UserEmail discriminated union */
const userEmail = () => discriminatedUnion(VerifiedEmail, UnverifiedEmail);
/** Example where developer forgets to add a new type. If used, deserializing will throw runtime exception */
const badUserEmail = () => discriminatedUnion(UnverifiedEmail);

/** Custom serializer for a Loadable<T> */
function loadable<T>(valueClazz: Clazz<T>) {
    return discriminatedUnion(NotStarted, InProgress, LoadError, class AvailableInstance extends Available<T> {
        static readonly type = Available.type;
    });
}

const SampleNote = new Note('id1234', 'This is a cool product');

export class User {
    @serializable name: string;
    @serializable(userEmail()) email: UserEmail;
    @serializable(loadable(Note)) note: Loadable<Note> = Loadable.Available(SampleNote);
    @serializable(loadable(Note)) noteUpdate: LoadableUpdate = Loadable.InProgress();

    constructor(name: string,
                email: UserEmail) {
        this.name = name;
        this.email = email;
    }
}

/** This DU implementation has all benefits of TypeScript DUs */
// assertNever from TypeScript Handbook
function assertNever(x: never): never { throw new Error(); }
function exampleFunctionShowingExhaustiveness(email: UserEmail): void {
    switch (email.type) {
        // Autocomplete works
        case 'verified': break;
        // Commenting out any case will cause compile error at assertNever
        case 'unverified': break;
        default: assertNever(email);
    }
}

export const sampleUser = new User("David Sample", new VerifiedEmail("verified@example.com", new Date()));
// Deserialized objects a) conform to the schema b) have associated constructor c) unsafe to stringify
export const deserializedUser = deserialize(User, sampleUser);
// Serialized objects a) are safe to stringify b) match the schema c) do not have associated constructor
export const serializedUser = serialize(deserializedUser);
// Simulate data coming over network
export const deserializedFromJson = deserialize(User, JSON.parse('{ "name": "Jason Sample", "email": { "type": "unverified", "address": "unverified@example.com" } }'));
// Simulate bad data coming over network -- will throw on deserialize (Unexpected object)
// export const badFromJson = deserialize(User, JSON.parse('{ "name": "Jason Sample", "email": "badStructure@example.com" }'));
