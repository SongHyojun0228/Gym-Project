const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

async function connect() {
    try {
        const client = await MongoClient.connect(
            'mongodb+srv://thdgywns2300:3k95ZbJxEcAOnz02@gym.4vl2x.mongodb.net/?retryWrites=true&w=majority&appName=Gym',
            {
                useNewUrlParser: true, 
                useUnifiedTopology: true,
            }
        );
        database = client.db('Gym'); 
        console.log('MongoDB Atlas 연결 성공');
    } catch (error) {
        console.error('MongoDB Atlas 연결 실패:', error);
        throw error;
    }
}

function getDb() {
    if (!database) {
        throw {
            message: 'Database connection not established!',
        };
    }
    return database;
}

module.exports = {
    connectToDatabase: connect,
    getDb: getDb,
};
