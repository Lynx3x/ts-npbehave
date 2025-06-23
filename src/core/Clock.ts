/**
 * 时钟类，用于行为树的计时功能
 */
export class Clock {
    private updateRoutine: NodeJS.Timeout | null = null;
    private elapsedTime: number = 0;
    private started: boolean = false;

    // 计时器回调集合
    private timers: Map<string, { time: number; repeat: boolean; action: () => void; }> = new Map();
    // 帧更新回调集合
    private updateObservers: Set<() => void> = new Set();

    /**
     * 获取当前环境的setInterval函数
     */
    private getSetInterval(): (callback: () => void, ms: number) => any {
        if (typeof window !== 'undefined') {
            return window.setInterval;
        } else {
            return global.setInterval;
        }
    }

    /**
     * 获取当前环境的clearInterval函数
     */
    private getClearInterval(): (id: any) => void {
        if (typeof window !== 'undefined') {
            return window.clearInterval;
        } else {
            return global.clearInterval;
        }
    }

    /**
     * 启动时钟
     */
    start(): void {
        if (!this.started) {
            this.started = true;
            this.elapsedTime = 0;
            this.updateRoutine = this.getSetInterval()(() => this.update(), 16); // 约60fps
        }
    }

    /**
     * 停止时钟
     */
    stop(): void {
        if (this.started) {
            this.started = false;
            if (this.updateRoutine !== null) {
                this.getClearInterval()(this.updateRoutine);
                this.updateRoutine = null;
            }
        }
    }

    /**
     * 暂停时钟
     */
    pause(): void {
        if (this.started && this.updateRoutine !== null) {
            this.getClearInterval()(this.updateRoutine);
            this.updateRoutine = null;
        }
    }

    /**
     * 恢复时钟
     */
    resume(): void {
        if (this.started && this.updateRoutine === null) {
            this.updateRoutine = this.getSetInterval()(() => this.update(), 16);
        }
    }

    /**
     * 更新时钟
     */
    private update(): void {
        const deltaTime = 0.016; // 固定增量，约16ms
        this.elapsedTime += deltaTime;

        // 执行所有更新观察者
        this.updateObservers.forEach(observer => {
            observer();
        });

        // 处理计时器
        const timersToRemove: string[] = [];

        this.timers.forEach((timer, id) => {
            if (this.elapsedTime >= timer.time) {
                timer.action();

                if (timer.repeat) {
                    // 重新设置计时器时间
                    timer.time = this.elapsedTime + timer.time;
                } else {
                    timersToRemove.push(id);
                }
            }
        });

        // 移除已完成的非重复计时器
        timersToRemove.forEach(id => {
            this.timers.delete(id);
        });
    }

    /**
     * 添加更新观察者
     * @param action 每帧执行的回调
     */
    addUpdateObserver(action: () => void): void {
        this.updateObservers.add(action);
    }

    /**
     * 移除更新观察者
     * @param action 要移除的回调
     */
    removeUpdateObserver(action: () => void): void {
        this.updateObservers.delete(action);
    }

    /**
     * 获取或创建计时器
     * @param delay 延迟时间（秒）
     * @param repeat 是否重复
     * @param action 计时器回调
     * @returns 计时器ID
     */
    addTimer(delay: number, repeat: boolean, action: () => void): string {
        const id = Math.random().toString(36).substring(2, 9);
        this.timers.set(id, {
            time: this.elapsedTime + delay,
            repeat,
            action
        });
        return id;
    }

    /**
     * 移除计时器
     * @param id 计时器ID
     */
    removeTimer(id: string): void {
        this.timers.delete(id);
    }

    /**
     * 清除所有计时器
     */
    clearAllTimers(): void {
        this.timers.clear();
    }

    /**
     * 获取已经经过的时间
     */
    getElapsedTime(): number {
        return this.elapsedTime;
    }
} 