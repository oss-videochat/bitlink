import {APIResponseCallback} from "../models/APIResponse";
import * as socketio from "socket.io";
import {Participant} from "./Participant";
import {Room} from "./Room";

export type handleSocketEvent<T = {}> = (data: T & {socket: socketio.Socket}, cb: APIResponseCallback) => void;
export type handleParticipantEvent<T = {}> = (data: T & {participant: Participant, room: Room}, cb: APIResponseCallback) => void;
