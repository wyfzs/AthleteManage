// src/route/index.js
import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Train from '../pages/TrainManage';
import Report from '../pages/Report';
import Health from '../pages/HealthManage';
import Game from '../pages/GameManage';
import Athletes from '../pages/AthleteManage';
import Layout from '../pages/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Athletehome from '../pages/athletehome';
import CoachHome from '../pages/coachhome';
import AdminHome from '../pages/adminhome';
import TrainManageDetail from '../pages/trainManageDetail';
import GameDetail from '../pages/GameDetail';
import TrainHealthTable from '../pages/SecondTrain/trainHealthTable';
import SpecialTrain from '../pages/SecondTrain/SpecialTrain';
import AthleteSpecialTrain from '../pages/athletehome/specialTrain';

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: 'athletehome',
                element: (
                    <ProtectedRoute allowedRoles={['athlete']}>
                        <Athletehome />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'adminhome',
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminHome />
                    </ProtectedRoute>
                ),
            },
            {
                index: true,
                element: (
                    <ProtectedRoute allowedRoles={['coach']}>
                        <CoachHome />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'athletemanage',
                element: (
                    <ProtectedRoute allowedRoles={['coach']}>
                        <Athletes />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'train',
                children: [
                    {
                        path: 'Team',
                        element: (
                            <ProtectedRoute allowedRoles={['coach']}>
                                <Train />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'special',
                        element: (
                            <ProtectedRoute allowedRoles={['coach']}>
                                <SpecialTrain />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'health',
                        element: (
                            <ProtectedRoute allowedRoles={['coach']}>
                                <TrainHealthTable />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
            {
                path: 'game',
                element: (
                    <ProtectedRoute allowedRoles={['coach']}>
                        <Game />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'health',
                element: (
                    <ProtectedRoute allowedRoles={['coach', 'athlete']}>
                        <Health />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'report',
                element: (
                    <ProtectedRoute allowedRoles={['coach']}>
                        <Report />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'trainmanagedetail',
                element: (
                    <ProtectedRoute allowedRoles={['coach']}>
                        <TrainManageDetail />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'gamedetail',
                element: (
                    <ProtectedRoute allowedRoles={['coach']}>
                        <GameDetail />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/athlete-specialTrain',
                element: (
                    <ProtectedRoute allowedRoles={['athlete']}>
                        <AthleteSpecialTrain />
                    </ProtectedRoute>
                )
            }
        ],
    },
]);

export default router;