import { Card, Select, Form, Button, Input, Spin, message } from 'antd'; // 引入 Spin 和 message 组件
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 引入 axios
import './SpecialTrain.css'; // 引入自定义样式文件

const { Option } = Select;

const SpecialTrain = () => {
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [trainingPlan, setTrainingPlan] = useState<string | null>(null);
    const [athName, setAthName] = useState("");

    const coach = localStorage.getItem('coachname');
    const specialty = localStorage.getItem('coachspecialty');

    const handleChange = (value: string) => {
        form.setFieldsValue({ athlete: value });
    };

    const fetchAthleteByCoach = async () => {
        try {
            const response = await axios.get('/api/athleteByCoach', {
                params: {
                    coach,
                    specialty,
                },
            });
            const data = response.data;
            if (data.success) {
                const formattedOptions = data.data.map((item: string, index: number) => ({
                    value: index.toString(), // 使用索引作为 value
                    label: item,
                }));
                setOptions(formattedOptions);
            } else {
                console.error('Failed to fetch athlete data:', data);
            }
        } catch (error) {
            console.error('Failed to fetch athlete data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAthleteByCoach();
    }, []);

    const onFinish = async (values: any) => {
        setLoading(true); // 在提交表单时显示加载指示器
        try {
            // 根据 values.athlete 查找对应的 option.label
            const selectedAthleteLabel = options.find(option => option.value === values.athlete)?.label;
            if (!selectedAthleteLabel) {
                console.error('未找到对应的运动员标签');
                setLoading(false); // 隐藏加载指示器
                return;
            }
            setAthName(selectedAthleteLabel);
            // 创建一个新的对象，将 athlete 的值替换为 label
            const { trainingRequirements } = values;
            const dataToSend = {
                coach,
                specialty,
                name: selectedAthleteLabel,
                trainingRequirements
            };

            const response = await axios.post('/api/specialTrainPlan', dataToSend);
            if (response.data.success) {
                console.log('个性化训练计划生成成功:', response.data);
                setTrainingPlan(response.data.trainPlan); // 假设返回的数据中有一个 trainPlan 字段
                message.success('个性化训练计划生成成功');
                // 重置编辑表单的初始值
                editForm.resetFields();
                editForm.setFieldsValue({ requirements: response.data.trainPlan });
            } else {
                console.error('个性化训练计划生成失败:', response.data);
                message.error('个性化训练计划生成失败');
            }
        } catch (error) {
            console.error('个性化训练计划生成失败:', error);
            message.error('个性化训练计划生成失败');
        } finally {
            setLoading(false); // 隐藏加载指示器
        }
    };

    const onEditFinish = async (values: any) => {
        const { requirements } = values;
        const dataTend = {
            specialTrain: requirements,
            name: athName,
            coach,
            specialty
        }

        setLoading(true); // 在提交表单时显示加载指示器
        try {
            const response = await axios.post('/api/specialTrainPlanSave', dataTend);
            if (response.data.success) {
                console.log('个性化训练计划保存成功:', response.data);
                message.success('个性化训练计划保存成功');
                // 更新 trainingPlan 状态
                setTrainingPlan(requirements);
                // 重置编辑表单的初始值
                editForm.resetFields();
                editForm.setFieldsValue({ requirements });
            } else {
                console.error('个性化训练计划保存失败:', response.data);
                message.error('个性化训练计划保存失败');
            }
        } catch (error) {
            console.error('个性化训练计划保存失败:', error);
            message.error('个性化训练计划保存失败');
        } finally {
            setLoading(false); // 隐藏加载指示器
        }
    };

    return (
        <Spin spinning={loading} tip="加载中...">
            <Card title="个性化训练定制" style={{ padding: '24px' }}>
                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="horizontal"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    colon={false}
                    labelAlign="left"
                    size="large"
                >
                    <Form.Item
                        name="athlete"
                        label="选择运动员"
                        rules={[{ required: true, message: '请选择运动员' }]}
                    >
                        <Select
                            className="custom-select"
                            onChange={handleChange}
                            style={{ width: 200 }}
                            placeholder="请选择运动员制定个性化计划"
                            loading={loading}
                        >
                            {options.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="trainingRequirements"
                        label="定制化训练要求"
                        rules={[{ required: true, message: '请输入定制化训练要求' }]}
                    >
                        <Input.TextArea
                            rows={6}
                            placeholder="请输入定制化训练要求"
                        />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                            生成个性化训练计划
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <Card title="个性化训练计划" style={{ marginTop: 20 }}>
                {trainingPlan ? (
                    <div>
                        <p>{trainingPlan}</p>
                        <Form
                            form={editForm}
                            onFinish={onEditFinish}
                            layout="horizontal"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            colon={false}
                            labelAlign="left"
                            size="large"
                            initialValues={{ requirements: trainingPlan }}
                        >
                            <Form.Item
                                name="requirements"
                                label="编辑训练计划"
                            >
                                <Input.TextArea
                                    rows={12} // 调整高度
                                />
                            </Form.Item>
                            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                                <Button type="primary" htmlType="submit" loading={loading} size="large">
                                    保存训练计划
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                ) : (
                    <p>请先生成个性化训练计划</p>
                )}
            </Card>
        </Spin>
    );
};

export default SpecialTrain;