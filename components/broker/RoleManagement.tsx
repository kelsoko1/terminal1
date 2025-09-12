'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function RoleManagement() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Active Users</h3>
          <div className="text-3xl font-bold">42</div>
          <p className="text-sm text-muted-foreground">Across all roles</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Trading Access</h3>
          <div className="text-3xl font-bold">28</div>
          <p className="text-sm text-muted-foreground">Users with trading rights</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Admin Access</h3>
          <div className="text-3xl font-bold">8</div>
          <p className="text-sm text-muted-foreground">System administrators</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Pending Requests</h3>
          <div className="text-3xl font-bold text-yellow-600">5</div>
          <p className="text-sm text-muted-foreground">Access requests</p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">User Access Control</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-8" />
              </div>
              <Button>Add User</Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Smith</TableCell>
                <TableCell>Senior Broker</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Badge variant="outline">Trading</Badge>
                    <Badge variant="outline">Client Management</Badge>
                  </div>
                </TableCell>
                <TableCell><span className="text-green-600">Active</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sarah Johnson</TableCell>
                <TableCell>System Admin</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Badge variant="outline">Full Access</Badge>
                  </div>
                </TableCell>
                <TableCell><span className="text-green-600">Active</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Michael Chen</TableCell>
                <TableCell>Junior Broker</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Badge variant="outline">Trading</Badge>
                    <Badge variant="outline">Limited</Badge>
                  </div>
                </TableCell>
                <TableCell><span className="text-yellow-600">Under Review</span></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Role Templates</h3>
              <Button>Create Template</Button>
            </div>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Senior Broker</h4>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex gap-1 mb-2">
                  <Badge variant="outline">Trading</Badge>
                  <Badge variant="outline">Client Management</Badge>
                  <Badge variant="outline">Reports</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Full trading and client management access</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Junior Broker</h4>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex gap-1 mb-2">
                  <Badge variant="outline">Trading</Badge>
                  <Badge variant="outline">Limited</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Limited trading access with supervision</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Back Office Admin</h4>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex gap-1 mb-2">
                  <Badge variant="outline">Reports</Badge>
                  <Badge variant="outline">Settlements</Badge>
                  <Badge variant="outline">Compliance</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Administrative access without trading rights</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Access Requests</h3>
              <Badge variant="secondary">5 Pending</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 border rounded-lg">
                <div>
                  <p className="font-medium">Trading Rights Request</p>
                  <p className="text-sm text-muted-foreground">From: Michael Chen</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Deny</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 border rounded-lg">
                <div>
                  <p className="font-medium">Client Management Access</p>
                  <p className="text-sm text-muted-foreground">From: Lisa Wong</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Deny</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
