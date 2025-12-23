import { Button, Card } from "antd";

const Report = () => {
    const buttonStyle = {
        backgroundColor: '#1890ff', // 蓝色背景
        color: 'white', // 白色文字
        borderRadius: '6px', // 圆角
        border: 'none', // 去掉边框
        padding: '4px', // 保持垂直内边距，移除水平内边距的自定义
        fontSize: '14px', // 减小字体大小
        cursor: 'pointer', // 鼠标悬停时显示为指针
        transition: 'background-color 0.3s', // 添加过渡效果
    };

    const buttonHoverStyle = {
        backgroundColor: '#40a9ff', // 悬停时颜色加深
    };

    return (
        <div>
            <Card title="健康报告分析" style={{ marginBottom: 24, width: '66.67%' }}></Card>
            <Button
            >
                导出健康报告
            </Button>
        </div>
    )
}

export default Report;