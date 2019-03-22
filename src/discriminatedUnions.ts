import { PropSchema, serialize, deserialize, serializable, date, getDefaultModelSchema } from 'serializr';

type Address = string;

class VerifiedEmail {
    @serializable readonly type = 'verified';
    @serializable address: Address;
    @serializable(date()) verificationDate: Date;
    nonSerializedTag = Symbol('NotSerialized');

    constructor(address: Address,
                verificationDate: Date) {
        this.address = address;
        this.verificationDate = verificationDate;
    }
}

class UnverifiedEmail {
    @serializable readonly type = 'unverified';
    @serializable address: Address;
    nonSerializedTag = Symbol('NotSerialized');

    constructor(address: Address) {
        this.address = address;
    }
}

type UserEmail = VerifiedEmail | UnverifiedEmail;

/** From TypeScript Handbook */
function assertNever(x: never): never {
    throw new Error(`Unexpected object: ${x}`);
}

/** Custom serializer for UserEmail discriminated union */
export function userEmail(): PropSchema {
    return {
        serializer: (userEmail: UserEmail /*sourcePropertyValue: any*/): any => {
            if (userEmail === null || userEmail === undefined) {
                return userEmail;
            }

            switch (userEmail.type) {
                case 'verified':
                    // Serialize based on associated clazz schema
                    return serialize(getDefaultModelSchema(VerifiedEmail), userEmail);
                case 'unverified':
                    // Serialize based on associated clazz schema
                    return serialize(getDefaultModelSchema(UnverifiedEmail), userEmail);
                default:
                    return assertNever(userEmail);;
            };
        },
        deserializer: (jsonValue: UserEmail): void => {
            // jsonValue is something that should be shaped like a UserEmail - but may not be
            switch (jsonValue.type) {
                case 'verified': deserialize(getDefaultModelSchema(VerifiedEmail), jsonValue); break;
                case 'unverified': deserialize(getDefaultModelSchema(UnverifiedEmail), jsonValue); break;
                default: assertNever(jsonValue);
            }
        }
    };
}


export class User {
    @serializable name: string;
    @serializable(userEmail()) email: UserEmail;

    constructor(name: string,
                email: UserEmail) {
        this.name = name;
        this.email = email;
    }
}

export const sampleUser = new User("David Sample", new VerifiedEmail("verified@example.com", new Date()));
// Deserialized objects a) conform to the schema b) have associated constructor c) unsafe to stringify
export const deserializedUser = deserialize(User, sampleUser);
// Serialized objects a) are safe to stringify b) match the schema c) do not have associated constructor
export const serializedUser = serialize(deserializedUser);
// Simulate data coming over network
export const deserializedFromJson = deserialize(User, JSON.parse('{ "name": "David", "email": { "type": "unverified", "address": "unverified@example.com" } }'));
