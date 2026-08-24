const express = require('express');

const router = express.Router();

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ==========================================
// ASK AI
// ==========================================

router.post('/ask', async (req, res) => {

    try {

        const {
            question,
            documentText,
            imageData,
            imageMimeType,
            conversationHistory
        } = req.body;


        // ==========================================
        // VALIDATE QUESTION
        // ==========================================

        if (!question || !question.trim()) {

            return res.status(400).json({

                success: false,

                error: 'Question is required.'

            });

        }


        // ==========================================
        // CONVERSATION HISTORY
        // ==========================================

        let history = [];

        if (Array.isArray(conversationHistory)) {

            history = conversationHistory

                .filter(message =>
                    message &&
                    (
                        message.role === 'user' ||
                        message.role === 'assistant'
                    ) &&
                    typeof message.content === 'string' &&
                    message.content.trim()
                )

                .map(message => ({

                    role:
                        message.role === 'assistant'
                            ? 'model'
                            : 'user',

                    parts: [

                        {
                            text: message.content
                        }

                    ]

                }));

        }


        // ==========================================
        // AI INSTRUCTIONS
        // ==========================================

        let instruction = `

You are an academic tutor for a student.

Answer questions clearly and directly using simple language.

IMPORTANT:

- Use the conversation history to understand follow-up questions.
- Do not treat every question as completely independent.
- Maintain the context of the current conversation.
- Do not mention that you are using conversation history.
- If the student changes the topic, answer the new topic normally.

DOCUMENT AND IMAGE RULES:

- If a document or image has been uploaded, you MUST use it when answering questions about the uploaded material.
- If the student asks "What did I just upload?", identify and describe the uploaded material using the provided document text or image.
- If the student asks a question about the uploaded material, use that material as the primary source.
- Do not claim that no document or image was uploaded when document or image data has been provided.
- Do not invent information that cannot be determined from the uploaded material.

`;


        // ==========================================
        // DOCUMENT
        // ==========================================

        if (
            documentText &&
            documentText.trim()
        ) {

            instruction += `

The student has uploaded a study document.

The extracted document content is provided below.

================ DOCUMENT START ================

${documentText}

================ DOCUMENT END ==================

Use this document as the primary source.

If the student asks what they uploaded, summarize what this document is about.

`;

        }


        // ==========================================
        // IMAGE
        // ==========================================

        const hasImage =
            imageData &&
            imageMimeType;


        if (hasImage) {

            instruction += `

The student has uploaded an image.

Analyze the image carefully.

If the student asks what they uploaded, describe what is visible in the image.

If the image contains text, questions, diagrams, tables, or study material, use that information when answering.

`;

        }


        // ==========================================
        // BUILD CURRENT REQUEST
        // ==========================================

        const currentParts = [];


        // Add document information

        if (
            documentText &&
            documentText.trim()
        ) {

            currentParts.push({

                text: `

UPLOADED DOCUMENT:

${documentText}

END OF UPLOADED DOCUMENT.

`

            });

        }


        // Add image

        if (hasImage) {

            currentParts.push({

                inlineData: {

                    mimeType: imageMimeType,

                    data: imageData

                }

            });

        }


        // Add current question

        currentParts.push({

            text: question

        });


        // ==========================================
        // ADD CURRENT REQUEST TO HISTORY
        // ==========================================

        const contents = [

            ...history

        ];


        /*
            The frontend already puts the current question
            inside conversationHistory.

            However, the uploaded document/image belongs
            specifically to the current request, so we add
            it here together with the question.
        */

        contents.push({

            role: 'user',

            parts: currentParts

        });


        // ==========================================
        // STREAMING RESPONSE
        // ==========================================

        res.setHeader(
            'Content-Type',
            'text/plain; charset=utf-8'
        );

        res.setHeader(
            'Cache-Control',
            'no-cache'
        );

        res.setHeader(
            'Connection',
            'keep-alive'
        );


        // ==========================================
        // SEND TO GEMINI
        // ==========================================

        const stream =
            await ai.models.generateContentStream({

                model: 'gemini-3.6-flash',

                systemInstruction:
                    instruction,

                contents:
                    contents

            });


        // ==========================================
        // STREAM RESPONSE
        // ==========================================

        for await (const chunk of stream) {

            let text =
                chunk.text;

            if (text) {

                // Remove Markdown bold markers
                text =
                    text.replace(/\*\*/g, '');

                res.write(text);

            }

        }


        res.end();


    } catch (error) {

        console.error(
            'AI Route Error:',
            error
        );


        if (res.headersSent) {

            res.end();

        } else {

            res.status(500).json({

                success: false,

                error:
                    error.message ||
                    'Failed to process AI request.'

            });

        }

    }

});


module.exports = router;