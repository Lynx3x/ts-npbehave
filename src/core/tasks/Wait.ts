import { Task } from '../Task';
import { NodeResult } from '../Node';

/**
 * 等待节点
 * 等待指定时间的任务节点
 */
export class Wait extends Task {
    /**
     * 等待时间（秒）
     */
    private waitTime: number;

    /**
     * 是否随机化等待时间
     */
    private randomVariation: number;

    /**
     * 计时器ID
     */
    private timerId: NodeJS.Timeout | null = null;

    /**
     * 构造函数
     * @param waitTime 等待时间（秒）
     * @param randomVariation 随机变化量（0-1之间，0表示无随机变化）
     */
    constructor(waitTime: number, randomVariation: number = 0) {
        super('Wait');
        this.waitTime = waitTime;
        this.randomVariation = randomVariation;
    }

    /**
     * 开始等待
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        let waitTime = this.waitTime;

        // 应用随机变化
        if (this.randomVariation > 0) {
            const randomRange = this.waitTime * this.randomVariation;
            waitTime = this.waitTime - randomRange * 0.5 + Math.random() * randomRange;
        }

        // 使用Promise实现异步等待
        return new Promise<NodeResult>((resolve) => {
            this.timerId = setTimeout(async () => {
                this.timerId = null;
                await this.stopped(NodeResult.SUCCESS);
                resolve(NodeResult.SUCCESS);
            }, waitTime * 1000);
        });
    }

    /**
     * 停止等待
     * @returns 停止操作的Promise
     */
    protected override async doStop(): Promise<void> {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        await this.stopped(NodeResult.FAILURE);
    }
} 