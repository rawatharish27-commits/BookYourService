export class InvoiceService {
  generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }

  generateInvoice(bookingDetails: any, priceBreakdown: any) {
    return {
      invoiceNumber: this.generateInvoiceNumber(),
      date: new Date(),
      customer: {
        name: bookingDetails.customerName,
      },
      items: [
        { description: bookingDetails.serviceName, amount: priceBreakdown.basePrice },
        { description: 'Platform Fee', amount: priceBreakdown.platformFee }
      ],
      tax: {
        totalGst: priceBreakdown.gst
      },
      totalAmount: priceBreakdown.total
    };
  }
}

export const invoiceService = new InvoiceService();