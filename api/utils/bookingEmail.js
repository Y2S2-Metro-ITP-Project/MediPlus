import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.send','https://www.googleapis.com/auth/meetings.space.created','https://www.googleapis.com/auth/calendar',`https://www.googleapis.com/auth/drive`];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), '\\api\\utils\\credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
export async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Send an email using the Gmail API.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} to The recipient's email address.
 * @param {string} subject The email subject.
 * @param {string} body The email body.
 */
 export async function sendEmail(auth, to, subject, body) {
  const gmail = google.gmail({ version: 'v1', auth });
  const message = `From: Ismails Hospital Pvt Ltd <mnfalahahamad@gmail.com>
To: ${to}
Subject: ${subject}

${body}`;

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
    .replace(/=+$/, '');

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  console.log(`Email sent to ${to} with messageId: ${response.data.id}`);
}
