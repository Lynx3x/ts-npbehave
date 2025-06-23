import React, { useState } from 'react';
import BehaviorTreeExample from './examples/BehaviorTreeExample';
import { runTest } from './examples/SimpleTest';

/**
 * 应用主组件
 */
const App: React.FC = () => {
    const [showNodeTest, setShowNodeTest] = useState(false);
    const [showTreeExample, setShowTreeExample] = useState(false);

    return (
        <div style={{ padding: '20px' }}>
            <h1>TS-NPBehave 测试</h1>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setShowNodeTest(!showNodeTest)}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: showNodeTest ? '#4CAF50' : '#f1f1f1'
                    }}
                >
                    {showNodeTest ? '隐藏' : '显示'} 节点测试
                </button>

                <button
                    onClick={() => setShowTreeExample(!showTreeExample)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: showTreeExample ? '#4CAF50' : '#f1f1f1'
                    }}
                >
                    {showTreeExample ? '隐藏' : '显示'} 行为树示例
                </button>
            </div>

            {showNodeTest && (
                <div>
                    <h2>节点单元测试</h2>
                    <button onClick={() => runTest()} style={{ padding: '10px 20px', margin: '10px 0' }}>
                        运行节点测试
                    </button>
                    <div id="log-area" style={{
                        margin: '10px 0',
                        padding: '10px',
                        border: '1px solid #ccc',
                        height: '300px',
                        overflow: 'auto',
                        fontFamily: 'monospace'
                    }}></div>
                </div>
            )}

            {showTreeExample && (
                <div>
                    <h2>行为树示例</h2>
                    <BehaviorTreeExample />
                </div>
            )}
        </div>
    );
};

export default App; 