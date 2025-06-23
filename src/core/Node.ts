/**
 * 节点状态枚举
 */
export enum State {
    INACTIVE,    // 非活动
    ACTIVE,      // 活动
    STOP_REQUESTED, // 已请求停止
}

/**
 * 节点结果枚举
 */
export enum NodeResult {
    SUCCESS,     // 成功
    FAILURE,     // 失败
    RUNNING      // 运行中
}

/**
 * 节点基类
 * 所有行为树节点的抽象基类
 */
export abstract class Node {
    /**
     * 当前节点状态
     */
    protected _currentState: State = State.INACTIVE;

    /**
     * 根节点
     */
    public rootNode?: Root;

    /**
     * 父容器节点
     */
    private _parentNode?: Container;

    /**
     * 节点标签
     */
    private _label: string = '';

    /**
     * 节点名称
     */
    private _name: string;

    /**
     * 获取当前状态
     */
    get currentState(): State {
        return this._currentState;
    }

    /**
     * 获取标签
     */
    get label(): string {
        return this._label;
    }

    /**
     * 设置标签
     */
    set label(value: string) {
        this._label = value;
    }

    /**
     * 获取名称
     */
    get name(): string {
        return this._name;
    }

    /**
     * 获取黑板
     */
    get blackboard(): Blackboard | undefined {
        return this.rootNode?.blackboard;
    }

    /**
     * 获取时钟
     */
    get clock(): Clock | undefined {
        return this.rootNode?.clock;
    }

    /**
     * 是否已请求停止
     */
    get isStopRequested(): boolean {
        return this._currentState === State.STOP_REQUESTED;
    }

    /**
     * 是否处于活动状态
     */
    get isActive(): boolean {
        return this._currentState === State.ACTIVE;
    }

    /**
     * 构造函数
     * @param name 节点名称
     */
    constructor(name: string) {
        this._name = name;
    }

    /**
     * 设置根节点
     * @param rootNode 根节点
     */
    setRoot(rootNode: Root): void {
        this.rootNode = rootNode;
    }

    /**
     * 设置父节点
     * @param parent 父容器节点
     */
    setParent(parent: Container): void {
        this._parentNode = parent;
    }

    /**
     * 获取父节点
     */
    get parentNode(): Container | undefined {
        return this._parentNode;
    }

    /**
     * 启动节点
     * @returns 节点执行结果的Promise
     */
    async start(): Promise<NodeResult> {
        if (this._currentState !== State.INACTIVE) {
            console.error(`只能启动非活动节点，尝试启动: ${this._name}!`);
            return NodeResult.FAILURE;
        }

        this._currentState = State.ACTIVE;
        return await this.doStart();
    }

    /**
     * 停止节点
     * @returns 停止操作的Promise
     */
    async stop(): Promise<void> {
        if (this._currentState !== State.ACTIVE) {
            console.error(`只能停止活动节点，尝试停止: ${this._name}!`);
            return;
        }

        this._currentState = State.STOP_REQUESTED;
        await this.doStop();
    }

    /**
     * 子类实现的启动逻辑
     * @returns 节点执行结果的Promise
     */
    protected abstract doStart(): Promise<NodeResult>;

    /**
     * 子类实现的停止逻辑
     * @returns 停止操作的Promise
     */
    protected abstract doStop(): Promise<void>;

    /**
     * 节点已停止
     * @param result 节点结果
     */
    protected async stopped(result: NodeResult): Promise<void> {
        if (this._currentState === State.INACTIVE) {
            console.error(`节点 ${this} 在状态INACTIVE时调用'stopped'，出现错误!`);
            return;
        }

        this._currentState = State.INACTIVE;

        if (this._parentNode) {
            await this._parentNode.childStopped(this, result);
        }
    }

    /**
     * 父复合节点停止处理
     * @param composite 复合节点
     */
    async parentCompositeStopped(composite: Composite): Promise<void> {
        await this.doParentCompositeStopped(composite);
    }

    /**
     * 子类实现的父复合节点停止逻辑
     * @param composite 复合节点
     */
    protected async doParentCompositeStopped(composite: Composite): Promise<void> {
        // 子类可能需要重写此方法
    }

    /**
     * 转换为字符串表示
     */
    toString(): string {
        return this._label ? `${this._name}{${this._label}}` : this._name;
    }

    /**
     * 获取节点路径
     */
    public getPath(): string {
        if (this._parentNode) {
            const parentPath = this._parentNode.getPath();
            return parentPath ? `${parentPath}/${this}` : this.toString();
        }
        return this.toString();
    }
}

/**
 * 根节点接口
 */
export interface Root {
    blackboard?: Blackboard;
    clock?: Clock;
}

/**
 * 容器节点接口
 */
export interface Container extends Node {
    childStopped(child: Node, result: NodeResult): Promise<void>;
    getPath(): string;
}

/**
 * 复合节点接口
 */
export interface Composite extends Container {
    // 复合节点接口
}

/**
 * 黑板接口
 */
export interface Blackboard {
    // 黑板接口声明
    addObserver(key: string, observer: () => void | Promise<void>): void;
    removeObserver(key: string, observer: () => void | Promise<void>): void;
    compare<T>(key: string, op: any, value: T): Promise<boolean>;
}

/**
 * 时钟接口
 */
export interface Clock {
    // 时钟接口声明
    addTimer(delay: number, repeat: boolean, callback: () => void): string;
    removeTimer(id: string): void;
} 