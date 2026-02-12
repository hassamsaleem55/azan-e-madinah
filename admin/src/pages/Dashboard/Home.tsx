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
          description="Welcome back! Here's what's happening today"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Dashboard' },
          ]}
        />

        {/* Top Cards Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-fadeIn">
          {/* Agents Card */}
          <Link to="/registered-agencies" className="block group">
            <div className="relative overflow-hidden bg-linear-to-br from-teal-500 via-teal-600 to-emerald-600 dark:from-teal-600 dark:via-teal-700 dark:to-emerald-700 rounded-2xl p-8 text-white shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 transition-all duration-500 hover:-translate-y-1">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-dots opacity-10"></div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-transparent to-black/10"></div>
              
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <UsersIcon className="w-24 h-24" />
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 mb-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <UsersIcon className="w-7 h-7" />
                </div>
                
                <h3 className="text-2xl font-bold mb-2">Agents</h3>
                <p className="text-teal-100 mb-6 text-base">Manage your registered agents and agencies</p>
                
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg group-hover:translate-x-1">
                  Go to list 
                  <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Index Cards */}
          <div className="relative overflow-hidden bg-linear-to-br from-slate-500 via-slate-600 to-blue-600 dark:from-slate-600 dark:via-slate-700 dark:to-blue-700 rounded-2xl p-8 text-white shadow-xl shadow-slate-500/30 hover:shadow-2xl hover:shadow-slate-500/40 transition-all duration-500 hover:-translate-y-1 group cursor-pointer">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-dots opacity-10"></div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-transparent to-black/10"></div>
            
            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <IdentificationIcon className="w-24 h-24" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 mb-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <IdentificationIcon className="w-7 h-7" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Index Cards</h3>
              <p className="text-slate-100 mb-6 text-base">Manage and organize index cards</p>
              
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg group-hover:translate-x-1">
                Go to list 
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
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
              className="w-full group"
              size="md"
              onClick={() => {/* Navigate to groups */}}
            >
              <span className="flex items-center gap-2">
                View All Groups
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Button>
          </PageContentSection>
        </PageContent>
      </PageLayout>
    </>
  );
}
