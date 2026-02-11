import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from 'react-hot-toast';
import SignIn from "./pages/AuthPages/SignIn";
import ChangePassword from "./pages/AuthPages/ChangePassword";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import ManageUserPasswords from "./pages/AuthPages/ManageUserPasswords";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import TestEmail from "./pages/TestEmail";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./context/PrivateRoute";
import RegisteredAgencies from "./pages/RegisteredAgencies";
import AgentDetail from "./pages/AgentDetail";
import AddBank from "./pages/AddBank";
import Sector from "./pages/Sector";
import Airline from "./pages/Airline";
import GroupTicketing from "./pages/GroupTicketing";
import GroupTicketingForm from "./pages/GroupTicketingForm";
import ViewPaymentVoucher from "./pages/ViewPaymentVoucher";
import EditPaymentVoucher from "./pages/EditPaymentVoucher";
import ViewAccounts from "./pages/ViewAccounts";
import Ledger from "./pages/Ledger";
import AllBookings from "./pages/AllBookings";
import BookingDetail from "./pages/BookingDetail";
import RoleManagement from "./pages/RoleManagement";
import UserManagement from "./pages/UserManagement";
import { PermissionGuard } from "./context/PermissionGuard";
import Packages from "./pages/Packages";
import Hotels from "./pages/Hotels";
import Flights from "./pages/Flights";
import FlightPackages from "./pages/FlightPackages";
import Visas from "./pages/Visas";
import Tours from "./pages/Tours";
import Testimonials from "./pages/Testimonials";
import ContentManagement from "./pages/ContentManagement";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AuthProvider>
        <Router basename="/admin-portal/">
          <ScrollToTop />
          <Routes>
            <Route element={<PrivateRoute />}>
              {/* Dashboard Layout */}
              <Route element={<AppLayout />}>
                <Route index path="/" element={<PermissionGuard permission="dashboard.view"><Home /></PermissionGuard>} />

                {/* Others Page */}
                <Route path="/profile" element={<UserProfiles />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/blank" element={<Blank />} />
                <Route path="/registered-agencies" element={<PermissionGuard permission="agencies.view"><RegisteredAgencies /></PermissionGuard>} />
                <Route path="/registered-agencies/:id" element={<PermissionGuard permission="agencies.details"><AgentDetail /></PermissionGuard>} />
                <Route path="/add-bank" element={<PermissionGuard permission="banks.view"><AddBank /></PermissionGuard>} />
                <Route path="/sector" element={<PermissionGuard permission="sectors.view"><Sector /></PermissionGuard>} />
                <Route path="/airline" element={<PermissionGuard permission="airlines.view"><Airline /></PermissionGuard>} />
                <Route path="/all-bookings" element={<PermissionGuard permission="bookings.view"><AllBookings /></PermissionGuard>} />
                <Route path="/booking-detail/:id" element={<PermissionGuard permission="bookings.details"><BookingDetail /></PermissionGuard>} />
                <Route path="/group-ticketing" element={<PermissionGuard permission="groups.view"><GroupTicketing /></PermissionGuard>} />
                <Route path="/group-ticketing/create" element={<PermissionGuard permission="groups.create"><GroupTicketingForm /></PermissionGuard>} />
                <Route path="/group-ticketing/edit/:id" element={<PermissionGuard permission="groups.edit"><GroupTicketingForm /></PermissionGuard>} />
                <Route path="/view-payment-voucher" element={<PermissionGuard permission="payments.view"><ViewPaymentVoucher /></PermissionGuard>} />
                <Route path="/view-payment-voucher/edit/:id" element={<PermissionGuard permission="payments.edit"><EditPaymentVoucher /></PermissionGuard>} />
                <Route path="/view-accounts" element={<PermissionGuard permission="ledger.view"><ViewAccounts /></PermissionGuard>} />
                <Route path="/ledger/:id" element={<PermissionGuard permission="ledger.view"><Ledger /></PermissionGuard>} />

                {/* Password Management */}
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/manage-user-passwords" element={<ManageUserPasswords />} />
                <Route path="/test-email" element={<TestEmail />} />

                {/* Role Management - Super Admin Only */}
                <Route 
                  path="/settings/roles" 
                  element={
                    <PermissionGuard permission="settings.roles">
                      <RoleManagement />
                    </PermissionGuard>
                  } 
                />
                <Route 
                  path="/settings/users" 
                  element={
                    <PermissionGuard permission="settings.roles">
                      <UserManagement />
                    </PermissionGuard>
                  } 
                />

                {/* Travel Management */}
                <Route path="/packages" element={<PermissionGuard permission="packages.view"><Packages /></PermissionGuard>} />
                <Route path="/hotels" element={<PermissionGuard permission="hotels.view"><Hotels /></PermissionGuard>} />
                <Route path="/flights" element={<PermissionGuard permission="airlines.view"><Flights /></PermissionGuard>} />
                <Route path="/flight-packages" element={<PermissionGuard permission="packages.view"><FlightPackages /></PermissionGuard>} />
                <Route path="/visas" element={<PermissionGuard permission="visas.view"><Visas /></PermissionGuard>} />
                <Route path="/tours" element={<PermissionGuard permission="tours.view"><Tours /></PermissionGuard>} />
                <Route path="/testimonials" element={<PermissionGuard permission="testimonials.view"><Testimonials /></PermissionGuard>} />
                <Route path="/content-management" element={<PermissionGuard permission="content.view"><ContentManagement /></PermissionGuard>} />

                {/* Forms */}
                <Route path="/form-elements" element={<FormElements />} />

                {/* Tables */}
                <Route path="/basic-tables" element={<BasicTables />} />

                {/* Ui Elements */}
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/buttons" element={<Buttons />} />
                <Route path="/images" element={<Images />} />
                <Route path="/videos" element={<Videos />} />

                {/* Charts */}
                <Route path="/line-chart" element={<LineChart />} />
                <Route path="/bar-chart" element={<BarChart />} />
              </Route>
            </Route>

            {/* Auth Layout */}
            <Route path="/signin" element={<SignIn />} />
            {/* <Route path="/signup" element={<SignUp />} /> */} {/* Disabled: Admin users created by admins only */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}
