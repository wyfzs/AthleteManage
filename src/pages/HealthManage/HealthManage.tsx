import React, { useState } from 'react';
import { HealthData } from './types';
import { Card, Descriptions, Typography, Form, Input, Button, Modal, message, Spin } from 'antd';
import axios from 'axios';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

const { Title, Paragraph } = Typography;

const HealthManage: React.FC<{ healthData: HealthData }> = ({ healthData }) => {
    const role = localStorage.getItem('role');
    const [formData, setFormData] = useState(healthData);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const athletename = localStorage.getItem('athletename');
    const coachname = localStorage.getItem('coachname');
    const coachspecialty = localStorage.getItem('coachspecialty');
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploadedData, setUploadedData] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const healthInfo = {
        athletename,
        coachname,
        coachspecialty
    };

    const handleOk = async () => {
        // setLoading(true);
        const combinedData = {
            ...formData,
            ...healthInfo
        };
        try {
            const response = await axios.post('/api/healthAnalysis', combinedData);
            const reportData = response.data;
            setReport(reportData.report);
            message.success('健康分析报告已提交');
            setIsModalVisible(false);
        } catch (error) {
            message.error('提交失败，请重试');
        } /* finally {
            setLoading(false);
        } */
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = (values: HealthData) => {
        setFormData(values);
        showModal();
    };

    const generatePDF = () => {
        if (!report) return;

        const element = document.getElementById('report-content');

        if (element) {
            html2pdf(element, {
                margin: 10,
                filename: athletename ? `${athletename} 健康报告.pdf` : `${coachname} 健康报告.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            });
        }
    };

    const showUploadModal = () => {
        setUploadModalVisible(true);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]; // 显式类型断言

                // 定义明确的接口
                interface HealthDataRow {
                    indicator: string;
                    result: string;
                    referenceRange: string;
                    unit: string;
                    note: string;
                    exerciseSuggestion: string;
                }

                // 使用接口进行映射并转换为键值对
                const structuredData: HealthDataRow[] = json.slice(1).map((row: any[]) => ({
                    indicator: row[0] || '',
                    result: row[1] || '',
                    referenceRange: row[2] || '',
                    unit: row[3] || '',
                    note: row[4] || '',
                    exerciseSuggestion: row[5] || ''
                }));

                // 转换为键值对对象
                const keyValueData: { [key: string]: string } = structuredData.reduce((acc, curr) => {
                    acc[curr.indicator] = curr.result;
                    return acc;
                }, {});

                setUploadedData([keyValueData]); // 将键值对对象放入数组中
                showUploadModal();
            };
            reader.readAsArrayBuffer(file);
        }
    };
    // 修改 setLoading 的使用方式，避免全屏 Spin
    const handleImportOk = async () => {
        setLoading(true)
        setIsGenerating(true); // 新增一个状态：isGenerating: boolean
        try {
            const combinedData = {
                healthReport: uploadedData[0],
                ...healthInfo
            };

            const response = await fetch('/api/importhealthReport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(combinedData)
            });

            if (!response.ok || !response.body) {
                throw new Error('Network response was not ok or no body present');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                accumulatedText += chunk;
                console.log('Received from backend:', chunk);
                setReport(accumulatedText);
            }

            message.success('健康分析报告已生成');
        } catch (error) {
            message.error('生成失败，请重试');
        } finally {
            setIsGenerating(false);
            setUploadModalVisible(false);
            setLoading(false);
        }
    };

    return (
        <Spin spinning={loading} tip="正在生成报告..." >
            <div>
                <Card title="健康管理" style={{ marginBottom: 24, width: '66.67%' }}>
                    <Form
                        layout="vertical"
                        initialValues={formData}
                        onFinish={onFinish}
                    >
                        <Card title="基础信息" type="inner" style={{ marginBottom: 24, width: '66.67%' }}>
                            <Form.Item name={['basicInfo', 'age']} label="年龄">
                                <Input type="number" />
                            </Form.Item>
                            <Form.Item name={['basicInfo', 'gender']} label="性别">
                                <Input />
                            </Form.Item>
                            <Form.Item name={['basicInfo', 'bloodType']} label="血型">
                                <Input />
                            </Form.Item>
                            <Form.Item name={['basicInfo', 'allergyHistory']} label="过敏史">
                                <Input />
                            </Form.Item>
                            <Form.Item name={['basicInfo', 'familyMedicalHistory']} label="家族病史">
                                <Input />
                            </Form.Item>
                            <Form.Item name={['basicInfo', 'height']} label="身高">
                                <Input type="number" addonAfter="cm" />
                            </Form.Item>
                            <Form.Item name={['basicInfo', 'weight']} label="体重">
                                <Input type="number" addonAfter="kg" />
                            </Form.Item>
                            <Form.Item name={['basicInfo', 'bodyFatPercentage']} label="体脂率">
                                <Input type="number" addonAfter="%" />
                            </Form.Item>
                        </Card>

                        <Card title="生理指标" type="inner" style={{ marginBottom: 24, width: '66.67%' }}>
                            <Form.Item name={['physiologicalIndicators', 'restingHeartRate']} label="静息心率">
                                <Input type="number" addonAfter="bpm" />
                            </Form.Item>
                            <Form.Item name={['physiologicalIndicators', 'bloodPressure']} label="血压">
                                <Input />
                            </Form.Item>
                            <Form.Item name={['physiologicalIndicators', 'glucoseLevel']} label="血糖">
                                <Input type="number" addonAfter="mg/dL" />
                            </Form.Item>
                            <Form.Item name={['physiologicalIndicators', 'bloodOxygen']} label="血氧">
                                <Input type="number" addonAfter="%" />
                            </Form.Item>
                            <Form.Item name={['physiologicalIndicators', 'sleepDuration']} label="睡眠时长">
                                <Input type="number" addonAfter="小时" />
                            </Form.Item>
                            <Form.Item name={['physiologicalIndicators', 'muscleMass']} label="肌肉量">
                                <Input type="number" addonAfter="kg" />
                            </Form.Item>
                        </Card>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" disabled={loading}>
                                提交
                            </Button>
                            <Button type="dashed" disabled={isGenerating} onClick={() => document.getElementById('fileInput')?.click()} style={{ marginLeft: 16 }}>
                                {isGenerating ? '生成中...' : '导入体检报告'}
                            </Button>
                            <input
                                id="fileInput"
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </Form.Item>
                        {report && (
                            <Card title="健康分析报告" type="inner">
                                <div id="report-content" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.5', padding: '10px' }}>
                                    {report.split('###').map((section, index) => (
                                        <div key={index} style={{ marginBottom: '20px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>{section.split('\n')[0]}</h3>
                                            <p style={{ fontSize: '12px', lineHeight: '1.5' }}>
                                                {section.split('\n').slice(1).map((line, lineIndex) => (
                                                    <span key={lineIndex}>
                                                        {line.trim()}
                                                        <br />
                                                    </span>
                                                ))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <Button type="primary" onClick={generatePDF} disabled={loading}>
                                    生成报告
                                </Button>
                            </Card>
                        )}
                    </Form>
                </Card>
                <Modal
                    title="确认提交"
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    confirmLoading={loading}
                >
                    <p>您确定要提交健康分析报告吗？</p>
                </Modal>
                <Modal
                    title="确认导入体检报告"
                    visible={uploadModalVisible}
                    onOk={handleImportOk}
                    onCancel={() => setUploadModalVisible(false)}
                    confirmLoading={loading}
                >
                    <p>您确定要导入体检报告吗？</p>
                </Modal>
            </div>
        </Spin>
    );
};

export default HealthManage;