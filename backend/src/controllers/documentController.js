const PDFDocument = require('pdfkit');
const Document = require('../models/Document');

exports.downloadDocumentPDF = async (req, res) => {
  try {
    const docData = await Document.findById(req.params.id)
      .populate('landlordId', 'firstName lastName phone')
      .populate('tenantId', 'firstName lastName email phone')
      .populate('propertyId');

    const pdf = new PDFDocument({ margin: 50 });
    
    // Set headers for download
      // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Lease_${docData._id}.pdf`);
    pdf.pipe(res);






    pdf.end();
  } catch (error) {
    res.status(500).json({ message: "PDF Generation Failed" });
  }
};