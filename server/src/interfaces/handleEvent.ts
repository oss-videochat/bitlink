import * as socketio from "socket.io";
import {Participant} from "./Participant";
import {Room} from "./Room";


export interface APIResponse<T = any> {
    success: boolean,
    error: string | null,
    data?: T | any,
    status: number
}

export interface APIResponseCallback {
    (response: APIResponse): void
}

export type handleSocketEvent<T = {}> = (data: T & { socket: socketio.Socket }, cb: APIResponseCallback) => void;
export type handleParticipantEvent<T = {}> = (data: T & { participant: Participant, room: Room }, cb: APIResponseCallback) => void;
