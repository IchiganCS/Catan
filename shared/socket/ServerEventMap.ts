import { AuthToken } from "../authentication/AuthToken"
import { AnyLogin } from "../authentication/AuthObject"
import { LobbyRoom, RedactedGameRoom, RoomId } from "../Room"
import { RedactedGameState } from "../logic/GameState"
import { Settings } from "../logic/Settings"
import { RequestGameAction } from "../logic/GameAction"

export type ServerEventMap = LoginServerEventMap & RoomServerEventMap & GameServerEventMap

export type Callback<T> = (arg: T) => void

export type GameServerEventMap = {
    fullGameRoom: (room: RoomId, token: AuthToken, cb: Callback<RedactedGameRoom | 'invalid token' | 'invalid room id'>) => void
    gameState: (room: RoomId, token: AuthToken, cb: Callback<RedactedGameState | 'invalid token' | 'invalid room id'>) => void
    gameAction: (room: RoomId, token: AuthToken, action: RequestGameAction, cb: Callback<true | 'invalid token' | 'invalid room id'| 'action not allowed'>) => void
}

export type RoomServerEventMap = {
    lobbyList: (cb: Callback<LobbyRoom[]>) => void
    createAndJoin: (roomName: string, token: AuthToken, cb: Callback<LobbyRoom | 'room name in use' | 'invalid token'>) => void
    join: (roomId: RoomId, token: AuthToken, cb: Callback<LobbyRoom | 'invalid room id' | 'invalid token' | 'room is ingame' | 'user already joined'>) => void
    leave: (roomId: RoomId, token: AuthToken, cb: Callback<true | 'invalid token' | 'invalid room id'>) => void
}

export type LobbyServerEventMap = {
    startGame: (roomId: RoomId, token: AuthToken, cb: Callback<true | 'no such room id' | 'not the owner' | 'invalid token'>) => void
    changeSettings: <Property extends keyof Settings>(
        roomId: RoomId, 
        token: AuthToken, 
        setting: Property,
        value: Settings[Property],
        cb: Callback<true | 'invalid room id' | 'not the owner' | 'invalid token' | 'room is ingame'>) => void
}

export type LoginServerEventMap = {
    login: (data: AnyLogin) => void
    logout: (id: AuthToken) => void
}
