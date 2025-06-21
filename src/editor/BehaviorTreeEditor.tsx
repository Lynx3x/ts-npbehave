import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MarkerType,
    NodeTypes,
    ConnectionLineType,
    Edge,
    Node,
} from 'react-flow-renderer';
import NodeSidebar from './components/NodeSidebar';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';
import CustomNode from './components/CustomNode';
import './styles.css';

// 直接定义StandardTreeConfig和StandardTreeNode接口，避免循环导入
interface StandardTreeNode {
    type: string;
    properties: Record<string, any>;
    children?: StandardTreeNode[];
}

interface StandardTreeConfig {
    trees: StandardTreeNode[];
}

// 节点类型定义
export const NODE_TYPES = {
    COMPOSITE: {
        SELECTOR: 'COMPOSITE.SELECTOR',
        SEQUENCE: 'COMPOSITE.SEQUENCE',
        PARALLEL: 'COMPOSITE.PARALLEL',
    },
    DECORATOR: {
        BLACKBOARD_CONDITION: 'DECORATOR.BLACKBOARD_CONDITION',
    },
    TASK: {
        ACTION: 'TASK.ACTION',
        WAIT: 'TASK.WAIT',
    },
};

// React Flow 自定义节点类型
const nodeTypes: NodeTypes = {
    customNode: CustomNode,
};

// 本地存储键
const STORAGE_KEY = 'ts-npbehave-editor-state';

// 行为树编辑器组件
const BehaviorTreeEditor: React.FC = () => {
    // 节点和边的状态
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [selectedEdge, setSelectedEdge] = useState<any>(null);

    // 用于生成唯一ID
    const idCounter = useRef(0);
    const nextId = () => `node_${idCounter.current++}`;

    // 上次保存时间状态
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    // 从本地存储加载状态
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const { nodes: savedNodes, edges: savedEdges, idCounter: savedIdCounter, lastSaved: savedTime } = JSON.parse(savedState);
                setNodes(savedNodes);
                setEdges(savedEdges);
                idCounter.current = savedIdCounter || 0;
                if (savedTime) {
                    setLastSaved(savedTime);
                }
            } catch (error) {
                console.error('Failed to load saved state:', error);
            }
        }
    }, [setNodes, setEdges]);

    // 保存状态到本地存储（使用防抖）
    useEffect(() => {
        // 创建防抖函数，延迟1秒保存
        const saveToLocalStorage = () => {
            console.log('自动保存编辑器状态...');
            const currentTime = new Date().toISOString();
            const state = {
                nodes,
                edges,
                idCounter: idCounter.current,
                lastSaved: currentTime
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            setLastSaved(currentTime);
        };

        // 如果有节点或边，设置定时器
        if (nodes.length > 0 || edges.length > 0) {
            const timerId = setTimeout(saveToLocalStorage, 1000);
            return () => clearTimeout(timerId);
        }
    }, [nodes, edges]);

    // 处理节点拖放
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // 处理节点放置
    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const nodeType = event.dataTransfer.getData('application/reactflow');
            if (!nodeType) return;

            // 获取放置位置
            const reactFlowBounds = document.querySelector('.flow-container')?.getBoundingClientRect();
            if (!reactFlowBounds) return;

            const position = {
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            };

            // 创建新节点
            const newNode = {
                id: nextId(),
                type: 'customNode',
                position,
                data: {
                    label: nodeType.split('.').pop(),
                    type: nodeType,
                    nodeType: nodeType.split('.')[0],
                    nodeName: nodeType.split('.')[1]
                },
            };

            // 添加新节点
            setNodes((prevNodes) => prevNodes.concat(newNode));
        },
        [setNodes]
    );

    // 处理边连接
    const onConnect = useCallback(
        (params: any) => {
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed },
                    },
                    eds
                )
            );
        },
        [setEdges]
    );

    // 处理元素点击
    const onNodeClick = useCallback(
        (event: React.MouseEvent, node: any) => {
            setSelectedNode(node);
            setSelectedEdge(null);
        },
        []
    );

    const onEdgeClick = useCallback(
        (event: React.MouseEvent, edge: any) => {
            setSelectedEdge(edge);
            setSelectedNode(null);
        },
        []
    );

    // 处理节点复制
    const handleCopyNode = useCallback(() => {
        if (!selectedNode) return;

        // 创建新节点ID
        const newId = nextId();

        // 复制节点，位置稍微偏移
        const newNode = {
            ...selectedNode,
            id: newId,
            position: {
                x: selectedNode.position.x + 50,
                y: selectedNode.position.y + 50
            },
            selected: false
        };

        // 添加新节点
        setNodes((nds) => nds.concat(newNode));

        // 选择新节点
        setSelectedNode(newNode);

        console.log(`已复制节点: ${selectedNode.data.label || selectedNode.id}`);
    }, [selectedNode, setNodes]);

    // 处理删除选中元素
    const handleDeleteSelected = useCallback(() => {
        if (selectedNode) {
            // 确认删除节点
            const confirmMessage = `确定要删除节点 "${selectedNode.data.label || selectedNode.id}" 吗？`;
            if (window.confirm(confirmMessage)) {
                // 删除节点及其所有连接的边
                setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
                setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
                setSelectedNode(null);

                // 显示删除确认消息
                console.log(`已删除节点: ${selectedNode.data.label || selectedNode.id}`);
            }
        } else if (selectedEdge) {
            // 确认删除边
            if (window.confirm("确定要删除这个连接吗？")) {
                // 删除边
                setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
                setSelectedEdge(null);

                // 显示删除确认消息
                console.log(`已删除连接`);
            }
        }
    }, [selectedNode, selectedEdge, setNodes, setEdges]);

    // 注册键盘快捷键
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // 删除快捷键
            if (event.key === 'Delete' || event.key === 'Backspace') {
                handleDeleteSelected();
            }

            // 复制快捷键 (Ctrl+C)
            if (event.key === 'c' && event.ctrlKey && selectedNode) {
                handleCopyNode();
                event.preventDefault(); // 防止默认的复制行为
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleDeleteSelected, handleCopyNode, selectedNode]);

    // 处理属性更新
    const handlePropertyChange = useCallback(
        (id: string, properties: any) => {
            setNodes((prevNodes) =>
                prevNodes.map((node) => {
                    if (node.id === id) {
                        return { ...node, data: { ...node.data, ...properties } };
                    }
                    return node;
                })
            );
        },
        [setNodes]
    );

    // 将可视化行为树转换为标准化的JSON配置
    const convertToStandardFormat = (nodes: Node[], edges: Edge[]) => {
        // 首先找到根节点（没有入边的节点）
        const nodeMap: Record<string, any> = {};
        const childrenMap: Record<string, string[]> = {};

        // 初始化所有节点的映射和子节点列表
        nodes.forEach(node => {
            nodeMap[node.id] = {
                id: node.id,
                type: node.data.type,
                properties: { ...node.data },
            };
            childrenMap[node.id] = [];
        });

        // 构建父子关系
        edges.forEach(edge => {
            const sourceId = edge.source;
            const targetId = edge.target;

            if (sourceId && targetId) {
                childrenMap[sourceId].push(targetId);
            }
        });

        // 找到根节点（没有入边的节点）
        const allNodeIds = new Set(nodes.map(node => node.id));
        edges.forEach(edge => {
            if (edge.target) {
                allNodeIds.delete(edge.target);
            }
        });

        const rootIds = Array.from(allNodeIds);

        // 递归构建树结构
        const buildTreeStructure = (nodeId: string): any => {
            const node = nodeMap[nodeId];
            if (!node) return null;

            const children = childrenMap[nodeId].map(buildTreeStructure).filter(Boolean);

            return {
                type: node.type,
                properties: node.properties,
                children: children.length > 0 ? children : undefined
            };
        };

        // 如果有多个根节点，创建一个虚拟的根节点
        let result;
        if (rootIds.length === 0) {
            result = { trees: [] };
        } else if (rootIds.length === 1) {
            result = { trees: [buildTreeStructure(rootIds[0])] };
        } else {
            result = {
                trees: rootIds.map(buildTreeStructure)
            };
        }

        return result;
    };

    // 从标准格式JSON配置构建可视化行为树
    const buildFromStandardFormat = (config: StandardTreeConfig) => {
        if (!config.trees || config.trees.length === 0) {
            return { nodes: [], edges: [], idCounter: 0 };
        }

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        let nodeIdCounter = 0;

        // 递归构建节点和边
        const processNode = (treeNode: StandardTreeNode, parentId: string | null, position: { x: number, y: number; }) => {
            const nodeId = `node_${nodeIdCounter++}`;

            // 确保节点类型有效
            if (!treeNode.type || !treeNode.type.includes('.')) {
                console.error('无效的节点类型:', treeNode.type);
                return;
            }

            // 创建节点
            const node: Node = {
                id: nodeId,
                type: 'customNode',
                position,
                data: {
                    label: treeNode.properties?.label || treeNode.type.split('.')[1],
                    type: treeNode.type,
                    nodeType: treeNode.type.split('.')[0],
                    nodeName: treeNode.type.split('.')[1],
                    ...treeNode.properties
                }
            };

            newNodes.push(node);
            console.log('添加节点:', node);

            // 如果有父节点，创建边
            if (parentId) {
                const edge: Edge = {
                    id: `edge_${parentId}_${nodeId}`,
                    source: parentId,
                    target: nodeId,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed },
                };
                newEdges.push(edge);
                console.log('添加边:', edge);
            }

            // 处理子节点
            if (treeNode.children && treeNode.children.length > 0) {
                const childSpacing = 200; // 子节点之间的水平间距
                const childYOffset = 100; // 子节点相对于父节点的垂直偏移

                // 计算子节点的起始X坐标
                const totalWidth = (treeNode.children.length - 1) * childSpacing;
                let startX = position.x - totalWidth / 2;

                // 递归处理每个子节点
                treeNode.children.forEach((childNode, index) => {
                    const childPosition = {
                        x: startX + index * childSpacing,
                        y: position.y + childYOffset
                    };

                    processNode(childNode, nodeId, childPosition);
                });
            }
        };

        // 处理所有根节点
        config.trees.forEach((rootNode, index) => {
            const rootPosition = { x: 300 + index * 300, y: 50 };
            processNode(rootNode, null, rootPosition);
        });

        console.log('构建完成，节点数:', newNodes.length, '边数:', newEdges.length);
        return { nodes: newNodes, edges: newEdges, idCounter: nodeIdCounter };
    };

    // 处理保存树
    const handleSaveTree = useCallback(() => {
        const behaviorTree = {
            nodes,
            edges,
        };

        // 转换为JSON并保存
        const json = JSON.stringify(behaviorTree, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'behavior-tree.json';
        link.href = url;
        link.click();

        // 清理URL对象
        URL.revokeObjectURL(url);
    }, [nodes, edges]);

    // 导出标准格式的行为树配置
    const handleExportStandardTree = useCallback(() => {
        const standardTree = convertToStandardFormat(nodes, edges);

        // 转换为JSON并保存
        const json = JSON.stringify(standardTree, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'behavior-tree-standard.json';
        link.href = url;
        link.click();

        // 清理URL对象
        URL.revokeObjectURL(url);
    }, [nodes, edges]);

    // 处理加载树
    const handleLoadTree = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const parsedData = JSON.parse(content);

                    if (parsedData.nodes && parsedData.edges) {
                        setNodes(parsedData.nodes);
                        setEdges(parsedData.edges);

                        // 更新ID计数器
                        const maxId = Math.max(
                            ...parsedData.nodes.map((node: any) => {
                                const idNumber = parseInt(node.id.split('_')[1], 10);
                                return isNaN(idNumber) ? 0 : idNumber;
                            })
                        );
                        idCounter.current = maxId + 1;
                    }
                } catch (error) {
                    console.error('Failed to parse file:', error);
                    alert('文件格式错误');
                }
            };
            reader.readAsText(file);
        },
        [setNodes, setEdges]
    );

    // 处理导入标准格式的行为树配置
    const handleImportStandardTree = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            console.log('开始导入文件:', file.name);

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    console.log('文件内容:', content.substring(0, 100) + '...');

                    const parsedData = JSON.parse(content);
                    console.log('解析后的数据:', parsedData);

                    if (parsedData.trees && Array.isArray(parsedData.trees)) {
                        console.log('找到树配置，树数量:', parsedData.trees.length);

                        const { nodes: newNodes, edges: newEdges, idCounter: newIdCounter } = buildFromStandardFormat(parsedData);
                        console.log('构建结果 - 节点:', newNodes.length, '边:', newEdges.length);

                        if (newNodes.length > 0) {
                            setNodes(newNodes);
                            setEdges(newEdges);
                            idCounter.current = newIdCounter;
                            alert(`成功导入行为树，包含 ${newNodes.length} 个节点`);
                        } else {
                            alert('导入失败：未能从配置创建任何节点');
                        }
                    } else {
                        console.error('无效的树配置:', parsedData);
                        alert('无效的行为树配置格式：缺少trees数组');
                    }
                } catch (error) {
                    console.error('导入文件时出错:', error);
                    alert(`文件格式错误: ${error instanceof Error ? error.message : '未知错误'}`);
                }
            };

            reader.onerror = (error) => {
                console.error('读取文件时出错:', error);
                alert('读取文件时出错');
            };

            reader.readAsText(file);
        },
        [setNodes, setEdges]
    );

    // 清除编辑器
    const handleClearEditor = useCallback(() => {
        if (window.confirm('确定要清除编辑器吗？这将删除所有节点和连接。')) {
            setNodes([]);
            setEdges([]);
            idCounter.current = 0;
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [setNodes, setEdges]);

    return (
        <div className="editor-container">
            <NodeSidebar />

            <div className="main-area">
                <Toolbar
                    onSave={handleSaveTree}
                    onLoad={handleLoadTree}
                    onExport={handleExportStandardTree}
                    onImport={handleImportStandardTree}
                    onClear={handleClearEditor}
                    onDelete={handleDeleteSelected}
                    onCopy={handleCopyNode}
                    canDelete={!!selectedNode || !!selectedEdge}
                    canCopy={!!selectedNode}
                    lastSaved={lastSaved}
                />

                <div className="flow-container">
                    <ReactFlowProvider>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeClick={onNodeClick}
                            onEdgeClick={onEdgeClick}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            connectionLineType={ConnectionLineType.SmoothStep}
                            defaultZoom={1}
                            minZoom={0.2}
                            maxZoom={4}
                            snapToGrid={true}
                            snapGrid={[15, 15]}
                            fitView
                        >
                            <Controls />
                            <Background gap={16} size={1} />
                        </ReactFlow>
                    </ReactFlowProvider>
                </div>
            </div>

            {selectedNode && (
                <PropertiesPanel
                    node={selectedNode}
                    onChange={handlePropertyChange}
                />
            )}
        </div>
    );
};

export default BehaviorTreeEditor; 