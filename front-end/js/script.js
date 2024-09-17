// login
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

const colors = [
    "white", "green", "blue", "red", "yellow", "pink",
    "gold", "darkkhaki", "cadetblue", "orange", "purple"
];

const user = { id: "", name: "", color: "", IP: "" };

let websocket;

// Helper functions
const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("message--self");
    div.innerHTML = content;
    return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.classList.add("message--other");
    span.classList.add("message--sender");
    span.style.color = senderColor;
    div.appendChild(span);
    span.innerHTML = sender;
    div.innerHTML += content;
    return div;
};

<!-- Nem adianta você saber as credenciais, espertão! -->
<!-- Sem o nick e o Ip correto, você não poderá se conectar, logo, não tem como você invadir! -->
<!-- Um beijo da Lavi pra você! Se você conseguir invadir, me avisa, tá? -->
            
const authorizedUsers = [
    { name: "Lavi 🎈", ip: "146.70.98.145" },
    { name: "Pedro", ip: "169.150.196.102" },
    { name: "NoName404", ip: "89.39.107.185" },
    { name: "Cuca", ip: "146.70.98.145" },
    { name: "Unic", ip: "209.14.68.136" }

// Load messages from localStorage
const loadMessages = () => {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.forEach(msg => {
        const message = msg.userId === user.id 
            ? createMessageSelfElement(msg.content) 
            : createMessageOtherElement(msg.content, msg.userName, msg.userColor);
        chatMessages.appendChild(message);
    });
    scrollScreen();
};

const saveMessage = (message) => {
    let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
};

const clearOldMessages = () => {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    const now = new Date().getTime();
    const filteredMessages = messages.filter(msg => now - msg.timestamp < 24 * 60 * 60 * 1000); // 24 hours
    localStorage.setItem('chatMessages', JSON.stringify(filteredMessages));
};

const getUserIP = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Erro ao obter o IP:', error);
        return null;
    }
};

const isUserAuthorized = (name, ip) => {
    return authorizedUsers.some(user => user.name === name && user.ip === ip);
};

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

const handleLogin = async (event) => {
    event.preventDefault();

    const ip = await getUserIP();
    if (!ip) {
        alert("Erro ao obter o IP. Tente novamente mais tarde.");
        return;
    }

    const name = loginInput.value;
    const authorized = isUserAuthorized(name, ip);

    if (!authorized) {
        window.location.href = "https://www.google.com";
        return;
    }

    user.id = crypto.randomUUID();
    user.name = name;
    user.color = getRandomColor();
    user.IP = ip;

    login.style.display = "none";
    chat.style.display = "flex";

    websocket = new WebSocket("wss://chat-dzys.onrender.com/");

    websocket.onmessage = processMessage;

    // Load messages from localStorage
    loadMessages();

    // Clear old messages from localStorage
    clearOldMessages();
};

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);

    const message = userId == user.id 
        ? createMessageSelfElement(content) 
        : createMessageOtherElement(content, userName, userColor);

    chatMessages.appendChild(message);
    scrollScreen();

    // Save message to localStorage
    saveMessage({
        userId, userName, userColor, content, timestamp: new Date().getTime()
    });
};

const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };

    websocket.send(JSON.stringify(message));
    chatInput.value = "";
};

// Event listeners
loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
