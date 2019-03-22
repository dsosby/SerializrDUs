import * as DU from './discriminatedUnions';

const logObject = (tag: string, obj: any): void => {
    console.log(`${tag}:\n`);
    console.dir(obj, { colors: true, depth: 10 });
    console.log(`\n\n`);
}

logObject('Deserialized', DU.deserializedUser);
logObject('Serialized', DU.serializedUser);
logObject('DeserializedFromJson', DU.deserializedFromJson);

