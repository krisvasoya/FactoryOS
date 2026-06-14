const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Create Company (Tenant)
  const company = await prisma.company.create({
    data: {
      name: 'Apex Manufacturing Tech',
      email: 'contact@apexmfg.com',
      phone: '+1 (555) 123-4567',
      address: '100 Industrial Parkway, Sector 4, Tech City',
      gstNumber: '29AAAAA1111A1Z1',
    },
  });

  console.log(`Created Company: ${company.name} (${company.id})`);

  // 2. Create Default Owner User
  const passwordHash = await bcrypt.hash('password123', 10);
  const owner = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'owner@factoryos.com',
      passwordHash: passwordHash,
      name: 'Arjun Sharma',
      role: 'Owner',
    },
  });

  console.log(`Created Owner User: ${owner.email}`);

  // Create additional users for demo
  await prisma.user.createMany({
    data: [
      {
        companyId: company.id,
        email: 'production@factoryos.com',
        passwordHash: passwordHash,
        name: 'Amit Patel',
        role: 'Production',
      },
      {
        companyId: company.id,
        email: 'warehouse@factoryos.com',
        passwordHash: passwordHash,
        name: 'Rajesh Kumar',
        role: 'Warehouse',
      },
      {
        companyId: company.id,
        email: 'finance@factoryos.com',
        passwordHash: passwordHash,
        name: 'Sonia Verma',
        role: 'Accountant',
      },
    ],
  });

  // 3. Create Categories
  const catElectronics = await prisma.category.create({
    data: { companyId: company.id, name: 'Electronics', description: 'PCB, Chips, and sensors' },
  });
  const catPlastics = await prisma.category.create({
    data: { companyId: company.id, name: 'Plastics', description: 'Resins and molded casings' },
  });
  const catFinished = await prisma.category.create({
    data: { companyId: company.id, name: 'Finished Products', description: 'Ready for shipment' },
  });

  // 4. Create Raw Materials
  const rawMCU = await prisma.rawMaterial.create({
    data: {
      companyId: company.id,
      categoryId: catElectronics.id,
      sku: 'RM-MCU-08',
      name: '32-bit Microcontroller Chip',
      description: 'Core processing chip for smart controllers',
      cost: 7.50,
      unit: 'pcs',
      minStock: 200,
    },
  });

  const rawLED = await prisma.rawMaterial.create({
    data: {
      companyId: company.id,
      categoryId: catElectronics.id,
      sku: 'RM-LED-RG',
      name: 'RGB Status Indicator LED',
      description: 'Multi-color status light',
      cost: 0.20,
      unit: 'pcs',
      minStock: 1000,
    },
  });

  const rawABS = await prisma.rawMaterial.create({
    data: {
      companyId: company.id,
      categoryId: catPlastics.id,
      sku: 'RM-PLA-ABS',
      name: 'ABS Plastic Granules (Premium)',
      description: 'High grade injection molding plastic',
      cost: 3.20,
      unit: 'kg',
      minStock: 500,
    },
  });

  const rawSolder = await prisma.rawMaterial.create({
    data: {
      companyId: company.id,
      categoryId: catElectronics.id,
      sku: 'RM-SLD-PST',
      name: 'Lead-free Solder Paste',
      description: 'Assembly line solder paste',
      cost: 15.00,
      unit: 'kg',
      minStock: 50,
    },
  });

  console.log('Created Raw Materials');

  // 5. Create Finished Goods Products
  const prodThermostat = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: catFinished.id,
      sku: 'FG-SMT-T1',
      name: 'Apex Smart Thermostat T1',
      description: 'IoT enabled residential thermostat',
      price: 149.99,
      cost: 42.50,
      unit: 'pcs',
      type: 'Finished',
    },
  });

  const prodEnclosure = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: catPlastics.id,
      sku: 'SF-ENC-T1',
      name: 'Thermostat Plastic Enclosure Unit',
      description: 'Molded plastic casing for Smart Thermostat',
      price: 18.00,
      cost: 4.80,
      unit: 'pcs',
      type: 'SemiFinished',
    },
  });

  console.log('Created Products');

  // 6. Create Bill of Materials (BOM)
  const bomThermostat = await prisma.billOfMaterials.create({
    data: {
      companyId: company.id,
      productId: prodThermostat.id,
      name: 'BOM - Thermostat T1 standard',
      version: '1.0',
      isActive: true,
    },
  });

  // MCU, LEDs, Solder Paste, and plastic enclosure
  await prisma.bOMItem.createMany({
    data: [
      { bomId: bomThermostat.id, rawMaterialId: rawMCU.id, quantity: 1.0 },
      { bomId: bomThermostat.id, rawMaterialId: rawLED.id, quantity: 4.0 },
      { bomId: bomThermostat.id, rawMaterialId: rawSolder.id, quantity: 0.05 }, // 50 grams
    ],
  });

  console.log('Created BOM');

  // 7. Create Warehouses
  const whMain = await prisma.warehouse.create({
    data: { companyId: company.id, name: 'Central Warehouse', location: 'Building A' },
  });
  const whTransit = await prisma.warehouse.create({
    data: { companyId: company.id, name: 'Secondary Hub', location: 'Building B' },
  });

  // 8. Add Inventory Items
  await prisma.inventoryItem.createMany({
    data: [
      {
        companyId: company.id,
        warehouseId: whMain.id,
        rawMaterialId: rawMCU.id,
        quantity: 1250,
        batchNumber: 'B-MCU-2026A',
      },
      {
        companyId: company.id,
        warehouseId: whMain.id,
        rawMaterialId: rawLED.id,
        quantity: 450, // LOW STOCK (minStock is 1000)
        batchNumber: 'B-LED-490',
      },
      {
        companyId: company.id,
        warehouseId: whMain.id,
        rawMaterialId: rawABS.id,
        quantity: 800,
        batchNumber: 'B-PLA-09A',
      },
      {
        companyId: company.id,
        warehouseId: whMain.id,
        rawMaterialId: rawSolder.id,
        quantity: 65,
        batchNumber: 'B-SLD-261',
      },
      {
        companyId: company.id,
        warehouseId: whMain.id,
        productId: prodThermostat.id,
        quantity: 120,
        batchNumber: 'B-FG-T1-88',
      },
    ],
  });

  console.log('Created Inventory Levels');

  // 9. Machines
  const machineSMT = await prisma.machine.create({
    data: {
      companyId: company.id,
      name: 'SMT Assembly Line 01',
      code: 'MCH-SMT-01',
      status: 'Active',
      runningHours: 342.5,
      lastMaintenance: new Date('2026-05-15'),
    },
  });

  const machineInjection = await prisma.machine.create({
    data: {
      companyId: company.id,
      name: 'Plastic Injection Press 02',
      code: 'MCH-INJ-02',
      status: 'Maintenance',
      runningHours: 924.0,
      lastMaintenance: new Date('2026-06-01'),
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      machineId: machineInjection.id,
      description: 'Hydraulic seal replacement and recalibration',
      cost: 450.00,
      scheduledAt: new Date('2026-06-12'),
      completedAt: new Date('2026-06-13'),
      notes: 'Completed successfully, pressure checks passed.',
    },
  });

  console.log('Created Machines & Maintenance');

  // 10. Employees & Attendance
  const empWorker = await prisma.employee.create({
    data: {
      companyId: company.id,
      name: 'Vikram Singh',
      email: 'vikram@apexmfg.com',
      phone: '+1 (555) 987-6543',
      department: 'Production',
      role: 'Worker',
      salary: 2800,
    },
  });

  await prisma.attendance.create({
    data: {
      employeeId: empWorker.id,
      date: new Date(),
      status: 'Present',
      clockIn: new Date(new Date().setHours(8, 0, 0)),
      clockOut: new Date(new Date().setHours(17, 0, 0)),
    },
  });

  // 11. Customers & Suppliers
  const customer = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: 'Global Electro-Distributors',
      contactName: 'Sarah Jenkins',
      email: 'sjenkins@globaldist.com',
      phone: '+1 (555) 321-4567',
      address: '450 Logistics Blvd, Chicago, IL',
      creditLimit: 50000.0,
    },
  });

  const supplier = await prisma.supplier.create({
    data: {
      companyId: company.id,
      name: 'Silicon Valley Components',
      contactName: 'Mark Chen',
      email: 'mchen@svcomponents.com',
      phone: '+1 (555) 890-1234',
      address: '22 Tech Way, San Jose, CA',
      rating: 4.8,
    },
  });

  // 12. Sales Orders & Invoices & Payments (to populate dashboard charts and revenue ledger)
  const salesOrder = await prisma.salesOrder.create({
    data: {
      companyId: company.id,
      customerId: customer.id,
      soNumber: 'SO-2026-001',
      status: 'Confirmed',
      totalAmount: 14999.00,
    },
  });

  await prisma.salesOrderItem.create({
    data: {
      salesOrderId: salesOrder.id,
      productId: prodThermostat.id,
      quantity: 100,
      unitPrice: 149.99,
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      companyId: company.id,
      customerId: customer.id,
      salesOrderId: salesOrder.id,
      invoiceNumber: 'INV-2026-001',
      status: 'Paid',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days out
      subTotal: 14999.00,
      taxAmount: 2699.82, // 18% GST
      totalAmount: 17698.82,
    },
  });

  await prisma.payment.create({
    data: {
      companyId: company.id,
      invoiceId: invoice.id,
      amount: 17698.82,
      method: 'Bank',
      reference: 'TXN-BK-991023',
      createdAt: new Date(),
    },
  });

  // Add some expenses (salaries, utility bills, raw material purchases)
  await prisma.expense.createMany({
    data: [
      { companyId: company.id, category: 'Salaries', amount: 3200, description: 'May payroll', date: new Date('2026-05-30') },
      { companyId: company.id, category: 'Utilities', amount: 850, description: 'Power and water factory bills', date: new Date('2026-06-02') },
      { companyId: company.id, category: 'Raw Materials', amount: 4500, description: 'Silicon microchips purchase', date: new Date('2026-06-05') },
    ],
  });

  // Production Orders
  await prisma.productionOrder.create({
    data: {
      companyId: company.id,
      productId: prodThermostat.id,
      bomId: bomThermostat.id,
      machineId: machineSMT.id,
      quantity: 50,
      status: 'InProgress',
      cost: 2125.00,
      startDate: new Date(),
    },
  });

  await prisma.productionOrder.create({
    data: {
      companyId: company.id,
      productId: prodThermostat.id,
      bomId: bomThermostat.id,
      machineId: machineSMT.id,
      quantity: 20,
      status: 'Completed',
      cost: 850.00,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
  });

  // AI Insights Recommendation Settings
  await prisma.settings.create({
    data: {
      companyId: company.id,
      key: 'ai_production_optimization',
      value: 'true',
    },
  });

  console.log('Seeding Completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
