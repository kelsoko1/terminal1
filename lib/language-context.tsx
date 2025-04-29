'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'sw'

type Translations = {
  [key: string]: {
    en: string
    sw: string
  }
}

// Common translations used across the app
export const translations: Translations = {
  // Navigation
  dashboard: { en: 'Dashboard', sw: 'Dashibodi' },
  trading: { en: 'Trading', sw: 'Biashara' },
  portfolio: { en: 'Portfolio', sw: 'Portfoilio' },
  account: { en: 'Account', sw: 'Akaunti' },
  broker: { en: 'Broker (Back Office)', sw: 'Wakala (Ofisi ya Nyuma)' },
  
  // Trading page
  stocks: { en: 'Stocks', sw: 'Hisa' },
  bonds: { en: 'Bonds', sw: 'Hatifungani' },
  funds: { en: 'Funds', sw: 'Fedha' },
  
  // Bond trading
  bondTrading: { en: 'Bond Trading', sw: 'Biashara ya Hatifungani' },
  government: { en: 'Government', sw: 'Serikali' },
  corporate: { en: 'Corporate', sw: 'Kampuni' },
  municipal: { en: 'Municipal', sw: 'Manispaa' },
  myBonds: { en: 'My Bonds', sw: 'Hatifungani Zangu' },
  bondName: { en: 'Bond Name', sw: 'Jina la Hatifungani' },
  issuer: { en: 'Issuer', sw: 'Mtoaji' },
  maturity: { en: 'Maturity', sw: 'Ukomavu' },
  couponRate: { en: 'Coupon Rate', sw: 'Kiwango cha Kuponi' },
  ytm: { en: 'YTM', sw: 'YTM' },
  price: { en: 'Price (TZS)', sw: 'Bei (TZS)' },
  minInvestment: { en: 'Min. Investment', sw: 'Uwekezaji wa Chini' },
  actions: { en: 'Actions', sw: 'Vitendo' },
  buy: { en: 'Buy', sw: 'Nunua' },
  sell: { en: 'Sell', sw: 'Uza' },
  
  // Fund trading
  fundTrading: { en: 'Mutual Fund Trading', sw: 'Biashara ya Fedha za Pamoja' },
  allFunds: { en: 'All Funds', sw: 'Fedha Zote' },
  equity: { en: 'Equity', sw: 'Hisa' },
  balanced: { en: 'Balanced', sw: 'Usawa' },
  moneyMarket: { en: 'Money Market', sw: 'Soko la Fedha' },
  myFunds: { en: 'My Funds', sw: 'Fedha Zangu' },
  fundName: { en: 'Fund Name', sw: 'Jina la Fedha' },
  category: { en: 'Category', sw: 'Kategoria' },
  manager: { en: 'Manager', sw: 'Meneja' },
  nav: { en: 'NAV (TZS)', sw: 'NAV (TZS)' },
  oneMonthReturn: { en: '1M Return', sw: 'Faida ya Mwezi 1' },
  oneYearReturn: { en: '1Y Return', sw: 'Faida ya Mwaka 1' },
  riskLevel: { en: 'Risk Level', sw: 'Kiwango cha Hatari' },
  
  // FX Futures Trading
  fxFutureTrading: { en: 'FX Future Trading', sw: 'Biashara ya Fedha za Baadaye' },
  tradeFutureCurrencies: { en: 'Trade currency futures with our matching engine', sw: 'Fanya biashara ya fedha za baadaye kupitia injini yetu ya kulinganisha' },
  refreshRates: { en: 'Refresh Rates', sw: 'Sasisha Viwango' },
  allPairs: { en: 'All Pairs', sw: 'Jozi Zote' },
  tzsBase: { en: 'TZS Base', sw: 'Msingi wa TZS' },
  pair: { en: 'Currency Pair', sw: 'Jozi ya Fedha' },
  expiry: { en: 'Expiry', sw: 'Muda wa Kumalizika' },
  spotPrice: { en: 'Spot Price', sw: 'Bei ya Sasa' },
  premium: { en: 'Premium', sw: 'Malipo ya Ziada' },
  futurePrice: { en: 'Future Price', sw: 'Bei ya Baadaye' },
  openInterest: { en: 'Open Interest', sw: 'Ushawishi Uliofunguliwa' },
  selected: { en: 'Selected', sw: 'Imechaguliwa' },
  select: { en: 'Select', sw: 'Chagua' },
  myOrders: { en: 'My Orders', sw: 'Maagizo Yangu' },
  side: { en: 'Side', sw: 'Upande' },
  quantity: { en: 'Quantity', sw: 'Kiasi' },
  filled: { en: 'Filled', sw: 'Imejazwa' },
  status: { en: 'Status', sw: 'Hali' },
  pending: { en: 'pending', sw: 'inasubiri' },
  partially_filled: { en: 'partially filled', sw: 'imejazwa kwa sehemu' },
  filledStatus: { en: 'filled', sw: 'imejazwa' },
  cancelled: { en: 'cancelled', sw: 'imefutwa' },
  orderBook: { en: 'Order Book', sw: 'Kitabu cha Maagizo' },
  amount: { en: 'Amount', sw: 'Kiasi' },
  total: { en: 'Total', sw: 'Jumla' },
  placeTrade: { en: 'Place Trade', sw: 'Weka Biashara' },
  limitOrder: { en: 'Limit', sw: 'Kikomo' },
  marketOrder: { en: 'Market', sw: 'Soko' },
  buyFuture: { en: 'Buy Future', sw: 'Nunua Fedha za Baadaye' },
  sellFuture: { en: 'Sell Future', sw: 'Uza Fedha za Baadaye' },
  recentTrades: { en: 'Recent Trades', sw: 'Biashara za Hivi Karibuni' },
  time: { en: 'Time', sw: 'Wakati' },
  noTradesYet: { en: 'No trades yet for this pair and expiry.', sw: 'Hakuna biashara bado kwa jozi hii na muda wa kumalizika.' },
  noOrdersYet: { en: 'No orders yet. Start trading to see your orders here.', sw: 'Hakuna maagizo bado. Anza kufanya biashara kuona maagizo yako hapa.' },
  confirmBuy: { en: 'Confirm Buy', sw: 'Thibitisha Ununuzi' },
  confirmSell: { en: 'Confirm Sell', sw: 'Thibitisha Uuzaji' },
  reviewOrderDetails: { en: 'Please review your order details before confirming', sw: 'Tafadhali kagua maelezo ya agizo lako kabla ya kuthibitisha' },
  orderType: { en: 'Order Type', sw: 'Aina ya Agizo' },
  futuresWarning: { en: 'Futures trading involves risk. Make sure you understand the contract specifications.', sw: 'Biashara ya fedha za baadaye ina hatari. Hakikisha unaelewa maelezo ya mkataba.' },
  futuresInfo: { en: 'Currency futures are standardized contracts that allow you to buy or sell currency at a future date at a price agreed upon today.', sw: 'Fedha za baadaye ni mikataba iliyosanifiwa inayokuruhusu kununua au kuuza fedha katika tarehe ya baadaye kwa bei iliyokubaliwa leo.' },
  confirmOrder: { en: 'Confirm Order', sw: 'Thibitisha Agizo' },
  
  // Risk levels
  low: { en: 'Low', sw: 'Chini' },
  medium: { en: 'Medium', sw: 'Wastani' },
  high: { en: 'High', sw: 'Juu' },
  
  // Dialog content
  buyBond: { en: 'Buy Bond', sw: 'Nunua Hatifungani' },
  buyFundUnits: { en: 'Buy Fund Units', sw: 'Nunua Vitengo vya Fedha' },
  sellFundUnits: { en: 'Sell Fund Units', sw: 'Uza Vitengo vya Fedha' },
  investmentAmount: { en: 'Investment Amount (TZS)', sw: 'Kiasi cha Uwekezaji (TZS)' },
  units: { en: 'Units', sw: 'Vitengo' },
  unitsToSell: { en: 'Units to Sell', sw: 'Vitengo vya Kuuza' },
  value: { en: 'Value', sw: 'Thamani' },
  cancel: { en: 'Cancel', sw: 'Ghairi' },
  confirm: { en: 'Confirm Purchase', sw: 'Thibitisha Ununuzi' },
  confirmSale: { en: 'Confirm Sale', sw: 'Thibitisha Uuzaji' }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sw')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Translation function
  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language]
    }
    // If translation not found, return the key as fallback
    return key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
