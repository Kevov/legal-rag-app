export class CustomMemory {
    private memoryStore: Map<string, string[]>;

    constructor() {
        this.memoryStore = new Map<string, string[]>();
    }

    public set(key: string, value: string) {
        if (this.memoryStore.has(key)) {
            const existingValues = this.memoryStore.get(key) || [];
            if (existingValues.length >= 50) {
                existingValues.shift(); // Remove the oldest entry
            }
            this.memoryStore.set(key, existingValues.concat(value));
        } else {
            this.memoryStore.set(key, [value]);
        }
    }

    public get(key: string): string[] | undefined {
        return this.memoryStore.get(key);
    }
}
