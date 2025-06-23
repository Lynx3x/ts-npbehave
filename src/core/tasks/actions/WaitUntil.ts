import { Node, NodeResult } from '../../Node';

/**
 * 条件函数类型
 * 返回布尔值或Promise<布尔值>
 */
export type ConditionFunction = () => (boolean | Promise<boolean>);

/**
 * 等待直到条件满足节点
 * 等待条件满足或超时
 */
export class WaitUntil extends Node {
    private condition: ConditionFunction;
    private checkInterval: number;
    private timeout: number;
    private timerId: string | null = null;
    private timeoutId: string | null = null;
    private startTime: number = 0;

    /**
     * 构造函数
     * @param condition 条件函数
     * @param checkInterval 检查间隔（秒）
     * @param timeout 超时时间（秒），小于等于0表示不超时
     */
    constructor(condition: ConditionFunction, checkInterval: number = 0.1, timeout: number = 0) {
        super('WaitUntil');
        this.condition = condition;
        this.checkInterval = checkInterval;
        this.timeout = timeout;
    }

    /**
     * 启动节点
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        this.startTime = this.clock ? this.clock.getElapsedTime() : Date.now() / 1000;

        // 立即检查一次条件
        if (await this.checkCondition()) {
            await this.stopped(NodeResult.SUCCESS);
            return NodeResult.SUCCESS;
        }

        // 设置定时检查条件
        if (this.clock) {
            this.timerId = this.clock.addTimer(this.checkInterval, true, this.onTimerTick.bind(this));

            // 如果设置了超时，则添加超时定时器
            if (this.timeout > 0) {
                this.timeoutId = this.clock.addTimer(this.timeout, false, this.onTimeout.bind(this));
            }

            return NodeResult.RUNNING;
        } else {
            // 没有时钟，直接失败
            await this.stopped(NodeResult.FAILURE);
            return NodeResult.FAILURE;
        }
    }

    /**
     * 停止节点
     */
    protected override async doStop(): Promise<void> {
        this.clearTimers();
    }

    /**
     * 清除所有定时器
     */
    private clearTimers(): void {
        if (this.clock) {
            if (this.timerId !== null) {
                this.clock.removeTimer(this.timerId);
                this.timerId = null;
            }

            if (this.timeoutId !== null) {
                this.clock.removeTimer(this.timeoutId);
                this.timeoutId = null;
            }
        }
    }

    /**
     * 定时器回调
     */
    private async onTimerTick(): Promise<void> {
        if (this.isActive) {
            await this.checkCondition();
        }
    }

    /**
     * 超时回调
     */
    private async onTimeout(): Promise<void> {
        if (this.isActive) {
            this.clearTimers();
            await this.stopped(NodeResult.FAILURE);
        }
    }

    /**
     * 检查条件
     * @returns 条件是否满足
     */
    private async checkCondition(): Promise<boolean> {
        try {
            const result = await this.condition();

            // 如果条件满足，则停止等待并返回成功
            if (result && this.isActive) {
                this.clearTimers();
                await this.stopped(NodeResult.SUCCESS);
                return true;
            }

            // 检查是否超时（如果没有时钟但设置了超时）
            if (this.timeout > 0 && !this.clock) {
                const currentTime = Date.now() / 1000;
                if (currentTime - this.startTime >= this.timeout && this.isActive) {
                    await this.stopped(NodeResult.FAILURE);
                    return false;
                }
            }

            return result;
        } catch (error) {
            console.error(`等待条件检查出错: ${error}`);

            if (this.isActive) {
                this.clearTimers();
                await this.stopped(NodeResult.FAILURE);
            }

            return false;
        }
    }
} 