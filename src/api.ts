/* Demo of Async API */
import { Note } from './models';

export function getUpdatedNote(): Promise<Note> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(new Note(new Date().toUTCString(), 'Sample note from fake API'));
        }, 500);
    });
}
