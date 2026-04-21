'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Holding, Transaction } from '@/types/portfolio';

const HOLDINGS_KEY = 'ngxglass-portfolio';
const TX_KEY       = 'ngxglass-transactions';

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    try {
      setHoldings(JSON.parse(localStorage.getItem(HOLDINGS_KEY) || '[]'));
      setTransactions(JSON.parse(localStorage.getItem(TX_KEY) || '[]'));
    } catch {
      setHoldings([]);
      setTransactions([]);
    }
  }, []);

  const saveHoldings = useCallback((next: Holding[]) => {
    setHoldings(next);
    localStorage.setItem(HOLDINGS_KEY, JSON.stringify(next));
  }, []);

  const saveTx = useCallback((next: Transaction[]) => {
    setTransactions(next);
    localStorage.setItem(TX_KEY, JSON.stringify(next));
  }, []);

  const addHolding = useCallback((holding: Holding) => {
    setHoldings(prev => {
      const existing = prev.find(h => h.sym === holding.sym);
      let next: Holding[];
      if (existing) {
        // Weighted average cost
        const totalShares = existing.shares + holding.shares;
        const avgCost = (existing.avgCost * existing.shares + holding.avgCost * holding.shares) / totalShares;
        next = prev.map(h => h.sym === holding.sym ? { ...h, shares: totalShares, avgCost } : h);
      } else {
        next = [...prev, holding];
      }
      localStorage.setItem(HOLDINGS_KEY, JSON.stringify(next));
      return next;
    });

    // Log transaction
    const tx: Transaction = {
      sym: holding.sym,
      shares: holding.shares,
      price: holding.avgCost,
      date: holding.buyDate || new Date().toISOString().slice(0, 10),
      type: 'BUY',
      note: holding.note,
    };
    setTransactions(prev => {
      const next = [tx, ...prev];
      localStorage.setItem(TX_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeHolding = useCallback((sym: string) => {
    setHoldings(prev => {
      const next = prev.filter(h => h.sym !== sym);
      localStorage.setItem(HOLDINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearPortfolio = useCallback(() => {
    saveHoldings([]);
    saveTx([]);
  }, [saveHoldings, saveTx]);

  return { holdings, transactions, addHolding, removeHolding, clearPortfolio };
}
