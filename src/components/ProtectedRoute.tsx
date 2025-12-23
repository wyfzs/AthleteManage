// src/components/ProtectedRoute.tsx
import { JSX, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
    const location = useLocation();
    const userRole = localStorage.getItem('role');

    // 如果用户没有登录或角色不在允许的列表中
    if (!userRole || !allowedRoles.includes(userRole)) {
        // 根据用户角色进行重定向
        if (userRole === 'athlete') {
            return <Navigate to="/athletehome" replace />;
        } else if (userRole === 'coach') {
            return <Navigate to="/" replace />;
        } else if (userRole === 'admin') {
            return <Navigate to="/adminhome" replace />;
        } else {
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;