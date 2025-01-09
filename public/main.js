function addMessageToUI(isOwnMessage, data) {
    clearFeedback();
    
    let messageElement = '';
    if (data.audio) {
        // Handle audio message
        messageElement = `
            <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
                <audio controls>
                    <source src="data:audio/wav;base64,${data.audio}" type="audio/wav">
                </audio>
                <p>${data.name} ● ${moment(data.dateTime).fromNow()}</p>
            </li>
        `;
    } else if (data.message) {
        // Handle text message
        messageElement = `
            <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
                <p class="message">
                  ${data.message}
                  <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
                </p>
            </li>
        `;
    }

    messageContainer.innerHTML += messageElement;
    scrollToBottom();
}

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
}



messageInput.addEventListener('keypress', () => {
    socket.emit('feedback', {
        feedback: `✍️ ${nameInput.value} is typing a message`,
    });
});

messageInput.addEventListener('blur', () => {
    socket.emit('feedback', {
        feedback: '',
    });
});

socket.on('feedback', (data) => {
    clearFeedback();
    const element = `
        <li class="message-feedback">
            <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
    `;
    messageContainer.innerHTML += element;
});

function clearFeedback() {
    document.querySelectorAll('li.message-feedback').forEach((element) => {
        element.parentNode.removeChild(element);
    });
}

recordButton.addEventListener('click', toggleRecording);

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    console.log('Starting recording...');
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            isRecording = true;
            recordButton.innerHTML = '<i class="fas fa-stop"></i>'; // Change icon to stop

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = [];
                sendAudioMessage(audioBlob);
            });
        })
        .catch(error => {
            console.error('Error accessing microphone', error);
        });
}

function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;
    recordButton.innerHTML = '<i class="fas fa-microphone"></i>'; // Change icon back to mic
}

function sendAudioMessage(audioBlob) {
    const reader = new FileReader();
    reader.onloadend = function() {
        const base64Audio = reader.result.split(',')[1];
        const data = {
            audio: base64Audio,
            name: nameInput.value,
            message: null, // Ensure message is null for audio messages
            dateTime: new Date(),
        };
        socket.emit('message', data);
    };
    reader.readAsDataURL(audioBlob);
}

// Generate or get a unique user ID
let userId = sessionStorage.getItem('userId');
if (!userId) {
    userId = Date.now().toString(); // or any unique ID generation method
    sessionStorage.setItem('userId', userId);
}