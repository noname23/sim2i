const express = require("express");
const app = express();
const pg = require('pg');

const connectionString = 'postgres://postgres:123456@localhost:5432/sim2i';
const connection = new pg.Client(connectionString);

connection.connect();

const server = require("http").createServer(app);
const io = require("socket.io").listen(server);


app.get("/",function (req,res){
    res.sendFile(__dirname+"/index.html");
});

/*var msg = ['hay','hallo','hello','hei','hey',
           'apa kabar?','gmana kabarnya?','apa kabarnya'];
var asw = ['hay juga','hallo juga','hello juga','hei juga','hey juga',
           'sehat baik','alhamdulillah sehat','baik-baik saja'];*/

var msg = [];
connection.query("SELECT message FROM message", function(err,res) {
    if(err){
        console.log(err.stack)
    } else {
        for (var i = 0; i<res.rows.length; i++){
            msg.push(res.rows[i].message)
        }
    }
});

var asw = [];
connection.query("SELECT answer FROM answer", function(err,res) {
    if(err){
        console.log(err.stack)
    } else {
        for (var i = 0; i<res.rows.length; i++){
            asw.push(res.rows[i].answer)
        }
    }
});

io.sockets.on("connection", function(socket) {
    console.log("Refresh, Peer Connected..");

    socket.on("send message", function(data) {
        io.sockets.emit("on message", data);

        setTimeout(function () {
            if(msg.indexOf(data.message)!=-1){
                var messageIndex = msg.indexOf(data.message);

                io.sockets.emit("on message",{
                    message: "Sim2i menjawab: "+ asw[messageIndex]
                });
            }

        });

    });

});

server.listen(3000);