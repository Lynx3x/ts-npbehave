import React, { useState, useEffect } from 'react';
import { NODE_TYPES } from '../BehaviorTreeEditor';
import PropertyEditor from './PropertyEditor';

interface PropertiesPanelProps {
    node: any;
    onChange: (id: string, properties: any) => void;
}

/**
 * 属性面板组件
 */
const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onChange }) => {
    const [properties, setProperties] = useState<any>({});

    // 当节点改变时更新属性
    useEffect(() => {
        if (node && node.data) {
            setProperties({ ...node.data });
        } else {
            setProperties({});
        }
    }, [node]);

    // 处理属性变化
    const handleChange = (key: string, value: any) => {
        const newProperties = { ...properties, [key]: value };
        setProperties(newProperties);
        onChange(node.id, { ...newProperties });
    };

    // 没有选中节点时不显示
    if (!node) {
        return null;
    }

    // 根据节点类型渲染不同属性编辑器
    const renderProperties = () => {
        const nodeType = properties.type || '';

        // 通用属性
        const commonProps = (
            <>
                <PropertyEditor
                    id="label"
                    label="名称"
                    type="text"
                    value={properties.label || ''}
                    onChange={(value) => handleChange('label', value)}
                />
                <div className="form-group">
                    <label>节点类型</label>
                    <div className="node-type-info">
                        <span className="node-type-label">{properties.nodeType}</span>
                        <span className="node-type-name">{properties.nodeName}</span>
                    </div>
                </div>
            </>
        );

        // 节点特定属性
        switch (nodeType) {
            case NODE_TYPES.TASK.WAIT:
                return (
                    <>
                        {commonProps}
                        <PropertyEditor
                            id="waitTime"
                            label="等待时间 (秒)"
                            type="number"
                            value={properties.waitTime || 1}
                            onChange={(value) => handleChange('waitTime', value)}
                            step={0.1}
                            min={0}
                        />
                        <PropertyEditor
                            id="randomVariation"
                            label="随机变化 (0-1)"
                            type="number"
                            value={properties.randomVariation || 0}
                            onChange={(value) => handleChange('randomVariation', value)}
                            step={0.1}
                            min={0}
                            max={1}
                        />
                    </>
                );

            case NODE_TYPES.DECORATOR.BLACKBOARD_CONDITION:
                return (
                    <>
                        {commonProps}
                        <PropertyEditor
                            id="key"
                            label="黑板键"
                            type="text"
                            value={properties.key || ''}
                            onChange={(value) => handleChange('key', value)}
                        />
                        <PropertyEditor
                            id="operator"
                            label="运算符"
                            type="select"
                            value={properties.operator || 'IS_EQUAL'}
                            onChange={(value) => handleChange('operator', value)}
                            options={[
                                { value: 'IS_EQUAL', label: '等于' },
                                { value: 'IS_NOT_EQUAL', label: '不等于' },
                                { value: 'IS_GREATER', label: '大于' },
                                { value: 'IS_GREATER_OR_EQUAL', label: '大于等于' },
                                { value: 'IS_SMALLER', label: '小于' },
                                { value: 'IS_SMALLER_OR_EQUAL', label: '小于等于' },
                                { value: 'ALWAYS_TRUE', label: '总是为真' }
                            ]}
                        />
                        <PropertyEditor
                            id="value"
                            label="比较值"
                            type="text"
                            value={properties.value || ''}
                            onChange={(value) => handleChange('value', value)}
                        />
                    </>
                );

            case NODE_TYPES.TASK.ACTION:
                return (
                    <>
                        {commonProps}
                        <PropertyEditor
                            id="actionDescription"
                            label="动作描述"
                            type="textarea"
                            value={properties.actionDescription || ''}
                            onChange={(value) => handleChange('actionDescription', value)}
                        />
                    </>
                );

            case NODE_TYPES.COMPOSITE.PARALLEL:
                return (
                    <>
                        {commonProps}
                        <PropertyEditor
                            id="successPolicy"
                            label="成功策略"
                            type="select"
                            value={properties.successPolicy || 'ONE'}
                            onChange={(value) => handleChange('successPolicy', value)}
                            options={[
                                { value: 'ONE', label: '一个满足即可' },
                                { value: 'ALL', label: '全部满足' }
                            ]}
                        />
                        <PropertyEditor
                            id="failurePolicy"
                            label="失败策略"
                            type="select"
                            value={properties.failurePolicy || 'ONE'}
                            onChange={(value) => handleChange('failurePolicy', value)}
                            options={[
                                { value: 'ONE', label: '一个失败即失败' },
                                { value: 'ALL', label: '全部失败才失败' }
                            ]}
                        />
                    </>
                );

            default:
                return commonProps;
        }
    };

    return (
        <div className="properties-panel">
            <div className="sidebar-title">属性</div>
            <div className="node-type">{properties.type}</div>
            {renderProperties()}
        </div>
    );
};

export default PropertiesPanel; 