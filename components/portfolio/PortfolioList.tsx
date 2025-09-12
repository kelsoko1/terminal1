'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Portfolio {
  id: string
  clientName: string
  totalValue: number
  return: number
  riskLevel: string
  lastUpdated: string
}

const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    clientName: 'John Doe',
    totalValue: 1250000,
    return: 12.5,
    riskLevel: 'Moderate',
    lastUpdated: '2024-03-15',
  },
  {
    id: '2',
    clientName: 'Jane Smith',
    totalValue: 850000,
    return: 8.2,
    riskLevel: 'Conservative',
    lastUpdated: '2024-03-15',
  },
  // Add more mock portfolios
]

export default function PortfolioList() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search portfolios..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Return</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPortfolios.map((portfolio) => (
            <TableRow key={portfolio.id}>
              <TableCell>{portfolio.clientName}</TableCell>
              <TableCell>TZS {portfolio.totalValue.toLocaleString()}</TableCell>
              <TableCell className={portfolio.return >= 0 ? 'text-green-600' : 'text-red-600'}>
                {portfolio.return}%
              </TableCell>
              <TableCell>{portfolio.riskLevel}</TableCell>
              <TableCell>{portfolio.lastUpdated}</TableCell>
              <TableCell>
                <Link href={`/broker/portfolio/${portfolio.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 