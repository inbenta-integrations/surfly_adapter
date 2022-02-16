var sessionInfo = null;

Surfly.init(settings, function(initResult) {
    if (initResult.success) {
        if (!Surfly.isInsideSession) {
            sessionInfo = Surfly.session();
        }
    } else {
        console.log("Surfly was unable to initialize properly.")
    }

    Surfly.on('session_ended', function(session) {
        localStorage.surflySessionId = '';
    });
});

var Cobrowse = function(labels, lang) {
    return function(chatBot) {

        if (localStorage.hyperchatSessionId === undefined || localStorage.hyperchatSessionId === null) {
            localStorage.hyperchatSessionId = '';
        }

        function surflySessionStart() {
            sessionInfo.create();
            Surfly.on('session_created', function(session) {
                let hyperchatSessionId = localStorage.hyperchatSessionId;
                let messageToAgent = 'Agent cobrowsing: ' + session.followerLink;
                ICF.Lobby.chats[hyperchatSessionId].sendMessage(messageToAgent).then((data) => {
                    localStorage.surflySessionId = session._sessionId;
                    session.startLeader();
                });
            });
        }

        function surflyCloseSession() {
            let surflySessionId = localStorage.surflySessionId;
            if (surflySessionId !== undefined && surflySessionId !== null && surflySessionId !== '') {
                let nameData = { source: 'default' };
                chatBot.actions.setChatbotName(nameData);
                setTimeout(function() {
                    localStorage.surflySessionId = '';
                    sessionInfo.end();
                }, 1000);
            }
        }

        function showConfirmCobrowsing() {
            let systemMessageData = {
                id: 'cobrowsing_modal',
                modal: true,
                translate: true,
                message: 'cobrowsing-request',
                options: [
                    {
                        label: 'accept',
                        value:'accept',
                        translate: true
                    },
                    {
                        label: 'deny', 
                        value:'deny',
                        translate: true
                    }
                ]
            }
            chatBot.actions.displaySystemMessage(systemMessageData);
        }

        function cleanMessage(message) {
            if (message.indexOf('<') === -1) return message;
            let div = document.createElement("div");
            div.innerHTML = message;
            return div.innerText.trim();
        }

        chatBot.subscriptions.onDisplaySystemMessage(function(data, next) {
            //Validate if the Hyperchat conversation finished
            if (data.message !== undefined && data.message === 'chat-closed') {
                localStorage.hyperchatSessionId = '';
                surflyCloseSession();
            }
            return next(data);
        });

        chatBot.subscriptions.onDisplayChatbotMessage(function(messageData, next) {
            if (messageData.user === undefined) return next(messageData);
            if (messageData.user === '') return next(messageData);

            let message = cleanMessage(messageData.message);
            let keyWords = ['Start cobrowsing', '[Cobrowsing]'];
            if (keyWords.find((str) => str === message) === undefined) return next(messageData);
            if (Surfly.isInsideSession) return next(messageData);
            
            showConfirmCobrowsing();
            return next(messageData);
        });

        chatBot.subscriptions.onSetExternalInfo(function(escalationData, next) {
            if (escalationData.chatId !== undefined && escalationData.chatId.trim() !== '') {
                //Store the Hyperchat session id when escalation starts
                localStorage.hyperchatSessionId = escalationData.chatId;
            }
            return next(escalationData);
        });

        chatBot.subscriptions.onSelectSystemMessageOption(function(optionData, next) {
            if (optionData.id !== "cobrowsing_modal") return next(optionData);

            let messageData = {
                type: 'answer',
                translate: true,
                message: 'cobrowsing-start'
            }
            if (optionData.option.value === 'accept') {
                surflySessionStart();
            } else {
                messageData.message = 'cobrowsing-refused-user';
                let messageToAgent = labels[lang]['cobrowsing-refused-agent'];
                let hyperchatSessionId = localStorage.hyperchatSessionId;
                ICF.Lobby.chats[hyperchatSessionId].sendMessage(messageToAgent);
            }
            chatBot.actions.displayChatbotMessage(messageData);
            return next(optionData);
        });
    } // return chatbot
}
