import { Node, NodeResult } from '../../Node';

/**
 * 动作节点函数类型
 * 可以返回NodeResult、Promise<NodeResult>、void或Promise<void>
 */
export type ActionFunction = () => (NodeResult | Promise<NodeResult> | void | Promise<void>);

/**
 * 动作节点
 * 执行自定义函数并返回结果
 */
export class Action extends Node {
    private action: ActionFunction;
    private defaultResult: NodeResult;
    private isExecuting: boolean = false;

    /**
     * 构造函数
     * @param action 动作函数
     * @param defaultResult 默认结果（如果动作函数返回void）
     */
    constructor(action: ActionFunction, defaultResult: NodeResult = NodeResult.SUCCESS) {
        super('Action');
        this.action = action;
        this.defaultResult = defaultResult;
    }

    /**
     * 启动节点
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        this.isExecuting = true;
        let result: NodeResult;

        try {
            // 执行动作函数
            const actionResult = await this.action();

            // 如果动作函数返回明确结果，则使用它，否则使用默认结果
            if (actionResult !== undefined && typeof actionResult === 'number' &&
                (actionResult === NodeResult.SUCCESS ||
                    actionResult === NodeResult.FAILURE ||
                    actionResult === NodeResult.RUNNING)) {
                result = actionResult as NodeResult;
            } else {
                result = this.defaultResult;
            }
        } catch (error) {
            console.error(`动作节点执行出错: ${error}`);
            result = NodeResult.FAILURE;
        }

        // 只有当节点仍在执行时才报告结果
        if (this.isExecuting) {
            this.isExecuting = false;
            await this.stopped(result);
        }

        return result;
    }

    /**
     * 停止节点
     */
    protected override async doStop(): Promise<void> {
        this.isExecuting = false;
    }
} 