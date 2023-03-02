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

    getPosition(position) {
        const [y, x] = position.split('-');
        return {
            [y]: '40px',
            [x]: '40px',
        };
    }

    initialize() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.zIndex = '9999';
        Object.keys(this.position)
            .forEach(key => container.style[key] = this.position[key]);

        document.body.appendChild(container);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add(`${nm}-button-container`);

        const chatIcon = document.createElement('span');
        chatIcon.innerHTML =
            `<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" class="bi bi-chat-dots" viewBox="0 0 16 16">
        <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
        <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
        </svg>`;
        chatIcon.classList.add(`${nm}-icon`);
        this.chatIcon = chatIcon;

        const closeIcon = document.createElement('span');
        closeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>`;
        closeIcon.classList.add(`${nm}-icon`, `${nm}-hidden`);
        this.closeIcon = closeIcon;

        this.chatContainer = document.createElement('div');
        this.chatContainer.classList.add(`${nm}-hidden`, `${nm}-chat-container`);
        this.chatContainer.style.width = chatWidth;

        this.createChatContainerContent();

        buttonContainer.appendChild(this.chatIcon);
        buttonContainer.appendChild(this.closeIcon);

        buttonContainer.addEventListener('click', this.toggleOpen.bind(this));

        container.appendChild(this.chatContainer);
        container.appendChild(buttonContainer);
        this.chatContent.innerHTML += this.chatStripe(true, this.welcomeMessage, '');
    }

    createStyles() {
        const styleTag = document.createElement('style');
        document.head.appendChild(styleTag);
        styleTag.innerHTML = `
        ${nm}-button-container,${nm}-scrpt-header{background:linear-gradient(to bottom right,#4294e3,#8f12fd)}${nm}-clearfix::after{content:"";clear:both;display:table}${nm}-icon{cursor:pointer;width:100%;position:absolute;top:11px;left:13px;transition:transform .3s;color:#fff}${nm}-hidden{transform:scale(0)}${nm}-button-container{width:70px;height:70px;border-radius:50%}${nm}-chat-container{box-shadow:0 0 18px 8px rgba(0,0,0,.1);right:-25px;bottom:75px;position:absolute;transition:max-height .2s;background-color:#fff;border-radius:10px}${nm}-chat-container.hidden{max-height:0}${nm}-scrpt-header{display:inline-block;width:100%;margin:0;padding:10px;color:#fff;border-top-left-radius:10px;border-top-right-radius:10px}${nm}-chat-container form input{padding:20px;display:inline-block;width:calc(100% - 50px);border:0;background-color:#f7f7f7}${nm}-chat-container form input:focus{outline:0}${nm}-chat-container form button{cursor:pointer;color:#8f12fd;background-color:#f7f7f7;border:0;border-radius:4px;padding:20px 10px}${nm}-scrpt-chat-bottom-menu{padding-top:20px;list-style-type:none;text-align:center;padding-left:0;margin-left:0}${nm}-scrpt-chat-bottom-menu li{display:inline-block;padding-left:30px;padding-right:30px;cursor:pointer}${nm}-bottom-menu-icon{padding-bottom:5px;display:inline-block}${nm}-chat-content{display:block;width:100%;padding:10px;height:510px;overflow-y:scroll;position:relative;box-shadow:0 4px 2px -2px rgba(0,0,0,.1)}${nm}-fullscreen-button{border:0;background-color:#fff;border-radius:100%;padding-bottom:3px;float:right;margin-left:4px}${nm}-bubble-income,${nm}-bubble-outcome{border-top-left-radius:10px;border-top-right-radius:10px}${nm}-msg-box{display:inline-block;width:80%}${nm}-msg-box p{padding:7px}${nm}-income{float:left}${nm}-outcome{float:right}${nm}-bubble-outcome{background-color:gray;color:#fff;border-bottom-left-radius:10px}${nm}-bubble-income{background-color:#f7f7f7;color:#424242;border-bottom-right-radius:10px}
        `;
    }

    createChatContainerContent() {
        const clrfx = document.createElement('span');
        clrfx.classList.add(`${nm}-clearfix`);

        this.chatContainer.innerHTML = '';
        const title = document.createElement('div');
        title.classList.add(`${nm}-scrpt-header`);

        const closeButton = document.createElement('button');
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg> `;
        closeButton.classList.add(`${nm}-close-button`);
        closeButton.addEventListener("click", () => this.closeChat());

        title.appendChild(closeButton);

        this.fullScreenButton = document.createElement('button');
        this.fullScreenButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrows-angle-expand" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z"/>
      </svg>`;
        this.fullScreenButton.classList.add(`${nm}-fullscreen-button`);
        this.fullScreenButton.addEventListener("click", () => this.fullscreenchat());
        title.appendChild(this.fullScreenButton);


        const form = document.createElement('form');
        form.classList.add(`${nm}-content`);

        const text = document.createElement('input');
        text.requered = true;
        text.id = `${nm}-text`;
        text.type = "text";
        text.placeholder = this.inputText;

        this.btn = document.createElement('button');
        this.btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" fill="currentColor" class="bi bi-send-fill" viewBox="0 0 16 16">
        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
      </svg>`;

        this.chatContent = document.createElement('div');
        this.chatContent.classList.add(`${nm}-chat-content`);
        form.appendChild(this.chatContent);
        form.appendChild(clrfx);

        form.appendChild(text);
        form.appendChild(this.btn);
        form.addEventListener('submit', this.submit.bind(this));


        const bottomMenuContainer = document.createElement('ul');
        bottomMenuContainer.classList.add(`${nm}-scrpt-chat-bottom-menu`);

        const bottomMenuContainerItems = [
            {
                icon: `
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
                <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                </svg>`,
                text: 'Home',
                click: function () {
                    alert(this.text);
                }
            },
            {
                icon: `
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-chat-dots" viewBox="0 0 16 16">
                <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
                </svg>`,
                text: 'Chat',
                click: function () {
                    alert(this.text);
                }
            },
            {
                icon: `
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                </svg>`,
                text: 'Help',
                click: function () {
                    alert(this.text);
                }
            },
        ];

        bottomMenuContainerItems.forEach(item => {
            let li = document.createElement('li');
            let span = document.createElement('span');
            span.classList.add(`${nm}-bottom-menu-icon`);
            span.innerHTML = item.icon;
            li.appendChild(span);
            let br = document.createElement('br');
            li.appendChild(br);
            let text = document.createElement('span');
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
        let id = this.generateUniqueId();
        let inpt = document.getElementById(`${nm}-text`);
        let q = inpt.value;
        if (q.trim() === '') {
            return;
        }
        this.chatContent.innerHTML += this.chatStripe(false, q, '');
        inpt.disabled = true;
        inpt.value = '';
        this.btn.disabled = true;

        let result = await this.makeRequest("POST", `${domain}/answer?name=${this.appName}`, {
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

    fullscreenchat() {
        if (this.chatContainer.style.width === chatWidth) {
            this.chatContainer.style.width = `${window.innerWidth - 30}px`;
            this.chatContainer.style.height = `${window.innerHeight - 125}px`;
        } else {
            this.chatContainer.style.width = chatWidth;
            this.chatContainer.style.height = `auto`;
        }
    }

    closeChat() {
        this.open = false;
        // this.createChatContainerContent();
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
        let result = await this.makeRequest("GET", `${domain}/api/project/${appName}/init`);
        let data = JSON.parse(result);
        this.welcomeMessage = data.data.welcome_message;
        this.inputText = data.data.input_text;
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