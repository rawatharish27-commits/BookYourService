import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from "supertest";
import app from "../app";
import { db } from "../config/db";

// Cleanup before tests
beforeAll(async () => {
    // Optional: Clear test DB or Mock DB connection here
    // For production safety, usually we mock the DB or run against a test_db
    // This is a smoke test example assuming a running dev DB or mocked response
});

afterAll(async () => {
    await db.end();
});

describe("Auth API", () => {
  it("should return health check ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual("ok");
  });

  it("should block registration with invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "not-an-email",
      phone: "1234567890",
      password: "password123",
      role: "CLIENT"
    });
    expect(res.statusCode).toEqual(400); // Zod validation error
  });

  // Add more tests for real DB flows if using a dedicated test database
});