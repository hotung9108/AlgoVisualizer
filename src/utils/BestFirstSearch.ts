import type { Graph } from "../types/Graph";
import type { OpenNode, SearchStep } from "../types/SearchStep";

export function bestFirstSearch(graph: Graph): SearchStep[] {
    const { nodes, startNode, endNode, edges } = graph;
    const steps: SearchStep[] = [];
    if (!nodes[startNode] || !nodes[endNode]) {
        steps.push({
            currentNode: null,
            L: [],
            D: [],
            parent: [],
            message: "Start or End node not found in graph.",
        });
        return steps;
    }
    const openSet: string[] = [startNode];
    const closedSet: string[] = [];
    const parentMap: Record<string, string> = {};
    const getOpenNodes = (): OpenNode[] =>
        openSet.map((id) => ({
            id,
            heuristic: nodes[id]?.heuristic ?? 0,
        }));
    steps.push({
        currentNode: null,
        L: getOpenNodes(),
        D: [...closedSet],
        parent: [],
        message: "Starting Best-First Search...",
    });
    while (openSet.length > 0) {
        openSet.sort((a, b) => nodes[a].heuristic - nodes[b].heuristic);
        const currentId = openSet.shift()!;
        closedSet.push(currentId); // Thêm dòng này để lưu điểm đã đi qua
        const neighbors = nodes[currentId].neighbors;
        for (const neighborId of neighbors) {
            const hasEdge = edges.some(
                (edge) => edge.from === currentId && edge.to === neighborId,
            );
            if (
                hasEdge &&
                !closedSet.includes(neighborId) &&
                !openSet.includes(neighborId) &&
                nodes[neighborId]
            ) {
                parentMap[neighborId] = currentId;
                openSet.push(neighborId);
            }
        }
        openSet.sort((a, b) => nodes[a].heuristic - nodes[b].heuristic);
        if (currentId === endNode) {
            const path = reconstructPath(parentMap, endNode);
            steps.push({
                currentNode: currentId,
                L: getOpenNodes(),
                D: [...closedSet],
                parent: path,
                message: `Goal reached! Path: ${path.join(" -> ")}`,
            });
            return steps;
        }
        steps.push({
            currentNode: currentId,
            L: getOpenNodes(),
            D: [...closedSet],
            parent: reconstructPath(parentMap, currentId),
            message: `Expanding node ${currentId} (h=${nodes[currentId].heuristic})`,
        });
    }
    steps.push({
        currentNode: null,
        L: [],
        D: [...closedSet],
        parent: [],
        message: "No path found.",
    });

    return steps;
}
function reconstructPath(
    parentMap: Record<string, string>,
    current: string,
): string[] {
    const path = [current];
    while (parentMap[current]) {
        current = parentMap[current];
        path.unshift(current);
    }
    return path;
}
