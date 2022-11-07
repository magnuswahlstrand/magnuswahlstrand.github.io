import {slugifyStr} from "./slugify";
import type {MarkdownInstance} from "astro";
import type {Frontmatter} from "../types";

const getCountedTags = (posts: MarkdownInstance<Frontmatter>[]) => {
    let tags: string[] = [];
    const filteredPosts = posts.filter(({frontmatter}) => !frontmatter.draft);
    filteredPosts.forEach(post => {
        tags = [...tags, ...post.frontmatter.tags.map(tag => slugifyStr(tag))];
    });
    // const arr = [5, 5, 5, 2, 2, 2, 2, 2, 9, 4];
    const countedTags: Record<string, number>[] = [];
    // const countedTags: {[key: string]: number} = {};

    for (const num of tags) {
        countedTags[num] = (countedTags[num] || 0) + 1
    }

    const tagList = Object.keys(countedTags).map(key => {
        return {
            tag: key,
            count: countedTags[key]
        }
    })

    tagList.sort((a, b) => b.count - a.count)

    return tagList;
};

export default getCountedTags;
