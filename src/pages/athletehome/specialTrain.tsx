import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Typography, Spin, Button, Alert } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import html2pdf from 'html2pdf.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './SpecialTrain.css';

const { Title } = Typography;

const AthleteSpecialTrain = () => {
    const name = localStorage.getItem('athletename');
    const specialty = localStorage.getItem('coachspecialty');
    const coach = localStorage.getItem('coachname');
    const [traindata, setTrainData] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchSpecialTrainData = async () => {
            try {
                const { data: { specialTrain } } = await axios.post('/api/specialTrainByAthlete', {
                    coach,
                    name,
                    specialty
                });
                setTrainData(specialTrain);
            } catch (err) {
                console.error('Error fetching training data:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecialTrainData();
    }, [coach, name, specialty]);

    const generatePDF = () => {
        const element = document.getElementById('special-train-content');
        if (element) {
            html2pdf(element, {
                margin: 10,
                filename: `${name}_专项训练计划.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            });
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <Spin size="large" />
                <p style={{ marginTop: '20px', fontSize: '18px' }}>正在加载专项训练计划...</p>
            </div>
        );
    }

    return (
        <Card
            title={`${name} - 专项训练计划`}
            bordered={false}
            className="special-train-container"
            style={{
                maxWidth: 800,
                margin: '60px auto',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                transition: 'box-shadow 0.3s ease-in-out',
                backgroundColor: '#fff',
            }}
            hoverable
        >
            <div id="special-train-content">
                {!error ? (
                    <>
                        {/* <Title level={4} style={{ marginBottom: '16px' }}>
                            训练计划
                        </Title> */}
                        <div
                            className="markdown-content"
                            style={{
                                fontSize: '15px',
                                lineHeight: '1.8',
                                padding: '16px',
                                backgroundColor: '#f7f7f7',
                                borderRadius: '8px',
                                border: '1px solid #eaeaea',
                                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                            }}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{traindata || '暂无可用数据'}</ReactMarkdown>
                        </div>
                    </>
                ) : (
                    <Alert
                        message="加载失败"
                        description="无法获取训练计划，请稍后重试。"
                        type="error"
                        showIcon
                        action={
                            <Button size="small" onClick={() => window.location.reload()} style={{ marginTop: 8 }}>
                                重试
                            </Button>
                        }
                        style={{ marginBottom: 20 }}
                    />
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={generatePDF}
                    style={{
                        backgroundColor: '#1890ff',
                        borderColor: '#1890ff',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        padding: '8px 20px',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#40a9ff';
                        e.currentTarget.style.borderColor = '#40a9ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1890ff';
                        e.currentTarget.style.borderColor = '#1890ff';
                    }}
                >
                    导出 PDF
                </Button>
            </div>
        </Card>
    );
};

export default AthleteSpecialTrain;