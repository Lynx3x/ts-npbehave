import { Decorator } from '../Decorator';
import { Node, NodeResult } from '../Node';

/**
 * 停止模式枚举
 * 定义当条件变化时Observer装饰器如何停止节点
 */
export enum StopMode {
    NONE,               // 不停止任何节点
    SELF,               // 仅停止自身
    LOWER_PRIORITY,     // 停止低优先级节点
    BOTH,               // 停止自身和低优先级节点
    IMMEDIATE_RESTART,  // 立即重启自身
    LOWER_PRIORITY_IMMEDIATE_RESTART // 停止低优先级节点并立即重启自身
}

/**
 * 条件函数类型
 * 返回布尔值或Promise<布尔值>
 */
export type ObserverCondition = () => (boolean | Promise<boolean>);

/**
 * 观察者装饰器
 * 监视条件并在条件变化时根据停止模式执行操作
 */
export class Observer extends Decorator {
    private condition: ObserverCondition;
    private stopMode: StopMode;
    private checkInterval: number;
    private lastResult: boolean = false;
    private isObserving: boolean = false;
    private timerId: string | null = null;

    /**
     * 构造函数
     * @param condition 观察的条件函数
     * @param stopMode 停止模式
     * @param decoratee 被装饰的子节点
     * @param checkInterval 检查条件的时间间隔（秒）
     */
    constructor(condition: ObserverCondition, stopMode: StopMode, decoratee: Node, checkInterval: number = 0.1) {
        super('Observer', decoratee);
        this.condition = condition;
        this.stopMode = stopMode;
        this.checkInterval = checkInterval;
    }

    /**
     * 启动装饰器
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        // 首次检查条件
        this.lastResult = await this.evaluateCondition();

        // 如果停止模式不是NONE，则开始观察条件变化
        if (this.stopMode !== StopMode.NONE) {
            this.startObservation();
        }

        // 启动子节点
        return await this.decoratee.start();
    }

    /**
     * 停止装饰器
     */
    protected override async doStop(): Promise<void> {
        this.stopObservation();

        // 如果子节点仍在运行，则停止它
        if (this.decoratee.isActive) {
            await this.decoratee.stop();
        }
    }

    /**
     * 处理子节点停止事件
     * @param child 停止的子节点
     * @param result 执行结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        this.stopObservation();
        await this.stopped(result);
    }

    /**
     * 开始观察条件变化
     */
    private startObservation(): void {
        if (this.isObserving || !this.clock) return;

        this.isObserving = true;
        this.timerId = this.clock.addTimer(
            this.checkInterval,
            true,  // 重复执行
            this.checkConditionChange.bind(this)
        );
    }

    /**
     * 停止观察条件变化
     */
    private stopObservation(): void {
        if (!this.isObserving || !this.clock || this.timerId === null) return;

        this.clock.removeTimer(this.timerId);
        this.timerId = null;
        this.isObserving = false;
    }

    /**
     * 检查条件是否变化
     */
    private async checkConditionChange(): Promise<void> {
        if (!this.isActive) {
            this.stopObservation();
            return;
        }

        const currentResult = await this.evaluateCondition();

        // 如果条件结果没有变化，则不需要任何操作
        if (currentResult === this.lastResult) return;

        // 更新最后的结果
        this.lastResult = currentResult;

        // 根据停止模式执行相应操作
        switch (this.stopMode) {
            case StopMode.SELF:
                if (this.decoratee.isActive) {
                    await this.decoratee.stop();
                }
                break;

            case StopMode.LOWER_PRIORITY:
                // 需要父复合节点支持停止低优先级节点
                if (this.parentNode) {
                    await this.parentNode.stopLowerPriorityChildren(this);
                }
                break;

            case StopMode.BOTH:
                // 先停止自身子节点
                if (this.decoratee.isActive) {
                    await this.decoratee.stop();
                }

                // 再停止低优先级节点
                if (this.parentNode) {
                    await this.parentNode.stopLowerPriorityChildren(this);
                }
                break;

            case StopMode.IMMEDIATE_RESTART:
                // 先停止自身子节点
                if (this.decoratee.isActive) {
                    await this.decoratee.stop();
                }

                // 通知父节点立即重启自身
                if (this.parentNode) {
                    await this.parentNode.immediateRestart(this);
                }
                break;

            case StopMode.LOWER_PRIORITY_IMMEDIATE_RESTART:
                // 停止低优先级节点
                if (this.parentNode) {
                    await this.parentNode.stopLowerPriorityChildren(this);
                    // 通知父节点立即重启自身
                    await this.parentNode.immediateRestart(this);
                }
                break;
        }
    }

    /**
     * 评估条件
     * @returns 条件的布尔结果
     */
    private async evaluateCondition(): Promise<boolean> {
        try {
            return await this.condition();
        } catch (error) {
            console.error(`观察者条件评估出错: ${error}`);
            return false;
        }
    }
} 