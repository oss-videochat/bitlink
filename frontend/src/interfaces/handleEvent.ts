export type handleEvent<T = {}> = (data: T & { io: SocketIOClient.Socket }, cb: any) => void;
