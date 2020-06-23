import debug from 'debug';

export default function (name: string) {
    return debug(`BitLink:${name}`);
}
