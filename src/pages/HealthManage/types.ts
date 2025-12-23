// types.ts
export interface HealthData {
    basicInfo: {
        age: number;
        gender: string;
        bloodType: string;
        allergyHistory: string;
        familyMedicalHistory: string;
        height: number;
        weight: number;
        bodyFatPercentage: number;
    };
    physiologicalIndicators: {
        restingHeartRate: number;
        bloodPressure: string;
        bloodOxygen: number;
        bodyFatPercentage: number;
        muscleMass: number;
        glucoseLevel: number;
        sleepDuration: number;
    };
    /*  healthReport: {
         quarterlyReport: string;
         annualReport: string;
     }; */
}