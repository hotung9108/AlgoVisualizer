import type { Graph } from "../types/Graph";
import type { Edge } from "../types/Edge";
import type { Node } from "../types/Node";

export function parseInput(input: string): Graph {
    const lines = input
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    const nodes: Record<string, Node> = {};
    const edges: Edge[] = [];
    let startNode = "";
    let endNode = "";

    if (lines.length < 2) {
        return { nodes: {}, edges: [], startNode: "", endNode: "" };
    }

    startNode = lines[0];
    endNode = lines[1];

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [nodePart, neighborPart] = line.split(":");
        const [nodeId, heuristic] = nodePart.split("-").map((s) => s.trim());
        const neighbors = neighborPart ? neighborPart.trim().split(/\s+/) : [];

        nodes[nodeId] = {
            id: nodeId,
            heuristic: Number(heuristic),
            neighbors,
        };

        neighbors.forEach((neighborId) => {
            edges.push({
                id: `${nodeId}_${neighborId}`,
                from: nodeId,
                to: neighborId,
            });
        });
    }

    return { nodes, edges, startNode, endNode };
}
