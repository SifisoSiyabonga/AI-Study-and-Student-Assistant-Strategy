const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();

// Store uploaded files temporarily in memory
const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB maximum
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Only PDF, DOCX and TXT files are supported.'
                )
            );
        }
    }
});


// ==========================================
// UPLOAD DOCUMENT
// ==========================================

router.post('/upload', upload.single('document'), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please select a document.'
            });
        }

        let extractedText = '';

        // ==========================================
        // PDF
        // ==========================================

        if (req.file.mimetype === 'application/pdf') {

            const pdfData = await pdfParse(req.file.buffer);

            extractedText = pdfData.text;
        }


        // ==========================================
        // DOCX
        // ==========================================

        else if (
            req.file.mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {

            const result = await mammoth.extractRawText({
                buffer: req.file.buffer
            });

            extractedText = result.value;
        }


        // ==========================================
        // TXT
        // ==========================================

        else if (req.file.mimetype === 'text/plain') {

            extractedText = req.file.buffer.toString('utf8');
        }


        extractedText = extractedText.trim();


        if (!extractedText) {
            return res.status(400).json({
                success: false,
                error: 'The uploaded document does not contain readable text.'
            });
        }


        // Prevent extremely large documents from
        // being sent to Gemini all at once.
        const MAX_TEXT_LENGTH = 50000;

        if (extractedText.length > MAX_TEXT_LENGTH) {

            extractedText =
                extractedText.substring(0, MAX_TEXT_LENGTH);

            extractedText +=
                '\n\n[Document truncated because it is too large.]';
        }


        res.json({
            success: true,

            filename: req.file.originalname,

            text: extractedText,

            message: 'Document uploaded successfully.'
        });


    } catch (error) {

        console.error('Document Upload Error:', error);

        res.status(500).json({
            success: false,
            error:
                error.message ||
                'Failed to process the document.'
        });
    }
});


// ==========================================
// MULTER / UPLOAD ERRORS
// ==========================================

router.use((error, req, res, next) => {

    if (error instanceof multer.MulterError) {

        if (error.code === 'LIMIT_FILE_SIZE') {

            return res.status(400).json({
                success: false,
                error: 'File is too large. Maximum size is 10 MB.'
            });
        }

        return res.status(400).json({
            success: false,
            error: error.message
        });
    }


    if (error) {

        return res.status(400).json({
            success: false,
            error: error.message
        });
    }


    next();
});


module.exports = router;