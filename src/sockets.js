const Chat = require('./models/Chat');

module.exports = function (io) {

    let users = {};
    io.on('connection', async socket => {
        console.log("new user connect");

        let messages = await Chat.find({});
        socket.emit('load old msgs',  messages);
        
        socket.on('send message', async (data,cb) => {

            var msg = data.trim();

            if(msg.substr(0,3) === '/w ') {
                msg = msg.substr(3); //lo que sigue despúes del índice 3
                const index = msg.indexOf(' ');
                if(index !== -1) {
                    var name = msg.substr(0, index);
                    msg = msg.substr(index+1);
                    if(name in users && name !== socket.nickname) {
                        users[name].emit('whisper', {
                            msg,
                            nick : socket.nickname,
                        });
                        users[socket.nickname].emit('whisper', {
                            msg,
                            nick : socket.nickname,
                            to : name
                        });
                    } else {
                        cb('Error! please enter a valid user');
                    }
                } else {
                    cb('Error! Please enter your message');
                }
            } else {
                var newMsg = new Chat({
                    msg,
                    nick: socket.nickname
                });
                await newMsg.save();

                io.sockets.emit('new message', {
                    msg : data,
                    nick : socket.nickname
                });
            }
        });

        socket.on('new user', (data, cb) => {
            if (data in users) {
                cb(false);
            } else {
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                updateNickNames();
                io.sockets.emit('userconneted', socket.nickname);
            }
        });

        socket.on('disconnect', data => {
            if(!socket.nickname) return;
            delete users[socket.nickname];
            updateNickNames();
            io.sockets.emit('userdisconnect', socket.nickname);
        });

        function updateNickNames() {
            io.sockets.emit('usernames',  Object.keys(users));
        }
    });
}
