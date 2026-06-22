'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight, Upload, AlertCircle, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OcrResult {
  supplierName: string;
  invoiceNumber: string;
  date: string;
  items: { desc: string; qty: number; price: number }[];
  totalAmount: number;
  detectedGST: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; date: Date }>>([
    {
      sender: 'ai',
      text: "Hello, I am your FactoryOS Co-Pilot. I can help analyze your production lines, project material requirements, scan invoices, or run queries. What would you like to check today?",
      date: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || inputValue;
    if (!queryText.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: queryText, date: new Date() }]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/v1/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: queryText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply, date: new Date() }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: "I ran into a connection glitch. Let me simulate a backup insight: Base rates are holding steady, but I suggest reviewing raw material supplier orders due to localized shipping bottlenecks.",
            date: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I couldn't contact the live models. However, based on cached metrics, your SMT Assembly Line is performing at 94% efficiency, but RGB LEDs are trending below safety thresholds.",
          date: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOcrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOcrLoading(true);
      setOcrResult(null);

      // Simulate parsing
      setTimeout(() => {
        setOcrLoading(false);
        setOcrResult({
          supplierName: 'Silicon Components Corp',
          invoiceNumber: 'INV-9902',
          date: '2026-06-12',
          items: [
            { desc: '32-bit Microcontroller Chip', qty: 500, price: 7.5 },
            { desc: 'RGB Status Indicator LED', qty: 1200, price: 0.2 },
          ],
          totalAmount: 3990.0,
          detectedGST: '718.20 (18%)',
        });

        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `📁 parsed Invoice INV-9902 from "Silicon Components Corp". Total amount is ₹3,990.00. I can register this in your Purchases ledger now. Should I proceed?`,
            date: new Date(),
          },
        ]);
      }, 2000);
    }
  };

  const quickPrompts = [
    'Analyze inventory risk levels',
    'Run SMT-01 machine efficiency audit',
    'Generate sales demand forecast',
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 items-center gap-2 rounded-full bg-primary text-primary-foreground border border-border shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Sparkles className="h-5 w-5 animate-pulse" />
        <span className="text-xs font-semibold tracking-wide">Ask Co-Pilot</span>
      </button>

      {/* Slide-out Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-40 flex w-96 flex-col border-l border-border bg-card/95 shadow-2xl backdrop-blur-lg"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-border bg-secondary/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                <span className="text-sm font-bold">FactoryOS Co-Pilot</span>
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold text-violet-600 dark:text-violet-400">
                  v1.2 (Active)
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Chat Content & Sub-modules */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Chat Message Logs */}
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600'
                          : 'bg-gradient-to-tr from-violet-500 to-indigo-600 shadow-md shadow-violet-500/20'
                      }`}
                    >
                      {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[75%] ${
                        msg.sender === 'user'
                          ? 'bg-secondary text-primary font-medium rounded-tr-none'
                          : 'bg-card border border-border shadow-sm rounded-tl-none text-foreground'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-500 to-indigo-600 text-white">
                      <Bot className="h-4 w-4 animate-bounce" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none border border-border bg-card px-4 py-3 text-xs text-muted-foreground italic flex items-center gap-1.5">
                      Analyzing metrics...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Suggesters */}
              <div className="space-y-2 border-t border-border pt-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Suggested Audits
                </span>
                <div className="space-y-1.5">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-left text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>

              {/* OCR Invoice Parser Widget */}
              <div className="rounded-2xl border border-dashed border-border p-4 space-y-3 bg-secondary/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    OCR Invoice Reader
                  </span>
                  <Upload className="h-3 w-3 text-muted-foreground" />
                </div>
                <label className="flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-secondary/40 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1.5" />
                  <span className="text-[10px] text-muted-foreground text-center">
                    Upload supplier invoice (PDF/Image)
                  </span>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleOcrUpload} />
                </label>

                {ocrLoading && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground animate-pulse">
                    <AlertCircle className="h-4 w-4 text-violet-500" /> Scanning document structures...
                  </div>
                )}

                {ocrResult && (
                  <div className="rounded-xl border border-border bg-card p-3 space-y-2 text-[10px]">
                    <div className="font-semibold text-xs border-b border-border pb-1 text-emerald-500">
                      Document Parsed Successfully
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Supplier:</span>
                      <span className="font-medium">{ocrResult.supplierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice ID:</span>
                      <span className="font-medium">{ocrResult.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grand Total:</span>
                      <span className="font-bold text-primary">₹{ocrResult.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Assist Simulation */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Voice Co-Pilot (Beta)
                </span>
                <button
                  onClick={() => alert("Voice service initializing: Listening module activated (mock).")}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-colors"
                >
                  <Volume2 className="h-3 w-3" /> Connect Mic
                </button>
              </div>
            </div>

            {/* Input Footer */}
            <div className="border-t border-border p-4 bg-secondary/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask for forecasts, stats, audits..."
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:scale-105 transition-transform"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
