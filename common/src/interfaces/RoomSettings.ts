import {HostDisconnectAction} from "..";

export interface RoomSettings {
    name: string
    waitingRoom: boolean,
    hostDisconnectAction: HostDisconnectAction
}
