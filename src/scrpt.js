const xPositions = ['left', 'right'];
const yPositions = ['top', 'bottom'];
const nm = 'scrpt';
const chatWidth = '400px';
const domain = 'http://161.35.71.150';
class Scrpt {
    loadInterval;
    constructor({ position = 'bottom-right', appName = '' } = {}) {
        this.position = this.getPosition(position);
        this.open = false;
        this.inputText = '';
        this.topics = [];
        this.appName = appName;

        if (!position.includes('-')) {
            throw new Error("position must include - symbol. for example bottom-right");
        }
        if (!yPositions.includes(position.split('-')[0])) {
            throw new Error("y position must be top or bottom");
        }
        if (!xPositions.includes(position.split('-')[1])) {
            throw new Error("x position must be left or right");
        }
        if (appName === '') {
            throw new Error("invalid app name");
        }
        this.getChatInitialData(appName).then(_ => {
            this.initialize();
        });
        this.createStyles();
    }

    detectMob() {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];

        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });
    }

    getPosition(position) {
        const [y, x] = position.split('-');
        return {
            [y]: '40px',
            [x]: '40px',
        };
    }

    initialize() {
        const container = this.dce('div');
        container.style.position = 'fixed';
        container.style.zIndex = '9999';
        Object.keys(this.position)
            .forEach(key => container.style[key] = this.position[key]);

        document.body.appendChild(container);

        const buttonContainer = this.dce('div');
        buttonContainer.classList.add(`${nm}-button-container`);

        const chatIcon = this.dce('img');
        chatIcon.src = `https://icons.getbootstrap.com/assets/icons/chat-dots.svg`;
        chatIcon.classList.add(`${nm}-icon`);
        this.chatIcon = chatIcon;

        const closeIcon = this.dce('img');
        closeIcon.src = `https://icons.getbootstrap.com/assets/icons/x.svg`;
        closeIcon.classList.add(`${nm}-icon`, `${nm}-hidden`);
        this.closeIcon = closeIcon;

        this.chatContainer = this.dce('div');
        this.chatContainer.classList.add(`${nm}-hidden`, `${nm}-chat-container`);
        this.chatContainer.style.width = this.detectMob() ? (window.innerWidth - 15) + 'px' : chatWidth;
        this.chatContainer.style.bottom = this.detectMob() ? "-18px" : '75px';

        this.createChatContainerContent();
        this.chatContent.style.height = this.detectMob() ? (window.innerHeight - 230) + 'px' : "500px";

        buttonContainer.appendChild(this.chatIcon);
        buttonContainer.appendChild(this.closeIcon);

        buttonContainer.addEventListener('click', this.toggleOpen.bind(this));

        container.appendChild(this.chatContainer);
        container.appendChild(buttonContainer);
        this.chatContent.innerHTML += this.chatStripe(true, this.welcomeMessage, '');
    }

    createStyles() {
        const styleTag = this.dce('style');
        document.head.appendChild(styleTag);
        styleTag.innerHTML = `
 .${nm}-clearfix::after {content: "";clear: both;display: table;}.${nm}-topics{position:absolute; right:0;bottom:60px; padding:0 13px 10px 0; z-index:11} .${nm}-topics-tags{height:0px;padding-left: 5px;
    list-style-type: none;display: block;overflow-y: scroll;position: absolute;bottom: 60px; transition:transform .3s ease; z-index:10}.${nm}-topics-tags li{ display:inline-block; float:left; margin-left: 5px;padding: 2px;     background: linear-gradient(to bottom right, #4294e3, #8f12fd);
color: white;border-radius: 7px;font-size: 14px;margin-bottom: 3px;} .${nm}-icon {cursor: pointer;width: 65%;position: absolute;top: 11px;left: 13px;transition: transform .3s ease;filter: invert(1);}.${nm}-hidden {transform: scale(0);}.${nm}-button-container {background: linear-gradient(to bottom right, #4294e3, #8f12fd);width: 70px;height: 70px;border-radius: 50%;}.${nm}-chat-container {box-shadow: 0 0 18px 8px rgba(0,0,0, 0.1);right: -25px;bottom: 75px;position: absolute;transition: max-height .2s ease;background-color: white;border-radius: 10px;}.${nm}-chat-container.hidden {max-height: 0px;}.${nm}-scrpt-header {display: inline-block;width: 100%;margin: 0;padding: 10px;color: white;background: linear-gradient(to bottom right, #4294e3, #8f12fd);border-top-left-radius: 10px;border-top-right-radius: 10px;}.${nm}-chat-container form input {padding: 20px;display: inline-block;width: calc(100% - 50px);border: 0px;background-color: #f7f7f7;}.${nm}-chat-container form input:focus {outline: none;}.${nm}-chat-send {cursor: pointer;display: inline-block;padding: 20px 14px;background-color: #f7f7f7;}.${nm}-scrpt-chat-bottom-menu {padding-top: 20px;list-style-type: none;text-align: center;padding-left: 0px;margin-left: 0px;}.${nm}-scrpt-chat-bottom-menu li {display: inline-block;padding-left: 30px;padding-right: 30px;cursor: pointer;}.${nm}-bottom-menu-icon {padding-bottom: 8px;display: inline-block; width: 20px;}.${nm}-chat-content {display: block;width: 100%;padding: 10px;overflow-y: scroll;position: relative;box-shadow: 0 4px 2px -2px rgba(0,0,0, 0.1);}.${nm}-close-button, .${nm}-fullscreen-button {border: 0px;background-color: white;border-radius: 100%;padding-bottom: 3px;float: right;margin-left: 4px;}.${nm}-msg-box {display: inline-block;width:80%;}.${nm}-msg-box p {padding: 7px;}.${nm}-income {float: left;}.${nm}-outcome {float: right;}.${nm}-bubble-outcome {    background: linear-gradient(to bottom right, #4294e3, #8f12fd);color: white;border-top-left-radius: 10px;border-top-right-radius: 10px;border-bottom-left-radius: 10px;}.${nm}-bubble-income {background-color: #f7f7f7;color: #424242;border-top-left-radius: 10px;border-top-right-radius: 10px;border-bottom-right-radius: 10px;}
        `;
    }

    createChatContainerContent() {
        const clrfx = this.dce('span');
        clrfx.classList.add(`${nm}-clearfix`);

        this.chatContainer.innerHTML = '';
        const title = this.dce('div');
        title.classList.add(`${nm}-scrpt-header`);

        const closeButton = this.dce('button');
        let closeImg = this.dce('img');
        closeImg.src = this.closeIcon.src;
        closeButton.appendChild(closeImg);
        closeButton.classList.add(`${nm}-close-button`);
        closeButton.addEventListener("click", () => this.closeChat());

        title.appendChild(closeButton);

        this.fullScreenButton = this.dce('button');
        let expandImg = this.dce('img');
        expandImg.src = `https://icons.getbootstrap.com/assets/icons/arrows-angle-expand.svg`;
        this.fullScreenButton.appendChild(expandImg);
        this.fullScreenButton.classList.add(`${nm}-fullscreen-button`);
        this.fullScreenButton.addEventListener("click", () => this.fullscreenchat());
        title.appendChild(this.fullScreenButton);


        const form = this.dce('form');
        form.style.position = 'relative';
        form.classList.add(`${nm}-content`);

        const text = this.dce('input');
        text.requered = true;
        text.id = `${nm}-text`;
        text.type = "text";
        text.placeholder = this.inputText;

        this.topicsTags = this.dce('ul');
        this.topicsTags.setAttribute('id', `${nm}-topics-tags`);
        this.topicsTags.classList.add(`${nm}-topics-tags`);

        let btnDiv = this.dce('div');
        this.btn = this.dce('img');
        this.btn.src = `https://icons.getbootstrap.com/assets/icons/send.svg`;
        btnDiv.classList.add(`${nm}-chat-send`);
        this.btn.style.width = "20px";
        btnDiv.appendChild(this.btn);

        this.chatContent = this.dce('div');
        this.chatContent.classList.add(`${nm}-chat-content`);

        this.topicBtn = this.dce('img');
        this.topicBtn.classList.add(`${nm}-topics`);
        this.topicBtn.setAttribute('role', 'button');
        this.topicBtn.setAttribute('id', `${nm}-topics-img`);
        this.topicBtn.src = 'https://icons.getbootstrap.com/assets/icons/book.svg';
        form.appendChild(this.chatContent);
        form.appendChild(clrfx);
        this.listTopics();
        form.appendChild(text);
        form.appendChild(btnDiv);
        form.appendChild(this.topicsTags);
        form.appendChild(this.topicBtn);
        form.addEventListener('submit', this.submit.bind(this));

        document.body.addEventListener('click', (event) => this.handleTopics(this, event));

        const bottomMenuContainer = this.dce('ul');
        bottomMenuContainer.classList.add(`${nm}-scrpt-chat-bottom-menu`);

        const bottomMenuContainerItems = [
            {
                icon: `https://icons.getbootstrap.com/assets/icons/house.svg`,
                text: 'Home',
                click: function () {
                }
            },
            {
                icon: this.chatIcon.src,
                text: 'Chat',
                click: function () {
                }
            },
            {
                icon: `https://icons.getbootstrap.com/assets/icons/question-circle.svg`,
                text: 'Help',
                click: function () {
                }
            },
        ];

        bottomMenuContainerItems.forEach(item => {
            let li = this.dce('li');
            let span = this.dce('img');
            span.classList.add(`${nm}-bottom-menu-icon`);
            span.src = item.icon;
            span.onclick = item.click;
            li.appendChild(span);
            let br = this.dce('br');
            li.appendChild(br);
            let text = this.dce('span');
            text.innerHTML = item.text;
            li.appendChild(text);
            bottomMenuContainer.appendChild(li);
        });

        this.chatContainer.appendChild(title);
        this.chatContainer.appendChild(form);
        this.chatContainer.appendChild(clrfx);
        this.chatContainer.appendChild(bottomMenuContainer);
    }

    async submit(e) {
        e.preventDefault();
        let inpt = document.getElementById(`${nm}-text`);
        let q = inpt.value;
        if (q.trim() === '') {
            return;
        }
        inpt.disabled = true;
        inpt.value = '';

        await this.sendQuestion(q);

    }

    async sendQuestion(q) {
        let id = this.generateUniqueId();
        this.chatContent.innerHTML += this.chatStripe(false, q, '');
        this.btn.disabled = true;
        this.blurAll();
        let result = await this.makeRequest("POST", `${domain}/api/projects/${this.appName}/answer`, {
            question: q
        });
        result = JSON.parse(result);
        this.chatContent.innerHTML += this.chatStripe(true, ' ', id);
        const messageDiv = document.getElementById(id);

        this.typeText(messageDiv, result.answer);
    }

    toggleOpen() {
        this.open = !this.open;
        if (this.open) {
            this.openChat();
        } else {
            this.closeChat();
        }

    }

    listTopics() {
        this.topicsTags.innerHTML = '';
        this.topics.map((item) => {
            const singleTopic = this.dce('li');
            singleTopic.setAttribute('role', 'button');
            singleTopic.innerText = item.title;
            singleTopic.onclick = async (e) => {
                if (this.topics.length > 0) {
                    let idx = this.topics.findIndex(item => { return item.title === e.target.innerText });
                    this.topics.splice(idx, 1);
                    this.listTopics();
                    this.toggleTopics();
                    await this.sendQuestion(`Tell me more about ${item.title}`);

                }

            };
            this.topicsTags.appendChild(singleTopic);
        });
    }

    handleTopics(obj, e) {
        if (e.target.id == `${nm}-topics-img`) {
            this.toggleTopics();
        };
    }

    toggleTopics() {
        let tagsElement = document.getElementById(`${nm}-topics-tags`);
        if (tagsElement.clientHeight === 0) {
            tagsElement.style.height = '84px';
            this.topicBtn.src = `https://icons.getbootstrap.com/assets/icons/x.svg`;
        } else {
            tagsElement.style.height = '0px';
            this.topicBtn.src = `https://icons.getbootstrap.com/assets/icons/book.svg`;
        }
    }

    fullscreenchat() {
        if (this.chatContainer.style.width === chatWidth) {
            this.chatContainer.style.width = `${window.innerWidth - 30}px`;
            this.chatContainer.style.height = `${window.innerHeight - 125}px`;
        } else {
            this.chatContainer.style.width = this.detectMob() ? (window.innerWidth - 17) + 'px' : chatWidth;
            this.chatContainer.style.bottom = this.detectMob() ? "-18px" : '75px';
            this.chatContainer.style.height = `auto`;
        }
    }

    closeChat() {
        this.open = false;
        this.chatIcon.classList.remove(`${nm}-hidden`);
        this.closeIcon.classList.add(`${nm}-hidden`);
        this.chatContainer.classList.add(`${nm}-hidden`);
    }

    openChat() {
        this.chatIcon.classList.add(`${nm}-hidden`);
        this.closeIcon.classList.remove(`${nm}-hidden`);
        this.chatContainer.classList.remove(`${nm}-hidden`);
    }

    typeText(element, text) {
        let index = 0;
        let interval = setInterval(() => {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
                this.chatContent.scrollTop = this.chatContent.scrollHeight;
            } else {
                clearInterval(interval);
                let inpt = document.getElementById(`${nm}-text`);
                inpt.disabled = false;
                this.btn.disabled = false;
            }
        }, 20);
    }

    uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    generateUniqueId() {
        return this.uuidv4();
    }

    chatStripe(isAi, value, uniqueID) {
        return (`
              <div class="${nm}-msg-box ${isAi ? `${nm}-income` : `${nm}-outcome`}">
                <p id="${uniqueID}" class="${!isAi ? `${nm}-bubble-outcome` : `${nm}-bubble-income`}">${value}</p>
              </div>
        `);
    };


    async getChatInitialData(appName) {
        let result = await this.makeRequest("GET", `${domain}/api/projects/${appName}/init`);
        let data = JSON.parse(result);
        this.welcomeMessage = data.data.welcome_message;
        this.inputText = data.data.input_text;
        this.topics = data.topics;
    }

    dce(el) {
        return document.createElement([el]);
    }

    blurAll() {
        var tmp = document.createElement("input");
        document.body.appendChild(tmp);
        tmp.focus();
        document.body.removeChild(tmp);
    }

    makeRequest(method, url, params = {}) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader('Content-type', 'application/json')
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            if (Object.keys(params).length !== 0) {
                xhr.send(JSON.stringify(params));
            } else {
                xhr.send();
            }
        });
    }
}