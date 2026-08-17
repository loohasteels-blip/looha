'use client';
import { useState } from 'react';
import './PDFQuoteButton.css';

export default function PDFQuoteButton({ rfq, quote, total }) {
  const [generating, setGenerating] = useState(false);

  async function generatePDF() {
    setGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      const primaryColor = [11, 31, 58];    // --color-primary
      const accentColor  = [233, 136, 0];   // --color-accent
      const grayColor    = [100, 116, 139];
      const lightGray    = [241, 245, 249];
      const textColor    = [30, 41, 59];

      const pageW = doc.internal.pageSize.getWidth();
      const margin = 18;
      let y = 0;

      // ── Header band ────────────────────────────────────────────────────────
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageW, 42, 'F');

      // Looha wordmark
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('LOOHA', margin, 18);

      // Accent bar
      doc.setFillColor(...accentColor);
      doc.rect(margin, 20, 28, 2.5, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(200, 210, 225);
      doc.text('Steel Trading Platform · looha.in', margin, 27);

      // Quote label (top right)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('QUOTATION', pageW - margin, 13, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(200, 210, 225);
      doc.text(`RFQ #${rfq.id.slice(0, 8).toUpperCase()}`, pageW - margin, 19, { align: 'right' });
      const now = new Date();
      doc.text(`Date: ${now.toLocaleDateString('en-IN')}`, pageW - margin, 25, { align: 'right' });
      const validTill = new Date(now);
      validTill.setDate(validTill.getDate() + (quote.validDays || 3));
      doc.text(`Valid till: ${validTill.toLocaleDateString('en-IN')}`, pageW - margin, 31, { align: 'right' });

      y = 52;

      // ── From / To block ────────────────────────────────────────────────────
      const col1 = margin;
      const col2 = pageW / 2 + 4;
      const colW = pageW / 2 - margin - 4;

      // From box
      doc.setFillColor(...lightGray);
      doc.roundedRect(col1, y, colW, 34, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...accentColor);
      doc.text('FROM (WHOLESALER)', col1 + 6, y + 7);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.text(quote.wholesalerName || 'Wholesaler', col1 + 6, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      if (quote.wholesalerGST) doc.text(`GST: ${quote.wholesalerGST}`, col1 + 6, y + 20);
      if (quote.wholesalerPhone) doc.text(`Ph: ${quote.wholesalerPhone}`, col1 + 6, y + 26);

      // To box
      doc.setFillColor(...lightGray);
      doc.roundedRect(col2, y, colW, 34, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...accentColor);
      doc.text('BILL TO (CONTRACTOR)', col2 + 6, y + 7);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.text(rfq.contractorName || 'Contractor', col2 + 6, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      if (rfq.contractorPhone) doc.text(`Ph: ${rfq.contractorPhone}`, col2 + 6, y + 20);
      doc.text(`Delivery Pincode: ${rfq.pincode}`, col2 + 6, y + 26);

      y += 42;

      // ── Items Table ────────────────────────────────────────────────────────
      const tableX = margin;
      const tableW = pageW - margin * 2;
      const cols = { item: 0.35, size: 0.15, qty: 0.1, tons: 0.1, rate: 0.15, total: 0.15 };

      // Table header
      doc.setFillColor(...primaryColor);
      doc.rect(tableX, y, tableW, 9, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);

      let cx = tableX + 3;
      doc.text('PRODUCT', cx, y + 6);
      cx += tableW * cols.item;
      doc.text('SIZE', cx, y + 6);
      cx += tableW * cols.size;
      doc.text('QTY', cx, y + 6, { align: 'right' });
      cx += tableW * cols.qty;
      doc.text('~TONS', cx, y + 6, { align: 'right' });
      cx += tableW * cols.tons;
      doc.text('RATE/T (₹)', cx, y + 6, { align: 'right' });
      cx += tableW * cols.rate;
      doc.text('TOTAL (₹)', tableX + tableW - 3, y + 6, { align: 'right' });

      y += 9;

      // Table rows
      (rfq.items || []).forEach((item, idx) => {
        const priceEntry = quote.prices?.find(p => p.product === item.product && p.size === item.size);
        const rate = priceEntry ? Number(priceEntry.pricePerTon) : 0;
        const tons = parseFloat(item.estimatedTons) || 0;
        const rowTotal = Math.round(rate * tons);

        const rowH = 10;
        const rowBg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        doc.setFillColor(...rowBg);
        doc.rect(tableX, y, tableW, rowH, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textColor);

        let rx = tableX + 3;
        doc.text(item.product || '—', rx, y + 7);
        rx += tableW * cols.item;
        doc.text(item.size || '—', rx, y + 7);
        rx += tableW * cols.size;
        doc.text(`${item.quantity} ${item.unit}`, rx + tableW * cols.qty - 3, y + 7, { align: 'right' });
        rx += tableW * cols.qty;
        doc.text(tons ? tons.toFixed(2) : '—', rx + tableW * cols.tons - 3, y + 7, { align: 'right' });
        rx += tableW * cols.tons;
        doc.text(rate ? rate.toLocaleString('en-IN') : '—', rx + tableW * cols.rate - 3, y + 7, { align: 'right' });
        doc.text(rowTotal ? rowTotal.toLocaleString('en-IN') : '—', tableX + tableW - 3, y + 7, { align: 'right' });

        y += rowH;
      });

      // Freight row
      if (quote.freightPerTon) {
        const totalTons = rfq.items?.reduce((s, it) => s + (parseFloat(it.estimatedTons) || 0), 0) || 0;
        const freightTotal = Math.round(quote.freightPerTon * totalTons);
        doc.setFillColor(255, 251, 235);
        doc.rect(tableX, y, tableW, 9, 'F');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(...grayColor);
        doc.text('Freight Charges', tableX + 3, y + 6);
        doc.text(`₹${quote.freightPerTon.toLocaleString('en-IN')}/T × ${totalTons.toFixed(2)}T`, tableX + tableW * 0.6, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.text(freightTotal.toLocaleString('en-IN'), tableX + tableW - 3, y + 6, { align: 'right' });
        y += 9;
      }

      // Total row
      doc.setFillColor(...primaryColor);
      doc.rect(tableX, y, tableW, 11, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('ESTIMATED TOTAL', tableX + 3, y + 8);
      doc.text(`₹ ${total.toLocaleString('en-IN')}`, tableX + tableW - 3, y + 8, { align: 'right' });
      y += 20;

      // GST note
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text('* Prices are exclusive of GST (18%). GST invoice will be issued directly by the wholesaler.', tableX, y);
      y += 6;
      doc.text('* This is an indicative quote. Final invoice may vary based on actual weight at loading.', tableX, y);
      y += 14;

      // ── Terms ─────────────────────────────────────────────────────────────
      doc.setFillColor(...lightGray);
      doc.roundedRect(tableX, y, tableW, 26, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...textColor);
      doc.text('Terms & Conditions', tableX + 6, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text(`• Delivery within ${quote.deliveryDays || 3} business days · Quote valid for ${quote.validDays || 3} days from date of issue`, tableX + 6, y + 13);
      doc.text('• Payment: 100% advance before dispatch · Subject to stock availability', tableX + 6, y + 18);
      if (quote.notes) doc.text(`• ${quote.notes}`, tableX + 6, y + 23);
      y += 32;

      // ── Footer ────────────────────────────────────────────────────────────
      doc.setFillColor(...primaryColor);
      doc.rect(0, doc.internal.pageSize.getHeight() - 14, pageW, 14, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(180, 195, 215);
      doc.text('Generated by Looha · looha.in · support@looha.in · +91 8885999718', pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

      // ── Save ──────────────────────────────────────────────────────────────
      doc.save(`Looha_Quote_${rfq.id.slice(0, 8).toUpperCase()}_${quote.wholesalerName?.replace(/\s+/g, '_') || 'Wholesaler'}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button className="pdf-quote-btn" onClick={generatePDF} disabled={generating}>
      {generating ? (
        <><span className="pdf-spinner" /> Generating…</>
      ) : (
        <>📄 Download PDF</>
      )}
    </button>
  );
}
