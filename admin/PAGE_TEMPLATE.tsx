// TEMPLATE: Use this as a starting point for refactoring any list/table page

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from './src/Api/axios';
import {
  PageMeta,
  PageLayout,
  PageHeader,
  PageContent,
  PageContentSection,
  FilterBar,
  Button,
  Badge,
  Modal,
  ModalFooter,
  DataTable,
  LoadingState,
  EmptyState,
  FormField,
  FormSection,
  Input,
  Select,
} from './src/components';

// 1. Define your TypeScript interface
interface YourItem {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  // ... add your fields
}

const YourPage = () => {
  // 2. State management
  const [items, setItems] = useState<YourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<YourItem | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    // ... your form fields
  });

  // 3. Data fetching
  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/your-endpoint', {
        params: filters,
      });
      setItems(response.data.items || []); // Adjust based on your API
    } catch (error) {
      toast.error('Failed to fetch items');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 4. CRUD operations
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axiosInstance.delete(`/your-endpoint/${id}`);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
      console.error(error);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ name: '' /* reset form */ });
    setShowModal(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/your-endpoint/${id}`);
      const item = response.data.item; // Adjust based on your API
      setFormData({
        name: item.name,
        // ... populate form
      });
      setEditingId(id);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to fetch item details');
    }
  };

  const handleView = (item: YourItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingId) {
        await axiosInstance.put(`/your-endpoint/${editingId}`, formData);
        toast.success('Item updated successfully');
      } else {
        await axiosInstance.post('/your-endpoint', formData);
        toast.success('Item created successfully');
      }
      setShowModal(false);
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  // 5. Filtering
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 6. Render
  return (
    <>
      <PageMeta 
        title="Your Page Title | Admin" 
        description="Manage your items" 
      />

      <PageLayout>
        {/* Header with breadcrumbs and actions */}
        <PageHeader
          title="Your Items"
          description="Manage and organize your items"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Your Items' },
          ]}
          actions={
            <Button 
              onClick={handleCreate} 
              startIcon={<Plus className="w-4 h-4" />}
            >
              Add Item
            </Button>
          }
        />

        {/* Search and Filters */}
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search items..."
          filters={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Filter by Category">
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  options={[
                    { value: 'cat1', label: 'Category 1' },
                    { value: 'cat2', label: 'Category 2' },
                  ]}
                  placeholder="All Categories"
                />
              </FormField>
              <FormField label="Filter by Status">
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  placeholder="All Statuses"
                />
              </FormField>
            </div>
          }
          showFilters={true}
        />

        {/* Table Content */}
        <PageContent>
          <PageContentSection noPadding>
            {loading ? (
              <LoadingState message="Loading items..." />
            ) : filteredItems.length === 0 ? (
              <EmptyState
                icon={<Plus className="w-16 h-16" />}
                title="No items found"
                description="Try adjusting your search or filters, or add a new item."
                action={
                  <Button 
                    onClick={handleCreate} 
                    startIcon={<Plus className="w-4 h-4" />}
                  >
                    Add First Item
                  </Button>
                }
              />
            ) : (
              <DataTable
                columns={[
                  {
                    key: 'name',
                    header: 'Name',
                    render: (item: YourItem) => (
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (item: YourItem) => (
                      <Badge
                        color={
                          item.status === 'active' ? 'success' :
                          item.status === 'pending' ? 'warning' :
                          'error'
                        }
                      >
                        {item.status}
                      </Badge>
                    ),
                  },
                  {
                    key: 'createdAt',
                    header: 'Created',
                    render: (item: YourItem) => (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    ),
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    align: 'center',
                    render: (item: YourItem) => (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item._id)}
                          className="p-2 text-warning-600 hover:bg-warning-50 dark:text-warning-400 dark:hover:bg-warning-900/20 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={filteredItems}
                keyExtractor={(item) => item._id}
                hover
              />
            )}
          </PageContentSection>
        </PageContent>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? 'Edit Item' : 'Add New Item'}
          size="lg"
          footer={
            <ModalFooter
              onCancel={() => setShowModal(false)}
              onSubmit={() => document.getElementById('item-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
              submitText={editingId ? 'Update' : 'Create'}
            />
          }
        >
          <form onSubmit={handleSubmit} id="item-form">
            <FormSection>
              <FormField label="Name" required>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </FormField>
              
              {/* Add more form fields here */}
            </FormSection>
          </form>
        </Modal>

        {/* View Modal */}
        {selectedItem && (
          <Modal
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            title="Item Details"
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedItem.name}
                </h3>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <Badge
                  color={selectedItem.status === 'active' ? 'success' : 'error'}
                >
                  {selectedItem.status}
                </Badge>
              </div>

              {/* Add more detail sections here */}
            </div>
          </Modal>
        )}
      </PageLayout>
    </>
  );
};

export default YourPage;
