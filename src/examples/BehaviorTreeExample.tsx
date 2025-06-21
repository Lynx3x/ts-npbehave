import React, { useEffect, useState } from 'react';
import {
    Selector,
    Sequence,
    Action,
    Wait,
    WaitForCondition,
    Repeater,
    Inverter,
    BlackboardCondition,
    Blackboard,
    Operator,
    NodeResult
} from '../core';

/**
 * 角色状态接口
 */
interface CharacterState {
    name: string;
    energy: number;
    health: number;
    position: { x: number; y: number; };
    status: string;
}

/**
 * 行为树示例组件
 * 展示如何使用行为树控制角色行为
 */
const BehaviorTreeExample: React.FC = () => {
    // 角色状态
    const [character, setCharacter] = useState<CharacterState>({
        name: '示例角色',
        energy: 100,
        health: 100,
        position: { x: 0, y: 0 },
        status: '空闲'
    });

    // 日志
    const [logs, setLogs] = useState<string[]>([]);

    // 添加日志
    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    // 更新角色状态
    const updateCharacter = (updates: Partial<CharacterState>) => {
        setCharacter(prev => ({ ...prev, ...updates }));
    };

    // 消耗能量
    const consumeEnergy = (amount: number) => {
        setCharacter(prev => ({
            ...prev,
            energy: Math.max(0, prev.energy - amount)
        }));
    };

    // 恢复能量
    const restoreEnergy = (amount: number) => {
        setCharacter(prev => ({
            ...prev,
            energy: Math.min(100, prev.energy + amount)
        }));
    };

    // 移动角色
    const moveCharacter = (dx: number, dy: number) => {
        setCharacter(prev => ({
            ...prev,
            position: {
                x: prev.position.x + dx,
                y: prev.position.y + dy
            }
        }));
    };

    useEffect(() => {
        // 创建黑板
        const blackboard = new Blackboard();

        // 初始化黑板数据
        const initBlackboard = async () => {
            await blackboard.set('energy', character.energy);
            await blackboard.set('health', character.health);
            await blackboard.set('position', character.position);
        };

        // 创建行为树
        const createBehaviorTree = async () => {
            await initBlackboard();

            // 探索行为
            const exploreSequence = new Sequence([
                // 检查能量是否足够
                new BlackboardCondition(
                    'energy',
                    Operator.IS_GREATER_OR_EQUAL,
                    20,
                    new Sequence([
                        new Action(async () => {
                            addLog('开始探索周围环境');
                            updateCharacter({ status: '探索中' });
                            return true;
                        }),
                        new Wait(1.0),
                        new Repeater(4,
                            new Sequence([
                                new Action(async () => {
                                    const direction = Math.floor(Math.random() * 4);
                                    const dx = direction === 0 ? 1 : (direction === 1 ? -1 : 0);
                                    const dy = direction === 2 ? 1 : (direction === 3 ? -1 : 0);

                                    addLog(`向方向(${dx}, ${dy})移动`);
                                    moveCharacter(dx, dy);
                                    consumeEnergy(5);
                                    await blackboard.set('energy', character.energy - 5);
                                    await blackboard.set('position', {
                                        x: character.position.x + dx,
                                        y: character.position.y + dy
                                    });

                                    return true;
                                }),
                                new Wait(0.5)
                            ])
                        ),
                        new Action(async () => {
                            addLog('探索完成');
                            return true;
                        })
                    ])
                )
            ]);

            // 休息行为
            const restSequence = new Sequence([
                new Action(async () => {
                    addLog('角色太累了，需要休息');
                    updateCharacter({ status: '休息中' });
                    return true;
                }),
                new Wait(2.0),
                new Action(async () => {
                    const energyGain = 30;
                    addLog(`休息恢复了${energyGain}点能量`);
                    restoreEnergy(energyGain);
                    await blackboard.set('energy', character.energy + energyGain);
                    return true;
                })
            ]);

            // 主行为树
            const mainTree = new Selector([
                exploreSequence,
                restSequence
            ]);

            // 启动行为树
            const result = await mainTree.start();
            addLog(`行为树执行完成，结果: ${NodeResult[result]}`);
            updateCharacter({ status: '空闲' });
        };

        // 启动行为树
        createBehaviorTree();

        // 定期更新黑板数据
        const blackboardUpdateInterval = setInterval(async () => {
            await blackboard.set('energy', character.energy);
            await blackboard.set('health', character.health);
            await blackboard.set('position', character.position);
        }, 1000);

        return () => {
            clearInterval(blackboardUpdateInterval);
        };
    }, []);

    return (
        <div className="behavior-tree-example">
            <h2>行为树示例</h2>

            <div className="character-info">
                <h3>{character.name}</h3>
                <div className="stats">
                    <div>状态: {character.status}</div>
                    <div>能量: {character.energy}/100</div>
                    <div>生命: {character.health}/100</div>
                    <div>位置: ({character.position.x}, {character.position.y})</div>
                </div>
            </div>

            <div className="log-container">
                <h3>行为日志</h3>
                <div className="logs">
                    {logs.map((log, index) => (
                        <div key={index} className="log-entry">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BehaviorTreeExample; 