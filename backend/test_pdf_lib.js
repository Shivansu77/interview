const fs = require('fs');
const path = require('path');

async function testPdfParse() {
    console.log('Testing pdf-parse import...');
    try {
        const pdfParse = require('pdf-parse');
        console.log('Type of pdfParse:', typeof pdfParse);
        console.log('pdfParse keys:', Object.keys(pdfParse));
        if (pdfParse.default) {
            console.log('Has default export:', typeof pdfParse.default);
        }

        // Try to find the function
        const parseFunc = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
        if (typeof parseFunc === 'function') {
            console.log('Found parse function!');
        }

        console.log('\n--- Testing pdf-parse/node ---');
        try {
            const pdfParseNode = require('pdf-parse/node');
            console.log('pdf-parse/node keys:', Object.keys(pdfParseNode));
        } catch (e) {
            console.log('Could not require pdf-parse/node:', e.message);
        }

        console.log('\n--- Inspecting PDFParse class ---');
        if (pdfParse.PDFParse) {
            console.log('PDFParse prototype:', Object.getOwnPropertyNames(pdfParse.PDFParse.prototype));
            // Try to instantiate
            try {
                const parser = new pdfParse.PDFParse();
                console.log('Parser instance keys:', Object.keys(parser));
            } catch (e) {
                console.log('Error instantiating PDFParse:', e.message);
            }
        }

    } catch (error) {
        console.error('❌ Error requiring pdf-parse:', error);
    }
}

testPdfParse();
