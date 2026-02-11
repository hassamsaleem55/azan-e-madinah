# UI Styling Standards & Layout Guide

## 🎨 Design Consistency Rules

### Layout Structure (Every Page)

```tsx
<PageLayout>
  {/* Breadcrumbs - ALWAYS on RIGHT side */}
  <PageHeader
    title="Page Title"
    description="Page description"
    breadcrumbs={[
      { label: 'Home', path: '/' },
      { label: 'Current Page' },
    ]}
    actions={<Button>Action</Button>}
  />

  {/* Search and Filters */}
  <FilterBar
    searchValue={search}
    onSearchChange={setSearch}
    filters={<FormField label="Filter">...</FormField>}
  />

  {/* Main Content */}
  <PageContent>
    <PageContentSection noPadding>
      {/* Table or Content */}
    </PageContentSection>
  </PageContent>
</PageLayout>
```

---

## 📐 Typography Standards

### Page Titles
```tsx
<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
  Page Title
</h1>
```

### Section Titles
```tsx
<h3 className="text-lg font-bold text-gray-900 dark:text-white">
  Section Title
</h3>
```

### Form Section Titles
```tsx
<h3 className="text-lg font-bold text-gray-900 dark:text-white">
  Form Section
</h3>
```

### Descriptions
```tsx
<p className="text-sm text-gray-600 dark:text-gray-400">
  Description text
</p>
```

---

## 📝 Form Element Standards

### Input Fields (Text, Email, Password, Number, etc.)
```tsx
import { Input, FormField } from '../components';

<FormField label="Field Name" required>
  <Input
    type="text"
    placeholder="Enter value..."
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</FormField>
```

**Styling:**
- Height: `h-11` (44px)
- Padding: `px-4 py-2.5`
- Border: `border border-gray-300 dark:border-gray-700`
- Border Radius: `rounded-lg`
- Background: `bg-white dark:bg-gray-900`
- Text: `text-gray-900 dark:text-white`
- Focus: `ring-2 ring-blue-500/20 border-blue-500`

### Textarea
```tsx
import { Textarea, FormField } from '../components';

<FormField label="Description">
  <Textarea
    rows={4}
    placeholder="Enter description..."
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</FormField>
```

**Styling:** Same as Input with `resize-y`

### Select Dropdowns
```tsx
import { Select, FormField } from '../components';

<FormField label="Category">
  <Select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    options={[
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ]}
    placeholder="Select category"
  />
</FormField>
```

**Styling:** Same as Input with chevron icon

### Labels
```tsx
<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
  Field Label
  <span className="text-error-500 ml-1">*</span> {/* Required indicator */}
</label>
```

### Checkboxes & Radio Buttons
```tsx
import { Checkbox, FormField } from '../components';

<FormField>
  <Checkbox
    label="Accept terms"
    checked={accepted}
    onChange={(e) => setAccepted(e.target.checked)}
  />
</FormField>
```

---

## 📅 Date & Time Pickers

### Date Picker (MaskedDatePicker)
```tsx
import MaskedDatePicker from '../components/maskedDatePicker';

<FormField label="Date">
  <MaskedDatePicker
    value={date}
    onChange={(date) => setDate(date)}
    placeholderText="Select date"
    minDate={new Date()}
  />
</FormField>
```

**Must match Input styling:**
- Same height (44px)
- Same padding
- Same border and colors
- Same focus states

---

## 🎯 Breadcrumb Positioning

### ✅ CORRECT (Right-Aligned)
```tsx
<nav className="flex items-center justify-end gap-2 text-sm">
  {/* Breadcrumb items */}
</nav>
```

### ❌ INCORRECT (Left-Aligned)
```tsx
<nav className="flex items-center gap-2 text-sm">
  {/* DON'T USE THIS */}
</nav>
```

**Breadcrumb Styling:**
- Text Size: `text-sm`
- Links: `text-gray-500 hover:text-gray-700 dark:text-gray-400`
- Current: `text-gray-900 dark:text-white font-medium`
- Separator: Chevron right icon (`text-gray-400`)

---

## 🎨 Color System

### Text Colors
```tsx
// Primary text
className="text-gray-900 dark:text-white"

// Secondary text
className="text-gray-600 dark:text-gray-400"

// Muted text
className="text-gray-500 dark:text-gray-500"

// Link text
className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
```

### Background Colors
```tsx
// Page background (handled by PageLayout)
className="bg-gray-50 dark:bg-gray-950"

// Card/Section background
className="bg-white dark:bg-gray-900"

// Subtle background
className="bg-gray-50 dark:bg-gray-800"
```

### Border Colors
```tsx
// Standard border
className="border-gray-300 dark:border-gray-700"

// Divider
className="border-gray-200 dark:border-gray-800"
```

### Status Colors
```tsx
// Success
className="text-success-600 dark:text-success-400"
className="bg-success-50 dark:bg-success-900/20"

// Warning
className="text-warning-600 dark:text-warning-400"
className="bg-warning-50 dark:bg-warning-900/20"

// Error
className="text-error-600 dark:text-error-400"
className="bg-error-50 dark:bg-error-900/20"

// Info
className="text-blue-600 dark:text-blue-400"
className="bg-blue-50 dark:bg-blue-900/20"
```

---

## 📦 Spacing Standards

### Page Layout
- Page padding: `space-y-6` (24px vertical spacing)
- Section spacing: `space-y-5` (20px)
- Form field spacing: `space-y-4` (16px)
- Element spacing: `space-y-2` (8px)

### Component Padding
- Cards/Sections: `p-6` (24px)
- Modals: `p-6` (24px)
- Inputs: `px-4 py-2.5` (16px horizontal, 10px vertical)
- Buttons: `px-4 py-2.5` (same as inputs)

---

## 🔘 Button Standards

### Primary Button
```tsx
<Button onClick={handleClick}>
  Action
</Button>
```

### Button with Icon
```tsx
<Button startIcon={<Plus className="w-4 h-4" />}>
  Add Item
</Button>
```

### Action Buttons (View/Edit/Delete)
```tsx
// View - Blue
<button className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors">
  <Eye className="w-4 h-4" />
</button>

// Edit - Warning
<button className="p-2 text-warning-600 hover:bg-warning-50 dark:text-warning-400 dark:hover:bg-warning-900/20 rounded transition-colors">
  <Edit className="w-4 h-4" />
</button>

// Delete - Error
<button className="p-2 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 rounded transition-colors">
  <Trash2 className="w-4 h-4" />
</button>
```

---

## 📊 Table Standards

### Using DataTable Component
```tsx
<DataTable
  columns={[
    {
      key: 'name',
      header: 'Name',
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {item.name}
        </div>
      ),
    },
    // ... more columns
  ]}
  data={items}
  keyExtractor={(item) => item._id}
  hover
/>
```

**Table Cell Text:**
- Headers: `text-xs font-medium text-gray-500 dark:text-gray-300 uppercase`
- Cell text: `text-sm text-gray-900 dark:text-white`
- Secondary: `text-xs text-gray-600 dark:text-gray-400`

---

## 🎭 State Components

### Loading State
```tsx
{loading && <LoadingState message="Loading data..." />}
```

### Empty State
```tsx
{items.length === 0 && (
  <EmptyState
    icon={<Plus className="w-16 h-16" />}
    title="No items found"
    description="Try adjusting your filters or add a new item."
    action={<Button onClick={handleCreate}>Add Item</Button>}
  />
)}
```

---

## 🪟 Modal Standards

### Standard Modal
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Modal Title"
  size="lg" // sm, md, lg, xl, full
>
  <div className="space-y-4">
    {/* Modal content */}
  </div>
</Modal>
```

### Modal with Footer
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Form Title"
  size="lg"
  footer={
    <ModalFooter
      onCancel={() => setShowModal(false)}
      onSubmit={handleSubmit}
      submitText="Save"
    />
  }
>
  {/* Form content */}
</Modal>
```

---

## 🏷️ Badge Standards

```tsx
import { Badge } from '../components';

// Status badges
<Badge color="success">Active</Badge>
<Badge color="warning">Pending</Badge>
<Badge color="error">Cancelled</Badge>
<Badge color="info">Draft</Badge>
```

---

## ✅ Consistency Checklist

Use this checklist for every page:

- [ ] Breadcrumbs positioned on the RIGHT side
- [ ] Page title is `text-3xl font-bold`
- [ ] Section titles are `text-lg font-bold`
- [ ] All inputs have consistent height (44px)
- [ ] All inputs use the standardized Input component
- [ ] All selects use the standardized Select component
- [ ] All textareas use the standardized Textarea component
- [ ] Labels are `text-sm font-semibold`
- [ ] Form fields wrapped in FormField component
- [ ] Action buttons follow color convention (blue/warning/error)
- [ ] Dark mode classes included for all elements
- [ ] PageLayout wrapper used
- [ ] PageHeader with proper structure
- [ ] FilterBar for search/filters
- [ ] Consistent spacing (space-y-6 for page, space-y-4 for forms)

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T
```tsx
// Inconsistent input styling
<input className="px-3 py-2 border rounded" />

// Left-aligned breadcrumbs
<nav className="flex items-center gap-2">

// Mixed title sizes
<h1 className="text-2xl font-semibold">
<h1 className="text-xl font-bold">

// Inline styles
<div style={{ padding: '16px' }}>

// Mixed label styles
<label className="text-xs">
<label className="font-medium">
```

### ✅ DO
```tsx
// Use standardized Input
<Input placeholder="..." value={...} onChange={...} />

// Right-aligned breadcrumbs
<nav className="flex items-center justify-end gap-2">

// Consistent title size
<h1 className="text-3xl font-bold text-gray-900 dark:text-white">

// Tailwind classes
<div className="p-4">

// Consistent labels via FormField
<FormField label="Name" required>
  <Input ... />
</FormField>
```

---

## 📱 Responsive Considerations

All components should be responsive:

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive flex
<div className="flex flex-col md:flex-row gap-4">

// Responsive text
<h1 className="text-2xl md:text-3xl font-bold">
```

---

## 🎯 Summary

**Three Golden Rules:**
1. **Breadcrumbs on the RIGHT** - Always use `justify-end`
2. **Use Standardized Components** - Import from `../components`
3. **Consistent Typography** - `text-3xl font-bold` for page titles, `text-sm font-semibold` for labels

**Every page should:**
- Use PageLayout, PageHeader, FilterBar pattern
- Have right-aligned breadcrumbs
- Use standardized Input/Select/Textarea components
- Follow the same spacing system
- Include dark mode classes
- Use consistent colors and typography

---

**Document Version:** 2.0  
**Last Updated:** February 11, 2026  
**Status:** Active Standard
