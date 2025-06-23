/**
 * 示例运行脚本
 * 用法: node run-example.js [示例名称]
 * 示例: node run-example.js ObserverTest
 */

const path = require('path');
const { execSync } = require('child_process');

// 获取示例名称
const exampleName = process.argv[2];

if (!exampleName) {
    console.error('请提供示例名称');
    console.log('示例: node run-example.js ObserverTest');
    process.exit(1);
}

// 示例文件路径
const examplePath = path.join('src', 'examples', `${exampleName}.ts`);

// 使用ts-node运行示例
try {
    console.log(`运行示例: ${exampleName}`);
    console.log('----------------------------');

    execSync(`npx ts-node -P tsconfig.node.json ${examplePath}`, {
        stdio: 'inherit'
    });

    console.log('----------------------------');
    console.log(`示例 ${exampleName} 运行完成`);
} catch (error) {
    console.error(`运行示例时出错: ${error.message}`);
    process.exit(1);
} 