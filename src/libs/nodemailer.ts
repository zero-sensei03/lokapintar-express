import nodemailer from 'nodemailer';
import { Env } from '../config/Env';

export const transporter = nodemailer.createTransport({
  host: Env.EMAIL_SERVER_HOST,
  port: Number(Env.EMAIL_SERVER_PORT) || 587,
  secure: Env.EMAIL_SERVER_SECURE,
  auth: {
    user: Env.EMAIL_SERVER_USER,
    pass: Env.EMAIL_SERVER_PASSWORD,
  },
});