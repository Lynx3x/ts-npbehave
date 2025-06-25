import React from 'react';

/**
 * 行为树节点类型
 */
export type BehaviorNodeType = 'selector' | 'sequence' | 'decorator' | 'action' | 'condition' | 'root' | 'wait' | 'repeater';

/**
 * 行为树节点显示数据
 */
export interface BehaviorTreeNodeDisplay {
    id: string;
    type: BehaviorNodeType;
    name: string;
    children?: BehaviorTreeNodeDisplay[];
    isActive?: boolean;
}

// 获取节点颜色
const getNodeColor = (type: BehaviorNodeType): string => {
    switch (type) {
        case 'selector': return '#ffa500'; // 橙色
        case 'sequence': return '#1e90ff'; // 蓝色
        case 'decorator': return '#9370db'; // 紫色
        case 'condition': return '#9acd32'; // 黄绿色
        case 'action': return '#ff6347';   // 红色
        case 'root': return '#ffffff';     // 白色
        case 'wait': return '#d3d3d3';     // 淡灰色
        case 'repeater': return '#ba55d3'; // 紫红色
        default: return '#cccccc';
    }
};

// 获取节点符号
const getNodeSymbol = (type: BehaviorNodeType): string => {
    switch (type) {
        case 'selector': return '?';  // 问号，表示选择
        case 'sequence': return '→';  // 箭头，表示序列
        case 'decorator': return '◊';  // 菱形，表示修饰
        case 'condition': return '?';  // 问号，表示条件
        case 'action': return '◯';    // 圆形，表示动作
        case 'root': return '⚫';      // 圆点，表示根节点
        case 'wait': return '⏳';      // 沙漏，表示等待
        case 'repeater': return '↻';   // 循环箭头，表示重复
        default: return '■';
    }
};

// 渲染单个行为树节点
const renderBehaviorTreeNode = (node: BehaviorTreeNodeDisplay, depth: number = 0): JSX.Element => {
    const nodeStyle: React.CSSProperties = {
        marginLeft: `${depth * 15}px`,
        color: getNodeColor(node.type),
        backgroundColor: node.isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
        padding: '2px 4px',
        borderRadius: '3px',
        marginBottom: '2px',
        fontWeight: node.isActive ? 'bold' : 'normal',
        display: 'flex',
        alignItems: 'center'
    };

    return (
        <div key={node.id}>
            <div style={nodeStyle}>
                <span style={{ marginRight: '5px' }}>{getNodeSymbol(node.type)}</span>
                <span>{node.name}</span>
            </div>
            {node.children && (
                <div>
                    {node.children.map(child => renderBehaviorTreeNode(child, depth + 1))}
                </div>
            )}
        </div>
    );
};

/**
 * 行为树可视化组件属性
 */
interface BehaviorTreeVisualizationProps {
    tree: BehaviorTreeNodeDisplay;
    currentPath?: string;
}

/**
 * 行为树可视化组件
 */
const BehaviorTreeVisualization: React.FC<BehaviorTreeVisualizationProps> = ({ tree, currentPath }) => {
    return (
        <div style={{
            border: '1px solid #333',
            borderRadius: '5px',
            padding: '10px',
            backgroundColor: '#0a0a0a',
            maxHeight: '400px',
            overflow: 'auto',
            marginBottom: '15px'
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0f0' }}>行为树结构</h4>
            {renderBehaviorTreeNode(tree)}

            <div style={{ marginTop: '10px', borderTop: '1px solid #333', paddingTop: '5px', fontSize: '12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <span><span style={{ color: '#ffa500' }}>?</span> 选择器</span>
                    <span><span style={{ color: '#1e90ff' }}>→</span> 序列</span>
                    <span><span style={{ color: '#9370db' }}>◊</span> 装饰器</span>
                    <span><span style={{ color: '#9acd32' }}>?</span> 条件</span>
                    <span><span style={{ color: '#ff6347' }}>◯</span> 动作</span>
                    <span><span style={{ color: '#d3d3d3' }}>⏳</span> 等待</span>
                </div>
            </div>

            {currentPath && (
                <div style={{ marginTop: '10px' }}>
                    <h4 style={{ color: '#0f0', marginBottom: '5px' }}>当前执行节点</h4>
                    <div style={{
                        backgroundColor: '#111',
                        padding: '8px',
                        border: '1px solid #333',
                        borderRadius: '3px',
                        color: '#0f0',
                        fontSize: '12px',
                        wordBreak: 'break-word'
                    }}>
                        {currentPath}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BehaviorTreeVisualization; 