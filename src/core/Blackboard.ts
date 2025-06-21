/**
 * 运算符枚举
 */
export enum Operator {
    IS_EQUAL,
    IS_NOT_EQUAL,
    IS_GREATER_OR_EQUAL,
    IS_GREATER,
    IS_SMALLER_OR_EQUAL,
    IS_SMALLER,
    ALWAYS_TRUE
}

/**
 * 观察回调类型
 */
export type ObserverCallback = () => void | Promise<void>;

/**
 * 黑板类 - 行为树数据存储和观察
 */
export class Blackboard {
    private data: Map<string, any> = new Map();
    private observers: Map<string, Set<ObserverCallback>> = new Map();
    private parent: Blackboard | null = null;

    /**
     * 构造函数
     * @param parent 父级黑板（可选）
     */
    constructor(parent: Blackboard | null = null) {
        this.parent = parent;
    }

    /**
     * 设置键值
     * @param key 键
     * @param value 值
     * @returns Promise
     */
    async set<T>(key: string, value: T): Promise<void> {
        // 检查值是否真的变化了
        if (this.data.has(key) && this.data.get(key) === value) {
            return;
        }

        this.data.set(key, value);
        await this.notifyObservers(key);
    }

    /**
     * 获取键值
     * @param key 键
     * @returns Promise<值>
     */
    async get<T>(key: string): Promise<T | undefined> {
        if (this.data.has(key)) {
            return this.data.get(key) as T;
        } else if (this.parent !== null) {
            return await this.parent.get<T>(key);
        }
        return undefined;
    }

    /**
     * 检查键是否存在
     * @param key 键
     * @returns Promise<是否存在>
     */
    async has(key: string): Promise<boolean> {
        return this.data.has(key) || (this.parent !== null && await this.parent.has(key));
    }

    /**
     * 移除键
     * @param key 键
     * @returns Promise
     */
    async remove(key: string): Promise<void> {
        if (this.data.has(key)) {
            this.data.delete(key);
            await this.notifyObservers(key);
        }
    }

    /**
     * 添加观察者
     * @param key 观察的键
     * @param observer 回调函数
     */
    addObserver(key: string, observer: ObserverCallback): void {
        if (!this.observers.has(key)) {
            this.observers.set(key, new Set());
        }
        this.observers.get(key)!.add(observer);
    }

    /**
     * 移除观察者
     * @param key 观察的键
     * @param observer 回调函数
     */
    removeObserver(key: string, observer: ObserverCallback): void {
        if (this.observers.has(key)) {
            const observers = this.observers.get(key)!;
            observers.delete(observer);
            if (observers.size === 0) {
                this.observers.delete(key);
            }
        }
    }

    /**
     * 通知观察者
     * @param key 变更的键
     * @returns Promise
     */
    private async notifyObservers(key: string): Promise<void> {
        if (this.observers.has(key)) {
            const observers = Array.from(this.observers.get(key)!);
            for (const observer of observers) {
                await observer();
            }
        }
    }

    /**
     * 清除所有数据
     * @returns Promise
     */
    async clear(): Promise<void> {
        const keys = Array.from(this.data.keys());
        this.data.clear();

        // 通知所有被观察键的观察者
        for (const key of keys) {
            await this.notifyObservers(key);
        }
    }

    /**
     * 比较键的值和给定值
     * @param key 键
     * @param op 运算符
     * @param value 比较值
     * @returns Promise<比较结果>
     */
    async compare<T>(key: string, op: Operator, value: T): Promise<boolean> {
        if (op === Operator.ALWAYS_TRUE) return true;

        const currentValue = await this.get<T>(key);

        if (currentValue === undefined) return false;

        switch (op) {
            case Operator.IS_EQUAL:
                return currentValue === value;
            case Operator.IS_NOT_EQUAL:
                return currentValue !== value;
            case Operator.IS_GREATER:
                return (currentValue as any) > (value as any);
            case Operator.IS_GREATER_OR_EQUAL:
                return (currentValue as any) >= (value as any);
            case Operator.IS_SMALLER:
                return (currentValue as any) < (value as any);
            case Operator.IS_SMALLER_OR_EQUAL:
                return (currentValue as any) <= (value as any);
            default:
                return false;
        }
    }
} 