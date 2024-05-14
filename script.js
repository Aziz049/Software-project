document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.querySelector("#chat-input");
    const sendButton = document.querySelector("#send-btn");
    const chatContainer = document.querySelector(".chatt-container");
    const deleteChatButton = document.querySelector("#delete-chat");

    let userText = null;
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    const API_KEY = "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"; // Your OpenAI API key

    const createElement = (html, className) => {
        const chatDiv = document.createElement("div");
        chatDiv.classList.add("chat", className);
        chatDiv.innerHTML = html;
        return chatDiv;
    };

    const updateLocalStorage = () => {
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    };

    const clearChatHistory = () => {
        localStorage.removeItem("chatHistory");
        chatHistory = [];
        chatContainer.innerHTML = ""; // Clear chat container
    };

    const getChatResponse = async (incomingChatDiv) => {
        const API_URL = "https://api.openai.com/v1/chat/completions";
        const pElement = document.createElement("p");

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ "role": "user", "content": userText }],
                temperature: 0.7
            })
        };

        try {
            const response = await fetch(API_URL, requestOptions);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);
            const botReply = data.choices[0].message.content;
            pElement.textContent = botReply;
            incomingChatDiv.querySelector(".typing-animation").remove();
            incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
            chatHistory.push({ role: "user", content: userText }, { role: "bot", content: botReply });
            updateLocalStorage();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const showTypingAnimation = () => {
        const html = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="bot.png" alt="Bot Image">
                                <div class="typing-animation">
                                    <div class="typing-dot" style="--delay: .2s"></div>
                                    <div class="typing-dot" style="--delay: .3s"></div>
                                    <div class="typing-dot" style="--delay: .4s"></div>
                                </div>
                            </div>
                        </div>`;

        const incomingChatDiv = createElement(html, "incoming");
        chatContainer.appendChild(incomingChatDiv);
        getChatResponse(incomingChatDiv);
    };

    const handleOutGoingChat = () => {
        userText = chatInput.value.trim();
        const html = `<div class="chat outgoing">
                            <div class="chat-content">
                                <div class="chat-details">
                                    <img src="user.png" alt="User Image">
                                    <p>${userText}</p>
                                </div>
                            </div>
                        </div>`;

        const outGoingChatDiv = createElement(html, "outgoing");
        chatContainer.appendChild(outGoingChatDiv);
        chatInput.value = ""; // Clearing the input field
        chatHistory.push({ role: "user", content: userText });
        updateLocalStorage();
        setTimeout(showTypingAnimation, 500);
    };

    const handleDeleteChat = () => {
        clearChatHistory();
    };

    sendButton.addEventListener("click", handleOutGoingChat);
    deleteChatButton.addEventListener("click", handleDeleteChat);

    const loadChatHistory = () => {
        chatHistory.forEach(message => {
            const html = `<div class="chat ${message.role === 'user' ? 'outgoing' : 'incoming'}">
                                <div class="chat-content">
                                    <div class="chat-details">
                                        <img src="${message.role === 'user' ? 'user' : 'bot'}.png" alt="${message.role === 'user' ? 'User' : 'Bot'} Image">
                                        <p>${message.content}</p>
                                    </div>
                                </div>
                            </div>`;
            chatContainer.appendChild(createElement(html, message.role));
        });
    };

    loadChatHistory();
});
