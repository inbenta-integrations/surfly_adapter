window.buildUI = function() {

    //Check if window is not in Surfly iframe
    if (window.parent.location.ctx === undefined) {

        var authorization = {
            inbentaKey: '',
            domainKey: ''
        };

        var config = {
            launcher: {
                title: 'Need Help?'
            },
            environment: 'development',
            answers: {
                maxOptions: 3,
                maxRelatedContents: 3,
                skipLastCheckQuestion: true
            },
            showActivityOnDelay: 2000,
            ratingPosition: 'conversationWindow',
            sanitizerOptions: {
                allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'iframe'
                ],
                allowedAttributes: {
                    a: ['href', 'name', 'target'],
                    iframe: ['src'],
                    img: ['src']
                },
                allowedClasses: {
                    'p': ['test']
                }
            },
            relatedContentsExpand: true,
            tracking: {
                userInfo: {
                    browserInfo: navigator.userAgent
                }
            },
            lang: 'en',
            labels: {
                en: {
                    'interface-title': 'Inbenta Bot',
                    'cobrowsing-request': 'Agent is requesting to start a cobrowsing session.',
                    'cobrowsing-start': 'Cobrowse is starting, please wait',
                    'cobrowsing-refused-user' : 'Alright, we understand you don\'t want to cobrowse',
                    'cobrowsing-refused-agent': 'Cobrowsing refused',
                    'accept': 'Accept',
                    'deny': 'Deny'
                }
            },
            closeButton: {
                visible: true
            },
            adapters: [],
        };

        SDKHCAdapter.configure({
            appId: '',
            region: '',
            room: function() {
                return '1';
            },
            importBotHistory: true,
            transcript: {
                download: false
            }
        });

        config.adapters = [
            Cobrowse(config.labels, config.lang),
            SDKNLEscalation2(SDKHCAdapter.checkEscalationConditions),
            SDKHCAdapter.build(),
        ];

        InbentaChatbotSDK.buildWithDomainCredentials(authorization, config);
    }
};
