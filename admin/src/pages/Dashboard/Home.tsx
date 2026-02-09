import PageMeta from "../../components/common/PageMeta";
import { ArrowRightIcon, UsersIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";
import AgentStatusChart from "../../components/charts/AgentStatusChart";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard | Rihla Access"
        description="Dashboard overview for Rihla Access"
      />
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-black dark:text-white">Dashboard</h1>
          <div className="text-sm text-gray-500">
            <span className="text-blue-600">Home</span> / Profile
          </div>
        </div>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
        {/* Agents Card */}
        <div className="bg-linear-to-br from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-700 rounded-lg p-6 text-white relative shadow-lg">
          <div className="absolute top-6 right-6 opacity-20">
            <UsersIcon className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Agents</h3>
          <p className="text-teal-100 mb-4 text-sm">My Agents</p>
          <Link to="/registered-agencies" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm transition-colors">
            Go to list <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Index Cards */}
        <div className="bg-linear-to-br from-slate-500 to-blue-600 dark:from-slate-600 dark:to-blue-700 rounded-lg p-6 text-white relative shadow-lg">
          <div className="absolute top-6 right-6 opacity-20">
            <IdentificationIcon className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Index Cards</h3>
          <p className="text-slate-100 mb-4 text-sm">Index Cards</p>
          <button className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm transition-colors">
            Go to list <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Agent Status Chart */}
      <div className="mb-6">
        <AgentStatusChart />
      </div>

      {/* View Sections */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <button className="bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg text-lg">
          View All Groups
        </button>
      </div>
    </>
  );
}
