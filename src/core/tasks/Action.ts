import { Task } from '../Task';
import { NodeResult } from '../Node';

/**
 * 动作任务类型定义
 * 支持同步和异步操作
 */
export type ActionFunction = () => boolean | void | Promise<boolean | void>;

/**
 * 动作节点
 * 执行指定的函数作为行为树的任务
 */
export class Action extends Task {
    private action: ActionFunction;

    /**
     * 构造函数
     * @param action 要执行的动作函数
     */
    constructor(action: ActionFunction) {
        super('Action');
        this.action = action;
    }

    /**
     * 执行动作
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        try {
            // 执行动作并获取结果
            const result = await this.action();

            // 如果返回值是布尔值，使用它作为结果
            // 否则默认为成功
            const success = result !== false;

            await this.stopped(success ? NodeResult.SUCCESS : NodeResult.FAILURE);
            return success ? NodeResult.SUCCESS : NodeResult.FAILURE;
        } catch (error) {
            console.error(`Action执行出错:`, error);
            await this.stopped(NodeResult.FAILURE);
            return NodeResult.FAILURE;
        }
    }

    /**
     * 停止动作
     * @returns 停止操作的Promise
     */
    protected override async doStop(): Promise<void> {
        await this.stopped(NodeResult.FAILURE);
    }
} 