import React, { useEffect, useState, useRef, useCallback } from 'react';
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
    NodeResult,
    Clock,
    Parallel
} from '../core';
import BehaviorTreeVisualization from './BehaviorTreeVisualization';

/**
 * 行为树节点类型
 */
type BehaviorNodeType = 'selector' | 'sequence' | 'decorator' | 'action' | 'condition' | 'root' | 'wait' | 'repeater';

/**
 * 世界地图单元格类型
 */
type TerrainType = 'grass' | 'forest' | 'mountain' | 'water' | 'desert' | 'cave' | 'village' | 'dungeon';

/**
 * 行为树节点显示接口
 */
interface BehaviorTreeNodeDisplay {
    id: string;
    type: 'root' | 'selector' | 'sequence' | 'decorator' | 'action' | 'condition' | 'wait';
    name: string;
    children?: BehaviorTreeNodeDisplay[];
    isActive?: boolean;
}

/**
 * 世界地图单元格
 */
interface MapCell {
    type: TerrainType;
    explored: boolean;
    hasEnemy: boolean;
    hasItem: boolean;
    hasNPC: boolean;
}

/**
 * 游戏物品接口
 */
interface GameItem {
    id: string;
    name: string;
    type: 'potion' | 'weapon' | 'armor' | 'food' | 'resource' | 'key' | 'material';
    value: number;
    effect?: string;
    damage?: number;
    defense?: number;
}

/**
 * 敌人接口
 */
interface Enemy {
    id: string;
    name: string;
    health: number;
    damage: number;
    defense?: number;
    loot?: GameItem[];
}

/**
 * 角色状态接口
 */
interface CharacterState {
    name: string;
    level: number;
    experience: number;
    maxExperience: number;
    energy: number;
    maxEnergy: number;
    health: number;
    maxHealth: number;
    gold: number;
    attack: number;
    defense: number;
    position: { x: number; y: number; };
    status: string;
    inventory: GameItem[];
    equippedWeapon?: GameItem;
    equippedArmor?: GameItem;
    questActive: boolean;
    questCompleted: boolean;
    currentBehaviorNode?: string; // 当前执行的行为树节点路径
}

/**
 * 颜色常量
 */
const COLORS = {
    grass: '#7cfc00',
    forest: '#228b22',
    mountain: '#a9a9a9',
    water: '#1e90ff',
    desert: '#f4a460',
    cave: '#696969',
    village: '#daa520',
    dungeon: '#800000',
    explored: '#e6e6e6',
    unexplored: '#333333',
    enemy: '#ff0000',
    item: '#ffff00',
    npc: '#00ffff',
    player: '#ff00ff'
};

/**
 * 字符常量
 */
const CHARS = {
    grass: '.',
    forest: 'ʦ',
    mountain: '▲',
    water: '~',
    desert: '░',
    cave: 'O',
    village: '⌂',
    dungeon: '†',
    player: '@',
    enemy: '!',
    item: '$',
    npc: '&'
};

/**
 * 判断一个地形是否安全
 */
const isSafeTerrain = (terrainType: TerrainType): boolean => {
    // 只有草地、村庄视为安全区域
    return ['grass', 'village'].includes(terrainType);
};

/**
 * 行为树示例组件 - DOS风格RPG模拟
 */
const BehaviorTreeExample: React.FC = () => {
    // 游戏地图
    const [worldMap, setWorldMap] = useState<MapCell[][]>([]);
    const mapSize = { width: 20, height: 15 };

    // 自动执行控制
    const [autoRunning, setAutoRunning] = useState<boolean>(false);
    const [ticks, setTicks] = useState<number>(0);

    // 角色状态
    const [character, setCharacter] = useState<CharacterState>({
        name: '冒险者',
        level: 1,
        experience: 0,
        maxExperience: 100,
        energy: 100,
        maxEnergy: 100,
        health: 100,
        maxHealth: 100,
        gold: 50,
        attack: 10,
        defense: 5,
        position: { x: 10, y: 7 },
        status: '空闲',
        inventory: [
            { id: 'potion_1', name: '小型生命药水', type: 'potion', value: 20, effect: '恢复20点生命值' },
            { id: 'food_1', name: '面包', type: 'food', value: 15, effect: '恢复15点能量' }
        ],
        equippedWeapon: { id: 'weapon_1', name: '铁剑', type: 'weapon', value: 10 },
        equippedArmor: { id: 'armor_1', name: '皮甲', type: 'armor', value: 5 },
        questActive: false,
        questCompleted: false,
        currentBehaviorNode: undefined
    });

    // 当前战斗的敌人
    const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);

    // 日志
    const [logs, setLogs] = useState<string[]>([]);

    // 使用refs保存最新状态
    const characterRef = useRef(character);
    const logsRef = useRef(logs);
    const worldMapRef = useRef(worldMap);
    const currentEnemyRef = useRef(currentEnemy);

    // 更新refs
    useEffect(() => {
        characterRef.current = character;
    }, [character]);

    useEffect(() => {
        logsRef.current = logs;
    }, [logs]);

    useEffect(() => {
        worldMapRef.current = worldMap;
    }, [worldMap]);

    useEffect(() => {
        currentEnemyRef.current = currentEnemy;
    }, [currentEnemy]);

    // 行为树结构可视化
    const [behaviorTreeStructure, setBehaviorTreeStructure] = useState<BehaviorTreeNodeDisplay>({
        id: 'root',
        type: 'root',
        name: '根节点',
        children: [
            {
                id: 'main-selector',
                type: 'selector',
                name: '主选择器',
                children: [
                    {
                        id: 'survival',
                        type: 'sequence',
                        name: '生存序列',
                        children: [
                            {
                                id: 'rest-condition',
                                type: 'condition',
                                name: '休息条件',
                                children: [
                                    {
                                        id: 'rest-sequence',
                                        type: 'sequence',
                                        name: '休息动作',
                                        children: [
                                            { id: 'rest-start', type: 'action', name: '开始休息' },
                                            { id: 'rest-wait', type: 'wait', name: '休息时间' },
                                            { id: 'rest-recover', type: 'action', name: '恢复能量' }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: 'health-condition',
                                type: 'condition',
                                name: '低生命条件',
                                children: [
                                    {
                                        id: 'healing',
                                        type: 'sequence',
                                        name: '治疗序列',
                                        children: [
                                            { id: 'heal-action', type: 'action', name: '使用治疗' }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'combat',
                        type: 'sequence',
                        name: '战斗序列',
                        children: [
                            {
                                id: 'combat-condition',
                                type: 'condition',
                                name: '战斗条件',
                                children: [
                                    {
                                        id: 'combat-sequence',
                                        type: 'sequence',
                                        name: '战斗动作',
                                        children: [
                                            { id: 'combat-action', type: 'action', name: '战斗行为' },
                                            { id: 'combat-wait', type: 'wait', name: '战斗间隔' }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'interaction',
                        type: 'sequence',
                        name: '互动序列',
                        children: [
                            {
                                id: 'village-condition',
                                type: 'condition',
                                name: '村庄条件',
                                children: [
                                    {
                                        id: 'no-combat-condition',
                                        type: 'condition',
                                        name: '非战斗条件',
                                        children: [
                                            {
                                                id: 'npc-interaction',
                                                type: 'sequence',
                                                name: 'NPC交互',
                                                children: [
                                                    { id: 'talk-action', type: 'action', name: '对话行为' },
                                                    { id: 'talk-wait', type: 'wait', name: '对话等待' }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: 'quest-condition',
                                type: 'condition',
                                name: '任务条件',
                                children: [
                                    { id: 'quest-search', type: 'action', name: '任务搜索' }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'explore',
                        type: 'sequence',
                        name: '探索序列',
                        children: [
                            {
                                id: 'explore-condition-1',
                                type: 'condition',
                                name: '非战斗条件',
                                children: [
                                    {
                                        id: 'explore-condition-2',
                                        type: 'condition',
                                        name: '能量条件',
                                        children: [
                                            {
                                                id: 'explore-sequence',
                                                type: 'sequence',
                                                name: '探索行为',
                                                children: [
                                                    { id: 'check-env', type: 'action', name: '环境检查' },
                                                    { id: 'explore-wait', type: 'wait', name: '探索等待' },
                                                    { id: 'move-action', type: 'action', name: '移动行为' }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    // 更新特定行为节点的活跃状态
    const updateActiveNode = (path: string) => {
        // 根据路径更新活跃节点
        const pathParts = path.split(' → ');
        if (pathParts.length < 1) return;

        const findAndUpdateNode = (
            node: BehaviorTreeNodeDisplay,
            currentPath: string[],
            targetPath: string[],
            depth: number
        ): BehaviorTreeNodeDisplay => {
            if (depth >= targetPath.length) return node;

            let nodeName = '';
            if (node.name === '根节点') nodeName = 'Root';
            else if (targetPath[depth].includes(node.name)) nodeName = targetPath[depth];
            else return { ...node, isActive: false };

            currentPath.push(nodeName);

            // 检查是否匹配当前层级
            const isMatch = targetPath[depth].includes(node.name);

            // 创建节点的副本
            const updatedNode: BehaviorTreeNodeDisplay = {
                ...node,
                isActive: isMatch && depth === targetPath.length - 1
            };

            // 递归更新子节点
            if (node.children && isMatch) {
                updatedNode.children = node.children.map(child =>
                    findAndUpdateNode(child, [...currentPath], targetPath, depth + 1)
                );
            }

            return updatedNode;
        };

        setBehaviorTreeStructure(prevTree =>
            findAndUpdateNode(prevTree, [], pathParts, 0)
        );

        // 更新当前执行的节点路径
        setCharacter(prev => ({
            ...prev,
            currentBehaviorNode: path
        }));
    };

    // 添加日志
    const addLog = (message: string) => {
        if (message.startsWith('[') && message.includes(']')) {
            // 可能包含了行为节点路径
            const match = message.match(/\[(.*?)\]/g);
            if (match && match.length > 1) {
                const path = match.map(m => m.replace(/[\[\]]/g, '')).join(' → ');
                setCharacter(prev => ({
                    ...prev,
                    currentBehaviorNode: path
                }));
            }
        }

        setLogs(prev => {
            const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] ${message}`];
            // 保留最后50条日志
            if (newLogs.length > 50) {
                return newLogs.slice(newLogs.length - 50);
            }
            return newLogs;
        });
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
            energy: Math.min(prev.maxEnergy, prev.energy + amount)
        }));
    };

    // 消耗生命值
    const takeDamage = (amount: number) => {
        setCharacter(prev => ({
            ...prev,
            health: Math.max(0, prev.health - amount)
        }));
    };

    // 恢复生命值
    const healCharacter = (amount: number) => {
        setCharacter(prev => ({
            ...prev,
            health: Math.min(prev.maxHealth, prev.health + amount)
        }));
    };

    // 获得经验值
    const gainExperience = (amount: number) => {
        setCharacter(prev => {
            let newExp = prev.experience + amount;
            let newLevel = prev.level;
            let newMaxExp = prev.maxExperience;

            // 升级检查
            if (newExp >= prev.maxExperience) {
                newExp -= prev.maxExperience;
                newLevel++;
                newMaxExp = Math.floor(prev.maxExperience * 1.5);

                // 升级奖励
                return {
                    ...prev,
                    level: newLevel,
                    experience: newExp,
                    maxExperience: newMaxExp,
                    maxHealth: prev.maxHealth + 10,
                    health: prev.maxHealth + 10,
                    maxEnergy: prev.maxEnergy + 5,
                    energy: prev.maxEnergy + 5,
                    attack: prev.attack + 2,
                    defense: prev.defense + 1
                };
            }

            return {
                ...prev,
                experience: newExp
            };
        });
    };

    // 获得金币
    const gainGold = (amount: number) => {
        setCharacter(prev => ({
            ...prev,
            gold: prev.gold + amount
        }));
    };

    // 移动角色
    const moveCharacter = (dx: number, dy: number) => {
        setCharacter(prev => {
            const newX = Math.max(0, Math.min(mapSize.width - 1, prev.position.x + dx));
            const newY = Math.max(0, Math.min(mapSize.height - 1, prev.position.y + dy));

            // 检查是否可以移动到该位置
            if (worldMapRef.current[newY] &&
                worldMapRef.current[newY][newX] &&
                worldMapRef.current[newY][newX].type !== 'water' &&
                worldMapRef.current[newY][newX].type !== 'mountain') {

                // 标记新区域为已探索
                const newMap = [...worldMapRef.current];
                for (let y = Math.max(0, newY - 1); y <= Math.min(mapSize.height - 1, newY + 1); y++) {
                    for (let x = Math.max(0, newX - 1); x <= Math.min(mapSize.width - 1, newX + 1); x++) {
                        if (newMap[y] && newMap[y][x]) {
                            newMap[y][x].explored = true;
                        }
                    }
                }
                setWorldMap(newMap);

                return {
                    ...prev,
                    position: { x: newX, y: newY }
                };
            }
            return prev;
        });
    };

    // 获取当前位置的地图单元格
    const getCurrentCell = (): MapCell | null => {
        const { x, y } = characterRef.current.position;
        if (worldMapRef.current[y] && worldMapRef.current[y][x]) {
            return worldMapRef.current[y][x];
        }
        return null;
    };

    // 随机生成敌人
    const generateRandomEnemy = (difficulty: number): Enemy => {
        const types = [
            { name: '小型史莱姆', baseDamage: 3, baseHealth: 20 },
            { name: '森林狼', baseDamage: 5, baseHealth: 30 },
            { name: '山地豺狼人', baseDamage: 7, baseHealth: 40 },
            { name: '洞穴蝙蝠', baseDamage: 4, baseHealth: 25 },
            { name: '沙漠蝎子', baseDamage: 8, baseHealth: 35 },
            { name: '地牢骷髅', baseDamage: 10, baseHealth: 50 }
        ];

        const enemyType = types[Math.floor(Math.random() * types.length)];
        const id = `enemy_${Date.now()}`;
        const healthMultiplier = 1 + (difficulty * 0.2);
        const damageMultiplier = 1 + (difficulty * 0.1);

        // 随机物品
        const loot: GameItem[] = [];
        if (Math.random() < 0.3) {
            loot.push({
                id: `potion_${Date.now()}`,
                name: '生命药水',
                type: 'potion',
                value: 20,
                effect: '恢复20点生命值'
            });
        }

        if (Math.random() < 0.2) {
            loot.push({
                id: `resource_${Date.now()}`,
                name: '兽皮',
                type: 'resource',
                value: 5
            });
        }

        return {
            id,
            name: enemyType.name,
            health: Math.floor(enemyType.baseHealth * healthMultiplier),
            damage: Math.floor(enemyType.baseDamage * damageMultiplier),
            loot
        };
    };

    // 生成随机物品
    const generateRandomItem = (): GameItem => {
        const types = [
            { name: '生命药水', type: 'potion', value: 20, effect: '恢复20点生命值' },
            { name: '活力药水', type: 'potion', value: 15, effect: '恢复15点能量' },
            { name: '干粮', type: 'food', value: 10, effect: '恢复10点能量' },
            { name: '铜矿石', type: 'resource', value: 5 },
            { name: '银矿石', type: 'resource', value: 10 },
            { name: '铁矿石', type: 'resource', value: 15 }
        ];

        const itemType = types[Math.floor(Math.random() * types.length)];
        return {
            id: `item_${Date.now()}`,
            name: itemType.name,
            type: itemType.type as any,
            value: itemType.value,
            effect: itemType.effect
        };
    };

    // 拾取物品
    const pickupItem = (item: GameItem) => {
        setCharacter(prev => ({
            ...prev,
            inventory: [...prev.inventory, item]
        }));
    };

    // 使用物品
    const useItem = (itemId: string) => {
        setCharacter(prev => {
            const item = prev.inventory.find(i => i.id === itemId);
            if (!item) return prev;

            const newInventory = prev.inventory.filter(i => i.id !== itemId);

            if (item.type === 'potion' && item.effect?.includes('生命值')) {
                healCharacter(item.value);
            } else if (item.type === 'food' || (item.type === 'potion' && item.effect?.includes('能量'))) {
                restoreEnergy(item.value);
            }

            return {
                ...prev,
                inventory: newInventory
            };
        });
    };

    // 战斗计算
    const calculateCombat = (enemy: Enemy) => {
        // 玩家攻击
        const playerDamage = Math.max(1, characterRef.current.attack - Math.floor(enemy.defense || 0));
        const newEnemyHealth = Math.max(0, enemy.health - playerDamage);

        addLog(`你对${enemy.name}造成了${playerDamage}点伤害!`);

        if (newEnemyHealth <= 0) {
            // 敌人死亡
            addLog(`你击败了${enemy.name}!`);
            gainExperience(Math.floor(enemy.damage * 2 + enemy.health / 5));
            gainGold(Math.floor(Math.random() * 10) + 5);

            // 掉落物品
            if (enemy.loot && enemy.loot.length > 0) {
                enemy.loot.forEach(item => {
                    addLog(`获得物品: ${item.name}`);
                    pickupItem(item);
                });
            }

            setCurrentEnemy(null);
            return null;
        } else {
            // 敌人存活并反击
            const enemyDamage = Math.max(1, enemy.damage - characterRef.current.defense);
            takeDamage(enemyDamage);
            addLog(`${enemy.name}对你造成了${enemyDamage}点伤害!`);

            const updatedEnemy = { ...enemy, health: newEnemyHealth };
            setCurrentEnemy(updatedEnemy);
            return updatedEnemy;
        }
    };

    // 生成游戏地图
    const generateWorldMap = () => {
        const newMap: MapCell[][] = [];

        for (let y = 0; y < mapSize.height; y++) {
            const row: MapCell[] = [];
            for (let x = 0; x < mapSize.width; x++) {
                // 生成不同的地形
                let type: TerrainType = 'grass';
                let hasEnemy = false;
                let hasItem = false;
                let hasNPC = false;

                // 随机地形，简化为仅有少量地形类型
                const random = Math.random();
                if (random < 0.7) type = 'grass';
                else if (random < 0.85) type = 'forest';
                else if (random < 0.9) type = 'mountain';
                else if (random < 0.95) type = 'water';
                else if (random < 0.97) type = 'cave';
                else if (random < 0.99) type = 'village';
                else type = 'dungeon';

                // 减少敌人和物品的密度
                if (type !== 'water' && type !== 'mountain' && Math.random() < 0.08) hasEnemy = true;
                if (type !== 'water' && type !== 'mountain' && Math.random() < 0.04) hasItem = true;
                if ((type === 'village') && Math.random() < 0.5) hasNPC = true;

                // 地图边缘设置为山脉
                if (x === 0 || y === 0 || x === mapSize.width - 1 || y === mapSize.height - 1) {
                    type = 'mountain';
                    hasEnemy = false;
                    hasItem = false;
                    hasNPC = false;
                }

                // 初始位置和周围设置为草地，没有敌人
                if ((x >= 9 && x <= 11) && (y >= 6 && y <= 8)) {
                    type = 'grass';
                    hasEnemy = false;
                    hasItem = false;
                    hasNPC = false;
                }

                row.push({
                    type,
                    explored: (x >= 9 && x <= 11) && (y >= 6 && y <= 8), // 初始只探索玩家周围
                    hasEnemy,
                    hasItem,
                    hasNPC
                });
            }
            newMap.push(row);
        }

        // 确保有一个村庄和一个洞穴
        newMap[3][3].type = 'village';
        newMap[3][3].hasEnemy = false;
        newMap[3][3].hasNPC = true;

        newMap[mapSize.height - 3][mapSize.width - 3].type = 'cave';

        setWorldMap(newMap);
        return newMap;
    };

    // 创建行为树逻辑
    useEffect(() => {
        // 初始化世界地图
        generateWorldMap();
    }, []);

    // 行为树自动执行控制
    useEffect(() => {
        // 设置定时执行行为树
        let interval: NodeJS.Timeout | null = null;

        if (autoRunning) {
            interval = setInterval(() => {
                setTicks(prev => prev + 1);
                const result = executeBehaviorTree();
                addLog(`当前行为树执行周期完成，结果: ${result ? 'SUCCESS' : 'FAILURE'}`);
            }, 2000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [autoRunning]);

    // 行为树执行函数
    const executeBehaviorTree = (): boolean => {
        addLog('[Root] 启动行为树周期...');

        // 生存序列
        if (character.health < character.maxHealth * 0.3) {
            addLog('[Root] → [主选择器] → [生存序列] 检查生存条件（低生命值）');
            addLog('[生存序列] → [低生命条件] 检查是否需要治疗');

            if (character.health < character.maxHealth * 0.3) {
                // 治疗序列
                const hasHealthPotion = character.inventory.some(item => item.type === 'potion' && item.effect === 'health');

                if (hasHealthPotion) {
                    addLog('[低生命条件] → [治疗序列] → [使用治疗] 使用生命药剂');

                    const potionIndex = character.inventory.findIndex(item =>
                        item.type === 'potion' && item.effect === 'health');

                    if (potionIndex >= 0) {
                        const potion = character.inventory[potionIndex];
                        const newInventory = [...character.inventory];
                        newInventory.splice(potionIndex, 1);

                        setCharacter(prev => ({
                            ...prev,
                            health: Math.min(prev.maxHealth, prev.health + 30),
                            inventory: newInventory
                        }));

                        addLog(`[使用治疗] 使用了${potion.name}，恢复30点生命值`);
                        return true; // SUCCESS
                    }
                } else {
                    addLog('[治疗序列] 没有治疗药剂，序列失败');
                }
            }
        }

        // 休息逻辑
        if (character.energy < character.maxEnergy * 0.3) {
            addLog('[Root] → [主选择器] → [生存序列] → [休息条件] 检查是否需要休息');

            if (character.energy < character.maxEnergy * 0.3 &&
                character.status !== 'combat' &&
                isSafeTerrain(worldMap[character.position.y][character.position.x].type)) {

                addLog('[休息条件] → [休息序列] → [开始休息] 在安全区域开始休息');

                addLog('[休息序列] → [休息时间] 休息中...');

                setCharacter(prev => ({
                    ...prev,
                    status: 'resting',
                    energy: Math.min(prev.maxEnergy, prev.energy + 20)
                }));

                addLog('[休息序列] → [恢复能量] 休息恢复了20点能量');
                return true; // SUCCESS
            }
        }

        // 如果在战斗中
        if (character.status === 'combat') {
            addLog('[Root] → [主选择器] → [战斗序列] → [战斗条件] 检查是否处于战斗中');
            addLog('[战斗条件] → [战斗序列] → [战斗行为] 执行战斗动作');

            // 这里可以添加战斗逻辑
            const combatResult = Math.random();

            if (combatResult > 0.7) {
                addLog('[战斗行为] 战斗胜利！');
                setCharacter(prev => ({
                    ...prev,
                    status: 'normal',
                    health: Math.max(1, prev.health - Math.floor(Math.random() * 10)),
                    energy: Math.max(1, prev.energy - 10),
                    gold: prev.gold + Math.floor(Math.random() * 10) + 5
                }));
                return true; // SUCCESS
            } else if (combatResult > 0.2) {
                addLog('[战斗行为] 战斗继续...');
                setCharacter(prev => ({
                    ...prev,
                    health: Math.max(1, prev.health - Math.floor(Math.random() * 10)),
                    energy: Math.max(1, prev.energy - 5)
                }));
                return true; // RUNNING
            } else {
                addLog('[战斗行为] 逃跑！');
                setCharacter(prev => ({
                    ...prev,
                    status: 'normal',
                    health: Math.max(1, prev.health - Math.floor(Math.random() * 15)),
                    energy: Math.max(1, prev.energy - 15)
                }));
                return true; // SUCCESS (逃跑也算成功结束战斗)
            }
        }

        // 互动序列 - 村庄交互
        const currentCell = worldMap[character.position.y][character.position.x];
        if (currentCell.type === 'village' && character.status !== 'combat') {
            addLog('[Root] → [主选择器] → [互动序列] → [村庄条件] 检查是否在村庄');
            addLog('[村庄条件] → [非战斗条件] → [NPC交互] 与村民交流');

            // 村庄交互逻辑
            const interactionResult = Math.random();

            if (interactionResult > 0.7) {
                // 获得任务
                addLog('[NPC交互] 村民给了你一个任务');
                setCharacter(prev => ({
                    ...prev,
                    questActive: true,
                    status: 'quest'
                }));
                return true; // SUCCESS
            } else if (interactionResult > 0.4) {
                // 交易
                const goldChange = Math.floor(Math.random() * 10) - 5;
                addLog(`[NPC交互] 与商人交易，${goldChange >= 0 ? '获得' : '失去'}了${Math.abs(goldChange)}金币`);

                setCharacter(prev => ({
                    ...prev,
                    gold: Math.max(0, prev.gold + goldChange)
                }));
                return true; // SUCCESS
            } else {
                // 休息
                addLog('[NPC交互] 在村庄休息');
                setCharacter(prev => ({
                    ...prev,
                    energy: Math.min(prev.maxEnergy, prev.energy + 10),
                    health: Math.min(prev.maxHealth, prev.health + 5)
                }));
                return true; // SUCCESS
            }
        }

        // 任务逻辑
        if (character.questActive && !character.questCompleted) {
            addLog('[Root] → [主选择器] → [互动序列] → [任务条件] 检查是否有进行中的任务');
            addLog('[任务条件] → [任务搜索] 搜索任务目标');

            // 任务完成概率
            if (Math.random() > 0.8) {
                addLog('[任务搜索] 任务完成！');
                setCharacter(prev => ({
                    ...prev,
                    questActive: false,
                    questCompleted: true,
                    gold: prev.gold + 20,
                    experience: prev.experience + 25
                }));
                return true; // SUCCESS
            } else {
                addLog('[任务搜索] 继续寻找任务目标...');
                // 消耗能量
                setCharacter(prev => ({
                    ...prev,
                    energy: Math.max(1, prev.energy - 5)
                }));
                return true; // RUNNING
            }
        }

        // 探索序列 - 默认行为
        if (character.status !== 'combat' && character.energy > character.maxEnergy * 0.1) {
            addLog('[Root] → [主选择器] → [探索序列] → [非战斗条件] → [能量条件] 检查是否能够探索');
            addLog('[探索序列] → [环境检查] 检查周围环境');

            // 随机移动
            const moves = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];

            // 过滤掉会走出地图边界的移动
            const validMoves = moves.filter(move => {
                const newX = character.position.x + move.x;
                const newY = character.position.y + move.y;
                return newX >= 0 && newX < mapSize.width && newY >= 0 && newY < mapSize.height &&
                    worldMap[newY][newX].type !== 'water'; // 不能走到水里
            });

            if (validMoves.length > 0) {
                const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                const newX = character.position.x + move.x;
                const newY = character.position.y + move.y;

                addLog('[探索序列] → [移动行为] 向附近移动');

                // 移动并消耗能量
                setCharacter(prev => ({
                    ...prev,
                    position: { x: newX, y: newY },
                    energy: Math.max(1, prev.energy - 5)
                }));

                // 检查移动后的新地形
                const newCell = worldMap[newY][newX];

                // 根据地形触发事件
                if (newCell.type === 'dungeon') {
                    if (Math.random() > 0.5) {
                        // 遇到敌人
                        addLog('[环境检查] 在地牢中遇到了敌人！');
                        setCharacter(prev => ({
                            ...prev,
                            status: 'combat'
                        }));
                    } else {
                        // 找到宝藏
                        const treasureGold = Math.floor(Math.random() * 20) + 10;
                        addLog(`[环境检查] 在地牢中发现了宝藏！获得了${treasureGold}金币`);
                        setCharacter(prev => ({
                            ...prev,
                            gold: prev.gold + treasureGold
                        }));
                    }
                } else if (newCell.type === 'forest' && Math.random() > 0.7) {
                    // 在森林里遇到敌人
                    addLog('[环境检查] 在森林中遇到了敌人！');
                    setCharacter(prev => ({
                        ...prev,
                        status: 'combat'
                    }));
                } else if (newCell.type === 'mountain' && Math.random() > 0.8) {
                    // 在山上找到矿物
                    addLog('[环境检查] 在山上发现了矿物！');
                    setCharacter(prev => ({
                        ...prev,
                        inventory: [...prev.inventory, {
                            id: `mineral-${Date.now()}`,
                            name: '矿石',
                            type: 'material',
                            value: 15,
                            effect: 'none'
                        } as GameItem]
                    }));
                }

                return true; // SUCCESS
            } else {
                addLog('[探索序列] 无处可去，探索失败');
                return false; // FAILURE
            }
        }

        addLog('[Root] 行为树执行完毕，所有条件都不满足');
        return false; // FAILURE
    };

    // 渲染ASCII地图
    const renderMap = () => {
        if (worldMap.length === 0) return null;

        return (
            <div style={{
                fontFamily: 'monospace',
                whiteSpace: 'pre',
                fontSize: '16px',
                lineHeight: '1',
                backgroundColor: '#000',
                color: '#ccc',
                padding: '10px',
                borderRadius: '5px',
                overflowX: 'auto'
            }}>
                {worldMap.map((row, y) => (
                    <div key={y}>
                        {row.map((cell, x) => {
                            // 角色位置
                            if (x === character.position.x && y === character.position.y) {
                                return <span key={x} style={{ color: COLORS.player }}>{CHARS.player}</span>;
                            }

                            // 未探索的区域显示为黑色
                            if (!cell.explored) {
                                return <span key={x} style={{ color: COLORS.unexplored }}>?</span>;
                            }

                            // 显示NPC
                            if (cell.hasNPC) {
                                return <span key={x} style={{ color: COLORS.npc }}>{CHARS.npc}</span>;
                            }

                            // 显示敌人
                            if (cell.hasEnemy) {
                                return <span key={x} style={{ color: COLORS.enemy }}>{CHARS.enemy}</span>;
                            }

                            // 显示物品
                            if (cell.hasItem) {
                                return <span key={x} style={{ color: COLORS.item }}>{CHARS.item}</span>;
                            }

                            // 显示地形
                            let color = '';
                            let char = '';

                            switch (cell.type) {
                                case 'grass':
                                    color = COLORS.grass;
                                    char = CHARS.grass;
                                    break;
                                case 'forest':
                                    color = COLORS.forest;
                                    char = CHARS.forest;
                                    break;
                                case 'mountain':
                                    color = COLORS.mountain;
                                    char = CHARS.mountain;
                                    break;
                                case 'water':
                                    color = COLORS.water;
                                    char = CHARS.water;
                                    break;
                                case 'desert':
                                    color = COLORS.desert;
                                    char = CHARS.desert;
                                    break;
                                case 'cave':
                                    color = COLORS.cave;
                                    char = CHARS.cave;
                                    break;
                                case 'village':
                                    color = COLORS.village;
                                    char = CHARS.village;
                                    break;
                                case 'dungeon':
                                    color = COLORS.dungeon;
                                    char = CHARS.dungeon;
                                    break;
                                default:
                                    color = '#fff';
                                    char = '?';
                            }

                            return <span key={x} style={{ color }}>{char}</span>;
                        })}
                    </div>
                ))}
                <div style={{ marginTop: '10px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                    图例:
                    <span style={{ color: COLORS.player, margin: '0 10px' }}>{CHARS.player}=角色</span>
                    <span style={{ color: COLORS.enemy, margin: '0 10px' }}>{CHARS.enemy}=敌人</span>
                    <span style={{ color: COLORS.item, margin: '0 10px' }}>{CHARS.item}=物品</span>
                    <span style={{ color: COLORS.npc, margin: '0 10px' }}>{CHARS.npc}=NPC</span>
                    <span style={{ color: COLORS.village, margin: '0 10px' }}>{CHARS.village}=村庄</span>
                    <span style={{ color: COLORS.cave, margin: '0 10px' }}>{CHARS.cave}=洞穴</span>
                    <span style={{ color: COLORS.dungeon, margin: '0 10px' }}>{CHARS.dungeon}=地牢</span>
                </div>
            </div>
        );
    };

    // 渲染战斗状态
    const renderCombat = () => {
        if (!currentEnemy) return null;

        return (
            <div style={{
                border: '1px solid #f00',
                borderRadius: '5px',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: 'rgba(255,0,0,0.1)'
            }}>
                <h4>战斗状态</h4>
                <div><strong>{currentEnemy.name}</strong> HP: {currentEnemy.health}</div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginTop: '5px'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.max(0, currentEnemy.health)}%`,
                        backgroundColor: '#f00'
                    }}></div>
                </div>
            </div>
        );
    };

    // 渲染物品栏
    const renderInventory = () => {
        return (
            <div>
                <h4>物品栏</h4>
                {character.inventory.length === 0 ? (
                    <div style={{ fontStyle: 'italic', color: '#999' }}>空</div>
                ) : (
                    <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
                        {character.inventory.map(item => (
                            <li key={item.id}>
                                {item.name}
                                {item.effect && <span style={{ color: '#666' }}> ({item.effect})</span>}
                            </li>
                        ))}
                    </ul>
                )}
                <div style={{ marginTop: '5px' }}>
                    <strong>装备:</strong> {character.equippedWeapon?.name || '无'} / {character.equippedArmor?.name || '无'}
                </div>
            </div>
        );
    };

    // 渲染行为树节点
    const renderBehaviorTreeNode = (node: BehaviorTreeNodeDisplay, depth: number = 0): JSX.Element => {
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

    // 渲染行为树结构
    const renderBehaviorTree = () => {
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
                {renderBehaviorTreeNode(behaviorTreeStructure)}

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
            </div>
        );
    };

    return (
        <div className="dos-game" style={{
            fontFamily: 'monospace',
            backgroundColor: '#000',
            color: '#ccc',
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            border: '2px solid #333'
        }}>
            <div style={{ borderBottom: '1px solid #555', paddingBottom: '10px', marginBottom: '20px' }}>
                <h2 style={{ color: '#0f0', margin: '0 0 10px 0' }}>
                    TS-NPBehave 行为树示例 - 复杂行为树结构
                </h2>
                <div style={{ color: '#0f0' }}>
                    ==========================================================================
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap' }}>
                {/* 左侧：行为树可视化 */}
                <div style={{ flex: '1.5 1 400px', minWidth: '400px' }}>
                    <h3 style={{ color: '#0f0' }}>NPBehave 行为树</h3>
                    <BehaviorTreeVisualization
                        tree={behaviorTreeStructure}
                        currentPath={character.currentBehaviorNode}
                    />
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#777' }}>
                        行为树结构通过优先级顺序的选择器（Selector）组织多个行为序列（Sequence），从上到下依次尝试执行。
                        每个序列只有在前一个节点成功的情况下才继续执行后续节点。选择器会选择第一个成功的子节点执行路径。
                    </div>
                </div>

                {/* 右侧：地图和状态 */}
                <div style={{ flex: '1 1 600px', minWidth: '400px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {/* 上部：地图 */}
                        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                            <h3 style={{ color: '#0f0' }}>世界地图</h3>
                            {renderMap()}

                            {renderCombat()}
                        </div>

                        {/* 上部：角色状态 */}
                        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                            <h3 style={{ color: '#0f0' }}>角色状态</h3>
                            <div style={{
                                backgroundColor: '#111',
                                padding: '10px',
                                border: '1px solid #333',
                                marginBottom: '20px'
                            }}>
                                <div style={{ marginBottom: '5px' }}>
                                    <strong style={{ color: '#0f0' }}>{character.name}</strong> Lv.{character.level} ({character.status})
                                </div>

                                <div>HP: {character.health}/{character.maxHealth}</div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#333',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    marginBottom: '10px'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(character.health / character.maxHealth) * 100}%`,
                                        backgroundColor: '#f00'
                                    }}></div>
                                </div>

                                <div>能量: {character.energy}/{character.maxEnergy}</div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#333',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    marginBottom: '10px'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(character.energy / character.maxEnergy) * 100}%`,
                                        backgroundColor: '#00f'
                                    }}></div>
                                </div>

                                {renderInventory()}
                            </div>
                        </div>
                    </div>

                    {/* 下部：行为树执行日志 */}
                    <div>
                        <h3 style={{ color: '#0f0' }}>行为树执行日志</h3>
                        <div style={{
                            backgroundColor: '#111',
                            border: '1px solid #333',
                            height: '300px',
                            overflow: 'auto',
                            padding: '10px',
                            fontFamily: 'monospace'
                        }}>
                            {logs.length === 0 ? (
                                <div style={{ color: '#666', fontStyle: 'italic' }}>等待行为树执行...</div>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} style={{
                                        borderBottom: '1px dotted #333',
                                        paddingBottom: '2px',
                                        marginBottom: '2px'
                                    }}>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* 控制按钮 */}
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => {
                                    const result = executeBehaviorTree();
                                    addLog(`当前行为树执行周期完成，结果: ${result ? 'SUCCESS' : 'FAILURE'}`);
                                }}
                                style={{
                                    backgroundColor: '#222',
                                    color: '#0f0',
                                    border: '1px solid #0f0',
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                执行行为树
                            </button>

                            <button
                                onClick={() => setAutoRunning(!autoRunning)}
                                style={{
                                    backgroundColor: '#222',
                                    color: autoRunning ? '#f00' : '#0f0',
                                    border: `1px solid ${autoRunning ? '#f00' : '#0f0'}`,
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                {autoRunning ? '停止自动执行' : '开始自动执行'}
                            </button>

                            <button
                                onClick={() => setCharacter(prev => ({
                                    ...prev,
                                    health: Math.max(1, prev.health - 20)
                                }))}
                                style={{
                                    backgroundColor: '#222',
                                    color: '#f00',
                                    border: '1px solid #f00',
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                减少生命值
                            </button>

                            <button
                                onClick={() => setCharacter(prev => ({
                                    ...prev,
                                    energy: Math.max(1, prev.energy - 20)
                                }))}
                                style={{
                                    backgroundColor: '#222',
                                    color: '#00f',
                                    border: '1px solid #00f',
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                减少能量值
                            </button>

                            <button
                                onClick={() => setCharacter(prev => ({
                                    ...prev,
                                    status: prev.status === 'combat' ? 'normal' : 'combat'
                                }))}
                                style={{
                                    backgroundColor: '#222',
                                    color: '#ff0',
                                    border: '1px solid #ff0',
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                切换战斗状态
                            </button>

                            <button
                                onClick={() => {
                                    if (worldMap[character.position.y][character.position.x].type !== 'village') {
                                        // 找到最近的村庄
                                        let villageFound = false;
                                        let closestVillage = { x: 0, y: 0 };

                                        for (let y = 0; y < mapSize.height; y++) {
                                            for (let x = 0; x < mapSize.width; x++) {
                                                if (worldMap[y][x].type === 'village') {
                                                    closestVillage = { x, y };
                                                    villageFound = true;
                                                    break;
                                                }
                                            }
                                            if (villageFound) break;
                                        }

                                        if (villageFound) {
                                            addLog('快速传送到村庄');
                                            setCharacter(prev => ({
                                                ...prev,
                                                position: closestVillage,
                                                energy: Math.max(1, prev.energy - 20)
                                            }));
                                        }
                                    }
                                }}
                                style={{
                                    backgroundColor: '#222',
                                    color: '#0ff',
                                    border: '1px solid #0ff',
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                传送至村庄
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BehaviorTreeExample; 