import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsApi, categoriesApi } from '../../services/api'
import { Product, Category } from '../../types'
import toast from 'react-hot-toast'
import { ChevronLeft, Save } from 'lucide-react'

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProductAndCategories()
  }, [id])

  const fetchProductAndCategories = async () => {
    try {
      const productResponse = await productsApi.getById(id!)
      setProduct(productResponse.data)

      const categoriesResponse = await categoriesApi.getAll()
      setCategories(categoriesResponse.data)
    } catch (error) {
      console.error('Error fetching product or categories:', error)
      toast.error('Failed to load product details')
      navigate(-1) // Go back if product not found or error
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (name.startsWith('price.')) {
      setProduct(prev => ({
        ...prev!,
        price: {
          ...prev!.price,
          [name.split('.')[1]]: type === 'checkbox' ? checked : parseFloat(value) || 0
        }
      }))
    } else if (name.startsWith('inventory.')) {
      setProduct(prev => ({
        ...prev!,
        inventory: {
          ...prev!.inventory,
          [name.split('.')[1]]: type === 'checkbox' ? checked : parseInt(value) || 0
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
    if (!product || !id) return

    setIsSubmitting(true)
    try {
      await productsApi.update(id, product)
      toast.success('Product updated successfully')
      navigate(-1) // Go back to products list
    } catch (error: any) {
      console.error('Error updating product:', error)
      toast.error(error.response?.data?.message || 'Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  if (!product) {
    return <div className="text-center py-12 text-gray-600">Product not found.</div>
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-lg font-medium">Edit Product</span>
        </button>
        <button type="submit" form="edit-product-form" className="btn-primary" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Product Form */}
      <form id="edit-product-form" onSubmit={handleSubmit} className="card space-y-6">
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
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
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
            <label htmlFor="price.amount" className="label">Price (USD)</label>
            <input type="number" id="price.amount" name="price.amount" value={product.price.amount} onChange={handleChange} className="input" step="0.01" required min="0" />
          </div>
          <div>
            <label htmlFor="price.onSale" className="label block">On Sale</label>
            <input type="checkbox" id="price.onSale" name="price.onSale" checked={product.price.onSale} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary-600" />
          </div>
          {product.price.onSale && (
            <div>
              <label htmlFor="price.discountPrice" className="label">Discount Price (USD)</label>
              <input type="number" id="price.discountPrice" name="price.discountPrice" value={product.price.discountPrice || ''} onChange={handleChange} className="input" step="0.01" min="0" />
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="inventory.quantity" className="label">Quantity</label>
            <input type="number" id="inventory.quantity" name="inventory.quantity" value={product.inventory.quantity} onChange={handleChange} className="input" required min="0" />
          </div>
          <div>
            <label htmlFor="inventory.minThreshold" className="label">Min Threshold</label>
            <input type="number" id="inventory.minThreshold" name="inventory.minThreshold" value={product.inventory.minThreshold || ''} onChange={handleChange} className="input" min="0" />
          </div>
          <div>
            <label htmlFor="inventory.inStock" className="label block">In Stock</label>
            <input type="checkbox" id="inventory.inStock" name="inventory.inStock" checked={product.inventory.inStock} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary-600" />
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
      </form>
    </div>
  )
}

export default EditProduct 