import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from "../context/AuthContext";
import Frontend from './Frontend'

export default function Index() {
    return (
        <AuthProvider>
            <Routes>
                <Route path='/*' element={<Frontend />} />
            </Routes>
        </AuthProvider>
    )
}