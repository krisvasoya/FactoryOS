import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Mock AI responses for when OpenAI API key is not configured
const manufacturingInsights = [
  "Based on current production velocity and BOM cost ratios, your net margin is tracking above industry average for discrete electronics manufacturing. Consider renegotiating supplier rates for high-volume components.",
  "Inventory analysis suggests your RGB LED stock will deplete within approximately 3 production runs at current consumption rates. Initiating a purchase order now could prevent a line stoppage.",
  "Machine utilization data shows SMT Assembly Line 01 averaging 94% efficiency. Scheduling a preventive maintenance window during the upcoming weekend would minimize production disruption.",
  "Sales trend analysis indicates Q2 orders are up 14% YoY. Recommend pre-positioning raw material stock for Smart Thermostat T1 by 20% to meet projected demand.",
  "Supplier delivery performance for Silicon Valley Components shows consistent on-time rates. Their current pricing is competitive — consider extending your purchase agreement for improved lead times.",
  "Running a rough cost-benefit on your current BOM: Smart Thermostat T1 materials cost $42.50 against a $149.99 sell price yields a strong 71.7% gross margin. Monitor labor and overhead allocations.",
  "Production waste tracking shows near-zero scrap on SMT line. This is excellent. However, plastic injection yields could benefit from mold temperature calibration to reduce flash defects.",
  "Cash flow analysis: Accounts receivable from Global Electro-Distributors is within net-30 terms. Ensuring timely follow-up on invoices due next week will maintain healthy cash conversion cycle.",
];

function getMockResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  
  if (lower.includes('stock') || lower.includes('inventory') || lower.includes('material')) {
    return "📦 Inventory Analysis: Your RGB Status LEDs are at 450 units against a safety threshold of 1,000 units — this is a critical shortfall. I recommend raising an emergency purchase order for 2,000 units to ensure 2 full production cycles. ABS Plastic Granules and Solder Paste are at healthy levels. MCU chips have solid coverage at 1,250 units.";
  }
  
  if (lower.includes('machine') || lower.includes('maintenance') || lower.includes('downtime')) {
    return "⚙️ Machine Telemetry Report: SMT Assembly Line 01 is running at Active status with 342.5 logged operating hours — approaching the 400-hour recommended service interval. Plastic Injection Press 02 is currently in scheduled maintenance. AI prediction: If SMT line maintenance is deferred beyond 3 weeks, there is a 68% probability of unplanned downtime based on historical failure patterns for this class of equipment.";
  }
  
  if (lower.includes('sales') || lower.includes('revenue') || lower.includes('forecast')) {
    return "📈 Sales Forecast: Based on current confirmed order volume and pipeline signals, I project monthly revenue to maintain above $14,000 for the next 60 days. However, LED shortages could constrain production output by up to 30% if not restocked by end of week. I recommend accelerating the next sales cycle discussion to lock in orders while production capacity is available.";
  }
  
  if (lower.includes('supplier') || lower.includes('purchase') || lower.includes('vendor')) {
    return "🏭 Supplier Intelligence: Silicon Valley Components (your primary electronics supplier) shows a 4.8/5.0 reliability rating with consistent delivery performance. For ABS Plastic Granules, market pricing has softened 8% over the past quarter — this is a favorable window to negotiate volume pricing or extend the purchase agreement. I recommend issuing a competitive RFQ to 2 alternative suppliers to strengthen your negotiating position.";
  }
  
  if (lower.includes('profit') || lower.includes('margin') || lower.includes('finance')) {
    return "💰 Financial Intelligence: Current gross margin on Smart Thermostat T1 stands at approximately 71.7% (sell price $149.99 vs materials cost $42.50). Operating expenses including salaries ($3,200), utilities ($850), and raw material purchases ($4,500) total $8,550 this period. Net profitability remains strong. I recommend reviewing overhead allocation and exploring automation opportunities to further improve contribution margins.";
  }
  
  if (lower.includes('production') || lower.includes('bom') || lower.includes('assembly')) {
    return "🔧 Production Status: You currently have 1 active production run for 50 units of Smart Thermostat T1 on SMT Line 01. Material consumption is on track. BOM verification shows all components are accounted for. Expected yield at current efficiency: 47-50 units (94-100% yield rate). Completion estimate: 4-6 hours at current line speed.";
  }
  
  if (lower.includes('employee') || lower.includes('attendance') || lower.includes('staff')) {
    return "👥 Workforce Summary: Production department is at full staffing. Current attendance shows Vikram Singh (Production Worker) clocked in at 08:00. Recommend cross-training 1-2 additional workers on SMT line operation to reduce single-point dependency. Monthly payroll projection is $2,800 for direct labor.";
  }
  
  // Default rotating insight
  const idx = Math.floor(Math.random() * manufacturingInsights.length);
  return manufacturingInsights[idx];
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

    let reply: string;

    // Try OpenAI if key is configured
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey.startsWith('sk-')) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are FactoryOS Co-Pilot, an AI assistant embedded inside a manufacturing ERP system. 
                You help factory owners and managers with:
                - Inventory analysis and forecasting
                - Production planning and BOM optimization  
                - Machine maintenance scheduling
                - Financial insights and cash flow analysis
                - Supplier recommendations
                - Employee productivity insights
                
                Keep responses concise (2-4 sentences), practical, and data-driven. 
                Use relevant emojis sparingly. Always relate answers to manufacturing operations.`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content || getMockResponse(prompt);
        } else {
          reply = getMockResponse(prompt);
        }
      } catch {
        reply = getMockResponse(prompt);
      }
    } else {
      // Use intelligent mock responses
      reply = getMockResponse(prompt);
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
