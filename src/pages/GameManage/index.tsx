import ProTable, { ActionType } from "@ant-design/pro-table";
import { Button, Card, Space } from "antd";
import axios from "axios";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const Game = () => {

    const actionGameRef = useRef<ActionType | null>(null);
    const specialtype = localStorage.getItem('coachspecialty');
    const navigate = useNavigate();

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
                    {/* <a onClick={() => modifycompetitions(record)}>编辑</a>
                        <a onClick={() => handleDeleteGame(record.id)}>删除</a> */}
                    <a onClick={() => handleDetail(record)}>详情</a>
                </Space>
            ),
        },
    ];
    const handleDetail = (record: any) => {
        console.log(record, '[[[[[[[[');

        navigate('/gamedetail', { replace: true, state: { record } });
    };

    return (
        <>
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
        </>
    )

}
export default Game;
