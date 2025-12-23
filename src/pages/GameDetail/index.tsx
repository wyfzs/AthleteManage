import React, { useState, useEffect, useRef } from 'react';
import ProTable, { ProColumns, TableDropdown } from '@ant-design/pro-table'; // 引入 TableDropdown
import { Card, message, Modal, Button, Drawer } from 'antd'; // 引入 Button 和 Modal 组件
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; // 引入 xlsx 库
import ReactMarkdown from 'react-markdown';


const GameDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    console.log('location', location);
    const [tolPeople, setTolPeople] = useState<number>(0);
    const record = location.state || {};
    const status = record.record.status;
    const id = record.record.id;
    const gameName = record.record.name;
    const date = record.record.date;
    const [file, setFile] = useState<File | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isGameAnalysicVisible, setIsGameAnalysicVisible] = useState(false);
    const [analysicdata, setAnalysicdata] = useState<any>({});
    const [analysicdrawerVisit, setAnalysicDrawerVisit] = useState(false);
    const [analysicData, setAnalysicData] = useState();
    const [isAnalysic, setIsAnalysic] = useState(true);

    const [isAnalyzing, setIsAnalyzing] = useState(false); // 新增 loading 状态
    const handleBack = () => {
        navigate('/game');
    };

    const gameDataColumns: ProColumns<any>[] = [
        {
            title: '运动员姓名',
            dataIndex: 'name',
            key: 'name',
            width: 100,
        },
        {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
        },
        {
            title: '年龄',
            dataIndex: 'age',
            key: 'age',
            width: 100,
        },
        {
            title: '联系方式',
            dataIndex: 'telephone',
            key: 'telephone',
            width: 100,
        },
        {
            title: '比赛表现',
            dataIndex: 'gameScore',
            key: 'gameScore',
            width: 300,
        },
        {
            title: '操作',
            key: 'action',
            width: 100,
            render: (text, record) => (
                <>
                    <Button type="link" disabled={!record.gameScore} onClick={() => { setIsGameAnalysicVisible(true); setAnalysicdata({ ...record, gameName, date, id }) }}>
                        比赛分析
                    </Button>
                    <Button type="link" disabled={!record.gameScore} onClick={() => { queryGameAnalysic(record.name) }}>
                        查看分析结果
                    </Button>
                </>
            ),
        }
    ];
    const queryGameAnalysic = (name) => {
        setAnalysicDrawerVisit(true)
        axios.get('/api/queryGameAnalysic', {
            params: {
                id,
                name
            }
        }).then(res => {
            console.log(res.data.gameAnalysic, '[[[[[[[[[[[[[[');
            setAnalysicData(res.data.gameAnalysic)
        }).catch(err => {
            console.log(err);
        })

    }
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFile(file);
            setIsModalVisible(true);
        }
    };

    // 定义 Excel 数据行的类型
    interface ExcelDataRow {
        [key: string]: any;
    }

    const handleModalOk = async () => {
        if (file) {
            // 解析 Excel 文件
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // 假设第一行是表头
                const headers = jsonData[0] as string[];
                const rows = jsonData.slice(1) as any[][]; // 明确类型为 any[][]

                // 将每一行数据转换为对象
                const dataObjects: ExcelDataRow[] = rows.map((row: any[]) => {
                    return headers.reduce((obj, header, index) => {
                        switch (header) {
                            case '运动员':
                                obj['name'] = row[index];
                                break;
                            case '比赛表现':
                                obj['gameScore'] = row[index];
                                break;
                            default:
                                obj[header] = row[index];
                                break;
                        }
                        return obj;
                    }, {} as ExcelDataRow);
                });

                // 现在 dataObjects 包含了 Excel 表格中的每一行数据，转换为对象格式
                // 继续上传文件
                uploadFile(dataObjects);
            };
            reader.readAsArrayBuffer(file);
        }
    };
    const uploadFile = async (dataObjects) => {
        const DataObjects = {
            DataMap: dataObjects,
            gameId: record.record.id,
        };
        console.log(DataObjects, ']]]]]]]]]]]]]');

        try {
            const response = await axios.post('/api/uploadScores', DataObjects, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.data.success) {
                message.success('文件上传成功');
            } else {
                message.error('文件上传失败');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            message.error('文件上传失败');
        } finally {
            setIsModalVisible(false);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };
    const CancelAnalysic = () => {
        setIsGameAnalysicVisible(false);
    };
    const gameAnalysic = async () => {
        setIsAnalyzing(true); // 开启 loading 状态
        const { id, gameName, date, name, age, gender, gameScore } = analysicdata;
        try {
            const response = await axios.post('/api/gameAnalysic', { id, gameName, date, name, age, gender, gameScore });
            if (response.data.success) {
                message.success('比赛分析成功');
                setIsAnalysic(false)
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            message.error('比赛分析出错');
        } finally {
            setIsAnalyzing(false); // 关闭 loading 状态
            setIsGameAnalysicVisible(false); // 关闭 Modal
        }
    };
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
                <span><strong>比赛类别：</strong>{record.record.type}</span>
                <span><strong>比赛名称:	</strong>{record.record.name}</span>
                <span><strong>比赛日期:	</strong>{record.record.date}</span>
                <span><strong>比赛地点:	</strong>{record.record.location}</span>
                <span><strong>状态:</strong>{record.record.status}</span>
                <span><strong>报名人数:</strong>{tolPeople}</span>
            </div>} >
                <ProTable
                    request={async (params = {}) => {
                        try {
                            const response = await axios.get('/api/getregistrationInfo', {
                                params: {
                                    id: record.record.id
                                }
                            });
                            if (response.data.success) {
                                // 调整数据结构并映射字段
                                const data = response.data.data;
                                setTolPeople(data.length);
                                console.log(tolPeople, 'ffffffffffff');

                                return {
                                    data: data,
                                    success: true,
                                    total: response.data.total,
                                };
                            } else {
                                console.error('Failed to fetch competitions:', response.data.message);
                                return {
                                    data: [],
                                    success: false,
                                    total: 0,
                                };
                            }
                        } catch (error) {
                            console.error('Error fetching data:', error);
                            return {
                                data: [],
                                success: false,
                                total: 0,
                            };
                        }
                    }}
                    columns={gameDataColumns}
                    rowKey="id"
                    search={false}
                    pagination={{
                        pageSize: 10,
                    }}
                    toolBarRender={() => [
                        <Button key="upload-scores" type="primary" onClick={handleFileUpload} disabled={status !== '已完成'}>
                            上传成绩
                        </Button>,
                    ]}
                />
            </Card>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <Modal
                title="确认上传"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <p>确定要上传此文件吗？</p>
            </Modal>
            <Modal
                title="确认分析吗"
                visible={isGameAnalysicVisible}
                onOk={gameAnalysic}
                onCancel={CancelAnalysic}
                confirmLoading={isAnalyzing}
            >
                <p>确认进行比赛分析吗？</p>
            </Modal>
            <Drawer title="比赛分析结果" size='large' onClose={() => setAnalysicDrawerVisit(false)} open={analysicdrawerVisit}>
                <ReactMarkdown>{analysicData}</ReactMarkdown>
            </Drawer>
        </div>
    );
};

export default GameDetail;