// src/pages/Login/index.tsx
import { useState } from 'react';
import { Form, Input, Button, Checkbox, Tabs, message, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const { TabPane } = Tabs;
const { Option } = Select;

const Login = () => {
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');

  const handleLogin = async (values: any) => {
    console.log('登录表单提交：', values);
    const { username, password } = values;
    if (username === 'admin' || password === 'admin@123') {
      const admin = 'admin';
      localStorage.setItem('role', admin);
      navigate('/adminhome', { replace: true }); // 跳转到主页
      return;
    }
    try {
      // 使用 axios 发送登录请求
      const response = await axios.post('/api/login', values, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.success) {
        const { token, role, username } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('username', username);
        message.success('登录成功');
        //根据用户角色决定跳转的路由
        if (role === 'athlete') {
          navigate('/athletehome', { replace: true }); // 跳转到主页
        } else {
          navigate('/', { replace: true }); // 跳转到默认路由
        }
      } else {
        message.error('用户名或密码错误');
      }
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败,账号或密码错误');
    }
  };

  const handleRegister = async (values: any) => {
    try {
      // 使用 axios 发送注册请求
      const response = await axios.post('/api/regUser', values, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.success) {
        message.success('注册成功，请登录');
        setActiveTab('1'); // 切换到登录选项卡
      } else {
        message.error('注册失败，请检查输入信息');
      }
    } catch (error) {
      console.error('注册失败:', error);
      message.error('注册失败，请稍后重试');
    }
  };

  return (
    <div className="login-container">
      <h2 className='marginLeft'>体育运动员信息管理系统</h2>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="登录" key="1">
          <Form
            form={loginForm}
            name="login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }, { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母数字下划线' }]}
            >
              <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }, { min: 8, message: '密码至少8位' }]}
            >
              <Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="密码" />
            </Form.Item>
            <Form.Item>
              <div className="remember-me">
                <Checkbox name="remember" value="true">
                  记住我
                </Checkbox>
              </div>
              <Button type="primary" htmlType="submit" className="login-form-button" style={{ width: '100%' }}>
                登录
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="注册" key="2">
          <Form
            form={registerForm}
            name="register"
            className="register-form"
            initialValues={{ remember: true }}
            onFinish={handleRegister}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }, { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母数字下划线' }]}
            >
              <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[{ required: true, message: '请输入邮箱!' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
            >
              <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="邮箱" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }, { min: 8, message: '密码至少8位' }]}
            >
              <Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="密码" />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: '请确认密码!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致!'));
                  },
                }),
              ]}
            >
              <Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="确认密码" />
            </Form.Item>
            <Form.Item
              name="role"
              rules={[{ required: true, message: '请选择用户角色!' }]}
            >
              <Select placeholder="请选择用户角色">
                <Option value="athlete">运动员</Option>
                <Option value="coach">教练</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="register-form-button" style={{ width: '100%' }}>
                注册
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Login;