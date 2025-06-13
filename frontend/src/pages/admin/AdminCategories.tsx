import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react'
import { categoriesApi } from '../../services/api'
import { Category } from '../../types'
import toast from 'react-hot-toast'

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    subcategories: [] as string[],
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    let filtered = categories

    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subcategories.some(sub => 
          sub.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll()
      setCategories(response.data)
      setFilteredCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory._id, formData)
        toast.success('Category updated successfully')
      } else {
        await categoriesApi.create(formData)
        toast.success('Category created successfully')
      }

      setShowCreateModal(false)
      setEditingCategory(null)
      setFormData({ name: '', subcategories: [] })
      fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      subcategories: [...category.subcategories],
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      await categoriesApi.delete(id)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  const addSubcategory = () => {
    setFormData({
      ...formData,
      subcategories: [...formData.subcategories, ''],
    })
  }

  const updateSubcategory = (index: number, value: string) => {
    const newSubcategories = [...formData.subcategories]
    newSubcategories[index] = value
    setFormData({
      ...formData,
      subcategories: newSubcategories,
    })
  }

  const removeSubcategory = (index: number) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter((_, i) => i !== index),
    })
  }

  const resetForm = () => {
    setFormData({ name: '', subcategories: [] })
    setEditingCategory(null)
    setShowCreateModal(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-1">Organize your product categories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredCategories.length} of {categories.length} categories
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">Try adjusting your search or create a new category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id, category.name)}
                    className="text-error-600 hover:text-error-900"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {category.subcategories.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Subcategories ({category.subcategories.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((subcategory, index) => (
                      <span key={index} className="badge badge-gray text-xs">
                        {subcategory}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No subcategories</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subcategories
                  </label>
                  <button
                    type="button"
                    onClick={addSubcategory}
                    className="btn-secondary text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.subcategories.map((subcategory, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="input flex-1"
                        value={subcategory}
                        onChange={(e) => updateSubcategory(index, e.target.value)}
                        placeholder="Subcategory name"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubcategory(index)}
                        className="text-error-600 hover:text-error-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {formData.subcategories.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No subcategories added
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategories