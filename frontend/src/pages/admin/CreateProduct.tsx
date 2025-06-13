import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi, categoriesApi } from '../../services/api'
import { Product, Category } from '../../types'
import toast from 'react-hot-toast'
import { ChevronLeft, Save } from 'lucide-react'

const CreateProduct: React.FC = () => {
  const navigate = useNavigate()
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    brand: '',
    description: '',
    category: '',
    images: [],
    price: {
      amount: 0,
      currency: 'INR',
      onSale: false,
      discountPrice: 0,
    },
    inventory: {
      quantity: 0,
      minThreshold: 0,
      inStock: false,
    },
    status: 'active',
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await categoriesApi.getAll()
      setCategories(categoriesResponse.data)
      // Set default category if available
      if (categoriesResponse.data.length > 0) {
        setProduct(prev => ({ ...prev!, category: categoriesResponse.data[0].name }))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (name.startsWith('price.')) {
      setProduct(prev => ({
        ...prev!,
        price: {
          ...prev!.price!,
          [name.split('.')[1]]: type === 'checkbox' ? checked : parseFloat(value) || 0
        }
      }))
    } else if (name.startsWith('inventory.')) {
      setProduct(prev => ({
        ...prev!,
        inventory: {
          ...prev!.inventory!,
          [name.split('.')[1]]: type === 'checkbox' ? checked : parseInt(value) || 0
        }
      }))
    } else if (name.startsWith('shelfLocation.coordinates.')) {
      setProduct(prev => ({
        ...prev!,
        shelfLocation: {
          ...prev!.shelfLocation!,
          coordinates: {
            ...prev!.shelfLocation!.coordinates!,
            [name.split('.')[2]]: parseFloat(value) || 0
          }
        }
      }))
    } else if (name.startsWith('shelfLocation.')) {
      setProduct(prev => ({
        ...prev!,
        shelfLocation: {
          ...prev!.shelfLocation!,
          [name.split('.')[1]]: value
        }
      }))
    } else {
      setProduct(prev => ({
        ...prev!,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setIsSubmitting(true)
    try {
      await productsApi.create(product)
      toast.success('Product created successfully')
      navigate(-1) // Go back to products list
    } catch (error: any) {
      console.error('Error creating product:', error)
      toast.error(error.response?.data?.message || 'Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-lg font-medium">Add New Product</span>
        </button>
        <button type="submit" form="create-product-form" className="btn-primary" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Adding...' : 'Add Product'}
        </button>
      </div>

      {/* Product Form */}
      <form id="create-product-form" onSubmit={handleSubmit} className="card space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="label">Product Name</label>
            <input type="text" id="name" name="name" value={product.name} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="brand" className="label">Brand</label>
            <input type="text" id="brand" name="brand" value={product.brand} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="category" className="label">Category</label>
            <select id="category" name="category" value={product.category} onChange={handleChange} className="input" required>
              {categories.length > 0 ? (
                categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))
              ) : (
                <option value="" disabled>No categories available</option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" name="description" value={product.description} onChange={handleChange} className="input" rows={3} />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price.amount" className="label">Price (INR)</label>
            <input type="number" id="price.amount" name="price.amount" value={product.price?.amount || 0} onChange={handleChange} className="input" step="0.01" required min="0" />
          </div>
          <div>
            <label htmlFor="price.onSale" className="label block">On Sale</label>
            <input type="checkbox" id="price.onSale" name="price.onSale" checked={product.price?.onSale || false} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary-600" />
          </div>
          {product.price?.onSale && (
            <div>
              <label htmlFor="price.discountPrice" className="label">Discount Price (INR)</label>
              <input type="number" id="price.discountPrice" name="price.discountPrice" value={product.price?.discountPrice || ''} onChange={handleChange} className="input" step="0.01" min="0" />
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="inventory.quantity" className="label">Quantity</label>
            <input type="number" id="inventory.quantity" name="inventory.quantity" value={product.inventory?.quantity || 0} onChange={handleChange} className="input" required min="0" />
          </div>
          <div>
            <label htmlFor="inventory.minThreshold" className="label">Min Threshold</label>
            <input type="number" id="inventory.minThreshold" name="inventory.minThreshold" value={product.inventory?.minThreshold || ''} onChange={handleChange} className="input" min="0" />
          </div>
          <div>
            <label htmlFor="inventory.inStock" className="label block">In Stock</label>
            <input type="checkbox" id="inventory.inStock" name="inventory.inStock" checked={product.inventory?.inStock || false} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary-600" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="shelfLocation.storeId" className="label">Store ID</label>
            <input type="text" id="shelfLocation.storeId" name="shelfLocation.storeId" value={product.shelfLocation?.storeId || ''} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="shelfLocation.aisle" className="label">Aisle</label>
            <input type="text" id="shelfLocation.aisle" name="shelfLocation.aisle" value={product.shelfLocation?.aisle || ''} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="shelfLocation.section" className="label">Section</label>
            <input type="text" id="shelfLocation.section" name="shelfLocation.section" value={product.shelfLocation?.section || ''} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="shelfLocation.shelf" className="label">Shelf</label>
            <input type="text" id="shelfLocation.shelf" name="shelfLocation.shelf" value={product.shelfLocation?.shelf || ''} onChange={handleChange} className="input" required />
          </div>
          <div className="md:col-span-2">
            <h3 className="text-md font-medium text-gray-800 mb-2">Coordinates</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="shelfLocation.coordinates.x" className="label">X</label>
                <input type="number" id="shelfLocation.coordinates.x" name="shelfLocation.coordinates.x" value={product.shelfLocation?.coordinates?.x || 0} onChange={handleChange} className="input" step="0.1" />
              </div>
              <div>
                <label htmlFor="shelfLocation.coordinates.y" className="label">Y</label>
                <input type="number" id="shelfLocation.coordinates.y" name="shelfLocation.coordinates.y" value={product.shelfLocation?.coordinates?.y || 0} onChange={handleChange} className="input" step="0.1" />
              </div>
              <div>
                <label htmlFor="shelfLocation.coordinates.z" className="label">Z</label>
                <input type="number" id="shelfLocation.coordinates.z" name="shelfLocation.coordinates.z" value={product.shelfLocation?.coordinates?.z || 0} onChange={handleChange} className="input" step="0.1" />
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">Status</h2>
        <div>
          <label htmlFor="status" className="label">Product Status</label>
          <select id="status" name="status" value={product.status} onChange={handleChange} className="input" required>
            <option value="active">Active</option>
            <option value="discontinued">Discontinued</option>
            <option value="out-of-season">Out of Season</option>
          </select>
        </div>
        {/* No image upload yet, will be added later if requested */}
      </form>
    </div>
  )
}

export default CreateProduct 