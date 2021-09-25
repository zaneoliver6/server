const express     = require('express');
const app         = express();
var Answer        = require('./models/answer'); 
const mongoonse   = require('mongoose');

const webSocketServer = require('websocket').server;

const buildPath = '../form/build';
app.use(express.json());
app.use(express.static(buildPath));

var mongoDB = 'mongodb+srv://dbUser:eiAQwHJK12JA6VZm@zcluster.w8d4w.mongodb.net/code_test?retryWrites=true&w=majority';
mongoonse.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoonse.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));



app.post('/sendanswer', (req, res) => {
   console.log(req.body);
   //res.send(req.body);
   var answer_instance = new Answer(
      {
         answer: req.body.answer, 
         a_date: new Date()
      });
   
   answer_instance.save(function(err){
      if(err) {
         console.log(err);
         return 
      }
   });

   const answers = await Answer.
                     find().
                     limit(100).
                     sort({a_date: -1}).
                     select('answer').
                     exec();

   const json = {};
   json.data = {answers};
   
   sendMessage(JSON.stringify(json));

});

const server = app.listen(3000, () => {
   console.log('Server start on port 3000');
});

const wsServer = new webSocketServer({
   httpServer: server
});

const clients = {};

const sendMessage = (json) => {
   Object.keys(clients).map((client) => {
      clients[client].sendUTF(json);
   });
}

const getUniqueID = () => {
   const s4 = () => Math.floor((1 + Math.random()) *  0x10000).toString(16).substring(1);
   return s4() + s4() + '-' + s4();
};

wsServer.on('request', function(request){
   var userID = getUniqueID();
   console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');

   const connection = request.accept(null, request.origin);
   clients[userID] = connection;
   console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients))
});