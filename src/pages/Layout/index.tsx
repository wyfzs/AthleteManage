// src/pages/Layout/index.js
import { Layout, Menu, Popconfirm, Typography } from 'antd';
import {
  HomeOutlined,
  DiffOutlined,
  EditOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import './index.css';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Children } from 'react';

const { Header, Sider } = Layout;
const { Title } = Typography;

const GeekLayout = () => {
  // 点击获取路由跳转
  const navigate = useNavigate();
  const oncomenu = (route) => {
    navigate(route.key);
  };
  // 获取当前路由路径
  const location = useLocation();
  // 反向高亮
  const selectkeys = [location.pathname];

  // 获取用户角色
  const userRole = localStorage.getItem('role') || '';
  //获取用户账号
  const username = localStorage.getItem('username');

  // 定义所有菜单项
  const allItems = [
    {
      label: '运动员主页',
      key: '/athletehome',
      icon: <HomeOutlined />,
      roles: ['athlete'], // 只有运动员可以访问
    },
    {
      label: '教练主页',
      key: '/',
      icon: <HomeOutlined />,
      roles: ['coach'], // 只有教练可以访问
    },
    {
      label: '管理员主页',
      key: '/adminhome',
      icon: <HomeOutlined />,
      roles: ['admin'], // 只有管理员可以访问
    },
    {
      label: '运动员管理',
      key: '/athletemanage',
      icon: <HomeOutlined />,
      roles: ['coach'], // 只有管理员和教练可以访问
    },
    {
      label: '训练管理',
      key: '/train',
      icon: <DiffOutlined />,
      roles: ['coach'], // 只有管理员和教练可以访问
      children: [
        {
          label: '团队训练计划制定',
          key: '/train/Team',
          roles: ['coach'],
        },
        {
          label: '个性化训练计划定制',
          key: '/train/special',
          roles: ['coach'],
        },
        {
          label: '健康指标-训练转化对照',
          key: '/train/health',
        },
      ],
    },
    {
      label: '比赛管理',
      key: '/game',
      icon: <EditOutlined />,
      roles: ['coach'], // 只有管理员和教练可以访问
    },
    {
      label: '个性化训练',
      key: '/athlete-specialTrain',
      icon: <EditOutlined />,
      roles: ['athlete'], // 只有管理员和教练可以访问
    },
    {
      label: '健康管理',
      key: '/health',
      icon: <EditOutlined />,
      roles: ['coach', 'athlete'], // 只有管理员和教练可以访问
    },
  ];

  // 根据用户角色过滤菜单项
  const items = allItems.filter(item => !item.roles || item.roles.includes(userRole));

  // 退出登录处理函数
  const handleLogout = () => {
    // 清除 token 和 role
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('coachspecialty');
    localStorage.removeItem('coachname');
    localStorage.removeItem('specialty');
    localStorage.removeItem('role');
    localStorage.removeItem('analysisData');
    localStorage.removeItem('trainData');
    localStorage.removeItem('trainPlans');
    localStorage.removeItem('athletename');

    // 导航到登录页面
    navigate('/login', { replace: true });
  };

  return (
    <Layout>
      <Header className="header">
        <Title level={4} style={{ marginRight: 24, color: '#BBFFEE', marginLeft: 24, marginTop: 20, fontFamily: 'cursive', fontSize: 26 }}>
          体育运动员数据管理平台
        </Title>
        <div className="user-info">
          <span>你好，{userRole === 'athlete' ? '运动员' : userRole === 'admin' ? '管理员' : '教练'}</span>
          <span className="user-name">{username}</span>
          <span className="user-logout">
            <Popconfirm title="是否确认退出？" okText="退出" cancelText="取消" onConfirm={handleLogout}>
              <LogoutOutlined /> 退出
            </Popconfirm>
          </span>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={selectkeys}
            items={items}
            onClick={oncomenu}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Layout className="layout-content" style={{ padding: 20 }}>
          <Outlet />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default GeekLayout;