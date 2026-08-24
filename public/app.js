document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // USER
    // ==========================================

    const userName =
        document.getElementById('userName');

    try {

        const savedUser =
            localStorage.getItem('user');

        if (savedUser) {

            const user =
                JSON.parse(savedUser);

            userName.textContent =
                user.name || 'User';

        } else {

            userName.textContent =
                'User';

        }

    } catch (error) {

        console.error(
            'Error loading user:',
            error
        );

        userName.textContent =
            'User';

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutBtn =
        document.getElementById('logoutBtn');

    if (logoutBtn) {

        logoutBtn.addEventListener(
            'click',
            (e) => {

                e.preventDefault();

                localStorage.removeItem('token');

                localStorage.removeItem('user');

                localStorage.removeItem(
                    'conversationHistory'
                );

                window.location.href =
                    'login.html';

            }
        );

    }


    // ==========================================
    // CHAT ELEMENTS
    // ==========================================

    const chatHistory =
        document.getElementById(
            'chatHistory'
        );

    const submitBtn =
        document.getElementById(
            'askBtn'
        );

    const textarea =
        document.getElementById(
            'questionInput'
        );


    // ==========================================
    // CONVERSATION MEMORY
    // ==========================================

    let conversationHistory = [];

    try {

        const savedConversation =
            localStorage.getItem(
                'conversationHistory'
            );

        if (savedConversation) {

            conversationHistory =
                JSON.parse(savedConversation);

        }

    } catch (error) {

        console.error(
            'Error loading conversation history:',
            error
        );

        conversationHistory = [];

    }


    // ==========================================
    // SAVE CONVERSATION
    // ==========================================

    function saveConversation() {

        try {

            localStorage.setItem(
                'conversationHistory',
                JSON.stringify(
                    conversationHistory
                )
            );

        } catch (error) {

            console.error(
                'Error saving conversation:',
                error
            );

        }

    }


    // ==========================================
    // DOCUMENT ELEMENTS
    // ==========================================

    const documentInput =
        document.getElementById(
            'documentInput'
        );

    const uploadBtn =
        document.getElementById(
            'uploadBtn'
        );

    const fileName =
        document.getElementById(
            'fileName'
        );

    const uploadStatus =
        document.getElementById(
            'uploadStatus'
        );

    const removeDocumentBtn =
        document.getElementById(
            'removeDocumentBtn'
        );

    const imagePreview =
        document.getElementById(
            'imagePreview'
        );

    const previewImage =
        document.getElementById(
            'previewImage'
        );


    // ==========================================
    // UPLOADED FILE DATA
    // ==========================================

    let documentText = '';

    let uploadedFileName = '';

    let imageData = '';

    let imageMimeType = '';


    // ==========================================
    // UPLOAD BUTTON
    // ==========================================

    if (
        uploadBtn &&
        documentInput
    ) {

        uploadBtn.addEventListener(
            'click',
            () => {

                documentInput.click();

            }
        );

    }


    // ==========================================
    // FILE SELECTION
    // ==========================================

    if (documentInput) {

        documentInput.addEventListener(
            'change',
            async () => {

                const file =
                    documentInput.files[0];

                if (!file) {

                    return;

                }


                // ==========================================
                // RESET PREVIOUS DATA
                // ==========================================

                documentText = '';

                uploadedFileName =
                    file.name;

                imageData = '';

                imageMimeType = '';


                fileName.textContent =
                    file.name;

                uploadStatus.textContent =
                    '⏳ Processing file...';

                uploadBtn.disabled =
                    true;


                try {

                    // ==========================================
                    // IMAGE FILE
                    // ==========================================

                    if (
                        file.type === 'image/jpeg' ||
                        file.type === 'image/png' ||
                        file.type === 'image/webp'
                    ) {

                        const reader =
                            new FileReader();


                        reader.onload = () => {

                            try {

                                const result =
                                    reader.result;


                                if (
                                    typeof result !==
                                    'string'
                                ) {

                                    throw new Error(
                                        'Could not read the image.'
                                    );

                                }


                                const parts =
                                    result.split(',');


                                imageData =
                                    parts[1] || '';


                                imageMimeType =
                                    file.type;


                                previewImage.src =
                                    result;


                                imagePreview.classList.remove(
                                    'hidden'
                                );


                            } catch (error) {

                                console.error(
                                    'Image processing error:',
                                    error
                                );

                                imageData = '';

                                imageMimeType = '';

                                uploadStatus.textContent =
                                    '❌ Could not process image.';

                            }

                        };


                        reader.onerror = () => {

                            console.error(
                                'FileReader error'
                            );

                            uploadStatus.textContent =
                                '❌ Could not read image.';

                        };


                        reader.readAsDataURL(file);


                        uploadStatus.textContent =
                            '✅ Image ready! Ask the AI a question about it.';


                        removeDocumentBtn.classList.remove(
                            'hidden'
                        );

                    }


                    // ==========================================
                    // DOCUMENT FILE
                    // ==========================================

                    else {

                        imagePreview.classList.add(
                            'hidden'
                        );

                        previewImage.src =
                            '';


                        const formData =
                            new FormData();


                        formData.append(
                            'document',
                            file
                        );


                        const response =
                            await fetch(
                                '/api/documents/upload',
                                {
                                    method: 'POST',
                                    body: formData
                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(
                                data.error ||
                                'Upload failed.'
                            );

                        }


                        // ==========================================
                        // CHECK DOCUMENT TEXT
                        // ==========================================

                        if (
                            typeof data.text !==
                            'string' ||
                            !data.text.trim()
                        ) {

                            throw new Error(
                                'The document was uploaded, but no readable text was extracted.'
                            );

                        }


                        documentText =
                            data.text;


                        uploadStatus.textContent =
                            '✅ Document ready! Ask the AI a question about it.';


                        removeDocumentBtn.classList.remove(
                            'hidden'
                        );

                    }


                } catch (error) {

                    console.error(
                        'Upload error:',
                        error
                    );


                    documentText = '';

                    uploadedFileName = '';

                    imageData = '';

                    imageMimeType = '';


                    uploadStatus.textContent =
                        '❌ ' +
                        (
                            error.message ||
                            'Upload failed.'
                        );


                    removeDocumentBtn.classList.add(
                        'hidden'
                    );

                } finally {

                    uploadBtn.disabled =
                        false;

                }

            }
        );

    }


    // ==========================================
    // REMOVE DOCUMENT / IMAGE
    // ==========================================

    if (removeDocumentBtn) {

        removeDocumentBtn.addEventListener(
            'click',
            () => {

                documentText = '';

                uploadedFileName = '';

                imageData = '';

                imageMimeType = '';


                if (documentInput) {

                    documentInput.value = '';

                }


                fileName.textContent =
                    'No file selected';


                uploadStatus.textContent =
                    '';


                if (imagePreview) {

                    imagePreview.classList.add(
                        'hidden'
                    );

                }


                if (previewImage) {

                    previewImage.src =
                        '';

                }


                removeDocumentBtn.classList.add(
                    'hidden'
                );

            }
        );

    }


    // ==========================================
    // ADD USER MESSAGE
    // ==========================================

    function addUserMessage(question) {

        const message =
            document.createElement('div');


        message.className =
            'chat-message user-message';


        message.innerHTML = `

            <div class="message-label">
                You
            </div>

            <div class="message-content">
                ${escapeHTML(question)}
            </div>

        `;


        chatHistory.appendChild(
            message
        );


        scrollToBottom();

    }


    // ==========================================
    // ADD AI MESSAGE
    // ==========================================

    function createAIMessage() {

        const message =
            document.createElement('div');


        message.className =
            'chat-message ai-message';


        message.innerHTML = `

            <div class="message-label">
                🤖 AI Assistant
            </div>

            <div class="message-content"></div>

        `;


        chatHistory.appendChild(
            message
        );


        return message.querySelector(
            '.message-content'
        );

    }


    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHTML(text) {

        const div =
            document.createElement('div');


        div.textContent =
            text;


        return div.innerHTML;

    }


    // ==========================================
    // SCROLL
    // ==========================================

    function scrollToBottom() {

        window.scrollTo({

            top:
                document.body.scrollHeight,

            behavior:
                'smooth'

        });

    }


    // ==========================================
    // ASK AI
    // ==========================================

    let isAsking = false;


    async function handleAsk() {

        const question =
            textarea.value.trim();


        // ==========================================
        // VALIDATE QUESTION
        // ==========================================

        if (!question) {

            return;

        }


        if (isAsking) {

            return;

        }


        isAsking = true;


        // ==========================================
        // SHOW USER QUESTION
        // ==========================================

        addUserMessage(
            question
        );


        // ==========================================
        // ADD QUESTION TO CONVERSATION
        // ==========================================

        conversationHistory.push({

            role: 'user',

            content: question

        });


        saveConversation();


        // ==========================================
        // CLEAR INPUT
        // ==========================================

        textarea.value = '';

        textarea.focus();


        // ==========================================
        // CREATE AI MESSAGE
        // ==========================================

        const aiAnswer =
            createAIMessage();


        aiAnswer.innerText =
            '🤔 Thinking...';


        // ==========================================
        // DISABLE BUTTON
        // ==========================================

        submitBtn.disabled =
            true;


        submitBtn.innerText =
            'Thinking...';


        try {

            // ==========================================
            // SEND DATA TO AI
            // ==========================================

            const response =
                await fetch(
                    '/api/ai/ask',
                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body: JSON.stringify({

                            question:
                                question,

                            documentText:
                                documentText,

                            uploadedFileName:
                                uploadedFileName,

                            imageData:
                                imageData,

                            imageMimeType:
                                imageMimeType,

                            conversationHistory:
                                conversationHistory

                        })

                    }
                );


            // ==========================================
            // CHECK RESPONSE
            // ==========================================

            if (!response.ok) {

                const errorText =
                    await response.text();


                throw new Error(
                    errorText ||
                    'AI request failed.'
                );

            }


            // ==========================================
            // CHECK RESPONSE BODY
            // ==========================================

            if (!response.body) {

                throw new Error(
                    'The server returned an empty response.'
                );

            }


            // ==========================================
            // STREAM AI RESPONSE
            // ==========================================

            const reader =
                response.body.getReader();


            const decoder =
                new TextDecoder();


            let answer = '';


            aiAnswer.innerText =
                '';


            while (true) {

                const {
                    value,
                    done
                } =
                    await reader.read();


                if (done) {

                    break;

                }


                const text =
                    decoder.decode(
                        value,
                        {
                            stream: true
                        }
                    );


                answer += text;


                aiAnswer.innerText =
                    answer;


                scrollToBottom();

            }


            // ==========================================
            // SAVE AI RESPONSE
            // ==========================================

            if (answer.trim()) {

                conversationHistory.push({

                    role: 'assistant',

                    content: answer

                });


                saveConversation();

            }


        } catch (error) {

            // ==========================================
            // SHOW ACTUAL ERROR
            // ==========================================

            console.error(
                'AI Error:',
                error
            );


            console.error(
                'FULL AI ERROR:',
                error
            );


            aiAnswer.innerText =
                '❌ AI Error: ' +
                (
                    error.message ||
                    'Unknown error'
                );


            // ==========================================
            // REMOVE FAILED USER MESSAGE
            // ==========================================

            if (
                conversationHistory.length > 0 &&
                conversationHistory[
                    conversationHistory.length - 1
                ].role === 'user'
            ) {

                conversationHistory.pop();

                saveConversation();

            }

        } finally {

            isAsking = false;


            submitBtn.disabled =
                false;


            submitBtn.innerText =
                '🚀 Ask AI';


            textarea.focus();

        }

    }


    // ==========================================
    // ASK BUTTON
    // ==========================================

    if (submitBtn) {

        submitBtn.addEventListener(
            'click',
            (e) => {

                e.preventDefault();

                handleAsk();

            }
        );

    }


    // ==========================================
    // ENTER KEY
    // ==========================================

    if (textarea) {

        textarea.addEventListener(
            'keydown',
            (e) => {

                if (
                    e.key === 'Enter' &&
                    !e.shiftKey
                ) {

                    e.preventDefault();

                    handleAsk();

                }

            }
        );

    }

});