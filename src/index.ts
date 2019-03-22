import {
    createModelSchema,
    primitive,
    reference,
    list,
    object,
    identifier,
    serialize,
    deserialize,
    getDefaultModelSchema,
    serializable,
} from 'serializr';

type EmailAddress = string;

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

type UserEmail = VerifiedEmail | UnverifiedEmail;

class User {
    @serializable(identifier())
    uuid = Math.random();

    @serializable displayName = 'John Doe';
    // @serializable email: UserEmail | null = null;
}

class Message {
    @serializable message = 'Test';

    @serializable(object(User))
    author = null;

    // Self referencing decorators work in Babel 5.x and Typescript. See below for more.
    @serializable(list(object(Message)))
    comments = [];
}

// You can now deserialize and serialize!
const message = deserialize(Message, {
    message: 'Hello world',
    author: {
        uuid: 1,
        displayName: 'Alice',
        email: new VerifiedEmail('alice@example.com', new Date())
    },
    comments: [
        {
            message: 'Welcome!',
            author: { uuid: 1, displayName: 'Bob' },
        },
    ],
});

console.dir(message, { colors: true, depth: 10 });

// We can call serialize without the first argument here
//because the schema can be inferred from the decorated classes

const json = serialize(message);