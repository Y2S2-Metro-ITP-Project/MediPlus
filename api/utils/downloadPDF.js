const fs = require('fs');
const path = require('path');

/**
 * Downloads a file
 * @param{string} realFileId file ID
 * @param{string} destinationPath path to save the downloaded file
 * @return{obj} file status
 */
async function downloadFile(realFileId, destinationPath) {
  // Get credentials and build service
  // TODO (developer) - Use appropriate auth mechanism for your app

  const { GoogleAuth } = require('google-auth-library');
  const { google } = require('googleapis');

  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/drive',
  });
  const service = google.drive({ version: 'v3', auth });

  const fileId = realFileId;
  const destPath = path.join(__dirname, destinationPath);

  try {
    const file = await service.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      { responseType: 'stream' }
    );

    const destinationStream = fs.createWriteStream(destPath);
    file.data.pipe(destinationStream);

    return new Promise((resolve, reject) => {
      destinationStream.on('finish', () => {
        resolve(file.status);
      });
      destinationStream.on('error', (err) => {
        reject(err);
      });
    });
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}