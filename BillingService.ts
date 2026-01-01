import db from './DatabaseService';
import { BookingStatus, Addon } from './types';

class BillingService {
  async generateBill(bookingId: string, addons: Addon[]) {
    const bookingsList = db.getBookings();
    const bNode = bookingsList.find(x => x.id === bookingId);
    
    if (!bNode) {
      return { success: false, error: 'Booking node not found in ontology' };
    }

    const addonPriceValue: number = addons.reduce((sum: number, item: Addon) => sum + (item.price || 0), 0);
    const finalCalculatedTotal: number = (bNode.basePrice || 0) + addonPriceValue;

    if (finalCalculatedTotal > (bNode.maxPrice || 0)) {
      return { success: false, error: 'Price cap violation detected: Manual override required.' };
    }
    
    await db.updateBooking(bookingId, { 
        status: BookingStatus.COMPLETED, 
        total: finalCalculatedTotal 
    });

    return { 
      success: true, 
      amount: finalCalculatedTotal 
    };
  }
}

const billingServiceInstance = new BillingService();
export { billingServiceInstance as billingService };
export default billingServiceInstance;