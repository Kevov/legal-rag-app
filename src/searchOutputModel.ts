import { Document } from 'mongodb';

export class SearchOutputModel {
    private tagName: string;
    private tagDescription: string;

    constructor(tagName: string, tagDescription: string) {
        this.tagName = tagName;
        this.tagDescription = tagDescription;
    }

    public static fromDocument(doc: Document): SearchOutputModel {
        if (!doc || !doc.metadata.tag_name || !doc.pageContent) {
            throw new Error("Invalid document format");
        }
        return new SearchOutputModel(doc.metadata.tag_name, doc.pageContent);
    }
    
    public getTagName(): string {
        return this.tagName;
    }

    public getTagDescription(): string {
        return this.tagDescription;
    }
}