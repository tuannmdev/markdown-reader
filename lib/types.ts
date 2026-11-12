export interface DocMeta {
  slug: string[];
  href: string;
  title: string;
  description: string;
  order: number;
  tags: string[];
  readingMinutes: number;
  folders: string[];
}

export interface Doc extends DocMeta {
  body: string;
}

export interface TreeDoc {
  kind: "doc";
  title: string;
  href: string;
}

export interface TreeFolder {
  kind: "folder";
  id: string;
  name: string;
  children: TreeNode[];
}

export type TreeNode = TreeDoc | TreeFolder;

export interface Heading {
  id: string;
  text: string;
  depth: number;
}
