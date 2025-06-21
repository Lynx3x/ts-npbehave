import { Decorator } from '../Decorator';
import { Node, NodeResult } from '../Node';
import { ObserverCallback, Operator } from '../Blackboard';
import { Stops } from '../Stops';
import { Composite } from '../Composite';

/**
 * 黑板条件装饰器
 * 基于黑板的值条件决定是否执行装饰的节点
 */
export class BlackboardCondition extends Decorator {
    /**
     * 黑板键
     */
    private key: string;

    /**
     * 比较运算符
     */
    private operator: Operator;

    /**
     * 比较值
     */
    private value: any;

    /**
     * 停止规则
     */
    private stopsOnChange: Stops;

    /**
     * 是否已注册观察者
     */
    private isObserving: boolean = false;

    /**
     * 黑板观察者回调
     */
    private observer: ObserverCallback;

    /**
     * 构造函数
     * @param key 黑板键
     * @param operator 比较运算符
     * @param value 比较值
     * @param decoratee 被装饰节点
     * @param stopsOnChange 停止规则
     */
    constructor(
        key: string,
        operator: Operator,
        value: any,
        decoratee: Node,
        stopsOnChange: Stops = Stops.NONE
    ) {
        super('BlackboardCondition', decoratee);
        this.key = key;
        this.operator = operator;
        this.value = value;
        this.stopsOnChange = stopsOnChange;

        // 创建观察者回调
        this.observer = this.onValueChanged.bind(this);
    }

    /**
     * 开始执行
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        // 检查条件是否满足
        if (await this.isConditionMet()) {
            // 如果需要观察黑板变化
            if (this.stopsOnChange !== Stops.NONE && !this.isObserving) {
                this.startObserving();
            }

            // 启动装饰节点
            return await this.decoratee.start();
        } else {
            // 如果需要观察黑板变化
            if (this.stopsOnChange !== Stops.NONE && !this.isObserving) {
                this.startObserving();
            }

            // 条件不满足，直接失败
            await this.stopped(NodeResult.FAILURE);
            return NodeResult.FAILURE;
        }
    }

    /**
     * 停止执行
     * @returns 停止操作的Promise
     */
    protected override async doStop(): Promise<void> {
        // 如果需要，停止观察
        if (this.stopsOnChange !== Stops.NONE && this.stopsOnChange !== Stops.LOWER_PRIORITY && this.isObserving) {
            this.stopObserving();
        }

        // 调用基类停止方法
        await super.doStop();
    }

    /**
     * 子节点停止回调
     * @param child 停止的子节点
     * @param result 执行结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        // 如果停止规则包含SELF且正在观察，则停止观察
        if ((this.stopsOnChange === Stops.SELF || this.stopsOnChange === Stops.BOTH) && this.isObserving) {
            this.stopObserving();
        }

        // 停止节点
        await this.stopped(result);
    }

    /**
     * 黑板值变更回调
     */
    private async onValueChanged(): Promise<void> {
        const conditionMet = await this.isConditionMet();

        // 根据停止规则处理
        switch (this.stopsOnChange) {
            case Stops.LOWER_PRIORITY:
            case Stops.LOWER_PRIORITY_IMMEDIATE_RESTART:
                if (conditionMet) {
                    // 通知父复合节点停止低优先级节点
                    if (this.parentNode) {
                        await this.parentNode.childStopped(this, NodeResult.FAILURE);

                        // 如果需要立即重启
                        if (this.stopsOnChange === Stops.LOWER_PRIORITY_IMMEDIATE_RESTART) {
                            await this.parentNode.childStopped(this, NodeResult.SUCCESS);
                        }
                    }
                }
                break;

            case Stops.SELF:
            case Stops.BOTH:
                if (!conditionMet) {
                    // 停止观察并停止装饰节点
                    this.stopObserving();
                    await this.decoratee.stop();
                }
                break;

            case Stops.IMMEDIATE_RESTART:
                if (!conditionMet) {
                    // 停止观察并停止装饰节点
                    this.stopObserving();
                    await this.decoratee.stop();
                } else if (this.parentNode && !this.decoratee.isActive) {
                    // 通知父复合节点停止低优先级节点并重启本节点
                    await this.parentNode.childStopped(this, NodeResult.FAILURE);
                    await this.parentNode.childStopped(this, NodeResult.SUCCESS);
                }
                break;
        }
    }

    /**
     * 开始观察黑板
     */
    private startObserving(): void {
        if (this.blackboard) {
            this.blackboard.addObserver(this.key, this.observer);
            this.isObserving = true;
        }
    }

    /**
     * 停止观察黑板
     */
    private stopObserving(): void {
        if (this.blackboard && this.isObserving) {
            this.blackboard.removeObserver(this.key, this.observer);
            this.isObserving = false;
        }
    }

    /**
     * 父复合节点停止回调
     */
    override async doParentCompositeStopped(composite: Composite): Promise<void> {
        // 如果正在观察，停止观察
        if (this.isObserving) {
            this.stopObserving();
        }
    }

    /**
     * 检查条件是否满足
     * @returns 条件是否满足的Promise
     */
    private async isConditionMet(): Promise<boolean> {
        if (!this.blackboard) return false;
        return await this.blackboard.compare(this.key, this.operator, this.value);
    }
} 