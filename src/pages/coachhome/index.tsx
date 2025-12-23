
// src/pages/athletehome/index.tsx
import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Modal, Row, Col, Select, Card } from 'antd';
import axios from 'axios';
import ProTable from '@ant-design/pro-table';
import './index.css'; // 引入自定义 CSS 文件

const getUserToken = () => {
    return localStorage.getItem('token');
};

const getUsername = () => {
    return localStorage.getItem('username');
};

const Athletehome = () => {
    const [athleteList, setAthleteList] = useState<Record<string, any>[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        age: null,
        address: '',
        telephone: '',
        email: '',
        specialty: '',
        healthData: '',
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [useUpdateApi, setUseUpdateApi] = useState(false); // 新增状态变量

    useEffect(() => {
        fetchAthleteData();
    }, []);

    const fetchAthleteData = () => {
        const token = getUserToken();
        const username = getUsername();
        axios.get('/api/coachinfo/me', {
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
                    const coachname = data.data.name;
                    const coachspecialty = data.data.specialty;
                    localStorage.setItem('coachname', coachname);
                    localStorage.setItem('coachspecialty', coachspecialty);
                    setAthleteList([data.data]); // 确保将数据存储在数组中
                    setFormData(data.data);
                    setUseUpdateApi(true); // 设置为使用 /api/coachsUpdate 接口
                } else {
                    setIsModalVisible(true);
                    setUseUpdateApi(false); // 设置为不使用 /api/coachsUpdate 接口
                }
            })
            .catch(error => {
                console.error('Error fetching athlete data:', error);
                message.error('请您编辑主页信息.');
                setUseUpdateApi(false); // 设置为不使用 /api/coachsUpdate 接口
            });
    };

    const handleSave = (values) => {
        const token = getUserToken();
        const username = getUsername();
        const dataToSend = {
            ...values,
            username: username, // 将 username 添加到表单数据中
        };

        const apiUrl = useUpdateApi ? '/api/coachsUpdate' : '/api/acoachsinfo'; // 根据状态变量决定使用哪个接口

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
        /* {
            title: '教练',
            dataIndex: 'coach',
            key: 'coach',
        }, */
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
        /*   {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
          }, */
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

    return (
        <div className="container">
            <Card title="教练个人信息">
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
                            <Form.Item label="体检数据" name="healthData" rules={[{ required: true, message: '请选择体检数据' }]}>
                                <Select>
                                    <Select.Option value="优秀">优秀</Select.Option>
                                    <Select.Option value="良好">良好</Select.Option>
                                    <Select.Option value="不合格">不合格</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="运动专项" name="specialty" rules={[{ required: true, message: '请输入运动专项!' }]}>
                                <Input />
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
        </div>
    );
};

export default Athletehome;