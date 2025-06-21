import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';

/**
 * 自定义节点组件
 */
const CustomNode = memo(({ data, isConnectable, selected }: NodeProps) => {
    // 确定节点类型的CSS类名
    const getNodeClassName = () => {
        if (data.nodeType === 'COMPOSITE') {
            return 'node-composite';
        } else if (data.nodeType === 'DECORATOR') {
            return 'node-decorator';
        } else {
            return 'node-task';
        }
    };

    // 获取节点图标
    const getNodeIcon = () => {
        switch (data.type) {
            case 'COMPOSITE.SELECTOR':
                return '?';
            case 'COMPOSITE.SEQUENCE':
                return '→';
            case 'COMPOSITE.PARALLEL':
                return '⇉';
            case 'DECORATOR.BLACKBOARD_CONDITION':
                return '⚑';
            case 'TASK.ACTION':
                return '▶';
            case 'TASK.WAIT':
                return '⏱';
            default:
                return '◆';
        }
    };

    // 获取节点描述
    const getNodeDescription = () => {
        if (data.actionDescription) {
            return data.actionDescription;
        } else if (data.waitTime) {
            return `等待 ${data.waitTime}s`;
        } else if (data.key) {
            return `${data.key} ${data.operator} ${data.value}`;
        } else {
            return '';
        }
    };

    return (
        <div className={`custom-node ${getNodeClassName()} ${selected ? 'selected' : ''}`}>
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
            />
            <div className="node-content">
                <div className="node-icon">{getNodeIcon()}</div>
                <div className="node-title">{data.label || '未命名节点'}</div>
                <div className="node-type-display">
                    <span className="node-type-badge">{data.nodeType}</span>
                    <span className="node-name-badge">{data.nodeName}</span>
                </div>
                {getNodeDescription() && (
                    <div className="node-description">{getNodeDescription()}</div>
                )}
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
            />
        </div>
    );
});

export default CustomNode; 