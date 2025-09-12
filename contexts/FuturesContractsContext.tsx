'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const FUTURES_CATEGORIES = [
  { key: 'fx', label: 'FX' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'metals', label: 'Metals' },
  { key: 'rates', label: 'Interest Rates' },
  { key: 'crypto', label: 'Cryptocurrency' },
] as const

type FuturesCategory = typeof FUTURES_CATEGORIES[number]['key']

type FuturesContract = {
  symbol: string
  name: string
  expiry: string
  price: number
  category: FuturesCategory
}

const emptyContracts: Record<FuturesCategory, FuturesContract[]> = {
  fx: [], agriculture: [], metals: [], rates: [], crypto: []
}

type FuturesContractsContextType = {
  contracts: Record<FuturesCategory, FuturesContract[]>
  fetchContracts: () => Promise<void>
  addContract: (contract: FuturesContract) => Promise<void>
  updateContract: (contract: FuturesContract) => Promise<void>
  deleteContract: (symbol: string, category: FuturesCategory) => Promise<void>
  categories: typeof FUTURES_CATEGORIES
}

const FuturesContractsContext = createContext<FuturesContractsContextType | undefined>(undefined)

export function FuturesContractsProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState(emptyContracts)

  // Fetch contracts from API and group by category
  const fetchContracts = async () => {
    const res = await fetch('/api/futures-contracts')
    const data = await res.json()
    const grouped: Record<FuturesCategory, FuturesContract[]> = { fx: [], agriculture: [], metals: [], rates: [], crypto: [] }
    for (const c of data.contracts) {
      const cat = c.category as FuturesCategory
      if (grouped[cat]) grouped[cat].push(c)
    }
    setContracts(grouped)
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const addContract = async (contract: FuturesContract) => {
    await fetch('/api/futures-contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contract)
    })
    await fetchContracts()
  }

  const updateContract = async (contract: FuturesContract) => {
    await fetch('/api/futures-contracts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contract)
    })
    await fetchContracts()
  }

  const deleteContract = async (symbol: string, category: FuturesCategory) => {
    await fetch('/api/futures-contracts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol })
    })
    await fetchContracts()
  }

  return (
    <FuturesContractsContext.Provider value={{ contracts, fetchContracts, addContract, updateContract, deleteContract, categories: FUTURES_CATEGORIES }}>
      {children}
    </FuturesContractsContext.Provider>
  )
}

export function useFuturesContracts() {
  const ctx = useContext(FuturesContractsContext)
  if (!ctx) throw new Error('useFuturesContracts must be used within a FuturesContractsProvider')
  return ctx
} 