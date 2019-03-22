// Desired syntax
const enum UserEmailTypes {
    Verified = 'verified',
    Unverified = 'unverified'
}

type DiscriminatedUnion<T> = {
    type: T
}

type Address = string;
class VerifiedEmail implements DiscriminatedUnion<UserEmailTypes> {
    public type = UserEmailTypes.Verified;
    public address: Address;
    public verificationDate: Date;

    constructor(address: Address,
                verificationDate: Date) {
        this.address = address;
        this.verificationDate = verificationDate;
    }
}

class UnverifiedEmail implements DiscriminatedUnion<UserEmailTypes> {
    public type = UserEmailTypes.Unverified;
    public address: Address;

    constructor(address: Address) {
        this.address = address;
    }
}

type DU<T> = T extends Array<infer U> ? U|U : T;
type UserEmailDU = DU<[VerifiedEmail, UnverifiedEmail]>;

type UserEmail = VerifiedEmail | UnverifiedEmail

function serialize<T extends DiscriminatedUnion<T>>(unionValue: DiscriminatedUnion<T>): string {
    // Pick serialization schema/strategy based on union
    return '';
}

function deserialize<T extends DiscriminatedUnion<T>>(stringified: string): T | null {
    // Pick serialization schema based on union
    return null;
}

const email: UserEmail = new VerifiedEmail('test@example.com', new Date());
//const stringified = serialize(email);
//const reified = deserialize<UserEmail>('');