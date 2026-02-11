import PageHeader from "../../components/layout/PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import PageMeta from "../../components/common/PageMeta";

export default function BarChart() {
  return (
    <div>
      <PageMeta
        title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageHeader
        title="Bar Chart"
        description="Bar chart visualizations"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Charts', path: '/charts' },
          { label: 'Bar Chart' },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
