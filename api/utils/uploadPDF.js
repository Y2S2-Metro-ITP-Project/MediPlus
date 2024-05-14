/**
 * Insert new file.
 * @return{obj} file Id
 * */
async function uploadBasic() {
  const fs = require('fs');
  const { GoogleAuth } = require('google-auth-library');
  const { google } = require('googleapis');

  // Get credentials and build service
  // TODO (developer) - Use appropriate auth mechanism for your app
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/drive',
  });
  const service = google.drive({ version: 'v3', auth });
  const requestBody = {
    name: 'document.pdf', // Change the file name here
    fields: 'id',
  };
  const media = {
    mimeType: 'application/pdf', // Change the MIME type to 'application/pdf'
    body: fs.createReadStream('files/document.pdf'), // Change the file path here
  };
  try {
    const file = await service.files.create({
      requestBody,
      media: media,
    });
    console.log('File Id:', file.data.id);
    return file.data.id;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}