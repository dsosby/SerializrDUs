import {
    createModelSchema,
    custom,
    primitive,
    reference,
    list,
    object,
    identifier,
    serialize,
    deserialize,
    getDefaultModelSchema,
    serializable,
    ModelSchema,
    ClazzOrModelSchema
} from 'serializr';
import { Loadable } from './loadable';

const logObject = (obj: any) => console.dir(obj, { colors: true, depth: 10 });

// Custom Serializr for DU types
function discriminatedUnion(types: ModelSchema<any>[], discriminate: string) {
    const matchModelSchema = (value: any) => {
        const modelSchema = types.find(type => type.props[discriminate] === value[discriminate]);
        if (modelSchema === undefined) {
            logObject({ value, types });
            throw `Unknown discriminated union`;
        }

        return modelSchema;
    };

    return custom(
        (value: any) => serialize(matchModelSchema(value), value),
        (jsonValue: any) => deserialize(matchModelSchema(jsonValue), jsonValue)
    );
}

type EmailAddress = string;

// Discriminated Union pattern as described in the TypeScript Handbook
class VerifiedEmail {
    @serializable type = 'verified';
    @serializable address: EmailAddress;
    @serializable verificationDate: Date;

    constructor(address: EmailAddress,
                verificationDate: Date) {
        this.address = address;
        this.verificationDate = verificationDate;
    }
}

class UnverifiedEmail {
    @serializable type = 'unverified';
    @serializable pendingAddress: EmailAddress;

    constructor(pendingAddress: EmailAddress) {
        this.pendingAddress = pendingAddress;
    }
}

// TODO Can we do a decorator on this? Something to prevent mismatch of type and serializr schema
type UserEmail = VerifiedEmail | UnverifiedEmail;

const verifiedEmailSchema = createModelSchema(VerifiedEmail, {
    type: primitive(),
    address: primitive(),
    verificationDate: object(Date)
});

const unverifiedEmailSchema = createModelSchema(UnverifiedEmail, {
    type: primitive(),
    address: primitive(),
});

class User {
    @serializable(identifier())
    uuid = Math.random();

    @serializable displayName = 'John Doe';
    //@serializable(discriminatedUnion([verifiedEmailSchema, unverifiedEmailSchema], 'type')) email: UserEmail | null = null;
}

type LoadableUser = Loadable<User>;

class Message {
    @serializable message = 'Test';

    @serializable(object(User))
    author: LoadableUser = Loadable.NotStarted();

    // Self referencing decorators work in Babel 5.x and Typescript. See below for more.
    @serializable(list(object(Message)))
    comments = [];
}


// You can now deserialize and serialize!
const message = deserialize(Message, {
    message: 'Hello world',
    author: {
        type: 'Available',
        value: {
            uuid: 1,
            displayName: 'Alice',
            email: new VerifiedEmail('alice@example.com', new Date())
        }
    },
    comments: [
        {
            message: 'Welcome!',
            author: { uuid: 1, displayName: 'Bob' },
        },
    ],
});

logObject(message);

// We can call serialize without the first argument here
//because the schema can be inferred from the decorated classes

const jsonLike = serialize(message);
console.log(`\n\n\nJSONLike:\n${jsonLike}`);
const messageReified: Message = deserialize(Message, jsonLike);
console.log(`\n\n\nReified:\n`);
logObject(messageReified);
