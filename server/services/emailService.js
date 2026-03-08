const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const welcomeTemplate = require('../templates/emails/welcomeTemplate');

let transporter = null;

const initializeEmailService = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('Email service not configured. Set SMTP_USER and SMTP_PASS in .env to enable emails.');
        return;
    }

    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true' || false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        transporter.verify((error) => {
            if (error) {
                logger.error('Email service verification failed', { error: error.message });
                transporter = null;
            } else {
                logger.info('Email service initialized and connected to Gmail SMTP');
            }
        });
    } catch (error) {
        logger.error('Failed to initialize email service', { error: error.message });
        transporter = null;
    }
};

initializeEmailService();


const _send = async ({ to, subject, html }) => {
    if (!transporter) {
        logger.warn('Email service not initialized, email skipped', { to, subject });
        return false;
    }
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html,
        });
        logger.info('Email sent', { to, subject, messageId: info.messageId });
        return true;
    } catch (error) {
        logger.error('Email send failed', { to, subject, error: error.message });
        return false;
    }
};



const sendWelcomeEmail = (to, username) =>
    _send({ to, subject: 'Welcome to HuddleUp!', html: welcomeTemplate(username) });

module.exports = { sendWelcomeEmail };