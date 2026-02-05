# 🔄 END-TO-END SEQUENCE DIAGRAM

## (Client → Booking → Payment → Provider → Wallet)

### 🧠 Core Principles
* **Client provider choose nahi karta** (System Auto-Assigns)
* **Payment sirf webhook se verify hota** (Zero Trust Frontend)
* **Wallet credit sirf COMPLETED par** (Escrow-like logic)

---

### 1. BOOKING CREATION FLOW

```mermaid
sequenceDiagram
    participant Client
    participant API as Booking API
    participant DB as Database
    participant Engine as Auto-Assign Engine

    Client->>API: POST /bookings (Category, Time, Zone)
    API->>DB: Check Client Eligibility (Fraud Check)
    API->>Engine: Request Eligible Providers
    Engine->>DB: Query Providers (Active, Approved, In Zone)
    Engine->>Engine: Calculate Scores (Rating - Rejections)
    Engine->>DB: Check Availability (Slot Locking)
    Engine-->>API: Return Best Provider
    API->>DB: INSERT booking (Status: WAITING_PROVIDER)
    API-->>Client: 201 Created (Waiting)
```

### 2. PROVIDER HANDSHAKE

```mermaid
sequenceDiagram
    participant Provider
    participant API as Booking API
    participant DB as Database

    Provider->>API: GET /provider/bookings
    API-->>Provider: Show Incoming Request
    Provider->>API: PATCH /status (ACCEPTED)
    API->>DB: UPDATE bookings SET status='ACCEPTED'
    DB->>DB: UPDATE provider_stats (Total Bookings +1)
    API-->>Provider: 200 OK
```

### 3. PAYMENT FLOW (STRICT)

```mermaid
sequenceDiagram
    participant Client
    participant API as Payment API
    participant Gateway as Razorpay
    participant Webhook

    Client->>API: POST /payments/create
    API->>DB: Verify Booking Status (Must be ACCEPTED)
    API->>Gateway: Create Order
    Gateway-->>API: Order ID
    API-->>Client: Checkout Details

    Client->>Gateway: Enter Card Details
    Gateway-->>Client: Success

    Gateway->>Webhook: POST /webhook (payment.captured)
    Webhook->>DB: Verify Signature
    Webhook->>DB: Idempotency Check (Event ID)
    Webhook->>DB: UPDATE payments SET status='SUCCESS'
    Webhook->>DB: UPDATE bookings SET status='IN_PROGRESS'
    Webhook-->>Gateway: 200 OK
```

### 4. SETTLEMENT FLOW

```mermaid
sequenceDiagram
    participant Provider
    participant API as Booking API
    participant DB as Database

    Provider->>API: PATCH /status (COMPLETED)
    API->>DB: Validate Transition (IN_PROGRESS -> COMPLETED)
    API->>DB: UPDATE bookings SET status='COMPLETED'
    
    rect rgb(200, 255, 200)
    Note right of DB: FINANCIAL TRANSACTION
    DB->>DB: UPDATE provider_stats (Completed +1)
    DB->>DB: INSERT INTO wallet_transactions (Credit)
    DB->>DB: UPDATE provider_wallet SET balance = balance + amount
    end

    API-->>Provider: 200 OK
```

---

### 🔒 SYSTEM GUARDS (IMPLEMENTED)

1. **One booking ↔ One payment**: Enforced via Unique Constraint on `payments.booking_id`.
2. **Slot Locking**: DB Query checks overlap before assigning provider.
3. **Webhook Idempotency**: `webhook_events` table prevents replay attacks.
4. **State Machine**: Code enforces strict transitions (e.g., cannot go PENDING -> COMPLETED).
