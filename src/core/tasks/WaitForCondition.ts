import { Task } from '../Task';
import { NodeResult } from '../Node';

/**
 * 条件函数类型定义
 * 支持同步和异步操作
 */
export type ConditionFunction = () => boolean | Promise<boolean>;

/**
 * 等待条件节点
 * 等待直到条件满足或超时
 */
export class WaitForCondition extends Task {
    private condition: ConditionFunction;
    private checkInterval: number;
    private timeout: number;
    private timerId: NodeJS.Timeout | null = null;
    private timeoutId: NodeJS.Timeout | null = null;
    private startTime: number = 0;

    /**
     * 构造函数
     * @param condition 条件函数，返回true时任务成功
     * @param checkInterval 检查条件的间隔时间（秒），默认0.1秒
     * @param timeout 超时时间（秒），超过这个时间条件仍未满足则失败，默认为0（无超时）
     */
    constructor(condition: ConditionFunction, checkInterval: number = 0.1, timeout: number = 0) {
        super('WaitForCondition');
        this.condition = condition;
        this.checkInterval = checkInterval;
        this.timeout = timeout;
    }

    /**
     * 开始等待条件
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        // 记录开始时间
        this.startTime = Date.now();

        // 创建Promise
        return new Promise<NodeResult>((resolve) => {
            // 检查条件的函数
            const checkCondition = async () => {
                try {
                    // 检查条件是否满足
                    const result = await this.condition();

                    if (result) {
                        // 条件满足，停止等待并返回成功
                        this.clearTimers();
                        await this.stopped(NodeResult.SUCCESS);
                        resolve(NodeResult.SUCCESS);
                    } else {
                        // 检查是否超时
                        if (this.timeout > 0 && (Date.now() - this.startTime) / 1000 > this.timeout) {
                            // 超时，停止等待并返回失败
                            this.clearTimers();
                            await this.stopped(NodeResult.FAILURE);
                            resolve(NodeResult.FAILURE);
                        } else {
                            // 继续等待并检查
                            this.timerId = setTimeout(checkCondition, this.checkInterval * 1000);
                        }
                    }
                } catch (error) {
                    // 发生错误，停止等待并返回失败
                    console.error('WaitForCondition error:', error);
                    this.clearTimers();
                    await this.stopped(NodeResult.FAILURE);
                    resolve(NodeResult.FAILURE);
                }
            };

            // 开始检查条件
            checkCondition();

            // 如果设置了超时，创建超时计时器
            if (this.timeout > 0) {
                this.timeoutId = setTimeout(async () => {
                    this.clearTimers();
                    await this.stopped(NodeResult.FAILURE);
                    resolve(NodeResult.FAILURE);
                }, this.timeout * 1000);
            }
        });
    }

    /**
     * 停止等待条件
     * @returns 停止操作的Promise
     */
    protected override async doStop(): Promise<void> {
        this.clearTimers();
        await this.stopped(NodeResult.FAILURE);
    }

    /**
     * 清除所有计时器
     */
    private clearTimers(): void {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
} 