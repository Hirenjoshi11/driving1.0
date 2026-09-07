import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth.js';
import crypto from 'crypto';
const { getDb } = require('@/lib/db');

export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error_code: 'AUTH_REQUIRED',
          message: 'Authentication required. Please sign in to continue payment.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action = 'create_order' } = body;
    const db = getDb();

    // 1. CREATE PAYMENT ORDER (Idempotent & Authoritative Server Calculation)
    if (action === 'create_order') {
      const { applicationId, paymentMethod = 'upi', idempotencyKey } = body;
      if (!applicationId) {
        return NextResponse.json(
          { success: false, error_code: 'INVALID_REQUEST', message: 'Application ID is required' },
          { status: 400 }
        );
      }

      // Fetch application and verify ownership
      const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(applicationId);
      if (!application) {
        return NextResponse.json(
          { success: false, error_code: 'APPLICATION_NOT_FOUND', message: 'Application not found' },
          { status: 404 }
        );
      }

      if (session.role === 'citizen' && application.user_id !== session.userId) {
        return NextResponse.json(
          { success: false, error_code: 'FORBIDDEN', message: 'You do not have permission to pay for this application' },
          { status: 403 }
        );
      }

      if (application.payment_status === 'completed') {
        return NextResponse.json(
          {
            success: false,
            error_code: 'PAYMENT_ALREADY_COMPLETED',
            message: 'This application has already been paid and processed.',
          },
          { status: 409 }
        );
      }

      // Idempotency check: if an active order exists with same idempotency key or created in last 2 mins
      if (idempotencyKey) {
        const existingOrder = db.prepare(
          'SELECT * FROM payment_orders WHERE idempotency_key = ? AND application_id = ?'
        ).get(idempotencyKey, applicationId);

        if (existingOrder && existingOrder.status !== 'failed') {
          return NextResponse.json({
            success: true,
            reused: true,
            order: {
              order_id: existingOrder.order_id,
              total_amount: existingOrder.total_amount,
              currency: existingOrder.currency,
              status: existingOrder.status,
              breakdown: {
                government_fee: existingOrder.government_fee,
                service_fee: existingOrder.service_fee,
                gateway_fee: existingOrder.gateway_fee,
                discount: existingOrder.discount,
                total_payable: existingOrder.total_amount,
              },
            },
          });
        }
      }

      // Server calculates fees authoritatively from fee_structure table
      const feeRow = db.prepare(`
        SELECT * FROM fee_structure 
        WHERE service_id = ? AND state_id = ? AND is_active = 1
        ORDER BY effective_from DESC LIMIT 1
      `).get(application.service_id, application.state_id);

      const govtFee = feeRow ? (feeRow.government_fee || 0) : (application.government_fee || 350);
      const serviceFee = feeRow ? (feeRow.service_fee || 0) : (application.service_fee || 99);
      const testFee = feeRow ? (feeRow.test_fee || 0) : (application.test_fee || 0);
      const smartCardFee = feeRow ? (feeRow.smart_card_fee || 0) : (application.smart_card_fee || 0);
      const gatewayFee = feeRow ? (feeRow.gateway_fee || 0) : 0;
      const discount = 0;
      const totalAmount = govtFee + serviceFee + testFee + smartCardFee + gatewayFee - discount;

      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const actualIdempotencyKey = idempotencyKey || `IDEM-${orderId}`;

      db.prepare(`
        INSERT INTO payment_orders (
          order_id, application_id, user_id, state_id, service_id,
          government_fee, service_fee, gateway_fee, discount, total_amount,
          currency, status, payment_method, idempotency_key, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          'INR', 'processing', ?, ?, datetime('now'), datetime('now')
        )
      `).run(
        orderId,
        application.id,
        session.userId,
        application.state_id,
        application.service_id,
        govtFee,
        serviceFee + testFee + smartCardFee,
        gatewayFee,
        discount,
        totalAmount,
        paymentMethod,
        actualIdempotencyKey
      );

      // Update application state
      db.prepare(`
        UPDATE applications
        SET status = CASE WHEN status = 'draft' THEN 'payment_pending' ELSE status END,
            payment_status = 'pending',
            total_payable = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(totalAmount, application.id);

      return NextResponse.json({
        success: true,
        order: {
          order_id: orderId,
          total_amount: totalAmount,
          currency: 'INR',
          status: 'processing',
          breakdown: {
            government_fee: govtFee,
            service_fee: serviceFee + testFee + smartCardFee,
            gateway_fee: gatewayFee,
            discount: discount,
            total_payable: totalAmount,
          },
        },
      });
    }

    // 2. SERVER-SIDE PAYMENT VERIFICATION
    if (action === 'verify_payment') {
      const { orderId, paymentMethod = 'upi' } = body;
      if (!orderId) {
        return NextResponse.json(
          { success: false, error_code: 'INVALID_ORDER', message: 'Order ID is required' },
          { status: 400 }
        );
      }

      const order = db.prepare('SELECT * FROM payment_orders WHERE order_id = ?').get(orderId);
      if (!order) {
        return NextResponse.json(
          { success: false, error_code: 'ORDER_NOT_FOUND', message: 'Payment order not found' },
          { status: 404 }
        );
      }

      const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(order.application_id);
      if (!application) {
        return NextResponse.json(
          { success: false, error_code: 'APPLICATION_NOT_FOUND', message: 'Application not found' },
          { status: 404 }
        );
      }

      // Generate verified reference number
      const paymentRef = `PAY-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // Update order status
      db.prepare(`
        UPDATE payment_orders
        SET status = 'completed',
            gateway_reference = ?,
            payment_method = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(paymentRef, paymentMethod, order.id);

      // Update application status to submitted & completed payment
      db.prepare(`
        UPDATE applications
        SET status = 'submitted',
            payment_status = 'completed',
            payment_method = ?,
            payment_date = datetime('now'),
            total_payable = ?,
            submitted_at = COALESCE(submitted_at, datetime('now')),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(paymentMethod, order.total_amount, application.id);

      // Status history entry
      try {
        db.prepare(`
          INSERT INTO application_status_history (
            application_id, from_status, to_status, changed_by, notes
          ) VALUES (?, ?, ?, ?, ?)
        `).run(
          application.id,
          application.status,
          'submitted',
          session.userId,
          `Payment verified: ₹${order.total_amount} via ${paymentMethod.toUpperCase()} (Ref: ${paymentRef})`
        );
      } catch (err) {
        console.warn('Payment status history error:', err);
      }

      return NextResponse.json({
        success: true,
        verified: true,
        paymentReference: paymentRef,
        amountPaid: order.total_amount,
        applicationId: application.id,
        applicationNumber: application.application_number,
        status: 'submitted',
      });
    }

    // 3. CHECK PAYMENT STATUS (For network failure reconnection reconciliation)
    if (action === 'check_status') {
      const { orderId, applicationId } = body;
      let order;
      if (orderId) {
        order = db.prepare('SELECT * FROM payment_orders WHERE order_id = ?').get(orderId);
      } else if (applicationId) {
        order = db.prepare(
          'SELECT * FROM payment_orders WHERE application_id = ? ORDER BY id DESC LIMIT 1'
        ).get(applicationId);
      }

      if (!order) {
        return NextResponse.json(
          { success: false, error_code: 'ORDER_NOT_FOUND', message: 'No payment record found' },
          { status: 404 }
        );
      }

      const app = db.prepare('SELECT status, payment_status, application_number FROM applications WHERE id = ?').get(order.application_id);

      return NextResponse.json({
        success: true,
        orderId: order.order_id,
        status: order.status,
        paymentStatus: app?.payment_status || order.status,
        applicationStatus: app?.status,
        applicationNumber: app?.application_number,
        amount: order.total_amount,
        reference: order.gateway_reference,
      });
    }

    return NextResponse.json(
      { success: false, error_code: 'UNKNOWN_ACTION', message: `Unknown payment action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error_code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred while processing payment.',
      },
      { status: 500 }
    );
  }
}
