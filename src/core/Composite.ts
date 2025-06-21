import { Container } from './Container';
import { Node, NodeResult } from './Node';

/**
 * 复合节点抽象基类
 * 复合节点可以包含多个子节点，并控制子节点的执行顺序及结果处理
 */
export abstract class Composite extends Container {
    /**
     * 子节点数组
     */
    protected children: Node[];

    /**
     * 当前执行的子节点索引
     */
    protected currentChildIndex: number = 0;

    /**
     * 构造函数
     * @param name 节点名称
     * @param children 子节点数组
     */
    constructor(name: string, children: Node[] = []) {
        super(name);
        this.children = children;

        // 为所有子节点设置父节点
        for (const child of this.children) {
            child.setParent(this);
        }
    }

    /**
     * 当根节点被设置时，为所有子节点也设置根节点
     * @param rootNode 根节点
     */
    override setRoot(rootNode: import('./Node').Root): void {
        super.setRoot(rootNode);

        // 为所有子节点设置根节点
        for (const child of this.children) {
            child.setRoot(rootNode);
        }
    }

    /**
     * 停止所有活动的子节点
     * @returns 停止操作的Promise
     */
    protected async stopChildren(): Promise<void> {
        // 创建停止子节点的Promise数组
        const stopPromises: Promise<void>[] = [];

        // 从后往前停止子节点，避免在停止过程中的索引问题
        for (let i = this.children.length - 1; i >= 0; i--) {
            const child = this.children[i];
            if (child.isActive || child.isStopRequested) {
                stopPromises.push(child.stop());
            }
        }

        // 等待所有子节点停止
        await Promise.all(stopPromises);
    }

    /**
     * 当复合节点停止时，通知所有子节点
     * @returns 停止操作的Promise
     */
    protected override async doStop(): Promise<void> {
        // 创建通知子节点的Promise数组
        const notifyPromises: Promise<void>[] = [];

        for (const child of this.children) {
            notifyPromises.push(child.parentCompositeStopped(this));
        }

        // 等待所有通知完成
        await Promise.all(notifyPromises);

        // 停止所有子节点
        await this.stopChildren();
    }

    /**
     * 子类实现的启动逻辑
     * @returns 节点执行结果的Promise
     */
    protected abstract override doStart(): Promise<NodeResult>;

    /**
     * 处理子节点停止事件
     * 子类需要重写此方法以实现特定的复合逻辑
     * @param child 已停止的子节点
     * @param result 子节点执行结果
     */
    abstract override childStopped(child: Node, result: NodeResult): Promise<void>;
} 