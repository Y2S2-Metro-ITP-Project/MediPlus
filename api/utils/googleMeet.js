// googleMeet.js
import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { SpacesServiceClient } from '@google-apps/meet';
import { auth } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/meetings.space.created'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), '\\api\\utils\\credentials.json');
async function loadSavedCredentialsIfExist() {
try {
const content = await fs.readFile(TOKEN_PATH);
const credentials = JSON.parse(content);
return auth.fromJSON(credentials);
} catch (err) {
console.log(err);
return null;
}
}
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
async function authorize() {
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
async function createSpace(authClient) {
const meetClient = new SpacesServiceClient({
authClient: authClient
});
const request = {};
const response = await meetClient.createSpace(request);
console.log(`Meet URL: ${response[0].meetingUri}`);
return response;
}
export {
authorize,
createSpace,
};