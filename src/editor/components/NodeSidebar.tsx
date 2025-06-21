import React from 'react';
import { NODE_TYPES } from '../BehaviorTreeEditor';

/**
 * 节点侧边栏组件，显示可用的节点类型
 */
const NodeSidebar: React.FC = () => {
    const onDragStart = (event: React.DragEvent<HTMLLIElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="sidebar">
            <div className="sidebar-title">可用节点</div>

            <div className="sidebar-section">
                <h3>复合节点</h3>
                <ul className="node-list">
                    <li
                        className="node-item node-composite"
                        draggable
                        onDragStart={(e) => onDragStart(e, NODE_TYPES.COMPOSITE.SELECTOR)}
                    >
                        选择器 (Selector)
                    </li>
                    <li
                        className="node-item node-composite"
                        draggable
                        onDragStart={(e) => onDragStart(e, NODE_TYPES.COMPOSITE.SEQUENCE)}
                    >
                        序列 (Sequence)
                    </li>
                    <li
                        className="node-item node-composite"
                        draggable
                        onDragStart={(e) => onDragStart(e, NODE_TYPES.COMPOSITE.PARALLEL)}
                    >
                        并行 (Parallel)
                    </li>
                </ul>
            </div>

            <div className="sidebar-section">
                <h3>装饰器节点</h3>
                <ul className="node-list">
                    <li
                        className="node-item node-decorator"
                        draggable
                        onDragStart={(e) => onDragStart(e, NODE_TYPES.DECORATOR.BLACKBOARD_CONDITION)}
                    >
                        黑板条件 (BlackboardCondition)
                    </li>
                </ul>
            </div>

            <div className="sidebar-section">
                <h3>任务节点</h3>
                <ul className="node-list">
                    <li
                        className="node-item node-task"
                        draggable
                        onDragStart={(e) => onDragStart(e, NODE_TYPES.TASK.ACTION)}
                    >
                        动作 (Action)
                    </li>
                    <li
                        className="node-item node-task"
                        draggable
                        onDragStart={(e) => onDragStart(e, NODE_TYPES.TASK.WAIT)}
                    >
                        等待 (Wait)
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default NodeSidebar;
