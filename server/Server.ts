import { BuildingType, ClientEventMap, Color, GuestLogin, MemberLogin, ServerEventMap, SocketPort, UserWithAuth, defaultBoard } from "shared"
import { Server } from "socket.io"
import { addGuest, checkUser, removeUser } from "./authentication/AuthIdMap"

const io = new Server<ServerEventMap, ClientEventMap, {}, UserWithAuth>(SocketPort, {
    cors: {
        origin: '*',
        allowedHeaders: ['Access-Control-Allow-Origin']
    }
})

console.log('Server is listening.')

const board = defaultBoard(0)
board.roads.push([Color.Red, [6,6], [7,6]])
board.buildings.push([Color.Green, [4,4], BuildingType.Settlement])

io
.use((socket, next) => {
    const auth = socket.handshake.auth as GuestLogin | MemberLogin
    if (auth.type == 'guest') {
        const id = addGuest(auth)
        if (id == undefined)
            next(new Error('Name already in use'))
        else {
            const user: UserWithAuth = { isGuest: true, name: auth.name, authId: id }
            socket.emit('loggedIn', user)
            socket.data = user
            next()
        }
    }
    else if (auth.type == 'member')
        next(new Error('Not implemented'))
    else 
        next(new Error('malformed auth object'))
})
.on('connection', socket => {
    socket.on('stateRequest', id => {
        if (!checkUser(id)) {
            socket.emit('rejectedRequestInvalidId')
            return
        }

        socket.emit('state', { board })
    })

    socket.on('disconnect', (reason, desc) => {
        removeUser(socket.data.authId, socket.data.name)
    })
})