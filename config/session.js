const expressSession = require("express-session");
const mongodbStore = require("connect-mongodb-session");

function createSessionStore(session) {
    const MongoDBStore = mongodbStore(session);

    const sessionStore = new MongoDBStore({
        uri: "mongodb+srv://thdgywns2300:oF4luy5LHKI7Cah3@gym.4vl2x.mongodb.net/Gym?retryWrites=true&w=majority&appName=Gym",
        databaseName: "Gym",
        collection: "sessions",
    });

    return sessionStore;
}

function createSessionConfig() {
    return {
        secret: "super-secret",
        resave: false,
        saveUninitialized: false,
        store: createSessionStore(expressSession),
        cookie: {
            maxAge: 12 * 60 * 60 * 1000,
            httpOnly: true,
        }
    };
}

module.exports = createSessionConfig;
