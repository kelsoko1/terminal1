'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ShoppingBag, Package, Tag, DollarSign, Truck, Settings, BarChart, Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { formatCurrency, usdToTzs, CURRENCY_SYMBOL } from '@/lib/utils/currency'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

// Import the ecommerce context
import { useEcommerce, Product, Order, StoreSettings } from '@/contexts/EcommerceContext'

export function EcommerceManagement() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products')
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    stock: 0,
    category: 'Digital Products',
    status: 'active',
    description: ''
  })
  
  // Use the shared ecommerce context
  const { 
    products, 
    orders, 
    storeSettings, 
    setStoreSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus
  } = useEcommerce()
  
  // Handle product deletion
  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId)
  }
  
  // Handle edit product click
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsEditProductDialogOpen(true)
  }
  
  // Handle order status change
  const handleOrderStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus)
  }
  
  // Handle new product input change
  const handleNewProductChange = (field: string, value: any) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Handle save new product
  const handleSaveNewProduct = () => {
    if (newProduct.name && newProduct.price !== undefined) {
      addProduct(newProduct as Omit<Product, 'id'>)
      setIsAddProductDialogOpen(false)
      setNewProduct({
        name: '',
        price: 0,
        stock: 0,
        category: 'Digital Products',
        status: 'active',
        description: ''
      })
    }
  }
  
  // Get status badge color and class
  const getStatusBadgeVariant = (status: Product['status'] | Order['status']) => {
    switch(status) {
      case 'active':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'out-of-stock':
        return 'destructive'
      case 'pending':
        return 'outline'
      case 'processing':
        return 'secondary'
      case 'shipped':
        return 'default'
      case 'delivered':
        return 'default' // Using default with custom class instead of 'success'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }
  
  // Get additional badge class for custom styling
  const getStatusBadgeClass = (status: Product['status'] | Order['status']) => {
    if (status === 'delivered') {
      return 'bg-green-500 hover:bg-green-600 text-white'
    }
    return ''
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">E-commerce Management</h2>
          <p className="text-muted-foreground">
            Manage your products, orders, and store settings
          </p>
        </div>
        
        {activeTab === 'products' && (
          <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product to sell in your store
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input 
                      id="product-name" 
                      placeholder="Enter product name" 
                      value={newProduct.name || ''}
                      onChange={(e) => handleNewProductChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="product-price" 
                        type="number" 
                        className="pl-8" 
                        placeholder="0.00" 
                        value={newProduct.price || 0}
                        onChange={(e) => handleNewProductChange('price', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Category</Label>
                    <select 
                      id="product-category" 
                      className="w-full p-2 border rounded"
                      value={newProduct.category}
                      onChange={(e) => handleNewProductChange('category', e.target.value)}
                    >
                      <option>Digital Products</option>
                      <option>Software</option>
                      <option>Reports</option>
                      <option>Courses</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-stock">Stock Quantity</Label>
                    <Input 
                      id="product-stock" 
                      type="number" 
                      placeholder="0" 
                      value={newProduct.stock || 0}
                      onChange={(e) => handleNewProductChange('stock', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea 
                    id="product-description" 
                    placeholder="Enter product description" 
                    rows={4} 
                    value={newProduct.description || ''}
                    onChange={(e) => handleNewProductChange('description', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product-image">Product Image</Label>
                  <Input 
                    id="product-image" 
                    type="file" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        // In a real app, you would upload this file to storage
                        // For now, we'll just set a placeholder
                        handleNewProductChange('image', '/placeholder-product.jpg')
                      }
                    }}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="product-active" 
                    checked={newProduct.status === 'active'}
                    onCheckedChange={(checked) => 
                      handleNewProductChange('status', checked ? 'active' : 'draft')
                    }
                  />
                  <Label htmlFor="product-active">Set as active product</Label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveNewProduct}>Save Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Tabs defaultValue="products" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Store Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your product inventory and listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <span>{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatCurrency(usdToTzs(product.price))}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(product.status)}
                          className={getStatusBadgeClass(product.status)}
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.sales}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                View and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(order.status)}
                          className={getStatusBadgeClass(order.status)}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <select 
                          className="p-1 text-xs border rounded"
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value as Order['status'])}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>
                Configure your store preferences and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input 
                    id="store-name" 
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select 
                    id="currency" 
                    className="w-full p-2 border rounded"
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})}
                  >
                    <option value="TZS">TZS (TSh) - Tanzanian Shilling</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    {/* East African Currencies */}
                    <option value="KES">KES (KSh) - Kenyan Shilling</option>
                    <option value="UGX">UGX (USh) - Ugandan Shilling</option>
                    <option value="RWF">RWF (RF) - Rwandan Franc</option>
                    <option value="BIF">BIF (FBu) - Burundian Franc</option>
                    <option value="SSP">SSP (SSP) - South Sudanese Pound</option>
                    <option value="ETB">ETB (Br) - Ethiopian Birr</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input 
                    id="tax-rate" 
                    type="number" 
                    value={storeSettings.taxRate}
                    onChange={(e) => setStoreSettings({...storeSettings, taxRate: parseFloat(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shipping-fee">Default Shipping Fee</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">{CURRENCY_SYMBOL}</span>
                    <Input 
                      id="shipping-fee" 
                      type="number" 
                      className="pl-12" 
                      value={storeSettings.shippingFee}
                      onChange={(e) => setStoreSettings({...storeSettings, shippingFee: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email alerts for new orders and inventory updates</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={storeSettings.emailNotifications}
                    onCheckedChange={(checked) => setStoreSettings({...storeSettings, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-inventory" className="text-base">Automatic Inventory Management</Label>
                    <p className="text-sm text-muted-foreground">Automatically adjust inventory when orders are placed</p>
                  </div>
                  <Switch 
                    id="auto-inventory" 
                    checked={storeSettings.automaticInventory}
                    onCheckedChange={(checked) => setStoreSettings({...storeSettings, automaticInventory: checked})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-product-name">Product Name</Label>
                  <Input 
                    id="edit-product-name" 
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-product-price">Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="edit-product-price" 
                      type="number" 
                      className="pl-8" 
                      value={selectedProduct.price}
                      onChange={(e) => setSelectedProduct({...selectedProduct, price: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-product-category">Category</Label>
                  <select 
                    id="edit-product-category" 
                    className="w-full p-2 border rounded"
                    value={selectedProduct.category}
                    onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
                  >
                    <option>Digital Products</option>
                    <option>Software</option>
                    <option>Reports</option>
                    <option>Courses</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-product-stock">Stock Quantity</Label>
                  <Input 
                    id="edit-product-stock" 
                    type="number" 
                    value={selectedProduct.stock}
                    onChange={(e) => setSelectedProduct({...selectedProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-product-status">Status</Label>
                <select 
                  id="edit-product-status" 
                  className="w-full p-2 border rounded"
                  value={selectedProduct.status}
                  onChange={(e) => setSelectedProduct({...selectedProduct, status: e.target.value as Product['status']})}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="button"
              onClick={() => {
                if (selectedProduct) {
                  updateProduct(selectedProduct.id, selectedProduct)
                  setIsEditProductDialogOpen(false)
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
