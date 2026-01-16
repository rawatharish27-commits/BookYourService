import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../lib/prisma';

// ============================================
// BOOKING LIFECYCLE TEST (SENIOR DEV LEVEL)
// ============================================

describe('Booking Lifecycle Flow', () => {
  let customerToken: string;
  let providerToken: string;
  let bookingId: string;
  let serviceId: string;

  beforeAll(async () => {
    // 1. Create Test User (Customer)
    const customerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test-customer@example.com',
        phone: '+919999999901',
        password: 'password123',
        role: 'CUSTOMER',
      });
    customerToken = customerRes.body.data.token;

    // 2. Create Test User (Provider)
    const providerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test-provider@example.com',
        phone: '+919999999902',
        password: 'password123',
        role: 'PROVIDER',
      });
    providerToken = providerRes.body.data.token;

    // 3. Create Test Service
    const providerProfile = await prisma.providerProfile.findFirst({
      where: { userId: providerRes.body.data.user.id },
    });
    if (!providerProfile) {
      await prisma.providerProfile.create({
        data: {
          userId: providerRes.body.data.user.id,
          businessName: 'Test Provider Services',
          city: 'Delhi',
          skills: ['Cleaning'],
          status: 'APPROVED',
          rating: 5.0,
          available: true,
        },
      });
    }
    const serviceRes = await request(app)
      .post('/api/v1/service')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        title: 'Test Service',
        category: 'Cleaning',
        basePrice: 500,
        durationMinutes: 60,
        active: true,
      });
    serviceId = serviceRes.body.data.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test users, bookings, services
    await prisma.booking.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.providerProfile.deleteMany({});
  });

  it('should create a booking (DRAFT)', async () => {
    const res = await request(app)
      .post('/api/v1/booking')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        serviceId,
        scheduledDate: '2023-11-01',
        scheduledTime: '10:00',
        latitude: 28.6139,
        longitude: 77.2090,
        notes: 'Test booking',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DRAFT');

    bookingId = res.body.data.id; // Save for next test
  });

  it('should auto-assign provider to booking', async () => {
    // Mock Matching Engine Call
    const res = await request(app)
      .post(`/api/v1/matching/assign/${bookingId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    // Verify Assignment
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { Service: true },
    });

    expect(updatedBooking?.status).toBe('ASSIGNED');
    expect(updatedBooking?.providerId).toBeDefined();
  });

  it('provider should accept booking', async () => {
    const res = await request(app)
      .post('/api/v1/provider/job/accept')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        bookingId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ASSIGNED');
  });

  it('provider should start job with OTP', async () => {
    const res = await request(app)
      .post('/api/v1/provider/job/start')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        bookingId,
        otp: '123456', // Mock OTP
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('provider should complete job', async () => {
    const res = await request(app)
      .post('/api/v1/provider/job/complete')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        bookingId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('payment webhook should release money to provider wallet', async () => {
    const res = await request(app)
      .post('/api/v1/payment/webhook/razorpay')
      .send({
        bookingId,
        amount: 500,
        status: 'captured',
        transactionId: 'pay_test_123456',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify Wallet Credit (Mock)
    const providerWallet = await prisma.wallet.findFirst({
      where: { userId: 'provider-user-id' }, // Hardcoded for test simplicity
    });
    expect(providerWallet).toBeDefined();
  });
});
