import { Link } from 'react-router-dom';
import { 
    Users, 
    Landmark, 
    CreditCard, 
    BookOpen, 
    User, 
    ArrowRight, 
    Plane 
} from 'lucide-react';

const Dashboard = () => {
  const cards = [
    {
      title: 'All Groups',
      description: 'Browse available flight groups and book seats.',
      icon: <Plane size={24} />,
      link: '/dashboard/all-groups',
      theme: 'blue'
    },
    {
      title: 'My Bookings',
      description: 'Track status of your held and confirmed bookings.',
      icon: <Users size={24} />,
      link: '/dashboard/my-bookings',
      theme: 'indigo'
    },
    {
      title: 'Bank Details',
      description: 'View registered bank accounts for transactions.',
      icon: <Landmark size={24} />,
      link: '/dashboard/banks',
      theme: 'emerald'
    },
    {
      title: 'Payment',
      description: 'Submit payment proofs and view history.',
      icon: <CreditCard size={24} />,
      link: '/dashboard/payment',
      theme: 'amber'
    },
    {
      title: 'Ledger',
      description: 'Check your account statement and balance.',
      icon: <BookOpen size={24} />,
      link: '/dashboard/ledger',
      theme: 'purple'
    },
    {
      title: 'Profile',
      description: 'Update your agency contact information.',
      icon: <User size={24} />,
      link: '/dashboard/profile',
      theme: 'pink'
    }
  ];

  // Helper to get theme styles
  const getThemeStyles = (theme) => {
    const styles = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', groupHover: 'group-hover:border-blue-200', arrow: 'group-hover:text-blue-600' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', groupHover: 'group-hover:border-indigo-200', arrow: 'group-hover:text-indigo-600' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', groupHover: 'group-hover:border-emerald-200', arrow: 'group-hover:text-emerald-600' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600', groupHover: 'group-hover:border-amber-200', arrow: 'group-hover:text-amber-600' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', groupHover: 'group-hover:border-purple-200', arrow: 'group-hover:text-purple-600' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600', groupHover: 'group-hover:border-pink-200', arrow: 'group-hover:text-pink-600' },
    };
    return styles[theme] || styles.blue;
  };

  return (
    <div className="w-full pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Manage your travel agency operations.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const theme = getThemeStyles(card.theme);
          
          return (
            <Link
              to={card.link}
              key={index}
              className={`
                group relative bg-white p-6 rounded-2xl shadow-sm border border-gray-200 
                transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${theme.groupHover}
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${theme.bg} ${theme.text}`}>
                  {card.icon}
                </div>
                <div className={`p-2 rounded-full bg-gray-50 text-gray-300 transition-colors ${theme.arrow}`}>
                  <ArrowRight size={18} />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#C9A536] transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;