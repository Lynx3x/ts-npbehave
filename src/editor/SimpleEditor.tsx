import React from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MarkerType,
    Connection,
    Edge,
    Node,
} from 'react-flow-renderer';
import './styles.css';

// 定义初始节点
const initialNodes: Node[] = [
    {
        id: '1',
        data: { label: '选择器 (Selector)' },
        position: { x: 250, y: 5 },
        type: 'default'
    },
    {
        id: '2',
        data: { label: '序列 (Sequence)' },
        position: { x: 100, y: 100 },
        type: 'default'
    },
    {
        id: '3',
        data: { label: '动作 (Action)' },
        position: { x: 400, y: 100 },
        type: 'default'
    },
];

// 定义初始连线
const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e1-3', source: '1', target: '3' }
];

/**
 * 简化版编辑器组件
 */
const SimpleEditor: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = (params: Connection) =>
        setEdges((eds) => addEdge(params, eds));

    return (
        <div className="simple-editor">
            <h2 style={{ margin: '0', padding: '10px', background: '#f0f0f0' }}>
                NPBehave 行为树编辑器 - 简化版
            </h2>
            <div style={{ width: '100%', height: 'calc(100vh - 50px)' }}>
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        defaultEdgeOptions={{
                            type: 'smoothstep',
                            markerEnd: { type: MarkerType.ArrowClosed },
                        }}
                        fitView
                    >
                        <Controls />
                        <Background />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
        </div>
    );
};

export default SimpleEditor; 