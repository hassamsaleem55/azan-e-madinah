import { ArrowRightIcon, UsersIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";
import AgentStatusChart from "../../components/charts/AgentStatusChart";
import {
  PageMeta,
  PageLayout,
  PageHeader,
  PageContent,
  PageContentSection,
  Button,
} from "../../components";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard | Azan e Madinah Admin Portal"
        description="Dashboard overview for Azan e Madinah Admin Portal"
      />
      
      <PageLayout>
        <PageHeader
          title="Dashboard"
          description="Overview of your admin portal"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Dashboard' },
          ]}
        />

        {/* Top Cards Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Agents Card */}
          <Link to="/registered-agencies" className="block group">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-700 rounded-xl p-6 text-white relative shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
                <UsersIcon className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-semibold mb-2 relative z-10">Agents</h3>
              <p className="text-teal-100 mb-4 text-sm relative z-10">Manage your agents</p>
              <div className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors relative z-10">
                Go to list <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Index Cards */}
          <div className="bg-gradient-to-br from-slate-500 to-blue-600 dark:from-slate-600 dark:to-blue-700 rounded-xl p-6 text-white relative shadow-lg hover:shadow-xl transition-all group cursor-pointer">
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
              <IdentificationIcon className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-semibold mb-2 relative z-10">Index Cards</h3>
            <p className="text-slate-100 mb-4 text-sm relative z-10">Manage index cards</p>
            <div className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors relative z-10">
              Go to list <ArrowRightIcon className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Agent Status Chart */}
        <PageContent>
          <PageContentSection>
            <AgentStatusChart />
          </PageContentSection>
        </PageContent>

        {/* Quick Actions */}
        <PageContent>
          <PageContentSection>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {/* Navigate to groups */}}
            >
              View All Groups
            </Button>
          </PageContentSection>
        </PageContent>
      </PageLayout>
    </>
  );
}
