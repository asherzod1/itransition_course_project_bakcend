require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./sequelize');
const http = require('http')
const {Server} = require('socket.io')
const routes = require('./routes/routes');
const authRouter = require('./routes/auth');
const collectionRouter = require('./routes/collectionRoutes')
const collectionItemsRouter = require('./routes/collectionItemsRoutes')
const cors = require('cors');
const app = express();
const {User, Comment, CollectionItem} = require('./models/model')
const languageMiddleware = require("./middlewares/languageMiddleware");

const server = http.createServer(app)

const corsOrigin = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
const io = new Server(server, {
    cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"]
    }
})
// Middleware
app.use(bodyParser.json());
// Configure CORS
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(languageMiddleware)

// Route: Auth
app.use('', authRouter)
app.use('/collection', collectionRouter)
app.use('/collection-items', collectionItemsRouter)

// Middleware to verify JWT

app.use('', routes)

// Web socket for comments
const getCommentsByCollectionId = async (collectionItemId) =>{
    const comments = await Comment.findAll({
        where: {
            collectionItemId: collectionItemId
        },
        include: {
            model: User,
            as: 'user'
        }
    })
    return comments
}
io.on('connection', (socket) => {
    console.log('User connected', socket.id)
    socket.on('join_room', async ({collectionItemId, userId}) => {
        console.log("RoomID", collectionItemId, userId)
        socket.join(collectionItemId)
        const comments = await getCommentsByCollectionId(collectionItemId)
        socket.emit('comments', comments)
        socket.on('send_comment', async (data) => {
            console.log("Send comment", data)
            const comment = await Comment.create({
                text: data.message,
                UserId: data.userId,
                CollectionItemId: data.collectionItemId
            })
            console.log(comment)
            socket.emit('comments', await getCommentsByCollectionId(data.collectionItemId))
            socket.to(collectionItemId).emit('comments', await getCommentsByCollectionId(data.collectionItemId))
        })
    })
})
// End web socket for comments


app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
server.listen(8001, () => {
    console.log('Server is running on port 8000');
})
