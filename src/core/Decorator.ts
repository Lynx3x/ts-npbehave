import { Container } from './Container';
import { Node, NodeResult } from './Node';

/**
 * 装饰器节点抽象基类
 * 装饰器节点包装一个子节点，并可以修改其行为或结果
 */
export abstract class Decorator extends Container {
    /**
     * 被装饰的子节点
     */
    protected decoratee: Node;

    /**
     * 构造函数
     * @param name 节点名称
     * @param decoratee 被装饰的子节点
     */
    constructor(name: string, decoratee: Node) {
        super(name);
        this.decoratee = decoratee;
        this.decoratee.setParent(this);
    }

    /**
     * 当根节点被设置时，也为子节点设置根节点
     * @param rootNode 根节点
     */
    override setRoot(rootNode: import('./Node').Root): void {
        super.setRoot(rootNode);
        this.decoratee.setRoot(rootNode);
    }

    /**
     * 停止被装饰的子节点
     */
    protected override async doStop(): Promise<void> {
        if (this.decoratee.isActive || this.decoratee.isStopRequested) {
            await this.decoratee.stop();
        } else {
            await this.stopped(NodeResult.FAILURE);
        }
    }

    /**
     * 处理子节点停止事件
     * 子类需要重写此方法以实现特定的装饰行为
     * @param child 已停止的子节点
     * @param result 子节点执行结果
     */
    abstract override childStopped(child: Node, result: NodeResult): Promise<void>;
} 