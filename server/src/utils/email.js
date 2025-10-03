// src/utils/email.js
const nodemailer = require('nodemailer');


const createTransport = () => {
const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT || 587),
secure: process.env.SMTP_SECURE === 'true' || false,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS,
},
});
return transporter;
};


async function sendEmail({ to, subject, html, text }) {
const transporter = createTransport();
const info = await transporter.sendMail({
from: process.env.EMAIL_FROM || process.env.SMTP_USER,
to,
subject,
text,
html,
});
return info;
}


module.exports = { sendEmail };