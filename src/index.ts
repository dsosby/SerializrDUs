import * as Example from './example';

const logObject = (tag: string, obj: any): void => {
    console.log(`${tag}:\n`);
    console.dir(obj, { colors: true, depth: 10 });
    console.log(`\n\n`);
}

logObject('Deserialized', Example.deserializedUser);
logObject('Serialized', Example.serializedUser);
logObject('DeserializedFromJson', Example.deserializedFromJson);

console.log('Updating via promise');
Example.asyncLoadableNote.then(loadableNote => logObject('LoadableNote', loadableNote));
