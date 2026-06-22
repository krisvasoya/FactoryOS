/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * reset.js — wipes ALL data and creates a clean empty state.
 * New users can register and start fresh.
 * Run: node prisma/reset.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('⚠️  Starting full database reset...\n');

  // Delete in dependency order (children before parents)
  await prisma.payment.deleteMany({});
  console.log('✓ Cleared payments');

  await prisma.invoice.deleteMany({});
  console.log('✓ Cleared invoices');

  await prisma.salesOrderItem.deleteMany({});
  console.log('✓ Cleared sales order items');

  await prisma.salesOrder.deleteMany({});
  console.log('✓ Cleared sales orders');

  await prisma.purchaseOrderItem.deleteMany({});
  console.log('✓ Cleared purchase order items');

  await prisma.purchaseOrder.deleteMany({});
  console.log('✓ Cleared purchase orders');

  await prisma.customer.deleteMany({});
  console.log('✓ Cleared customers');

  await prisma.supplier.deleteMany({});
  console.log('✓ Cleared suppliers');

  await prisma.expense.deleteMany({});
  console.log('✓ Cleared expenses');

  await prisma.productionOrder.deleteMany({});
  console.log('✓ Cleared production orders');

  await prisma.bOMItem.deleteMany({});
  console.log('✓ Cleared BOM items');

  await prisma.billOfMaterials.deleteMany({});
  console.log('✓ Cleared BOMs');

  await prisma.attendance.deleteMany({});
  console.log('✓ Cleared attendance');

  await prisma.employee.deleteMany({});
  console.log('✓ Cleared employees');

  await prisma.maintenanceLog.deleteMany({});
  console.log('✓ Cleared maintenance logs');

  await prisma.machine.deleteMany({});
  console.log('✓ Cleared machines');

  await prisma.inventoryItem.deleteMany({});
  console.log('✓ Cleared inventory items');

  await prisma.stockMovement.deleteMany({});
  console.log('✓ Cleared stock movements');

  await prisma.warehouse.deleteMany({});
  console.log('✓ Cleared warehouses');

  await prisma.rawMaterial.deleteMany({});
  console.log('✓ Cleared raw materials');

  await prisma.product.deleteMany({});
  console.log('✓ Cleared products');

  await prisma.category.deleteMany({});
  console.log('✓ Cleared categories');

  await prisma.aIConversation.deleteMany({});
  console.log('✓ Cleared AI conversations');

  await prisma.notification.deleteMany({});
  console.log('✓ Cleared notifications');

  await prisma.auditLog.deleteMany({});
  console.log('✓ Cleared audit logs');

  await prisma.settings.deleteMany({});
  console.log('✓ Cleared settings');

  await prisma.user.deleteMany({});
  console.log('✓ Cleared users');

  await prisma.company.deleteMany({});
  console.log('✓ Cleared companies');

  console.log('\n✅ Database is now empty and clean.');
  console.log('   New users can register at /register and start fresh.\n');
}

main()
  .catch((e) => {
    console.error('❌ Reset failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
