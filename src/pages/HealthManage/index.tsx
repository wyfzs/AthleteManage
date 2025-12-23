// index.tsx
import React from 'react';
import HealthManage from './HealthManage';
import { HealthData } from './types';

const Health = () => {
    const healthData: HealthData = {
        basicInfo: {
            age: 0,
            gender: '男',
            bloodType: 'A',
            allergyHistory: '无',
            familyMedicalHistory: '无',
            height: 180,
            weight: 75,
            bodyFatPercentage: 15,
        },
        physiologicalIndicators: {
            restingHeartRate: 72,
            bloodPressure: '120/80',
            bloodOxygen: 98,
            bodyFatPercentage: 15,
            muscleMass: 38,
            glucoseLevel: 95,
            sleepDuration: 8,
        },
    };

    return <HealthManage healthData={healthData} />;
};

export default Health;