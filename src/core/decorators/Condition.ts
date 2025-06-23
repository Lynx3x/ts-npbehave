import { Node, NodeResult } from '../Node';
import { ObservingDecorator } from './ObservingDecorator';
import { StopMode } from './Observer';

/**
 * 条件函数类型
 * 返回布尔值或Promise<布尔值>
 */
export type ConditionFunction = () => (boolean | Promise<boolean>);

/**
 * 条件装饰器
 * 根据条件函数的结果决定是否执行子节点
 */
export class Condition extends ObservingDecorator {
    private condition: ConditionFunction;

    /**
     * 构造函数
     * @param condition 条件函数
     * @param decoratee 被装饰的子节点
     * @param stopMode 停止模式
     * @param checkInterval 检查条件的时间间隔（秒）
     */
    constructor(
        condition: ConditionFunction,
        decoratee: Node,
        stopMode: StopMode = StopMode.NONE,
        checkInterval: number = 0.1
    ) {
        super('Condition', decoratee, stopMode, checkInterval);
        this.condition = condition;
    }

    /**
     * 开始执行装饰器
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        // 检查条件是否满足
        const conditionMet = await this.isConditionMet();

        if (conditionMet) {
            // 条件满足，执行子节点
            return await super.doStart();
        } else {
            // 条件不满足，直接返回失败
            await this.stopped(NodeResult.FAILURE);
            return NodeResult.FAILURE;
        }
    }

    /**
     * 检查条件是否满足
     * @returns 条件是否满足的Promise
     */
    protected override async isConditionMet(): Promise<boolean> {
        try {
            return await this.condition();
        } catch (error) {
            console.error(`条件函数执行出错: ${error}`);
            return false;
        }
    }
} 