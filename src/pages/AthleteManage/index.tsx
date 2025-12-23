import { Space, Table, Tag, Modal, Form, Input, Button, message, Select } from 'antd';
import { ProTable, ActionType } from '@ant-design/pro-components';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

// 定义运动员数据的接口
interface Athlete {
    id: number;
    name: string;
    gender: string;
    age: number;
    address: string;
    telephone: string;
    email: string;
    coach: string;
    specialty: string;
    status: string;
    healthData: string;
}

const Athletes = () => {
    const coachname = localStorage.getItem('coachname');
    const coachspecialty = localStorage.getItem('coachspecialty');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const actionRef = useRef<ActionType | null>(null); // 修复后的代码
    const handleDelete = (telephone: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该运动员吗？',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                // 删除操作后，更新数据源并通过请求将更改同步到后端
                axios.delete(`/api/deleteAthletes?telephone=${telephone}`)
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
            const response = await axios.post('/api/addAthletes', values);
            if (response.data.success) {
                message.success('运动员添加成功');
                setIsModalVisible(false);
                form.resetFields();
                // 重新加载数据
                if (actionRef.current) {
                    actionRef.current.reload();
                }
            } else {
                message.error('运动员添加失败');
            }
        } catch (error) {
            console.error('Error adding athlete:', error);
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
            title: '状态',
            dataIndex: 'status',
            key: 'status',
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
                <a onClick={() => handleDelete(record.telephone)}>删除</a>
            ),
        },
    ];

    return (
        <>
            <ProTable<Athlete>
                columns={columns}
                request={async (params = {}) => {
                    try {
                        const response = await axios.get('/api/athletes', {
                            params: {
                                ...params,
                                coachname,
                                coachspecialty
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
                                coach: athlete.coach,
                                specialty: athlete.specialty,
                                status: athlete.status,
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
            <Modal
                title="添加运动员"
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
                        <Select>
                            {coachspecialty && <Select.Option value={coachspecialty}>{coachspecialty}</Select.Option>}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="coach"
                        label="教练"
                        rules={[{ required: true, message: '请输入教练' }]}
                    >
                        <Select>
                            {coachname && <Select.Option value={coachname}>{coachname}</Select.Option>}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="状态"
                        rules={[{ required: true, message: '请选择状态' }]}
                    >
                        <Select>
                            <Select.Option value="在役">在役</Select.Option>
                            <Select.Option value="退役">退役</Select.Option>
                        </Select>
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
        </>
    );
};

export default Athletes;