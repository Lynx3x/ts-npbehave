import { BehaviorTreeBuilder } from '../core/BehaviorTreeBuilder';

/**
 * 从配置文件加载行为树示例
 */
export function loadFromConfigExample() {
    // 示例JSON配置
    const exampleConfig = `{
        "trees": [
            {
                "type": "COMPOSITE.SELECTOR",
                "properties": {
                    "label": "根选择器"
                },
                "children": [
                    {
                        "type": "DECORATOR.BLACKBOARD_CONDITION",
                        "properties": {
                            "label": "检查是否饥饿",
                            "key": "isHungry",
                            "operator": "IS_EQUAL",
                            "value": true
                        },
                        "children": [
                            {
                                "type": "COMPOSITE.SEQUENCE",
                                "properties": {
                                    "label": "进食序列"
                                },
                                "children": [
                                    {
                                        "type": "TASK.ACTION",
                                        "properties": {
                                            "label": "寻找食物",
                                            "actionDescription": "正在寻找食物..."
                                        }
                                    },
                                    {
                                        "type": "TASK.ACTION",
                                        "properties": {
                                            "label": "吃食物",
                                            "actionDescription": "正在吃食物..."
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "COMPOSITE.SEQUENCE",
                        "properties": {
                            "label": "巡逻序列"
                        },
                        "children": [
                            {
                                "type": "TASK.ACTION",
                                "properties": {
                                    "label": "巡逻",
                                    "actionDescription": "正在巡逻..."
                                }
                            },
                            {
                                "type": "TASK.WAIT",
                                "properties": {
                                    "label": "等待",
                                    "waitTime": 2.0,
                                    "randomVariation": 0.5
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }`;

    console.log("从配置加载行为树示例...");

    // 创建行为树构建器
    const builder = new BehaviorTreeBuilder();

    // 从JSON构建行为树
    const behaviorTree = builder.buildFromJson(exampleConfig);

    if (behaviorTree) {
        console.log("行为树加载成功!");

        // 设置黑板值
        behaviorTree.blackboard.set("isHungry", false);

        // 启动行为树
        console.log("启动行为树...");
        behaviorTree.start();

        // 5秒后改变黑板值
        setTimeout(() => {
            console.log("\n改变黑板值: isHungry = true");
            behaviorTree.blackboard.set("isHungry", true);
        }, 5000);

        // 10秒后停止行为树
        setTimeout(() => {
            console.log("\n停止行为树...");
            behaviorTree.stop();
        }, 10000);
    } else {
        console.error("行为树加载失败!");
    }
}

// 如果直接运行此文件则执行示例
if (require.main === module) {
    loadFromConfigExample();
} 