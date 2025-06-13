import React, { useEffect, useState } from 'react'
import { Search, Filter, Package, Plus } from 'lucide-react'
import { productsApi, categoriesApi } from '../services/api'
import { useCartStore } from '../stores/cartStore'
import { Product, Category } from '../types'
import { formatCurrency } from '../utils/format'
import toast from 'react-hot-toast'

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCartStore()
  const [maxPrice, setMaxPrice] = useState(0)
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  // Determine the effective max value for the slider
  const priceValues = products.map(p => p.price.amount)
  const currentMaxProductPrice = priceValues.length ? Math.max(...priceValues) : 0
  const sliderMaxRange = Math.max(currentMaxProductPrice, 10000) // Ensure slider goes up to 10,000 or actual max price if higher

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productsApi.getAll(),
          categoriesApi.getAll(),
        ])

        setProducts(productsResponse.data)
        setCategories(categoriesResponse.data)
        setFilteredProducts(productsResponse.data)

      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filter by max price (min is always 0)
    if (maxPrice > 0) {
      filtered = filtered.filter(product => product.price.amount <= maxPrice)
    } else if (maxPrice === 0) {
      // If maxPrice is 0, show all products. No filter applied.
      // The products will naturally be limited by sliderMaxRange if it's less than actual max product price
      // (this branch is effectively a no-op as 'filtered' already contains all products before this point)
    }

    // Only show active products
    filtered = filtered.filter(product => product.status === 'active')

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, maxPrice])

  const handleAddToCart = (product: Product) => {
    if (!product.inventory.inStock) {
      toast.error('Product is out of stock')
      return
    }
    addItem(product)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-1">Discover our wide range of products</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              className="input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <button className="btn-secondary text-sm" onClick={() => setShowMoreFilters(v => !v)}>
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>

        {/* More Filters Panel */}
        {showMoreFilters && (
          <div className="mt-4 flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-700">Price Range</label>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">Min: {formatCurrency(0)}</span>
              <input
                type="range"
                min={0} // Always starts at 0
                max={sliderMaxRange} // Dynamic max, up to 10,000 or actual max
                value={maxPrice} // Use maxPrice directly
                onChange={e => setMaxPrice(parseFloat(e.target.value))}
                className="w-64"
              />
              <span className="text-gray-600 text-sm">Max: {formatCurrency(maxPrice)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="card group hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  {product.price.onSale && (
                    <span className="badge bg-error-100 text-error-800 text-xs">
                      Sale
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    {product.price.onSale && product.price.discountPrice ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-primary-600">
                          {formatCurrency(product.price.discountPrice)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.price.amount)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-primary-600">
                        {formatCurrency(product.price.amount)}
                      </span>
                    )}
                  </div>

                  <span className={`badge ${product.inventory.inStock ? 'badge-success' : 'badge-error'}`}>
                    {product.inventory.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inventory.inStock}
                  className="btn-primary w-full mt-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products