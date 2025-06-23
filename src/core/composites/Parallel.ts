import { Composite } from '../Composite';
import { Node, NodeResult } from '../Node';

/**
 * 策略枚举，定义并行节点的成功/失败条件
 */
export enum Policy {
    /**
     * 一个子节点满足条件即可
     */
    ONE,

    /**
     * 所有子节点都必须满足条件
     */
    ALL
}

/**
 * 并行节点
 * 同时执行所有子节点
 * 根据成功和失败策略决定整体结果
 */
export class Parallel extends Composite {
    /**
     * 成功策略
     */
    private successPolicy: Policy;

    /**
     * 失败策略
     */
    private failurePolicy: Policy;

    /**
     * 已完成子节点数量
     */
    private childrenCount: number = 0;

    /**
     * 成功的子节点数量
     */
    private childrenSuccessCount: number = 0;

    /**
     * 构造函数
     * @param successPolicy 成功策略
     * @param failurePolicy 失败策略
     * @param children 子节点数组
     */
    constructor(successPolicy: Policy, failurePolicy: Policy, children: Node[] = []) {
        super('Parallel', children);
        this.successPolicy = successPolicy;
        this.failurePolicy = failurePolicy;
    }

    /**
     * 开始执行并行节点
     */
    protected override async doStart(): Promise<NodeResult> {
        // 重置计数器
        this.childrenCount = 0;
        this.childrenSuccessCount = 0;

        // 如果没有子节点，直接成功
        if (this.children.length === 0) {
            return NodeResult.SUCCESS;
        }

        // 启动所有子节点
        for (const child of this.children) {
            await child.start();
        }

        // 返回RUNNING，因为子节点的结果会通过childStopped回调处理
        return NodeResult.RUNNING;
    }

    /**
     * 处理子节点停止事件
     * @param child 停止的子节点
     * @param result 执行结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        // 更新计数器
        this.childrenCount++;
        if (result === NodeResult.SUCCESS) {
            this.childrenSuccessCount++;
        }

        // 检查是否满足成功或失败条件
        if (
            // 失败策略为ONE且有一个子节点失败
            (this.failurePolicy === Policy.ONE && result === NodeResult.FAILURE) ||
            // 成功策略为ONE且有一个子节点成功
            (this.successPolicy === Policy.ONE && result === NodeResult.SUCCESS)
        ) {
            // 停止所有其他正在运行的子节点
            await this.stopChildren();
            // 返回结果
            this.stopped(result);
            return;
        }

        // 检查是否所有子节点都已完成
        if (this.childrenCount === this.children.length) {
            // 所有子节点都已完成，根据策略确定结果
            let finalResult: NodeResult;

            if (this.failurePolicy === Policy.ALL) {
                // 失败策略为ALL：只有当所有子节点都失败时才失败
                finalResult = this.childrenSuccessCount > 0
                    ? NodeResult.SUCCESS
                    : NodeResult.FAILURE;
            } else {
                // 成功策略为ALL：只有当所有子节点都成功时才成功
                finalResult = this.childrenSuccessCount === this.children.length
                    ? NodeResult.SUCCESS
                    : NodeResult.FAILURE;
            }

            this.stopped(finalResult);
        }
    }

    /**
     * 停止所有子节点
     */
    protected async stopChildren(): Promise<void> {
        for (const child of this.children) {
            if (child.isActive) {
                await child.stop();
            }
        }
    }
} 