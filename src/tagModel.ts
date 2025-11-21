export class TagModel {
    private tag_name: string;
    private text: string;
    private embedding: number[];

    constructor(tagName: string, text: string) {
        this.tag_name = tagName;
        this.text = text;
        this.embedding = [];
    }

    public static fromObject(obj: { tag_name: string; text: string }): TagModel {
        if (!obj || !obj.tag_name || !obj.text) {
            throw new Error("Invalid object format");
        }
        return new TagModel(obj.tag_name, obj.text);
    }

    public getTagName(): string {
        return this.tag_name;
    }

    public getText(): string {
        return this.text;
    }

    public setEmbedding(embedding: number[]): void {
        if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new Error("Embedding must be a non-empty array");
        }
        this.embedding = embedding;
    }
}