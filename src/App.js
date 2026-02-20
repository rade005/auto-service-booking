import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard";
import {AuthProvider} from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Services from "./pages/Services";
import Profile from "./pages/Profile";
import {AdminDashboard} from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import ServiceSearch from "./pages/ServiceSearch";
import {Review} from "./pages/Review";
import {OwnerDashboard} from "./pages/OwnerDashboard";
import {CreateService} from "./pages/CreateService";


function App() {
  return (
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={
              <ProtectedRoute>
              <Dashboard />
              </ProtectedRoute>} />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            }/>

            <Route path="/admin" element={
                <AdminRoute>
                    <AdminDashboard/>
                </AdminRoute>
            }/>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

            <Route path="/ServiceSearch" element={<ProtectedRoute><ServiceSearch /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><ServiceSearch /></ProtectedRoute>} />
            <Route path="/services/:serviceId" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/review/:bookingId" element={<ProtectedRoute><Review /></ProtectedRoute>} />
            <Route path="/owner" element={<OwnerDashboard/>} />
            <Route path="/create-service" element={<CreateService />} />


        </Routes>
      </BrowserRouter>
          </AuthProvider>
  );
}

export default App;
