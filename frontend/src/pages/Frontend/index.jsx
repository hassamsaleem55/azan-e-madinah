import { useEffect, useState } from 'react'
import { Route, Routes, Navigate, Link, useSearchParams } from 'react-router-dom'
import Header from '../../components/Header'
import Home from './Home'
import AllGroups from './AllGroups'
import BookingForm from '../../components/BookingForm'
import Bank from './Bank'
import Footer from '../../components/Footer'
import NoPage from '../../components/NoPage'
import Register from '../Auth/Register'
import Payment from './Payment'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import Dashboard from './Dashboard'
import Ledger from './Ledger'
import ChangePassword from '../../components/ChangePassword/ChangePassword'
import Profile from '../../components/Profile/Profile'
import MyBookings from '../MyBookings'
import BookingDetail from '../BookingDetail'
import { groupTypes } from '../../data/groupTypes'
import { useAuth } from "../../context/AuthContext";

export default function Frontend() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { user, logout, loading } = useAuth();

    const normalizeParams = (str) => {
        return decodeURIComponent(str.replace(/\+/g, " "));
    }

    const handleGroupTypeChange = (groupType) => {
        if (groupType) {
            setSearchParams({ group_type: groupType })
        } else {
            setSearchParams({})
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes with Header and Footer */}
            <Route path="/" element={
                <>
                    <Header user={user} handleLogout={logout} />
                    <Home user={user} />
                    <Footer />
                </>
            } />
            {/* <Route path="/home" element={
                <>
                    <Header user={user} handleLogout={logout} />
                    <Home user={user} />
                    <Footer />
                </>
            } /> */}
            <Route path="/auth/register" element={
                !user ? (
                    <>
                        <Header user={user} handleLogout={logout} />
                        <Register />
                        <Footer />
                    </>
                ) : <Navigate to="/dashboard" replace />
            } />

            {/* Dashboard Routes - Protected */}
            <Route path="/dashboard" element={
                // user ? <DashboardLayout user={user} handleLogout={handleLogout} /> : <Navigate to="/" replace />
                user ? <DashboardLayout user={user} handleLogout={logout} /> : <Navigate to="/" replace />
            }>
                <Route index element={<Dashboard />} />
                <Route path="all-groups" element={
                    <AllGroups headerType="dashboard" header={<div className="flex flex-wrap gap-1 sm:gap-2">
                        {groupTypes.map((type) => (
                            <Link
                                to={`/dashboard/${type.path}`}
                                key={type.value}
                                onClick={() => handleGroupTypeChange(type.value)}
                                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${(normalizeParams(searchParams.toString()) || '') === normalizeParams(type.path.split('?')[1] || '')
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {type.label}
                            </Link>
                        ))}
                    </div>} searchParams={searchParams} />
                } />
                <Route path="booking" element={<BookingForm user={user} />} />
                <Route path="banks" element={<Bank />} />
                <Route path="payment" element={<Payment />} />
                <Route path="ledger" element={<Ledger />} />
                <Route path="my-bookings" element={<MyBookings />} />
                <Route path="booking-detail/:id" element={<BookingDetail />} />
                <Route path="edit-booking/:id" element={<BookingForm />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="profile" element={<Profile />} />
            </Route>

            {/* Profile Route - Standalone Protected */}
            <Route path="/profile" element={
                user ? (
                    <>
                        {/* <Header user={user} handleLogout={handleLogout} /> */}
                        <Header user={user} handleLogout={logout} />
                        <Profile />
                        <Footer />
                    </>
                ) : <Navigate to="/" replace />
            } />

            {/* 404 Page */}
            <Route path="*" element={
                <>
                    {/* <Header user={user} handleLogout={handleLogout} /> */}
                    <Header user={user} handleLogout={logout} />
                    <NoPage />
                    <Footer />
                </>
            } />
        </Routes>
    )
}