import {debug} from 'debug';

const log = debug('BitLink');

export default function (name: string) {
    return log.extend(name);
}
