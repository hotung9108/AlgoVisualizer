import type { Edge } from "./Edge"
import type { Node } from "./Node"

export interface Graph{
    nodes: Record<string, Node>
    edges: Edge[]
    startNode: string;
    endNode: string;
}
