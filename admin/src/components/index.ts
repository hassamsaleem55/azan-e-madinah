/**
 * Central export for all standardized UI components
 * Import from this file for consistent component usage across the app
 */

// Layout Components
export { default as PageLayout } from './layout/PageLayout';
export { default as PageHeader } from './layout/PageHeader';
export { default as PageContent, PageContentSection } from './layout/PageContent';
export { default as FilterBar } from './layout/FilterBar';

// Form Components
export {
  FormGroup,
  FormSection,
  FormField,
  FormActions,
} from './form/FormComponents';
export { default as Input } from './form/Input';
export { default as Select } from './form/StandardSelect';
export { default as Textarea } from './form/Textarea';
export { default as Checkbox } from './form/Checkbox';
export { default as Label } from './form/Label';

// UI Components
export { default as Button } from './ui/button/Button';
export { default as Badge } from './ui/badge/Badge';
export { default as Alert } from './ui/Alert';
export { default as Modal, ModalFooter } from './ui/Modal';
export { DataTable, Pagination } from './ui/table/DataTable';
export { EmptyState, LoadingState, ErrorState } from './ui/States';

// Common Components
export { default as PageMeta } from './common/PageMeta';
export { default as PageBreadCrumb } from './common/PageBreadCrumb';
export { default as ComponentCard } from './common/ComponentCard';

// Design System Constants
export * from '../styles/design-system';
