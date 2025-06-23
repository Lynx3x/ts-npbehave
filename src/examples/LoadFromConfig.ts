import { BehaviorTreeBuilder } from '../core/BehaviorTreeBuilder';
import { NodeResult } from '../core/Node';
import { TestParent } from './TestParent';

/**
 * 从配置文件加载行为树示例
 */
export async function loadFromConfigExample() {
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

        // 创建测试父节点，用于运行行为树
        const testParent = new TestParent();

        // 为TestParent设置与行为树相同的黑板
        testParent.setBlackboard(behaviorTree.blackboard);

        // 设置黑板值 - 初始设为false，表示不饥饿
        await behaviorTree.blackboard.set("isHungry", false);

        console.log("\n第一次运行 (isHungry = false):");
        console.log("应该执行巡逻序列");
        let result = await testParent.runAndGetResult(behaviorTree.getMainNode());
        console.log(`行为树执行结果: ${NodeResult[result]}`);

        // 第二次运行，改变黑板值
        console.log("\n第二次运行 (isHungry = true):");
        console.log("应该执行进食序列");
        await behaviorTree.blackboard.set("isHungry", true);
        result = await testParent.runAndGetResult(behaviorTree.getMainNode());
        console.log(`行为树执行结果: ${NodeResult[result]}`);

        console.log("\n示例完成!");
    } else {
        console.error("行为树加载失败!");
    }
}

// 如果直接运行此文件则执行示例
if (require.main === module) {
    loadFromConfigExample().catch(err => {
        console.error("示例运行出错:", err);
    });
} 