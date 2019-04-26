import { serializable, Clazz } from 'serializr';
import { discriminatedUnion } from './discriminatedUnions';

export class NotStarted {
    static readonly type = 'NotStarted';
    @serializable public readonly type = NotStarted.type;
}

export class InProgress {
    static readonly type = 'InProgress';
    @serializable public readonly type = InProgress.type;
}

export class Available<T> {
    static readonly type = 'Available';
    @serializable public readonly type = Available.type;
    constructor(public value: T) {}
}

export class LoadError {
    static readonly type = 'LoadError';
    @serializable public readonly type = LoadError.type;
    constructor(public errorMessage: string) {}
}

export type LoadableUpdate = NotStarted | InProgress | LoadError;
export type Loadable<T> = LoadableUpdate | Available<T>;
export const Loadable = {
    NotStarted: () => new NotStarted(),
    InProgress: () => new InProgress(),
    Available: function<T>(value: T) { return new Available(value) },
    LoadError: (errorMessage: string) => new LoadError(errorMessage)
}

/** Custom serializer for a Loadable<T> */
export function loadable<T>(valueClazz: Clazz<T>) {
    return discriminatedUnion(NotStarted, InProgress, LoadError, class AvailableInstance extends Available<T> {
        static readonly type = Available.type;
    });
}

/** Maps a Promise continuation to a Loadable state **/
export function promisedLoadable<T>(promisedValue: Promise<T>): Promise<Loadable<T>> {
    return promisedValue
        .then((value: T) => Loadable.Available(value))
        .catch(err => {
            // If canceled, could return Loadable.NotStarted()
            return Loadable.LoadError(`Something happened: ${err}`);
        });
}