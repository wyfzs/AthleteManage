import { Space, Table, Tag, Modal, Form, Input, Button, message, Select, Card } from 'antd';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import axios from 'axios';
import { ReactNode, useEffect, useRef, useState } from 'react';

// 定义教练数据的接口
interface Athlete {
    id: string;
    name: string;
    gender: string;
    age: number;
    address: string;
    telephone: string;
    email: string;
    specialty: string;
    healthData: string;
}
// 定义比赛数据的接口
interface Competition {
    id: string;
    name: string;
    date: string;
    location: string;
    type: string;
    status: string;
}

const Athletes = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCompetitionModalVisible, setIsCompetitionModalVisible] = useState(false);
    const [competitionForm] = Form.useForm();
    const [form] = Form.useForm();
    const actionRef = useRef<ActionType | null>(null);
    const actionGameRef = useRef<ActionType | null>(null);
    const [isedit, setIsEdit] = useState<Competition | null>(null);

    console.log('isCompetitionModalVisible:', isCompetitionModalVisible);

    const handleDeleteCoach = (telephone: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该教练吗？',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                // 删除操作后，更新数据源并通过请求将更改同步到后端
                axios.delete(`/api/deleteCoaches?telephone=${telephone}`)
                    .then(response => {
                        if (response.data.success) {
                            message.success('删除成功');
                            // 重新加载数据
                            if (actionRef.current) {
                                actionRef.current.reload();
                            }
                        } else {
                            message.error(response.data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting data:', error);
                        message.error('删除失败');
                    });
            },
            onCancel() {
                console.log('取消删除');
            },
        });
    };
    const handleDeleteGame = (id: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该比赛吗？',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                // 删除操作后，更新数据源并通过请求将更改同步到后端
                axios.delete(`/api/competitionsDelete?id=${id}`)
                    .then(response => {
                        if (response.data.success) {
                            message.success('删除成功');
                            // 重新加载数据
                            if (actionGameRef.current) {
                                actionGameRef.current.reload();
                            }
                        } else {
                            message.error(response.data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting data:', error);
                        message.error('删除失败');
                    });
            },
            onCancel() {
                console.log('取消删除');
            },
        });
    };

    const handleAdd = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const response = await axios.post('/api/addCoaches', values);
            if (response.data.success) {
                message.success('教练添加成功');
                setIsModalVisible(false);
                form.resetFields();
                // 重新加载数据
                if (actionRef.current) {
                    actionRef.current.reload();
                }
            } else {
                message.error('教练添加失败');
            }
        } catch (error) {
            console.error('Error adding coach:', error);
            message.error('添加失败');
        }
    };

    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <a>{text}</a>,
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
            title: '运动专项',
            dataIndex: 'specialty',
            key: 'specialty',
        },
        {
            title: '体检数据',
            key: 'healthData',
            dataIndex: 'healthData',
            render: (healthData) => (
                <Tag color={healthData.length > 5 ? 'geekblue' : 'green'}>
                    {healthData.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: '操作',
            key: 'action',
            search: false,
            render: (text, record) => (
                <a onClick={() => {
                    handleDeleteCoach(record.telephone); console.log(record);
                }}>删除</a>
            ),
        },
    ];
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
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
                    <a onClick={() => modifycompetitions(record)}>编辑</a>
                    <a onClick={() => handleDeleteGame(record.id)}>删除</a>
                    {/* <a onClick={() => console.log('ssssss')}>详情</a> */}
                </Space>
            ),
        },
    ];
    const modifycompetitions = (record) => {
        setIsCompetitionModalVisible(true);
        const { id, date, location, type, name, status } = record;
        const Record = {
            id,
            date: formatDate(date),
            location,
            type,
            name,
            status
        }
        console.log(Record, '///////');
        setIsEdit(Record);
        competitionForm.setFieldsValue(Record);
    }
    const handleAddGame = () => {
        console.log('handleAddGame called');
        setIsCompetitionModalVisible(true);
    };

    const handleCompetitionOk = async () => {
        const id = isedit?.id;
        try {
            if (id) {
                // 如果有 id，则调用编辑接口
                await handleEditCompetitionOk(id);
            } else {
                // 否则调用添加接口
                await handleAddCompetitionOk();
            }
        } catch (error) {
            console.error('Error handling competition:', error);
            message.error('操作失败');
        }
    };

    const handleAddCompetitionOk = async () => {
        try {
            const values = await competitionForm.validateFields();
            const response = await axios.post('/api/competitionsAdd', values);
            if (response.data.success) {
                message.success('比赛添加成功');
                setIsCompetitionModalVisible(false);
                competitionForm.resetFields();
                // 重新加载数据
                if (actionGameRef.current) {
                    actionGameRef.current.reload();
                }
            } else {
                message.error('比赛添加失败');
            }
        } catch (error) {
            console.error('Error adding competition:', error);
            message.error('添加失败');
        }
    };

    const handleEditCompetitionOk = async (id) => {
        try {
            const values = await competitionForm.validateFields();
            console.log(values, '!!!!!1');

            const response = await axios.put('/api/competitionsModify', { ...values, id });
            if (response.data.success) {
                message.success('比赛修改成功');
                setIsCompetitionModalVisible(false);
                competitionForm.resetFields();
                // 重新加载数据
                if (actionGameRef.current) {
                    actionGameRef.current.reload();
                }
            } else {
                message.error('比赛修改失败');
            }
        } catch (error) {
            console.error('Error modifying competition:', error);
            message.error('修改失败');
        }
    };

    const handleCompetitionCancel = () => {
        setIsCompetitionModalVisible(false);
        competitionForm.resetFields();
    };

    return (
        <>
            <Card title="教练管理">
                <ProTable<Athlete>
                    columns={columns}
                    request={async (params = {}) => {
                        try {
                            const response = await axios.get('/api/coaches', {
                                params: {
                                    ...params,
                                },
                            });
                            if (response.data.success) {
                                // 调整数据结构并映射字段
                                const data = response.data.data.map((athlete: any) => ({
                                    id: parseInt(athlete.id, 10), // 将 id 字符串转换为数字
                                    name: athlete.name,
                                    gender: athlete.gender,
                                    age: athlete.age,
                                    address: athlete.address,
                                    telephone: athlete.telephone,
                                    email: athlete.email,
                                    specialty: athlete.specialty,
                                    healthData: athlete.healthData, // 假设 healthData 是一个标签
                                }));
                                return {
                                    data: data,
                                    success: true,
                                    total: response.data.total,
                                };
                            } else {
                                console.error('Failed to fetch athletes:', response.data.message);
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
                    toolBarRender={() => [
                        <Button type="primary" key="add" onClick={handleAdd}>
                            添加
                        </Button>,
                    ]}
                    actionRef={actionRef} // 添加 actionRef  
                />
            </Card>
            <Card title="比赛管理">
                <ProTable
                    columns={competitionColumns}
                    request={async (params = {}) => {
                        try {
                            const response = await axios.get('/api/competitionsQuery', {
                                params: {
                                    ...params,
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
                    toolBarRender={() => [
                        <Button type="primary" key="add" onClick={handleAddGame}>
                            添加
                        </Button>,
                    ]}
                    actionRef={actionGameRef} // 添加 actionGameRef
                />
            </Card>
            <Modal
                title="添加教练"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="姓名"
                        rules={[{ required: true, message: '请输入姓名' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="gender"
                        label="性别"
                        rules={[{ required: true, message: '请选择性别' }]}
                    >
                        <Select>
                            <Select.Option value="男">男</Select.Option>
                            <Select.Option value="女">女</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="age"
                        label="年龄"
                        rules={[{ required: true, message: '请输入年龄' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="地址"
                        rules={[{ required: true, message: '请输入地址' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="telephone"
                        label="联系方式"
                        rules={[{ required: true, message: '请输入联系方式' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="邮件"
                        rules={[{ required: true, message: '请输入邮件' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="specialty"
                        label="运动专项"
                        rules={[{ required: true, message: '请输入运动专项' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="healthData"
                        label="体检数据"
                        rules={[{ required: true, message: '请选择体检数据' }]}
                    >
                        <Select>
                            <Select.Option value="优秀">优秀</Select.Option>
                            <Select.Option value="良好">良好</Select.Option>
                            <Select.Option value="不合格">不合格</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="添加比赛"
                visible={isCompetitionModalVisible}
                onOk={handleCompetitionOk}
                onCancel={handleCompetitionCancel}
            >
                <Form form={competitionForm} layout="vertical">
                    <Form.Item
                        name="type"
                        label="比赛类别"
                        rules={[{ required: true, message: '请输入比赛类别' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="比赛名称"
                        rules={[{ required: true, message: '请输入比赛名称' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="date"
                        label="比赛日期"
                        rules={[{ required: true, message: '请输入比赛日期' }]}
                    >
                        <Input type='date' />
                    </Form.Item>
                    <Form.Item
                        name="location"
                        label="比赛地点"
                        rules={[{ required: true, message: '请输入比赛地点' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="状态"
                        rules={[{ required: true, message: '请选择状态' }]}
                    >
                        <Select>
                            <Select.Option value="进行中">进行中</Select.Option>
                            <Select.Option value="已完成">已完成</Select.Option>
                            <Select.Option value="未开始">未开始</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Athletes;
