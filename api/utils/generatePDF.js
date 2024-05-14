import puppeteer from 'puppeteer';

async function generatePDFFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set content and wait for page to load
  await page.setContent(htmlContent);

  // Generate PDF
  const pdfBuffer = await page.pdf({ format: 'A4' });

  await browser.close();
  return pdfBuffer;
}

export default generatePDFFromHtml;