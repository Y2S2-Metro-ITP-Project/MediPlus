import puppeteer from "puppeteer";

import PDFMerger from "pdf-merger-js";

async function generatePDF(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
}

async function combinePDFs(pdfBuffers) {
    const merger = new PDFMerger();

    for (const pdfBuffer of pdfBuffers) {
        merger.add(pdfBuffer);
    }

    const combinedPdfBuffer = await merger.saveAsBuffer();
    return combinedPdfBuffer;
}

async function generateAndCombinePDFs(htmlContents) {
    const pdfBuffers = [];
    
    for (const htmlContent of htmlContents) {
        const pdfBuffer = await generatePDF(htmlContent);
        pdfBuffers.push(pdfBuffer);
    }

    const combinedPdfBuffer = await combinePDFs(pdfBuffers);
    return combinedPdfBuffer;
}

export default generateAndCombinePDFs;