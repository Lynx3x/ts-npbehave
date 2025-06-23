import { Decorator } from '../Decorator';
import { Node, NodeResult } from '../Node';
import { StopMode } from './Observer';

/**
 * 观察型装饰器抽象基类
 * 提供观察机制的装饰器，子类只需要实现isConditionMet方法
 */
export abstract class ObservingDecorator extends Decorator {
    private stopMode: StopMode;
    private checkInterval: number;
    private isObserving: boolean = false;
    private lastConditionResult: boolean = false;
    private timerId: string | null = null;

    /**
     * 构造函数
     * @param name 节点名称
     * @param decoratee 被装饰的子节点
     * @param stopMode 停止模式
     * @param checkInterval 检查条件的时间间隔（秒）
     */
    constructor(name: string, decoratee: Node, stopMode: StopMode = StopMode.NONE, checkInterval: number = 0.1) {
        super(name, decoratee);
        this.stopMode = stopMode;
        this.checkInterval = checkInterval;
    }

    /**
     * 启动装饰器
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        // 检查条件是否满足
        this.lastConditionResult = await this.isConditionMet();

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
        // 如果停止模式需要继续观察，则保持观察
        if (this.stopMode === StopMode.LOWER_PRIORITY ||
            this.stopMode === StopMode.LOWER_PRIORITY_IMMEDIATE_RESTART) {
            // 保持观察
        } else {
            this.stopObservation();
        }

        await this.stopped(result);
    }

    /**
     * 子类必须实现的条件检查方法
     * @returns 条件是否满足的Promise
     */
    protected abstract isConditionMet(): Promise<boolean>;

    /**
     * 子类可以重写的开始观察方法
     * 默认使用定时器检查条件
     */
    protected startObservation(): void {
        if (this.isObserving || !this.clock) return;

        this.isObserving = true;
        this.timerId = this.clock.addTimer(
            this.checkInterval,
            true,  // 重复执行
            this.checkConditionChange.bind(this)
        );
    }

    /**
     * 子类可以重写的停止观察方法
     */
    protected stopObservation(): void {
        if (!this.isObserving || !this.clock || this.timerId === null) return;

        this.clock.removeTimer(this.timerId);
        this.timerId = null;
        this.isObserving = false;
    }

    /**
     * 检查条件是否变化
     */
    private async checkConditionChange(): Promise<void> {
        if (!this.isActive && this.stopMode !== StopMode.LOWER_PRIORITY &&
            this.stopMode !== StopMode.LOWER_PRIORITY_IMMEDIATE_RESTART) {
            this.stopObservation();
            return;
        }

        const currentConditionResult = await this.isConditionMet();

        // 如果条件结果没有变化，则不需要任何操作
        if (currentConditionResult === this.lastConditionResult) return;

        // 更新最后的结果
        this.lastConditionResult = currentConditionResult;

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
} 