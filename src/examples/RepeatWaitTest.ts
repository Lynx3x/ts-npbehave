import { Sequence, Action, Wait, Repeater } from '../core';
import { TestParent } from './TestParent';

/**
 * 测试重复执行Wait节点
 */
async function testRepeatedWait() {
    console.log("开始测试重复Wait节点...");

    const testParent = new TestParent();

    // 创建一个包含Wait的重复序列
    const waitSequence = new Sequence([
        new Action(async () => {
            console.log("执行动作前...");
            return true;
        }),
        new Wait(1.0), // 等待1秒
        new Action(async () => {
            console.log("执行动作后...");
            return true;
        })
    ]);

    // 使用Repeater重复执行3次
    const repeater = new Repeater(3, waitSequence);

    // 运行并获取结果
    console.log("开始执行...");
    console.log("注意每次Wait之间的时间间隔，应该都是约1秒");

    const startTime = Date.now();
    const result = await testParent.runAndGetResult(repeater);
    const endTime = Date.now();

    console.log(`执行完成，结果: ${result}`);
    console.log(`总执行时间: ${(endTime - startTime) / 1000}秒`);
    console.log("测试完成");
}

// 执行测试
if (require.main === module) {
    testRepeatedWait().catch(err => {
        console.error("测试出错:", err);
    });
}

export { testRepeatedWait }; 