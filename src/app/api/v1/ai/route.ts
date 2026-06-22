import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const factoryOSGuide = `
FactoryOS Modules & User Guide:
1. Products: Manage finished and semi-finished goods. Go to the Products page and click "+ Add Product". You can specify SKU, Name, Description, Selling Price, Production Cost, Unit, and Type.
2. Raw Materials: Catalog raw ingredients or parts. Go to Raw Materials and click "+ Add Material". You can configure SKU, Unit, Purchase Cost, and Minimum Stock (critical for low-stock alerts).
3. Inventory & Warehouses: Track stock levels. Under the Inventory page, view items across warehouses. Click "+ Log Stock Movement" to manually adjust quantities, run transfers, record material consumption, or issue finished goods.
4. Production (BOM & Orders):
   - Bill of Materials (BOM): A recipe mapping a Product to required Raw Materials and their quantities. First, create a BOM recipe.
   - Production Orders: Create an order to build products using a BOM and a Machine. Update the order status to InProgress, and then mark it Completed once done to calculate actual cost and material consumption.
5. Machines: View and register factory machines, runtime hours, and schedule maintenance logs.
6. Employees & Attendance: Enroll employees (department, role, salary) and clock in/out daily attendance. Click on any employee's name inside the directory to access their historical monthly attendance calendar.
7. Contacts: CRM hub. View Buyers (Customers) with credit limits and Suppliers with rating stars.
8. Orders (Purchase & Sales):
   - Purchase Orders (PO): Buy raw materials from Suppliers. Receiving a PO automatically adds raw materials to Central Warehouse.
   - Sales Orders (SO): Sell finished products to Customers. Shipping an SO automatically deducts finished products from Central Warehouse.
9. Finance: Create Invoices from Sales Orders. Accept payments (UPI, Card, Cash, Bank) and log Expenses across categories (Rent, Utilities, Salary, Maintenance) to calculate net profit.
10. Reports: Dynamic visual charts for Inventory Valuation, Production Cost Analysis, Yield Rates, and P&L statements.
11. Settings: Manage company profiles, GST configurations, default warehouse configurations, and user accounts.
`;

interface LowStockItem {
  name: string;
  current: number;
  min: number;
  unit: string;
}

function getDynamicMockResponse(
  prompt: string,
  metrics: {
    productCount: number;
    rawMaterialCount: number;
    categoryCount: number;
    warehouseCount: number;
    machineCount: number;
    employeeCount: number;
    customerCount: number;
    supplierCount: number;
    activeProductionCount: number;
    pendingPurchaseCount: number;
    pendingSalesCount: number;
    unpaidInvoiceCount: number;
    todayAttendanceCount: number;
    maintenanceMachineCount: number;
    lowStockItems: LowStockItem[];
  }
): string {
  const lower = prompt.toLowerCase();

  // How-to Questions
  if (
    lower.includes('how to') ||
    lower.includes('how do i') ||
    lower.includes('step to') ||
    lower.includes('where can i') ||
    lower.includes('where do i') ||
    lower.includes('steps to')
  ) {
    if (lower.includes('product')) {
      return "📦 How to manage Products: Go to the 'Products' tab in the sidebar and click the '+ Add Product' button. Enter the product's name, SKU, price/cost details, type (Finished/SemiFinished), and category. Make sure to populate categories first if needed!";
    }
    if (lower.includes('raw material') || lower.includes('material')) {
      return "🧱 How to manage Raw Materials: Navigate to the 'Raw Materials' tab in the sidebar. Click '+ Add Material' to register ingredients or parts, specifying their SKU, unit, purchase cost, and safety stock threshold (min stock).";
    }
    if (lower.includes('inventory') || lower.includes('stock') || lower.includes('warehouse')) {
      return "🏢 How to log Inventory: Head to the 'Inventory' tab. Here you can view current stock levels across all warehouses. Click '+ Log Stock Movement' to manually adjust quantities, run warehouse transfers, or record raw material consumption.";
    }
    if (lower.includes('bom') || lower.includes('recipe') || lower.includes('bill of material')) {
      return "🔧 How to create a BOM Recipe: In the 'Production' tab, click on '+ Create BOM Recipe'. Map a finished product to the precise raw materials and quantities required to manufacture a single unit of that product.";
    }
    if (lower.includes('production order') || lower.includes('production run') || lower.includes('manufacture')) {
      return "⚙️ How to run Production: Under the 'Production' tab, click '+ Create Production Order'. Select the Product, active BOM recipe, Target Machine, and run quantity. You can update the order status to InProgress, and then mark it Completed once done to calculate actual cost and raw material consumption.";
    }
    if (lower.includes('machine') || lower.includes('maintenance')) {
      return "📟 How to track Machines: Open the 'Machines' page. Register new machines with their codes. You can increment running hours, adjust status (Active, Maintenance, Offline), and record detailed maintenance logs.";
    }
    if (lower.includes('employee') || lower.includes('attendance') || lower.includes('salary') || lower.includes('staff')) {
      return "👥 How to manage Employees & Attendance: Go to the 'Employees' tab. You can enroll new employees with their department and role. Mark daily attendance using the calendar select widget. Click on any employee's name in the directory to see their full attendance calendar.";
    }
    if (lower.includes('contact') || lower.includes('supplier') || lower.includes('customer') || lower.includes('buyer')) {
      return "🤝 How to manage Contacts: Open the 'Contacts' page. Switch between 'Customers (Buyers)' (where you can track names and credit limit limits) and 'Suppliers' (where you can assign reliability rating stars).";
    }
    if (lower.includes('order') || lower.includes('purchase order') || lower.includes('sales order')) {
      return "🛒 How to manage Orders: Go to the 'Orders' page. Under 'Purchase Orders', buy raw materials from Suppliers. Under 'Sales Orders', place orders for finished goods from Customers. Updating status to 'Received' or 'Shipped' automatically updates central warehouse inventory levels!";
    }
    if (lower.includes('finance') || lower.includes('invoice') || lower.includes('payment') || lower.includes('expense')) {
      return "💰 How to track Finance: Go to the 'Finance' page. Click '+ Create Invoice' to link a customer and set pre-tax subtotals. You can record payments against invoices. Track operating expenses (rent, salaries, utility bills) under the 'Expenses Ledger' tab to see net profit.";
    }
    if (lower.includes('report') || lower.includes('chart') || lower.includes('analytics')) {
      return "📊 How to view Reports: Navigate to the 'Reports' tab. View interactive graphs tracking inventory valuation, production order efficiency, yields, monthly profit margins, and standard audit trails.";
    }
  }

  // Data Queries
  if (lower.includes('product')) {
    return `📦 Product Catalog: You currently have ${metrics.productCount} finished/semi-finished products registered in your catalog. You can organize these products inside ${metrics.categoryCount} categories. To add new products, go to the Products tab.`;
  }

  if (
    lower.includes('raw material') ||
    lower.includes('material') ||
    lower.includes('stock') ||
    lower.includes('inventory') ||
    lower.includes('warehouse')
  ) {
    let stockMsg = `📦 Inventory Status: You have ${metrics.rawMaterialCount} raw materials across ${metrics.warehouseCount} warehouses.`;
    if (metrics.lowStockItems.length > 0) {
      stockMsg += ` ⚠️ Critical Shortfalls: The following items are below minimum safety stock levels: ${metrics.lowStockItems
        .map((i) => `${i.name} (${i.current}/${i.min} ${i.unit})`)
        .join(', ')}. Recommend creating a Purchase Order.`;
    } else {
      stockMsg += ` ✅ Good news: All raw materials are currently above minimum safety thresholds.`;
    }
    return stockMsg;
  }

  if (lower.includes('machine') || lower.includes('maintenance')) {
    return `⚙️ Machine Fleet: Tracking a total of ${metrics.machineCount} factory machines. Currently, ${
      metrics.maintenanceMachineCount
    } machines are in Maintenance status and ${metrics.machineCount - metrics.maintenanceMachineCount} are Active. Add runtime details or log downtime in the Machines page.`;
  }

  if (lower.includes('production') || lower.includes('bom') || lower.includes('recipe')) {
    return `🔧 Production Pipeline: You currently have ${metrics.activeProductionCount} active/pending production orders. Ensure you have mapped BOM recipes under the Production page before starting a new run.`;
  }

  if (lower.includes('employee') || lower.includes('attendance') || lower.includes('staff')) {
    return `👥 Workforce Stats: There are ${metrics.employeeCount} active employees registered in your system. For today, ${metrics.todayAttendanceCount} employees are clocked in as Present. You can manage shifts and view calendars on the Employees page.`;
  }

  if (lower.includes('supplier') || lower.includes('customer') || lower.includes('contact') || lower.includes('buyer')) {
    return `🤝 Supply Chain: Connected with ${metrics.supplierCount} suppliers (monitored by rating stars) and ${metrics.customerCount} customers (monitored by credit limits). Manage them in the Contacts page.`;
  }

  if (lower.includes('order') || lower.includes('purchase') || lower.includes('sales')) {
    return `🛒 Order Queues: Tracking ${metrics.pendingPurchaseCount} active Purchase Orders and ${metrics.pendingSalesCount} active Sales Orders. Received purchase orders will add raw materials to stock, and shipped sales orders will deduct products.`;
  }

  if (lower.includes('finance') || lower.includes('invoice') || lower.includes('expense') || lower.includes('revenue') || lower.includes('profit')) {
    return `💰 Finance Ledger: Currently tracking ${metrics.unpaidInvoiceCount} unpaid customer invoices. Make sure to log operational expenses (salaries, utility bills, rent) in the Finance page to see net profitability reports.`;
  }

  return `Hello! I am your FactoryOS assistant. You currently have ${metrics.productCount} products, ${metrics.rawMaterialCount} raw materials, ${metrics.employeeCount} employees, and ${metrics.machineCount} machines configured in your company. Let me know if you need help with any specific module, or ask me 'How do I do X?' to get step-by-step instructions.`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const { companyId } = session;

    // 1. Gather all live metrics from database
    const [
      productCount,
      rawMaterialCount,
      categoryCount,
      warehouseCount,
      machineCount,
      employeeCount,
      customerCount,
      supplierCount,
      activeProductionCount,
      pendingPurchaseCount,
      pendingSalesCount,
      unpaidInvoiceCount,
      maintenanceMachineCount,
    ] = await Promise.all([
      db.product.count({ where: { companyId, deletedAt: null } }),
      db.rawMaterial.count({ where: { companyId, deletedAt: null } }),
      db.category.count({ where: { companyId, deletedAt: null } }),
      db.warehouse.count({ where: { companyId, deletedAt: null } }),
      db.machine.count({ where: { companyId, deletedAt: null } }),
      db.employee.count({ where: { companyId, deletedAt: null } }),
      db.customer.count({ where: { companyId, deletedAt: null } }),
      db.supplier.count({ where: { companyId, deletedAt: null } }),
      db.productionOrder.count({ where: { companyId, status: { in: ['Pending', 'InProgress'] }, deletedAt: null } }),
      db.purchaseOrder.count({ where: { companyId, status: { in: ['Draft', 'Ordered'] }, deletedAt: null } }),
      db.salesOrder.count({ where: { companyId, status: { in: ['Draft', 'Confirmed'] }, deletedAt: null } }),
      db.invoice.count({ where: { companyId, status: 'Unpaid', deletedAt: null } }),
      db.machine.count({ where: { companyId, status: 'Maintenance', deletedAt: null } }),
    ]);

    // Gather today's attendance count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendanceCount = await db.attendance.count({
      where: {
        employee: { companyId },
        date: { gte: today },
        status: 'Present',
        deletedAt: null,
      },
    });

    // Gather low stock items
    const rawMaterials = await db.rawMaterial.findMany({
      where: { companyId, minStock: { gt: 0 }, deletedAt: null },
      include: { inventoryItems: { where: { deletedAt: null } } },
    });
    const lowStockItems = rawMaterials
      .map((rm) => {
        const currentQty = rm.inventoryItems.reduce((acc, item) => acc + item.quantity, 0);
        return { name: rm.name, current: currentQty, min: rm.minStock, unit: rm.unit };
      })
      .filter((item) => item.current < item.min);

    const metrics = {
      productCount,
      rawMaterialCount,
      categoryCount,
      warehouseCount,
      machineCount,
      employeeCount,
      customerCount,
      supplierCount,
      activeProductionCount,
      pendingPurchaseCount,
      pendingSalesCount,
      unpaidInvoiceCount,
      todayAttendanceCount,
      maintenanceMachineCount,
      lowStockItems,
    };

    let reply: string;

    // Check if new company (no products registered)
    if (productCount === 0 && rawMaterialCount === 0) {
      reply =
        "Welcome to FactoryOS! I noticed your workspace is empty. To get started, navigate to the Products page to catalog your finished goods, add Raw Materials, or register Suppliers & Customers under Contacts. Let me know if you would like me to explain how any of these modules work!";
    } else {
      const openaiKey = process.env.OPENAI_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      const systemPrompt = `You are FactoryOS Co-Pilot, an AI assistant embedded inside a manufacturing ERP system. 
You help factory owners and managers understand and navigate the system, as well as analyze real-time operations, inventory levels, machine status, and finance stats.

CURRENT COMPANY METRICS (from active database):
- Registered Products: ${productCount}
- Raw Materials: ${rawMaterialCount}
- Categories: ${categoryCount}
- Warehouses: ${warehouseCount}
- Machines: ${machineCount} (${maintenanceMachineCount} in maintenance, ${machineCount - maintenanceMachineCount} active)
- Employees: ${employeeCount} (${todayAttendanceCount} present today)
- CRM Contacts: ${supplierCount} suppliers, ${customerCount} buyers/customers
- Production: ${activeProductionCount} active production orders
- Purchase Orders: ${pendingPurchaseCount} active/pending
- Sales Orders: ${pendingSalesCount} active/pending
- Finance: ${unpaidInvoiceCount} unpaid invoices
${lowStockItems.length > 0 ? `- Low Stock Raw Materials: ${lowStockItems.map((i) => `${i.name} (Current: ${i.current}, Min: ${i.min} ${i.unit})`).join(', ')}` : '- Low Stock Raw Materials: None'}

FACTORYOS MODULES & USER GUIDE:
${factoryOSGuide}

Always answer user questions contextually based on either how to use the project features or using the real-time company metrics above. If they ask about stock, products, or employees, refer to the actual numbers above. Keep responses concise (3-5 sentences), friendly, and direct. Use relevant emojis sparingly.`;

      // 1. Try Gemini
      if (geminiKey) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `System instructions and context:\n${systemPrompt}\n\nUser query: ${prompt}`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  maxOutputTokens: 350,
                  temperature: 0.7,
                },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || getDynamicMockResponse(prompt, metrics);
          } else {
            reply = getDynamicMockResponse(prompt, metrics);
          }
        } catch {
          reply = getDynamicMockResponse(prompt, metrics);
        }
      }
      // 2. Try OpenAI
      else if (openaiKey && openaiKey.startsWith('sk-')) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
              ],
              max_tokens: 350,
              temperature: 0.7,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            reply = data.choices?.[0]?.message?.content || getDynamicMockResponse(prompt, metrics);
          } else {
            reply = getDynamicMockResponse(prompt, metrics);
          }
        } catch {
          reply = getDynamicMockResponse(prompt, metrics);
        }
      } else {
        // Dynamic fallback response
        reply = getDynamicMockResponse(prompt, metrics);
      }
    }

    // Save conversation to DB
    await db.aIConversation.create({
      data: {
        companyId: session.companyId,
        userId: session.userId,
        message: prompt,
        response: reply,
      },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
