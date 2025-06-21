import { Decorator } from '../Decorator';
import { Node, NodeResult } from '../Node';

/**
 * 时间限制装饰器
 * 限制子节点的执行时间，超时则返回失败
 */
export class TimeLimit extends Decorator {
    private limitSeconds: number;
    private timerId: NodeJS.Timeout | null = null;

    /**
     * 构造函数
     * @param limitSeconds 时间限制（秒）
     * @param decoratee 被装饰的子节点
     */
    constructor(limitSeconds: number, decoratee: Node) {
        super('TimeLimit', decoratee);
        this.limitSeconds = limitSeconds;
    }

    /**
     * 开始执行装饰器
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        // 设置超时计时器
        this.timerId = setTimeout(() => {
            if (this.isActive) {
                // 如果子节点还在运行，则停止它并返回失败
                this.decoratee.stop().then(() => {
                    this.stopped(NodeResult.FAILURE);
                });
            }
        }, this.limitSeconds * 1000);

        // 启动子节点
        return await this.decoratee.start();
    }

    /**
     * 停止执行装饰器
     * @returns 停止操作的Promise
     */
    protected override async doStop(): Promise<void> {
        // 清除计时器
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        // 调用父类的停止方法
        await super.doStop();
    }

    /**
     * 处理子节点停止事件
     * @param child 停止的子节点
     * @param result 子节点的结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        // 清除计时器
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        // 传递子节点的结果
        await this.stopped(result);
    }
} 