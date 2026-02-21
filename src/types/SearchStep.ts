export interface OpenNode{
  id: string;
  heuristic: number;
}
export interface SearchStep {
  currentNode: string | null;
  L: OpenNode[]; //openSet
  D: string[];
  parent: string[]; //path
  message: string;
}
