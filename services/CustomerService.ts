
import { db } from './DatabaseService';
import { Booking } from '../types';

class CustomerService {
  getHistory(userId: string): Booking[] {
    return db.getBookings().filter(b => b.userId === userId).reverse();
  }
}

export const customerService = new CustomerService();
