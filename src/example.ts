import { deserialize, serialize } from 'serializr';
import { Note, User, UserEmail, UnverifiedEmail, VerifiedEmail } from './models';
import { getUpdatedNote } from './api';
import { Loadable, promisedLoadable } from './loadable';

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

const SampleNote = new Note('id1234', 'This is a cool product');

export const sampleUser = new User("David Sample", new VerifiedEmail("verified@example.com", new Date()));
// Deserialized objects a) conform to the schema b) have associated constructor c) unsafe to stringify
export const deserializedUser: User = deserialize(User, sampleUser);
// Serialized objects a) are safe to stringify b) match the schema c) do not have associated constructor
export const serializedUser = serialize(deserializedUser);
// Simulate data coming over network
export const deserializedFromJson = deserialize(User, JSON.parse('{ "name": "Jason Sample", "email": { "type": "unverified", "address": "unverified@example.com" } }'));
// Simulate bad data coming over network -- will throw on deserialize (Unexpected object)
// export const badFromJson = deserialize(User, JSON.parse('{ "name": "Jason Sample", "email": "badStructure@example.com" }'));

// Example using loadable from promise
export const asyncLoadableNote: Promise<Loadable<Note>> = promisedLoadable(getUpdatedNote());
