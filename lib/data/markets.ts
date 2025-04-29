import { MarketGroup } from '../types/market'

export const marketData: MarketGroup[] = [
  {
    type: 'stocks',
    regions: [
      {
        name: 'East Africa',
        exchanges: [
          {
            name: 'DSE',
            description: 'Dar es Salaam Stock Exchange',
            instruments: [
              {
                symbol: 'CRDB',
                name: 'CRDB Bank Plc',
                type: 'stocks',
                price: 385,
                change: 2.5,
                volume: 156789,
                marketCap: '2.8T',
                sector: 'Banking',
              },
              {
                symbol: 'TBL',
                name: 'Tanzania Breweries Limited',
                type: 'stocks',
                price: 10950,
                change: -1.2,
                volume: 45678,
                marketCap: '3.2T',
                sector: 'Consumer Goods',
              },
              {
                symbol: 'NMB',
                name: 'NMB Bank Plc',
                type: 'stocks',
                price: 2460,
                change: 1.8,
                volume: 89012,
                marketCap: '1.9T',
                sector: 'Banking',
              },
              {
                symbol: 'TCCL',
                name: 'Tanzania Portland Cement Company Ltd',
                type: 'stocks',
                price: 3100,
                change: 0.5,
                volume: 23456,
                marketCap: '1.1T',
                sector: 'Manufacturing',
              },
              {
                symbol: 'TOL',
                name: 'TOL Gases Limited',
                type: 'stocks',
                price: 500,
                change: -0.8,
                volume: 12345,
                marketCap: '850B',
                sector: 'Industrial',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'bonds',
    regions: [
      {
        name: 'East Africa',
        exchanges: [
          {
            name: 'DSE',
            description: 'Dar es Salaam Stock Exchange',
            instruments: [
              {
                symbol: 'T15/25',
                name: '15-Year Treasury Bond 2025',
                type: 'bonds',
                price: 98.5,
                change: 0.2,
                yield: 15.2,
                maturity: '2025-12-15',
                issuer: 'Government of Tanzania',
              },
              {
                symbol: 'T10/24',
                name: '10-Year Treasury Bond 2024',
                type: 'bonds',
                price: 99.2,
                change: -0.1,
                yield: 13.8,
                maturity: '2024-06-30',
                issuer: 'Government of Tanzania',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'reits',
    regions: [
      {
        name: 'East Africa',
        exchanges: [
          {
            name: 'DSE',
            description: 'Dar es Salaam Stock Exchange',
            instruments: [
              {
                symbol: 'WHREIT',
                name: 'Watumishi Housing REIT',
                type: 'reits',
                price: 1250,
                change: 1.5,
                nav: 1280,
                yield: 7.2,
                occupancyRate: 95,
                propertyValue: '125B',
              },
            ],
          },
        ],
      },
    ],
  },
] 