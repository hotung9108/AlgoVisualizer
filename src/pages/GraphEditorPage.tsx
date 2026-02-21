import type { Graph } from "../types/Graph";

interface GraphEditorProps {
    data?: Graph;
    onChange?: (graph: Graph) => void;
}
export default function GraphEditor({
    data,
    onChange
}:GraphEditorProps){
    return (
        <div>
            This is Graph Editor
        </div>
    );
}