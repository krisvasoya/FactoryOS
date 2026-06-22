import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;

    // Fetch Invoices
    const invoices = await db.invoice.findMany({
      where: { companyId, deletedAt: null },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch Payments
    const payments = await db.payment.findMany({
      where: { companyId, deletedAt: null },
      include: { invoice: true },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch Expenses
    const expenses = await db.expense.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ invoices, payments, expenses });
  } catch (error) {
    console.error('Finance retrieve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = session;
    const body = await req.json();
    const { action } = body; // "createInvoice" or "createExpense" or "recordPayment"

    if (action === 'createInvoice') {
      const { customerId, subTotal, dueDate } = body;

      if (!customerId || !subTotal || !dueDate) {
        return NextResponse.json({ error: 'Missing customer or invoice totals' }, { status: 400 });
      }

      // Verify customer belongs to company
      const customer = await db.customer.findFirst({
        where: { id: customerId, companyId, deletedAt: null }
      });
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const subTotalVal = parseFloat(subTotal);
      if (isNaN(subTotalVal) || subTotalVal <= 0) {
        return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
      }

      const taxRate = 0.18; // standard 18% GST
      const taxAmount = subTotalVal * taxRate;
      const totalAmount = subTotalVal + taxAmount;
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

      const invoice = await db.invoice.create({
        data: {
          companyId,
          customerId,
          invoiceNumber,
          dueDate: new Date(dueDate),
          subTotal: subTotalVal,
          taxAmount,
          totalAmount,
          status: 'Unpaid',
        },
      });

      // Audit Log
      await db.auditLog.create({
        data: {
          companyId,
          userId: session.userId,
          action: 'Create Invoice',
          entity: 'Invoice',
          entityId: invoice.id,
          details: `Invoice created: ${invoiceNumber}, amount: ${totalAmount}`,
        },
      });

      return NextResponse.json(invoice, { status: 201 });
    }

    if (action === 'createExpense') {
      const { category, amount, description, date } = body;

      if (!category || !amount) {
        return NextResponse.json({ error: 'Missing category or expense amount' }, { status: 400 });
      }

      const amountVal = parseFloat(amount);
      if (isNaN(amountVal) || amountVal <= 0) {
        return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
      }

      const expense = await db.expense.create({
        data: {
          companyId,
          category,
          amount: amountVal,
          description: description || null,
          date: date ? new Date(date) : new Date(),
        },
      });

      // Audit Log
      await db.auditLog.create({
        data: {
          companyId,
          userId: session.userId,
          action: 'Create Expense',
          entity: 'Expense',
          entityId: expense.id,
          details: `Expense logged: ${category}, amount: ${amountVal}`,
        },
      });

      return NextResponse.json(expense, { status: 201 });
    }

    if (action === 'recordPayment') {
      const { invoiceId, amount, method, reference } = body;

      if (!invoiceId || !amount || !method) {
        return NextResponse.json({ error: 'Missing payment metadata' }, { status: 400 });
      }

      const amountVal = parseFloat(amount);
      if (isNaN(amountVal) || amountVal <= 0) {
        return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
      }

      // Verify invoice belongs to company
      const invoice = await db.invoice.findFirst({
        where: { id: invoiceId, companyId, deletedAt: null }
      });
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      const payment = await db.$transaction(async (tx) => {
        const pay = await tx.payment.create({
          data: {
            companyId,
            invoiceId,
            amount: amountVal,
            method,
            reference,
          },
        });

        // Update invoice status to paid
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: 'Paid' },
        });

        return pay;
      });

      // Audit Log
      await db.auditLog.create({
        data: {
          companyId,
          userId: session.userId,
          action: 'Record Payment',
          entity: 'Payment',
          entityId: payment.id,
          details: `Logged payment of ${amountVal} for invoice ID ${invoiceId}`,
        },
      });

      return NextResponse.json(payment, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    console.error('Finance operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
