// src/pages/athletehome/index.tsx
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Form, Input, Button, message, Modal, Row, Col, Select, Table, Card, FormInstance, Space, Drawer } from 'antd';
import axios from 'axios';
import ProTable, { ActionType } from '@ant-design/pro-table';
import './index.css'; // 引入自定义 CSS 文件
import { SortOrder } from 'antd/es/table/interface';
import { DrawerForm, ProForm, ProFormText } from '@ant-design/pro-components';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


const getUserToken = () => {
    return localStorage.getItem('token');
};

const getUsername = () => {
    return localStorage.getItem('username');
};

// 定义教练数据的接口
interface Coach {
    id: number;
    name: string;
}
const gridStyle: React.CSSProperties = {
    width: '25%',
    textAlign: 'center',
};
const Athletehome = () => {
    // 添加一个新的状态变量来存储训练计划数据
    const [trainData, setTrainData] = useState([]);
    const [athleteList, setAthleteList] = useState<Record<string, any>[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        age: null,
        address: '',
        telephone: '',
        email: '',
        coach: '',
        specialty: '',
        healthData: '',
        status: ''
    });
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [useUpdateApi, setUseUpdateApi] = useState(false); // 新增状态变量

    // 添加一个新的状态变量来存储 trainquerycopy 数据
    const [trainDataCopy, setTrainDataCopy] = useState<Record<string, any>[]>([]);
    //查询训练详情信息
    const [trainDetail, setTrainDetail] = useState<Record<string, any>>({});


    // 新增状态变量用于训练信息 Modal
    const [isTrainInfoModalVisible, setIsTrainInfoModalVisible] = useState(false);
    const [trainInfoFormData, setTrainInfoFormData] = useState({
        duration: '',
        completionTime: '',
        description: '',
    });
    const [selectedTrainRecord, setSelectedTrainRecord] = useState<Record<string, any>>({});

    const [gameidInfo, setGameidInfo] = useState([])

    const [trainInfoForm] = Form.useForm(); // 创建 form 实例

    const [drawerVisit, setDrawerVisit] = useState(false);
    const [gameDetailData, setGameDetailData] = useState<string[]>([]);
    const [ispartin, setIspartin] = useState(false)
    const athletename = localStorage.getItem('athletename')
    const [analysicdrawerVisit, setAnalysicDrawerVisit] = useState(false);
    const [analysicData, setAnalysicData] = useState();


    // 生成 PDF 函数
    const generatePDF = () => {
        if (!analysicData) {
            message.warning('暂无数据可供导出');
            return;
        }

        // 创建一个临时 div 来渲染纯文本或 HTML 内容
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.padding = '20px';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.width = '800px';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.fontSize = '14px';
        tempDiv.style.lineHeight = '1.6';

        // 直接插入原始文本或 HTML 格式的内容
        tempDiv.innerHTML = `<pre>${analysicData}</pre>`;

        document.body.appendChild(tempDiv);

        // 使用 html2canvas 截图并生成 PDF
        html2canvas(tempDiv).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('比赛分析报告.pdf');

            // 移除临时 div
            document.body.removeChild(tempDiv);
        });
    };
    const fetchAthleteData = () => {
        const token = getUserToken();
        const username = getUsername();
        axios.get('/api/athletesinfo/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                username: username, // 将 username 添加到请求参数中
            },
        })
            .then(response => {
                const data = response.data;
                if (data.success && data.data) {
                    setAthleteList([data.data]); // 确保将数据存储在数组中
                    const athletename = data.data.name;
                    const coachname = data.data.coach;
                    const coachspecialty = data.data.specialty;
                    localStorage.setItem('athletename', athletename);
                    localStorage.setItem('coachname', coachname);
                    localStorage.setItem('coachspecialty', coachspecialty);

                    setFormData(data.data);
                    setUseUpdateApi(true); // 设置为使用 /api/athletesUpdate 接口
                    fetchTrainDataCopy();
                    // 调用 fetchTrainData 在这里
                    fetchTrainData();
                } else {
                    setIsModalVisible(true);
                    setUseUpdateApi(false); // 设置为不使用 /api/athletesUpdate 接口
                }
            })
            .catch(error => {
                console.error('Error fetching athlete data:', error);
                message.error('请您编辑主页信息.');
                setUseUpdateApi(false); // 设置为不使用 /api/athletesUpdate 接口
            });
    };
    const fetchgameData = () => {
        const name = formData.name || '';
        const email = formData.email || '';
        const telephone = formData.telephone || '';
        axios.get('/api/getregistrationInfoByAthlete', {
            params: {
                name: name,
                email: email,
                telephone: telephone,
            },
        })
            .then(response => {
                const data = response.data;
                if (data.success) {
                    // 处理返回的数据
                    setGameidInfo(data.data);
                    console.log('gameidInfo:????????????????????????????????/', gameidInfo);

                    console.log('Registration Info:', data.data);
                } else {
                    console.error('Failed to fetch registration info:', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching registration info:', error);
            });

    };
    const handleSave = (values) => {
        const token = getUserToken();
        const username = getUsername();
        const dataToSend = {
            ...values,
            username: username, // 将 username 添加到表单数据中
        };

        const apiUrl = useUpdateApi ? '/api/athletesUpdate' : '/api/athletesinfo'; // 根据状态变量决定使用哪个接口

        axios.put(apiUrl, dataToSend, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(response => {
                const data = response.data;
                setAthleteList([data]);
                setIsModalVisible(false);
                message.success('Profile updated successfully!');
                fetchAthleteData(); // 重新获取数据
            })
            .catch(error => {
                console.error('Error updating athlete data:', error);
                message.error('Failed to update profile.');
            });
    };

    const handleAdd = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: '年龄',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: '地址',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: '联系方式',
            dataIndex: 'telephone',
            key: 'telephone',
        },
        {
            title: '邮件',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: '教练',
            dataIndex: 'coach',
            key: 'coach',
        },
        {
            title: '运动专项',
            dataIndex: 'specialty',
            key: 'specialty',
        },
        {
            title: '体检数据',
            dataIndex: 'healthData',
            key: 'healthData',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <Button type="link" onClick={handleAdd}>
                    修改
                </Button>
            ),
        },
    ];

    const onSpecialtyChange = (specialty: string) => {
        if (specialty) {
            axios.get('/api/coachData', {
                params: {
                    specialty: specialty,
                },
            })
                .then(response => {
                    if (response.data.success) {
                        // 将返回的教练名称数组转换为 Coach 对象数组
                        const coachNames = response.data.data;
                        const coachObjects = coachNames.map((name: string, index: number) => ({
                            id: index, // 使用索引作为临时 id
                            name: name,
                        }));
                        setCoaches(coachObjects);
                    } else {
                        console.error('Failed to fetch coaches:', response.data.message);
                        setCoaches([]);
                    }
                })
                .catch(error => {
                    console.error('Error fetching coaches:', error);
                    setCoaches([]);
                });
        } else {
            setCoaches([]);
        }
    };
    // 创建一个新的函数来调用 trainquerycopy 接口
    const fetchTrainDataCopy = () => {
        const token = getUserToken();
        const coachname = localStorage.getItem('coachname') || '';
        const coachspecialty = localStorage.getItem('coachspecialty') || '';
        const athletename = localStorage.getItem('athletename') || '';
        axios.get('/api/trainquerycopy', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                coach: coachname,
                specialty: coachspecialty,
                athletename: athletename,
            },
        })
            .then(response => {
                const data = response.data;
                if (data.success && data.data) {
                    setTrainDataCopy(data.data);
                } else {
                    console.error('Failed to fetch train data copy:', data.message);
                    setTrainDataCopy([]);
                }
            })
            .catch(error => {
                console.error('Error fetching train data copy:', error);
                setTrainDataCopy([]);
            });
    };
    const fetchTrainData = () => {
        const token = getUserToken();
        const coachname = localStorage.getItem('coachname') || '';
        const coachspecialty = localStorage.getItem('coachspecialty') || '';
        axios.get('/api/trainquery', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                coach: coachname,
                specialty: coachspecialty,
            },
        })
            .then(response => {
                const data = response.data;
                if (data.success && data.data) {
                    setTrainData(data.data);
                } else {
                    console.error('Failed to fetch train data:', data.message);
                    setTrainData([]);
                }
            })
            .catch(error => {
                console.error('Error fetching train data:', error);
                setTrainData([]);
            });
    };

    // 在组件挂载时调用 fetchTrainData 函数
    useEffect(() => {
        fetchAthleteData();
        /*  fetchTrainDataCopy(); */
        /* fetchTrainData(); // 添加这一行 */
    }, []);
    useEffect(() => {
        fetchgameData();
    }, [formData]);
    const trainDataColumns = [
        {
            title: '训练计划名称',
            dataIndex: 'trainName',
            key: 'TrainName',
        },
        {
            title: '训练内容',
            dataIndex: 'trainContent',
            key: 'TrainContent',
        },
        {
            title: '日期',
            dataIndex: 'date',
            render: (date: string) => formatDate(date),
            sorter: (a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateA - dateB;
            },
            defaultSortOrder: 'descend' as SortOrder,
        },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <>
                    <Button type="link" onClick={() => handleOpenTrainInfoModal(record)} disabled={checkfilter(record) || record.trainType !== '自主录入'}>
                        记录训练信息
                    </Button>
                    <Button type="link" onClick={() => deleteTrainDetail(record)}>
                        删除
                    </Button>
                    <Button type="link" onClick={() => queryTrainDetail(record)}>
                        详情
                    </Button>
                </>
            ),
        },
    ];
    const deleteTrainDetail = (record) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这条训练记录吗？',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                const token = getUserToken();
                const athletename = localStorage.getItem('athletename') || '';
                axios.delete('/api/trainDetailDelete', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    params: {
                        id: record.id,
                        athletename: athletename,
                    },
                })
                    .then(response => {
                        const data = response.data;
                        if (data.success) {
                            message.success('训练记录删除成功!');
                            fetchTrainData(); // 重新获取训练数据
                            fetchTrainDataCopy();
                        } else {
                            message.error('训练记录删除失败，请重试.');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting train detail:', error);
                        message.error('训练记录删除失败，请重试.');
                    });
            },
            onCancel() {
                console.log('取消删除');
            },
        });
    };
    const queryTrainDetail = (record) => {
        const token = getUserToken();
        const athletename = localStorage.getItem('athletename') || '';
        axios.get('/api/athletequerydetail', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                id: record.id,
                athletename: athletename,
            },
        })
            .then(response => {
                const data = response.data;
                if (data.success && data.data) {
                    setTrainDetail(data.data);
                } else {
                    console.error('Failed to fetch train detail:', data.message);
                    message.error('暂无该训练数据');
                }
            })
            .catch(error => {
                console.error('Error fetching train detail:', error);
                message.error('暂无该训练数据');
            });
    };

    const checkfilter = (record) => {
        console.log(record, 'OOOOOOOOOOOOOOOOPPPPPPPPPPPPPPPPP');
        const id = record.id;
        const asd = trainDataCopy.find(item => item.id === id);
        if (asd?.duration === '' || asd?.duration === undefined) {
            return false;
        } else {
            return true;
        }

    }

    // 创建一个函数来格式化日期
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleOpenTrainInfoModal = (record: Record<string, any>) => {
        setSelectedTrainRecord(record);
        setIsTrainInfoModalVisible(true);
        setTrainInfoFormData({
            duration: '',
            completionTime: '',
            description: '',
        });

    };
    const handleCloseTrainInfoModal = () => {
        setIsTrainInfoModalVisible(false);
        setTrainInfoFormData({
            duration: '',
            completionTime: '',
            description: '',
        });
        trainInfoForm.resetFields(); // 重置表单字段
    };
    //将训练信息下发给后端
    const handleSaveTrainInfo = () => {
        trainInfoForm.validateFields().then(values => {
            console.log('trainInfoFormData:', values); // 添加调试信息
            const token = getUserToken();
            const athletename = localStorage.getItem('athletename') || '';

            // 格式化 completionTime 为 ISO 8601 格式
            const completionTime = new Date(values.completionTime).toISOString();

            const dataToSend = {
                ...values,
                athletename: athletename,
                // 添加训练计划数据到下发参数中
                coach: selectedTrainRecord.coach,
                date: selectedTrainRecord.date,
                id: selectedTrainRecord.id,
                specialty: selectedTrainRecord.specialty,
                trainContent: selectedTrainRecord.trainContent,
                trainName: selectedTrainRecord.trainName,
                completionTime: completionTime, // 使用格式化后的时间
            };
            axios.post('/api/athletestoragetraininfo', dataToSend, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then(response => {
                    const data = response.data;
                    if (data.success) {
                        message.success('训练信息保存成功!');
                        handleCloseTrainInfoModal();
                        fetchTrainData(); // 重新获取训练数据
                        fetchTrainDataCopy();
                    } else {
                        message.error('训练信息保存失败，请重试.');
                    }
                })
                .catch(error => {
                    console.error('Error saving train info:', error);
                    message.error('训练信息保存失败，请重试.');
                });
        }).catch(errorInfo => {
            console.error('Validate Failed:', errorInfo);
        });
    };
    const actionGameRef = useRef<ActionType | null>(null);
    const specialtype = localStorage.getItem('coachspecialty');
    const checkGamefilter = (id) => {
        const aer = gameidInfo.some(game => game === id);
        return aer;
    }
    // 比赛管理列表的列配置
    const competitionColumns = [
        {
            title: '比赛类别',
            dataIndex: 'type', // 修改为 'type'
            key: 'type',
        },
        {
            title: '比赛名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '比赛日期',
            dataIndex: 'date',
            key: 'date',
            render(record: any) {
                return formatDate(record);
            }
        },
        {
            title: '比赛地点',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: '操作',
            key: 'action',
            search: false,
            render: (record) => (

                <Space size="middle">
                    <Button type="link" onClick={() => registration(record)} disabled={checkGamefilter(record.id) || record.status === '已完成' || record.status === '进行中'}>
                        报名
                    </Button>
                    <Button type="link" onClick={() => cancleregistration(record)} disabled={!checkGamefilter(record.id) || record.status === '已完成' || record.status === '进行中'}>
                        取消报名
                    </Button>
                    {record.isScore === 'yes' && (
                        <>
                            <Button type="link" onClick={() => gameDetail(record)}   >
                                比赛详情
                            </Button>
                            <Button type="link" onClick={() => { queryGameAnalysic(record) }}>
                                查看分析结果
                            </Button>
                        </>

                    )}
                </Space>
            ),
        },
    ];
    const queryGameAnalysic = (record) => {
        setAnalysicDrawerVisit(true)
        const id = record.id;
        axios.get('/api/queryGameAnalysic', {
            params: {
                id,
                name: athletename
            }
        }).then(res => {
            console.log(res.data.gameAnalysic, '[[[[[[[[[[[[[[');
            setAnalysicData(res.data.gameAnalysic)
        }).catch(err => {
            console.log(err);
        })

    }
    const gameDetail = (record) => {
        setDrawerVisit(true)
        const id = record.id;
        const athletename = localStorage.getItem('athletename');
        const token = getUserToken();

        // setGameDetailData
        try {
            axios.get('/api/athleteQueryScore', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    id: id,
                    name: athletename
                },
            }).then(response => {
                const data = response.data;
                if (data.success) {
                    const dataArray = data.data.split("，") || [];
                    console.log(dataArray, '分割后的数组');

                    // 设置到状态中（类型为 string[] ）
                    setGameDetailData(dataArray);
                } else {
                    message.error('暂无该比赛数据');
                    setGameDetailData(['暂无数据'])
                };

            });
        } catch (error) {
            console.log(error);

        }
    };
    const cancleregistration = (record: Record<string, any>) => {
        const { name, telephone, email, coach } = athleteList[0];
        Modal.confirm({
            title: '确认取消报名',
            content: '确定要取消这场比赛的报名吗？',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                const token = getUserToken();
                const id = record.id || '';

                const dataToSend = {
                    id,
                    name,
                    telephone,
                    email,
                    coach
                };

                axios.delete('/api/cancleregistrationGame', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    data: dataToSend, // 将数据放入请求体中
                })
                    .then(response => {
                        const data = response.data;
                        if (data.success) {
                            message.success('取消报名成功!');
                            fetchgameData();
                        } else {
                            message.error('取消报名失败，请重试.');
                        }
                    })
                    .catch(error => {
                        console.error('Error canceling registration for the game:', error);
                        message.error('取消报名失败，请重试.');
                    });
            },
            onCancel() {
                console.log('取消取消报名');
            },
        });
    };
    const registration = (record: Record<string, any>) => {
        console.log(record, ']]]]]]]]]]]]]');

        const id = record.id || '';
        const date = record.date || '';
        const gameName = record.name || '';
        const { name, age, gender, address, telephone, email, coach } = athleteList[0];
        Modal.confirm({
            title: '确认报名',
            content: '确定要报名这场比赛吗？',
            okText: '确定',
            okType: 'primary',
            cancelText: '取消',
            onOk() {
                const token = getUserToken();
                const dataToSend = {
                    id,
                    date,
                    name,
                    gameName,
                    age,
                    gender,
                    address,
                    telephone,
                    email,
                    coach
                };

                axios.post('/api/registrationGame', dataToSend, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                })
                    .then(response => {
                        const data = response.data;
                        if (data.success) {
                            message.success('报名成功!');
                            fetchgameData();
                        } else {
                            message.error('报名失败，请重试.');
                        }
                    })
                    .catch(error => {
                        console.error('Error registering for the game:', error);
                        message.error('报名失败，请重试.');
                    });
            },
            onCancel() {
                console.log('取消报名');
            },
        });
    };
    return (
        <div className="container">
            <Card title="运动员个人信息" style={{ marginTop: 20 }}>
                <ProTable
                    columns={columns}
                    dataSource={athleteList}
                    rowKey="name"
                    search={false}
                    rowClassName={(record, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
                    options={{ setting: false, reload: false }}
                    pagination={false}
                    toolBarRender={() => [
                        <Button key="add" type="primary" onClick={handleAdd}>
                            编辑
                        </Button>,
                    ]}
                />
            </Card>
            <Modal
                title="填写个人信息"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    layout="vertical"
                    initialValues={formData}
                    onFinish={handleSave}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="性别" name="gender" rules={[{ required: true, message: '请选择性别!' }]}>
                                <Select>
                                    <Select.Option value="男">男</Select.Option>
                                    <Select.Option value="女">女</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="年龄"
                                name="age"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (!value) {
                                                return Promise.reject('请输入年龄!');
                                            }
                                            const age = Number(value); // 将值转换为数字
                                            if (!Number.isInteger(age)) {
                                                return Promise.reject('年龄必须是一个整数!');
                                            }
                                            if (age < 14 || age > 60) {
                                                return Promise.reject('年龄必须在14到60之间!');
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="地址" name="address" rules={[{ required: true, message: '请输入地址!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="联系方式" name="telephone" rules={[
                                { required: true, message: '请输入联系方式!' },
                                { pattern: /^1[3-9]\d{9}$/, message: '联系方式必须是有效的电话!' }
                            ]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="邮件" name="email" rules={[
                                { required: true, message: '请输入邮件!' },
                                { type: 'email', message: '邮件必须是有效的邮件地址!' }
                            ]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="specialty"
                                label="运动专项"
                                rules={[{ required: true, message: '请输入运动专项' }]}
                            >
                                <Input onChange={(e) => onSpecialtyChange(e.target.value)} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="coach"
                                label="教练"
                                rules={[{ required: true, message: '请选择教练' }]}
                            >
                                <Select>
                                    {coaches.map(coach => (
                                        <Select.Option key={coach.id} value={coach.name}>
                                            {coach.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="体检数据" name="healthData" rules={[{ required: true, message: '请选择体检数据' }]}>
                                <Select>
                                    <Select.Option value="优秀">优秀</Select.Option>
                                    <Select.Option value="良好">良好</Select.Option>
                                    <Select.Option value="不合格">不合格</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态!' }]}>
                                <Select>
                                    <Select.Option value="在役">在役</Select.Option>
                                    <Select.Option value="退役">退役</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Card title="训练计划" style={{ marginTop: 20 }}>
                <Table dataSource={trainData} columns={trainDataColumns} rowKey="id" />
            </Card>
            <Card title="比赛管理">
                <ProTable
                    columns={competitionColumns}
                    request={async (params = {}) => {
                        try {
                            if (params.date) {
                                const date = new Date(params.date);
                                params.date = date.toISOString();
                            }
                            const response = await axios.get('/api/competitionsQueryByType', {
                                params: {
                                    ...params,
                                    specialtype
                                },
                            });
                            if (response.data.success) {
                                // 调整数据结构并映射字段
                                const data = response.data.data.map((competition: any) => ({
                                    id: competition.id, // 不需要转换为数字
                                    name: competition.name,
                                    date: competition.date,
                                    location: competition.location,
                                    status: competition.status,
                                    type: competition.type, // 添加 type 字段
                                    isScore: competition.isScore,
                                }));
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
                    search={{
                        labelWidth: 'auto',
                        defaultCollapsed: true, // 默认折叠搜索栏
                    }}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                    }}
                    /*  toolBarRender={() => [
                         <Button type="primary" key="add" onClick={handleAddGame}>
                             添加
                         </Button>,
                     ]} */
                    actionRef={actionGameRef} // 添加 actionGameRef
                />
            </Card>
            {/* 新增的 Modal 组件 */}
            <Modal
                title="记录训练信息"
                visible={isTrainInfoModalVisible}
                onCancel={handleCloseTrainInfoModal}
                footer={[
                    <Button key="back" onClick={handleCloseTrainInfoModal}>
                        取消
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSaveTrainInfo} >
                        确定
                    </Button>,
                ]}
            >
                <Form
                    form={trainInfoForm}
                    layout="vertical"
                    initialValues={trainInfoFormData}
                    onFinish={handleSaveTrainInfo}
                >
                    <Form.Item label="所用时长" name="duration" rules={[{ required: true, message: '请输入所用时长!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="完成时间" name="completionTime" rules={[{ required: true, message: '请输入完成时间!' }]}>
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Form.Item label="描述" name="description" rules={[{ required: true, message: '请输入描述!' }]}>
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="训练详情"
                visible={!!trainDetail.id}
                onCancel={() => setTrainDetail({})}
                footer={null}
            >
                <div>
                    <p><strong>所用时长:</strong> {trainDetail.duration}</p>
                    <p><strong>完成时间:</strong> {formatDate(trainDetail.completionTime)}</p>
                    <p><strong>描述:</strong> {trainDetail.description}</p>
                    <p><strong>教练打分:</strong> {trainDetail.score}</p>
                </div>
            </Modal>
            <Drawer title="比赛详情" size='large' onClose={() => setDrawerVisit(false)} open={drawerVisit}>
                <Card title="比赛表现">
                    {gameDetailData.length !== 0 ? gameDetailData.map((item, index) => (
                        <Card.Grid style={gridStyle} key={index}>
                            {item}
                        </Card.Grid>
                    )) : <div>暂无数据</div>}
                </Card>
            </Drawer>
            <Drawer title="比赛分析结果" size='large' onClose={() => setAnalysicDrawerVisit(false)} open={analysicdrawerVisit}>
                {analysicData ? <ReactMarkdown>{analysicData}</ReactMarkdown> : <div>暂无数据</div>}
                <Button
                    type="primary"
                    style={{ marginTop: 16 }}
                    onClick={generatePDF}
                >
                    生成比赛分析报告
                </Button>
            </Drawer>
        </div>

    );
    // 在比赛分析结果中需要有一个按钮 ，按钮名称叫生成比赛分析报告，点击按钮后由前端生成pdf,数据来源为analysicData，pdf需要美观一点
};

export default Athletehome;