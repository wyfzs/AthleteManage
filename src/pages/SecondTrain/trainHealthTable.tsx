import { Card, Table } from "antd"


const TrainHealthTable = () => {
    const ealthTrainColumns = [
        {
            title: '健康指标',
            dataIndex: 'healthname',
            render: (text: any, record: any) => (
                <p><strong>{text}</strong></p>
            ),
        },
        {
            title: '正常范围	',
            dataIndex: 'normal',
        },
        {
            title: '异常值影响',
            dataIndex: 'effect',
        },
        {
            title: '训练调整建议	',
            dataIndex: 'suggestion',
        },
    ]
    const healthTraintable = [
        {
            healthname: '静息心率',
            normal: '60-100 bpm',
            effect: '＞100 bpm（心动过速）',
            suggestion: '推迟高强度训练，优先有氧耐力（60-70%HRmax） + 呼吸训练（如4-7-8呼吸法）。',
        },
        {
            healthname: '血压（BP）',
            normal: '＜120/80 mmHg',
            effect: '高血压（＞140/90）',
            suggestion: '避免爆发性动作（如跳箱）、瓦氏呼吸（举重时憋气）；采用循环训练（低负重+多组次）。',
        },
        {
            healthname: '血红蛋白（Hb）	',
            normal: '男13-17 g/dL,女12-15 g/dL',
            effect: '＜12 g/dL（贫血）',
            suggestion: '降低有氧训练量（跑步→游泳/骑行），补充铁+维生素C，避免连续两天大强度。',
        },
        {
            healthname: '血乳酸阈值',
            normal: '2-4 mmol/L（静息）',
            effect: '运动后＞8 mmol/L（清除慢）',
            suggestion: '延长组间休息（1:3工作:休息比），增加主动恢复（低强度踩车）。',
        },
        {
            healthname: 'CK值（肌酸激酶）',
            normal: '男38-174 U/L,女26-140 U/L',
            effect: '＞500 U/L（肌肉损伤）',
            suggestion: '停训48小时，进行冷敷/按摩；恢复后优先离心训练（如慢速下蹲）。',
        },
        {
            healthname: '体脂率（男/女）',
            normal: '运动员：6-13%/14-20%',
            effect: '男＞20%、女＞28%（肥胖）',
            suggestion: '采用复合动作（深蹲+推举组合）提升代谢压力，HIIT（20s冲刺+40s慢跑）。',
        },
        {
            healthname: '关节活动度',
            normal: '如肩屈曲180°',
            effect: '肩屈＜160°（灵活性不足）',
            suggestion: '训练前动态拉伸（弹力带肩绕环），避免过头举重（用哑铃替代杠铃）。',
        },
    ]
    return (
        <Card title="健康指标-训练转化对照表">
            <Table dataSource={healthTraintable} columns={ealthTrainColumns} rowKey="name" />
        </Card>
    )
}
export default TrainHealthTable;