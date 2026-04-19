import type { GameEvent } from './GameEvent';

export class EventQueue {
  private queue: GameEvent[] = [];

  public enqueue(event: GameEvent): void {
    this.queue.push(event);
  }

  public enqueueMany(events: GameEvent[]): void {
    this.queue.push(...events);
  }

  public dequeue(): GameEvent | undefined {
    return this.queue.shift();
  }

  public peek(): GameEvent | undefined {
    return this.queue[0];
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public clear(): void {
    this.queue = [];
  }

  public getQueue(): GameEvent[] {
    return [...this.queue];
  }

  public setQueue(queue: GameEvent[]): void {
    this.queue = [...queue];
  }
}
