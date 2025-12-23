import React, { useState, useEffect } from 'react';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Card, message, Modal, InputNumber } from 'antd';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const TrainManageDetail = () => {
    // 格式化时间的函数
    const formatTime = (time: string | undefined): string => {
        if (!time) return ''; // 如果时间为空，返回空字符串
        const date = new Date(time);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} `;
    };
    const navigate = useNavigate();
    const location = useLocation();
    const record = location.state || {};
    const trainName = record.record.trainName;
    const trainContent = record.record.trainContent;
    const trainId = record.record.id;
    const date = formatTime(record.record.date);
    const [athletename, setathletename] = useState<string>('');
    console.log(trainName, '----------------------------------');

    console.log('recoooooooooooooooooooooooooord', record.record);

    const [trainData, setTrainData] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const handleBack = () => {
        navigate('/train/Team');
    };

    const trainDataColumns: ProColumns<any>[] = [
        {
            title: '运动员',
            dataIndex: 'athletename',
            key: 'athletename',
        },
        {
            title: '所用时长',
            dataIndex: 'duration',
            key: 'duration',
        },
        {
            title: '完成时间',
            dataIndex: 'completionTime',
            key: 'completionTime',
            render: (text: any) => formatTime(text), // 使用格式化函数并确保类型安全
        },
        {
            title: '描述信息',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '训练效果评估得分',
            dataIndex: 'score',
            key: 'score',
            render: (text: any) => text || '无数据',
        },
        {
            title: '操作',
            key: 'action',
            render: (record: any) => (
                <a onClick={() => handleTrainAnalysis(record)}>训练分析</a>
            ),
        },
    ];

    const handleTrainAnalysis = (record) => {
        setIsModalVisible(true);
        setathletename(record.athletename)
    };

    const handleOk = () => {
        if (score !== null && score >= 0 && score <= 100) {
            axios.post('/api/trainscore', {
                id: trainId,
                score: score,
                athletename,
            })
                .then(response => {
                    message.success('评分成功');
                    setIsModalVisible(false);
                    fetchTrainData(); // 评分成功后刷新列表
                })
                .catch(error => {
                    console.error('评分失败:', error);
                    message.error('评分失败');
                });
        } else {
            message.error('请输入0-100之间的整数');
        }
    };
    const fetchTrainData = () => {
        axios.get('/api/trainquerydetail', {
            params: {
                id: trainId
            }
        })
            .then(response => {
                console.log(response.data);
                if (response.data.success) {
                    setTrainData(response.data.data);
                }
            })
            .catch(error => {
                console.error('暂无该训练数据:', error);
                message.error('暂无该训练数据');
            });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        // 从后端获取训练数据记录
        axios.get('/api/trainquerydetail', {
            params: {
                id: trainId
            }
        })
            .then(response => {
                console.log(response.data);
                if (response.data.success) {
                    setTrainData(response.data.data);
                }
            })
            .catch(error => {
                console.error('暂无该训练数据:', error);
                message.error('暂无该训练数据');
            });
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* 美化后的返回按钮 */}
            <button
                onClick={handleBack}
                style={{
                    marginLeft: '-40px',
                    marginTop: '-40px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#fff',
                    backgroundColor: '#007bff',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
                ← 返回
            </button>
            <Card title={<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span><strong>训练计划名称：</strong>{trainName}</span>
                <span><strong>训练内容：</strong>{trainContent}</span>
                <span><strong>发布日期：</strong>{date}</span>
            </div>} >
                <ProTable
                    dataSource={trainData}
                    columns={trainDataColumns}
                    rowKey="id"
                    search={false}
                    pagination={{
                        pageSize: 10,
                    }}
                />
            </Card>
            <Modal
                title="训练效果评估"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>请教练对训练效果做出评估：</p>
                <InputNumber
                    min={0}
                    max={100}
                    step={1}
                    value={score}
                    onChange={(value) => setScore(value)}
                    placeholder="请输入0-100之间的整数"
                />
            </Modal>
        </div>
    );
};

export default TrainManageDetail;