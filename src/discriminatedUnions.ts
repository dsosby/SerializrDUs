import { serialize, deserialize } from 'serializr';

// Thoughts from here: https://github.com/mobxjs/serializr/issues/65

// Implementing custom serializr supporting DUs with 'type' field
export interface UnionClazz {
    new(...args: any): {};
    type: string;
}

export function discriminatedUnion<U extends UnionClazz>(...unionClazzes: UnionClazz[]) {
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

