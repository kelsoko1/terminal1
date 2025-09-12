export type MarketType = 'stocks' | 'bonds' | 'reits' | 'funds';

interface BaseInstrument {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export interface Stock extends BaseInstrument {
  type: 'stocks';
  volume: number;
  marketCap: string;
  sector: string;
}

export interface Bond extends BaseInstrument {
  type: 'bonds';
  yield: number;
  maturity: string;
  issuer: string;
}

export interface REIT extends BaseInstrument {
  type: 'reits';
  nav: number;
  yield: number;
  occupancyRate: number;
  propertyValue: string;
}

export interface Fund extends BaseInstrument {
  type: 'funds';
  nav: number;
  ytdReturn: number;
  category: string;
  aum: string;
  minimumInvestment: string;
}

export type Instrument = Stock | Bond | REIT | Fund;

export interface Exchange {
  name: string;
  description?: string;
  instruments: Instrument[];
}

export interface Region {
  name: string;
  exchanges: Exchange[];
}

export interface MarketGroup {
  type: MarketType;
  regions: Region[];
}

export interface MarketData {
  groups: MarketGroup[];
} 