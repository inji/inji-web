import { formatKeyLabel } from "./misc";

export type ClaimType = "claim" | "sdClaim";

export type ClaimLeaf = {
    kind: "leaf";
    path: string;
    label: string;
    claimType: ClaimType;
};

export type ClaimGroup = {
    kind: "group";
    key: string;
    label: string;
    children: ClaimNode[];
};

export type ClaimNode = ClaimLeaf | ClaimGroup;

const parseClaimPath = (path: string): string[] =>
    path.replace(/^\$\./, "").split(".").filter(Boolean);

const insertIntoTree = (
    nodes: ClaimNode[],
    segments: string[],
    path: string,
    claimType: ClaimType
): void => {
    if (segments.length === 0) {
        return;
    }

    if (segments.length === 1) {
        nodes.push({
            kind: "leaf",
            path,
            label: formatKeyLabel(segments[0]),
            claimType,
        });
        return;
    }

    const [head, ...tail] = segments;
    let group = nodes.find(
        (node): node is ClaimGroup =>
            node.kind === "group" && node.key === head
    );

    if (!group) {
        group = {
            kind: "group",
            key: head,
            label: formatKeyLabel(head),
            children: [],
        };
        nodes.push(group);
    }

    insertIntoTree(group.children, tail, path, claimType);
};

const hasSdClaimDescendant = (node: ClaimGroup): boolean =>
    node.children.some((child) =>
        child.kind === "leaf"
            ? child.claimType === "sdClaim"
            : hasSdClaimDescendant(child)
    );

const getNodeSortOrder = (node: ClaimNode): number => {
    if (node.kind === "leaf") {
        return node.claimType === "sdClaim" ? 0 : 1;
    }
    return hasSdClaimDescendant(node) ? 0 : 1;
};

const sortClaimNodes = (nodes: ClaimNode[]): ClaimNode[] =>
    [...nodes]
        .sort((a, b) => {
            const orderDiff = getNodeSortOrder(a) - getNodeSortOrder(b);
            if (orderDiff !== 0) {
                return orderDiff;
            }
            const labelA = a.label;
            const labelB = b.label;
            return labelA.localeCompare(labelB);
        })
        .map((node) =>
            node.kind === "group"
                ? { ...node, children: sortClaimNodes(node.children) }
                : node
        );

export const buildClaimTree = (
    claims: string[] = [],
    sdClaims: string[] = []
): ClaimNode[] => {
    const root: ClaimNode[] = [];
    sdClaims.forEach((path) => insertIntoTree(root, parseClaimPath(path), path, "sdClaim"));
    claims.forEach((path) => insertIntoTree(root, parseClaimPath(path), path, "claim"));
    return sortClaimNodes(root);
};

export const filterClaimTree = (nodes: ClaimNode[], query: string): ClaimNode[] => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
        return nodes;
    }

    return nodes.reduce<ClaimNode[]>((filtered, node) => {
        if (node.kind === "leaf") {
            const matches =
                node.label.toLowerCase().includes(normalizedQuery) ||
                node.path.toLowerCase().includes(normalizedQuery);
            if (matches) {
                filtered.push(node);
            }
            return filtered;
        }

        const matchingChildren = filterClaimTree(node.children, query);
        const groupMatches = node.label.toLowerCase().includes(normalizedQuery);
        if (groupMatches || matchingChildren.length > 0) {
            filtered.push({
                ...node,
                children: groupMatches ? node.children : matchingChildren,
            });
        }
        return filtered;
    }, []);
};

export const collectSdClaimPaths = (nodes: ClaimNode[]): string[] =>
    nodes.flatMap((node) =>
        node.kind === "leaf" && node.claimType === "sdClaim"
            ? [node.path]
            : node.kind === "group"
              ? collectSdClaimPaths(node.children)
              : []
    );

export const collectClaimLeaves = (nodes: ClaimNode[]): ClaimLeaf[] =>
    nodes.flatMap((node) =>
        node.kind === "leaf" ? [node] : collectClaimLeaves(node.children)
    );
