import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Table, Card, Space, message, Select } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import { Outlet, useNavigate } from 'react-router-dom';
import TrainManageDetail from '../trainManageDetail';
import { SortOrder } from 'antd/es/table/interface';
import * as XLSX from 'xlsx';

interface TrainPlan {
    trainName: string;
    trainContent: string;
    trainType: string;
}

interface TrainRecord {
    id: number;
    trainName: string;
    trainContent: string;
    date: string;
    coach: string;
    specialty: string;
    trainType: string;
}

const TrainManage = () => {
    const [uploadedData, setUploadedData] = useState<any[]>([]);
    const navigate = useNavigate();
    const [trainPlans, setTrainPlans] = useState<TrainPlan[]>(() => {
        const savedPlans = localStorage.getItem('trainPlans');
        return savedPlans ? JSON.parse(savedPlans) : [];
    });
    const [trainData, setTrainData] = useState<TrainRecord[]>([]);
    const [searchParams, setSearchParams] = useState({ trainName: '', athletename: '' });
    const [analysisData, setAnalysisData] = useState<{ name: string; score: number }[]>([]);

    useEffect(() => {
        const coach = localStorage.getItem('coachname') || '';
        const specialty = localStorage.getItem('coachspecialty') || '';
        axios.get('/api/trainquery', {
            params: {
                coach,
                specialty
            }
        })
            .then(response => {
                setTrainData(response.data.data);
            })
            .catch(error => {
                console.error('获取训练数据失败:', error);
                message.error('获取训练数据失败');
            });
    }, []);

    useEffect(() => {
        localStorage.setItem('trainPlans', JSON.stringify(trainPlans));
    }, [trainPlans]);

    useEffect(() => {
        localStorage.setItem('trainData', JSON.stringify(trainData));
    }, [trainData]);

    const onFinish = (values: TrainPlan) => {
        setTrainPlans([...trainPlans, values]);
        console.log(trainPlans, '??????');

    };

    const handleAddTrainData = (record: TrainPlan) => {
        const newData: TrainRecord = {
            ...record,
            date: new Date().toLocaleDateString(),
            id: trainData.length + 1,
            coach: localStorage.getItem('coachname') || '',
            specialty: localStorage.getItem('coachspecialty') || '',
        };

        axios.post('/api/trainstorage', newData)
            .then(response => {
                console.log('数据存储成功:', response.data);
                setTrainData([...trainData, newData]);
                message.success('数据存储成功');
            })
            .catch(error => {
                console.error('数据存储失败:', error);
                message.error('数据存储失败');
            });
    };

    const handleDeleteTrainData = (trainName: string) => {
        const updatedPlans = trainPlans.filter(plan => plan.trainName !== trainName);
        setTrainPlans(updatedPlans);

        const updatedData = trainData.filter(item => item.trainName !== trainName);
        setTrainData(updatedData);
        localStorage.setItem('trainPlans', JSON.stringify(updatedPlans));
        localStorage.setItem('trainData', JSON.stringify(updatedData));

        message.success('数据删除成功');
    };

    const handleDetail = (record: any) => {
        navigate('/trainmanagedetail', { replace: true, state: { record } });
    };

    const trainDataColumns = [
        {
            title: '训练计划名称',
            dataIndex: 'trainName',
            key: 'trainName',
        },
        {
            title: '训练内容',
            dataIndex: 'trainContent',
            key: 'trainContent',
        },
        {
            title: '日期',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => formatDate(date),
            sorter: (a: TrainRecord, b: TrainRecord) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateA - dateB;
            },
            defaultSortOrder: 'descend' as SortOrder,

        },
        {
            title: '操作',
            key: 'action',
            render: (text: any, record: TrainRecord) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleDeleteTrainRecord(record.id)}>
                        删除
                    </Button>
                    <Button type="link" onClick={() => handleDetail(record)}>
                        详情
                    </Button>
                    <Button type="link" disabled={record.trainType !== '教练录入'}>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => handleFileUpload(e, record)}
                            style={{ position: 'absolute', opacity: 0, left: 0, top: 0, width: '100%', height: '100%' }}
                        />
                        导入
                    </Button>
                </Space>
            ),
        },
    ];
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, record: TrainRecord) => {
        console.log(record, 'record??????');
        const { id, coach, date, specialty, trainContent, trainName } = record;
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });

            // 假设只读第一个 sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            let json: any[] = [];
            json = XLSX.utils.sheet_to_json(worksheet);

            // 存入状态变量 uploadedData
            const renamedData = json.map(item => ({
                duration: item.所用时间,
                description: item.描述,
                athletename: item.运动员,
                trainName: trainName,
                coach: coach,
                specialty: specialty,
                date: date,
                trainContent: trainContent,
                id: id,
                completionTime: new Date().toISOString(),
            }));
            message.success('文件解析成功');
            // 发送到后端接口
            axios.post('/api/athletestoragetraininfobatch', renamedData)
                .then(response => {
                    message.success('数据上传成功');
                    console.log('接口返回:', response.data);
                })
                .catch(error => {
                    console.error('数据上传失败:', error);
                    message.error('数据上传失败');
                });
        };
        reader.readAsArrayBuffer(file);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDeleteTrainRecord = (id: number) => {
        axios.delete(`/api/traindelete/${id}`)
            .then(response => {
                console.log('训练数据删除成功:', response.data);
                const updatedData = trainData.filter(item => item.id !== id);
                setTrainData(updatedData);
                localStorage.setItem('trainData', JSON.stringify(updatedData));

                message.success('训练数据删除成功');
            })
            .catch(error => {
                console.error('训练数据删除失败:', error);
                message.error('训练数据删除失败');
            });
    };


    const onSearchFinish = (values: { trainName: string; athletename: string }) => {
        setSearchParams(values);
        fetchTrainData(values);
    };

    const fetchTrainData = (params: { trainName: string; athletename: string }) => {
        axios.get('/api/querytrainname', {
            params
        })
            .then(response => {
                const data = response.data.data.map((item: { score: number; date: string }) => ({
                    name: formatDate(item.date),
                    score: item.score
                }));
                setAnalysisData(data);
            })
            .catch(error => {
                console.error('获取训练数据失败:', error);
                message.error('获取训练数据失败');
            });
    };

    const columns = [
        {
            title: '数据录入方式',
            dataIndex: 'trainType',
            key: 'trainType',
            render: (text: string) => <span>{text}</span>,
        },
        {
            title: '训练计划名称',
            dataIndex: 'trainName',
            key: 'trainName',
        },
        {
            title: '训练内容',
            dataIndex: 'trainContent',
            key: 'trainContent',
        },
        {
            title: '操作',
            key: 'action',
            render: (text: any, record: TrainPlan) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => handleAddTrainData(record)}>
                        记录
                    </Button>
                    <Button type="primary" danger onClick={() => handleDeleteTrainData(record.trainName)}>
                        删除
                    </Button>
                </Space>
            ),
        },
    ];
    return (
        <div>
            <Card title="制定团队训练计划">
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item name="trainType" label="数据录入方式" rules={[{ required: true, message: '请选择数据录入方式' }]}>
                        <Select placeholder="请选择">
                            <Select.Option value="教练录入">教练录入</Select.Option>
                            <Select.Option value="自主录入">自主录入</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="trainName" label="训练计划名称" rules={[{ required: true, message: '请输入训练计划名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="trainContent" label="训练内容" rules={[{ required: true, message: '请输入训练内容' }]}>
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            提交
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <Card title="团队训练数据记录" style={{ marginTop: 20 }}>
                <Table dataSource={trainPlans} columns={columns} rowKey="name" />
            </Card>
            <Card title="团队训练计划列表" style={{ marginTop: 20 }}>
                <Table dataSource={trainData} columns={trainDataColumns} rowKey="id" />
            </Card>
            <Card title="训练图表展示">
                <Form onFinish={onSearchFinish} layout="vertical">
                    <Form.Item name="trainName" label="训练计划名称" rules={[{ required: true, message: '请输入训练计划名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="athletename" label="运动员名称" rules={[{ required: true, message: '请输入运动员名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            搜索
                        </Button>
                    </Form.Item>
                </Form>
                <LineChart width={600} height={300} data={analysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </Card>
        </div>
    );
};

export default TrainManage;