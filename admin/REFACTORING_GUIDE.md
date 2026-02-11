# UI Refactoring Guide - Apply to Remaining Pages

## Quick Start: Refactoring Pattern

This guide shows you how to refactor any page using our new design system.

---

## Step-by-Step Refactoring Process

### 1. Update Imports

**Replace old imports:**
```tsx
import PageMeta from '../components/common/PageMeta';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
```

**With centralized imports:**
```tsx
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
  FormActions,
  Input,
  Select,
  Textarea,
  Checkbox,
  Alert,
} from '../components';
```

---

### 2. Replace Page Structure

**Old Pattern:**
```tsx
return (
  <>
    <PageMeta title="..." description="..." />
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="..." />
      <div className="flex justify-between items-center">
        <div>
          <h1>Title</h1>
          <p>Description</p>
        </div>
        <Button>Action</Button>
      </div>
      {/* Content */}
    </div>
  </>
);
```

**New Pattern:**
```tsx
return (
  <>
    <PageMeta title="..." description="..." />
    <PageLayout>
      <PageHeader
        title="Title"
        description="Description"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Current Page' },
        ]}
        actions={<Button>Action</Button>}
      />
      {/* Content */}
    </PageLayout>
  </>
);
```

---

### 3. Replace Filters Section

**Old Pattern:**
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Input placeholder="Search..." value={search} onChange={...} />
    <select>...</select>
    <select>...</select>
  </div>
</div>
```

**New Pattern:**
```tsx
<FilterBar
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search..."
  filters={
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Filter Label">
        <Select
          value={filters.field}
          onChange={(e) => setFilters({ ...filters, field: e.target.value })}
          options={[...]}
          placeholder="All Items"
        />
      </FormField>
    </div>
  }
  showFilters={true}
/>
```

---

### 4. Replace Tables

**Old Pattern:**
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
  {loading ? (
    <div className="p-8 text-center">Loading...</div>
  ) : items.length === 0 ? (
    <div className="p-8 text-center">No items</div>
  ) : (
    <table>
      <thead>...</thead>
      <tbody>...</tbody>
    </table>
  )}
</div>
```

**New Pattern:**
```tsx
<PageContent>
  <PageContentSection noPadding>
    {loading ? (
      <LoadingState message="Loading..." />
    ) : filteredItems.length === 0 ? (
      <EmptyState
        icon={<IconComponent className="w-16 h-16" />}
        title="No items found"
        description="Try adjusting your search or filters"
        action={<Button>Add First Item</Button>}
      />
    ) : (
      <DataTable
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (item) => (
              <div className="font-medium">{item.name}</div>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'center',
            render: (item) => (
              <div className="flex items-center justify-center gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-warning-600 hover:bg-warning-50 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-error-600 hover:bg-error-50 rounded">
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
```

---

### 5. Replace Modals

**Old Pattern:**
```tsx
{showModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl max-w-2xl">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2>Modal Title</h2>
        <button onClick={closeModal}><X /></button>
      </div>
      <div className="p-6">
        <form>...</form>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t">
        <button onClick={closeModal}>Cancel</button>
        <button onClick={handleSubmit}>Save</button>
      </div>
    </div>
  </div>
)}
```

**New Pattern:**
```tsx
<Modal
  isOpen={showModal}
  onClose={closeModal}
  title="Modal Title"
  size="lg"
  footer={
    <ModalFooter
      onCancel={closeModal}
      onSubmit={handleSubmit}
      submitText="Save"
      cancelText="Cancel"
      isSubmitting={isSubmitting}
    />
  }
>
  <FormSection>
    <FormField label="Field Label" required>
      <Input
        value={formData.field}
        onChange={(e) => setFormData({ ...formData, field: e.target.value })}
        placeholder="Enter value"
      />
    </FormField>
  </FormSection>
</Modal>
```

---

### 6. Replace Status Badges

**Old Pattern:**
```tsx
<span className={`px-2 py-1 rounded-full ${
  status === 'active' ? 'bg-green-100 text-green-800' :
  status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
  'bg-red-100 text-red-800'
}`}>
  {status}
</span>
```

**New Pattern:**
```tsx
<Badge
  color={
    status === 'active' ? 'success' :
    status === 'pending' ? 'warning' :
    'error'
  }
>
  {status}
</Badge>
```

---

### 7. Replace Alerts/Notifications

**New Pattern:**
```tsx
<Alert variant="success" title="Success">
  Operation completed successfully
</Alert>

<Alert variant="error" title="Error">
  Something went wrong
</Alert>

<Alert variant="warning">
  Warning message without title
</Alert>

<Alert variant="info" icon={<InfoIcon />}>
  Custom icon alert
</Alert>
```

---

## Common Patterns by Page Type

### List/Table Pages (Flights, Hotels, Users, etc.)
1. PageLayout wrapper
2. PageHeader with title, description, breadcrumbs, "Add" button
3. FilterBar with search and filters
4. PageContent with DataTable
5. Modal for create/edit
6. Modal for view details

### Form Pages (PackageForm, HotelForm, etc.)
1. PageLayout wrapper
2. PageHeader with title and breadcrumbs
3. PageContent with FormSection(s)
4. FormField for each input
5. FormActions for submit/cancel buttons

### Dashboard Pages
1. PageLayout wrapper
2. PageHeader with breadcrumbs
3. Multiple PageContent sections for different widgets
4. Cards for metrics
5. Charts within PageContent

---

## Action Button Standards

### Table Row Actions:
```tsx
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
```

### Primary Actions:
```tsx
<Button
  onClick={handleAction}
  startIcon={<Plus className="w-4 h-4" />}
>
  Add Item
</Button>
```

### Secondary Actions:
```tsx
<Button
  variant="outline"
  onClick={handleAction}
>
  Cancel
</Button>
```

---

## Color Conventions

### Status Colors:
- **Success/Active/Approved**: `success` (green)
- **Warning/Pending**: `warning` (orange/yellow)
- **Error/Rejected/Cancelled**: `error` (red)
- **Info/Processing**: `info` (blue)
- **Neutral/Inactive**: `light` (gray)

### Action Colors:
- **View**: Blue (`text-blue-600`)
- **Edit**: Warning/Orange (`text-warning-600`)
- **Delete**: Error/Red (`text-error-600`)
- **Primary Action**: Brand color (`bg-brand-500`)

---

## Icon Sizes

- **Table actions**: `w-4 h-4` or `w-5 h-5`
- **Button icons**: `w-4 h-4` or `w-5 h-5`
- **Empty state icons**: `w-16 h-16`
- **Page header icons**: `w-6 h-6` or `w-8 h-8`

---

## Spacing Standards

- **Page sections**: `space-y-6` (within PageLayout)
- **Form fields**: `space-y-4` (within FormSection)
- **Card padding**: `p-6`
- **Table cell padding**: `px-4 py-3`
- **Button gap**: `gap-2` or `gap-3`

---

## Checklist for Each Refactored Page

- [ ] Imports updated to use central export
- [ ] PageLayout wrapper added
- [ ] PageHeader with breadcrumbs implemented
- [ ] FilterBar for search/filters (if applicable)
- [ ] DataTable for list views (if applicable)
- [ ] Modals using Modal component
- [ ] Forms using FormField/FormSection
- [ ] EmptyState and LoadingState implemented
- [ ] Badge components for status
- [ ] Consistent action button styling
- [ ] Dark mode verified
- [ ] Responsive behavior tested

---

## Files to Refactor Next (Priority Order)

### High Priority:
1. ✅ **Dashboard/Home.tsx** - DONE
2. ✅ **Flights.tsx** - DONE  
3. ✅ **Hotels.tsx** - DONE
4. **AllBookings/index.tsx** - Complex table with timers
5. **Packages.tsx** - Similar to Flights/Hotels
6. **FlightPackages.tsx** - Package listing
7. **Tours.tsx** - Tour management
8. **Visas.tsx** - Visa management

### Medium Priority:
9. **UserManagement.tsx** - User table
10. **RegisteredAgencies.tsx** - Agency listing
11. **RoleManagement.tsx** - Role/permission management
12. **GroupTicketing.tsx** - Group ticket listing
13. **Airline.tsx** - Airline management
14. **Sector.tsx** - Sector management

### Lower Priority:
15. **Ledger.tsx** - Financial ledger
16. **ViewPaymentVoucher.tsx** - Payment view
17. **ContentManagement.tsx** - Content CMS
18. **Testimonials.tsx** - Testimonial management
19. Form pages in `Forms/` directory
20. Table pages in `Tables/` directory
21. Auth pages

---

*Follow this guide to maintain consistency across all refactored pages.*
