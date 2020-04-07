// import { format } from "morgan";

$(function () {
    const socket = io();

    //obteniendo los elementos del DOM
    const $messageForm = $('#message-form')
    const $messageBox = $('#message')
    const $chat = $('#chat')

    //obteniendo los elementos del DOMdel  nickform
    const $nickForm = $('#nickForm')
    const $nickError = $('#nickError')
    const $nickname = $('#nickName')

    const $users = $('#usernames')

    $nickForm.submit(e => {
        e.preventDefault();
        if ($nickname.val() !== '') {
            socket.emit('new user', $nickname.val(), data => {
                if (data) {
                    $('#nickWrap').hide();
                    $('#contentWrap').show();
                } else {
                    $nickError.html(`
                            <div class="alert alert-danger">
                                That username already exists.
                            </div>
                        `);
                    $nickname.val('');
                }
            });
        }
    })

    //Events
    $messageForm.submit(e => {
        e.preventDefault();
        $messageBox.val();
        if ($messageBox.val() !== '') {
            socket.emit('send message', $messageBox.val(), data => {
                $chat.append(`
                <p class="error">${data}</p>
                `);
            });
            $messageBox.val('')
        }
    });

    socket.on('new message', function (data) {
        if (data.nick === $nickname.val()) {
            $chat.append(`<p class="transmitter"><b>Tú: </b>${data.msg}</p>`);
        } else {
            $chat.append(`<b>${data.nick}:</b> ${data.msg}<br/>`);
        }
        $('#chat').scrollTop($('#chat').prop('scrollHeight'));
    });

    socket.on('usernames', data => {
        let html = '';
        for (let i = 0; i < data.length; i++) {
            html += `<p class="color-gray"><i class="fas fa-user fa-2x"></i> ${data[i]}</p>`
        }
        $users.html(html);
    });

    socket.on('userconneted', data => {
        $chat.append(`
        <p class="text-center"><i>${data} se ha conectado</i><br/></p>
        `);
        $('#chat').scrollTop($('#chat').prop('scrollHeight'));
    })

    socket.on('userdisconnect', data => {
        $chat.append(`
        <p class="text-center"><i>${data} se ha desconectado</i><br/></p>
        `);
        $('#chat').scrollTop($('#chat').prop('scrollHeight'));
    })

    socket.on('whisper', data => {
        if (data.nick === $nickname.val()) {
            $chat.append(`
        <p class="whisper"><b>Dices a ${data.to}: ${data.msg}</p>
        `)
        } else {
            $chat.append(`
        <p class="whisper"><b>${data.nick} te dice</b>: ${data.msg}</p>
        `)
        }
        $('#chat').scrollTop($('#chat').prop('scrollHeight'));
    })

    socket.on('load old msgs', data => {
        for (let i = 0; i < data.length; i++) {
            $chat.append(`<b>${data[i].nick}:</b> ${data[i].msg}<br/>`);

        }
    })
    $('#chat').scrollTop($('#chat').prop('scrollHeight'));
})