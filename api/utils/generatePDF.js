import html2pdf from 'html2pdf';
import { Readable } from 'stream';

const generatePDF = (data, template) => {
  return new Promise((resolve, reject) => {
    const options = {
      margin: 10, // Set the margin (in mm)
      filename: 'report.pdf', // Set the output filename
      image: { type: 'jpeg', quality: 0.98 }, // Set the output image quality (0-1)
      enableLinks: false, // Enable or disable links
      html2canvas: { scale: 2 }, // Set the rendering scale factor
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, // Set the PDF options
    };

    const content = template(data);
    const worker = html2pdf().set(options).from(content);

    const stream = new Readable();
    stream._read = () => {}; // Required to prevent the stream from being paused

    worker.on('ok', (pdf) => {
      stream.push(pdf);
      stream.push(null); // Signal the end of the stream
      resolve(stream);
    }).on('error', (err) => {
      reject(err);
    });
  });
};

export default generatePDF;