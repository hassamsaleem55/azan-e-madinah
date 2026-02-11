import PageHeader from "../../components/layout/PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import LineChartOne from "../../components/charts/line/LineChartOne";
import PageMeta from "../../components/common/PageMeta";

export default function LineChart() {
  return (
    <>
      <PageMeta
        title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageHeader
        title="Line Chart"
        description="Line chart visualizations"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Charts', path: '/charts' },
          { label: 'Line Chart' },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Line Chart 1">
          <LineChartOne />
        </ComponentCard>
      </div>
    </>
  );
}
