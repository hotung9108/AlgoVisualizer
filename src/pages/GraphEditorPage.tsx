import { useEffect, useRef, useState } from "react";
import type { Graph } from "../types/Graph";
import { Trash2, Link as LinkIcon } from "lucide-react";

interface GraphEditorProps {
    data?: Graph;
    onChange?: (graph: Graph) => void;
}

type NodePosition = { x: number; y: number };
type DragState = { id: string; offsetX: number; offsetY: number } | null;

export default function GraphEditor({
    data,
    onChange,
}: GraphEditorProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const svgWidth = 1500;
    const svgHeight = 500;
    const RADIUS = 200;
    const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
    const [dragging, setDragging] = useState<DragState>(null);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [isLinking, setIsLinking] = useState(false);

    useEffect(() => {
        if (!data || !data.nodes) return;
        const ids = Object.keys(data.nodes);
        const cx = svgWidth / 2;
        const cy = svgHeight / 2;
        const pos: typeof nodePositions = {};
        ids.forEach((id, idx) => {
            const node = data.nodes[id];
            pos[id] = {
                x: node.x ?? cx + RADIUS * Math.cos((2 * Math.PI * idx) / ids.length),
                y: node.y ?? cy + RADIUS * Math.sin((2 * Math.PI * idx) / ids.length),
            };
        });
        setNodePositions(pos);
    }, [data]);

    const getMousePos = (e: React.MouseEvent) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const CTM = svg.getScreenCTM();
        if (!CTM) return { x: 0, y: 0 };
        return {
            x: (e.clientX - CTM.e) / CTM.a,
            y: (e.clientY - CTM.f) / CTM.d,
        };
    };

    const onMouseDownNode = (id: string) => (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isLinking && selectedNode && selectedNode !== id) {
            // Add edge
            if (onChange && data) {
                const newData = { ...data, nodes: { ...data.nodes } };
                if (!newData.nodes[selectedNode].neighbors.includes(id)) {
                    newData.nodes[selectedNode].neighbors = [
                        ...newData.nodes[selectedNode].neighbors,
                        id,
                    ];
                    onChange(newData);
                }
            }
            setIsLinking(false);
            setSelectedNode(id);
            return;
        }
        const pos = nodePositions[id];
        const mouse = getMousePos(e);
        setDragging({
            id,
            offsetX: mouse.x - pos.x,
            offsetY: mouse.y - pos.y,
        });
        setSelectedNode(id);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        const mouse = getMousePos(e);
        setNodePositions((prev) => ({
            ...prev,
            [dragging.id]: {
                x: mouse.x - dragging.offsetX,
                y: mouse.y - dragging.offsetY,
            },
        }));
    };

    const onMouseUp = () => {
        if (dragging && onChange && data) {
            const { id } = dragging;
            const pos = nodePositions[id];
            const newData = { ...data, nodes: { ...data.nodes } };
            newData.nodes[id] = { ...newData.nodes[id], x: pos.x, y: pos.y };
            onChange(newData);
        }
        setDragging(null);
    };

    const onSvgDoubleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const svg = svgRef.current;
        if (!svg || !onChange || !data) return;
        const CTM = svg.getScreenCTM();
        if (!CTM) return;
        const x = (e.clientX - CTM.e) / CTM.a;
        const y = (e.clientY - CTM.f) / CTM.d;
        const id = prompt("Enter Node ID:");
        if (!id) return;
        if (data.nodes[id]) {
            alert("Node already exists!");
            return;
        }
        const heuristic = parseFloat(prompt("Enter Heuristic value:", "0") || "0");
        const newData = { ...data, nodes: { ...data.nodes } };
        newData.nodes[id] = {
            id,
            heuristic,
            neighbors: [],
            x,
            y,
        };
        onChange(newData);
    };

    const removeNode = () => {
        if (!selectedNode || !onChange || !data) return;
        const newData = { ...data, nodes: { ...data.nodes } };
        delete newData.nodes[selectedNode];
        Object.values(newData.nodes).forEach((node: any) => {
            node.neighbors = node.neighbors.filter((n: string) => n !== selectedNode);
        });
        if (newData.startNode === selectedNode) newData.startNode = "";
        if (newData.endNode === selectedNode) newData.endNode = "";
        setSelectedNode(null);
        onChange(newData);
    };

    const setAsStart = () => {
        if (!selectedNode || !onChange || !data) return;
        onChange({ ...data, startNode: selectedNode });
    };

    const setAsEnd = () => {
        if (!selectedNode || !onChange || !data) return;
        onChange({ ...data, endNode: selectedNode });
    };

    const removeNeighbor = (neighborId: string) => {
        if (!selectedNode || !onChange || !data) return;
        const newData = { ...data, nodes: { ...data.nodes } };
        newData.nodes[selectedNode].neighbors = newData.nodes[selectedNode].neighbors.filter(
            (n) => n !== neighborId,
        );
        onChange(newData);
    };

    const nodeIds = data ? Object.keys(data.nodes) : [];
    const edges = data
        ? Object.values(data.nodes).flatMap((node) =>
              node.neighbors.map((neighborId) => ({
                  id: `${node.id}_${neighborId}`,
                  from: node.id,
                  to: neighborId,
              })),
          )
        : [];

    return (
        <div className="w-full h-full bg-stone-100 rounded-lg overflow-hidden border border-stone-300 relative group">
            <svg
                ref={svgRef}
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onDoubleClick={onSvgDoubleClick}
                className="w-full h-full cursor-crosshair"
            >
                <defs>
                    <marker
                        id="arrowhead-editor"
                        markerWidth="10"
                        markerHeight="7"
                        refX="18"
                        refY="3.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
                    </marker>
                </defs>
                {edges.map((edge) => {
                    const from = nodePositions[edge.from];
                    const to = nodePositions[edge.to];
                    if (!from || !to) return null;
                    return (
                        <line
                            key={edge.id}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke="#999"
                            strokeWidth={2}
                            markerEnd="url(#arrowhead-editor)"
                        />
                    );
                })}
                {nodeIds.map((id) => {
                    const pos = nodePositions[id];
                    if (!pos) return null;
                    let fill = "#fff";
                    if (id === selectedNode) fill = isLinking ? "#3b82f6" : "#f59e0b";
                    else if (id === data?.startNode) fill = "#8b5cf6";
                    else if (id === data?.endNode) fill = "#ef4444";
                    return (
                        <g
                            key={id}
                            transform={`translate(${pos.x},${pos.y})`}
                            onMouseDown={onMouseDownNode(id)}
                            style={{ cursor: "move" }}
                        >
                            <circle
                                r={24}
                                fill={fill}
                                stroke={id === selectedNode ? "#141414" : "#333"}
                                strokeWidth={id === selectedNode ? 3 : 2}
                                strokeDasharray={
                                    id === selectedNode && isLinking ? "4 2" : "none"
                                }
                            />
                            <text
                                textAnchor="middle"
                                dy=".35em"
                                fontSize={14}
                                fontWeight="bold"
                                fill="#333"
                                pointerEvents="none"
                            >
                                {id} ({data?.nodes[id].heuristic})
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div className="absolute top-4 right-4 flex flex-col gap-2 max-h-[90%] overflow-y-auto">
                {selectedNode && data && (
                    <div className="flex flex-col gap-2 bg-white/90 p-3 rounded-lg border border-stone-200 shadow-lg animate-in fade-in slide-in-from-right-4 w-48">
                        <p className="text-[10px] font-bold uppercase opacity-50 mb-1">
                            Node: {selectedNode}
                        </p>
                        <div className="flex flex-col gap-1 mb-2">
                            <p className="text-[9px] uppercase font-bold opacity-30">
                                Neighbors:
                            </p>
                            {data.nodes[selectedNode].neighbors.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {data.nodes[selectedNode].neighbors.map((n) => (
                                        <div
                                            key={n}
                                            className="flex items-center gap-1 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 text-[9px]"
                                        >
                                            <span>{n}</span>
                                            <button
                                                onClick={() => removeNeighbor(n)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[9px] italic opacity-30">No neighbors</p>
                            )}
                        </div>
                        <button
                            onClick={() => setIsLinking(!isLinking)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${
                                isLinking
                                    ? "bg-blue-500 text-white"
                                    : "bg-stone-100 hover:bg-stone-200"
                            }`}
                        >
                            <LinkIcon size={12} />
                            {isLinking ? "Click target node" : "Add Link"}
                        </button>
                        <button
                            onClick={setAsStart}
                            className="flex items-center gap-2 px-3 py-1.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 text-[10px] font-bold uppercase transition-colors"
                        >
                            Set as Start
                        </button>
                        <button
                            onClick={setAsEnd}
                            className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold uppercase transition-colors"
                        >
                            Set as End
                        </button>
                        <button
                            onClick={removeNode}
                            className="flex items-center gap-2 px-3 py-1.5 rounded bg-stone-800 text-white hover:bg-black text-[10px] font-bold uppercase transition-colors"
                        >
                            <Trash2 size={12} />
                            Delete Node
                        </button>
                    </div>
                )}
            </div>
            <div className="absolute bottom-4 left-4 text-[10px] bg-white/80 p-2 rounded border border-stone-200 backdrop-blur-sm pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                <p>Double-click to add node</p>
                <p>Drag to move nodes</p>
                <p>Click node to select</p>
                <p>Click "Add Link" then click another node to link</p>
            </div>
        </div>
    );
}