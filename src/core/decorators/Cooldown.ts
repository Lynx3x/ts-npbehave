import { Decorator } from '../Decorator';
import { Node, NodeResult } from '../Node';
import { Clock } from '../Clock';

/**
 * 冷却装饰器
 * 限制子节点在一定时间内只能执行一次
 */
export class Cooldown extends Decorator {
    private cooldownTime: number;
    private lastExecutionTime: number = 0;
    private randomVariation: number;

    /**
     * 构造函数
     * @param cooldownTime 冷却时间（秒）
     * @param decoratee 被装饰的子节点
     * @param randomVariation 随机变化量（0-1之间，影响冷却时间）
     */
    constructor(cooldownTime: number, decoratee: Node, randomVariation: number = 0) {
        super('Cooldown', decoratee);
        this.cooldownTime = cooldownTime;
        this.randomVariation = randomVariation;
    }

    /**
     * 开始执行装饰器
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        // 获取当前时间
        const currentTime = this.clock ? this.clock.getElapsedTime() : Date.now() / 1000;

        // 计算是否已冷却完成
        const elapsedTime = currentTime - this.lastExecutionTime;
        const isCooledDown = elapsedTime >= this.cooldownTime;

        if (isCooledDown) {
            // 更新最后执行时间
            this.lastExecutionTime = currentTime;

            // 开始执行子节点
            return await this.decoratee.start();
        } else {
            // 还在冷却中，直接返回失败
            await this.stopped(NodeResult.FAILURE);
            return NodeResult.FAILURE;
        }
    }

    /**
     * 处理子节点停止事件
     * @param child 停止的子节点
     * @param result 执行结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        // 将结果直接传递给父节点
        await this.stopped(result);
    }

    /**
     * 重置冷却时间
     */
    resetCooldown(): void {
        this.lastExecutionTime = 0;
    }

    /**
     * 设置冷却时间
     * @param cooldownTime 新的冷却时间（秒）
     */
    setCooldownTime(cooldownTime: number): void {
        this.cooldownTime = cooldownTime;
    }
} 