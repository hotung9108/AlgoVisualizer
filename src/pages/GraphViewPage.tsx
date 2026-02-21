import { useEffect, useRef, useState } from "react";
import type { Graph } from "../types/Graph";
import type { SearchStep } from "../types/SearchStep";

interface GraphViewProps {
    data?: Graph;
    step?: SearchStep;
}
export default function GraphView({ data, step }: GraphViewProps) {
    if (!data || !data.nodes) return <div>No graph data</div>;
    const svgRef = useRef<SVGSVGElement>(null);
    const svgWidth = 1500;
    const svgHeight = 500;
    const RADIUS = 200;
    const [nodePositions, setNodePositions] = useState<
        Record<string, { x: number; y: number }>
    >({});
    const [dragging, setDragging] = useState<{
        id: string;
        offsetX: number;
        offsetY: number;
    } | null>(null);
    const nodeIds = Object.keys(data.nodes);
    const openSetIds = step?.L?.map((n) => n.id) ?? [];
    const closedSetIds = step?.D ?? [];
    const pathIds = step?.parent ?? [];

    useEffect(() => {
        if (!data || !data.nodes) return;
        const ids = Object.keys(data.nodes);
        const cx = svgWidth / 2;
        const cy = svgHeight / 2;
        const pos: typeof nodePositions = {};
        ids.forEach((id, idx) => {
            const angle = (2 * Math.PI * idx) / ids.length;
            pos[id] = {
                x: cx + RADIUS * Math.cos(angle),
                y: cy + RADIUS * Math.sin(angle),
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
        const pos = nodePositions[id];
        const mouse = getMousePos(e);
        setDragging({
            id,
            offsetX: mouse.x - pos.x,
            offsetY: mouse.y - pos.y,
        });
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
        setDragging(null);
    };

    const edges = data.edges
        .map((edge) => {
            const from = nodePositions[edge.from];
            const to = nodePositions[edge.to];
            if (!from || !to) return null;
            let color = "#999";
            let width = 2;
            for (let i = 0; i < pathIds.length - 1; i++) {
                if (pathIds[i] === edge.from && pathIds[i + 1] === edge.to) {
                    color = "#10b981";
                    width = 4;
                }
            }
            return (
                <line
                    key={edge.id}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={color}
                    strokeWidth={width}
                    markerEnd="url(#arrowhead)"
                />
            );
        })
        .filter(Boolean);

    const nodes = nodeIds.map((id) => {
        const pos = nodePositions[id];
        if (!pos) return null;
        let fill = "#fff";
        if (step?.currentNode === id) fill = "#f59e0b";
        else if (pathIds.includes(id)) fill = "#10b981";
        else if (openSetIds.includes(id)) fill = "#3b82f6";
        else if (closedSetIds.includes(id)) fill = "#6b7280";
        else if (id === data.startNode) fill = "#8b5cf6";
        else if (id === data.endNode) fill = "#ef4444";
        return (
            <g
                key={id}
                transform={`translate(${pos.x},${pos.y})`}
                onMouseDown={onMouseDownNode(id)}
                style={{ cursor: "move" }}
            >
                <circle r={24} fill={fill} stroke="#333" strokeWidth={2} />
                <text
                    textAnchor="middle"
                    dy=".35em"
                    fontSize={14}
                    fontWeight="bold"
                    fill="#333"
                >
                    {id} ({data.nodes[id].heuristic})
                </text>
            </g>
        );
    });

    return (
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
            <div className="flex-1 min-h-0">
                <div>
                    <div className="w-full h-full bg-stone-100 rounded-lg overflow-x-auto border border-stone-300 relative">
                        <svg
                            ref={svgRef}
                            width={svgWidth}
                            height={svgHeight}
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseUp}
                        >
                            <defs>
                                <marker
                                    id="arrowhead"
                                    markerWidth="10"
                                    markerHeight="7"
                                    refX="18"
                                    refY="3.5"
                                    orient="auto"
                                >
                                    <polygon
                                        points="0 0, 10 3.5, 0 7"
                                        fill="#999"
                                    />
                                </marker>
                            </defs>
                            {edges}
                            {nodes}
                        </svg>
                        <div className="absolute bottom-4 left-4 flex flex-col gap-1 text-[10px] bg-white/80 p-2 rounded border border-stone-200 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#f59e0b] border border-stone-400" />
                                <span>Node đang xét</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#3b82f6] border border-stone-400" />
                                <span>Node trong danh sách</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#6b7280] border border-stone-400" />
                                <span>Node đã xét</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#10b981] border border-stone-400" />
                                <span>Kết quả</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-48 border border-[#141414] bg-white overflow-hidden flex flex-col animate-in slide-in-from-bottom-8">
                <div className="grid grid-cols-5 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] text-[10px] font-bold uppercase tracking-widest">
                    <div className="p-2 border-r border-[#E4E3E0]/20">
                        Phát triển thạng thái
                    </div>
                    <div className="p-2 border-r border-[#E4E3E0]/20">
                        Trạng thái kề
                    </div>
                    <div className="p-2 border-r border-[#E4E3E0]/20">
                        Danh sách đang xét (L)
                    </div>
                    <div className="p-2 border-r border-[#E4E3E0]/20">
                        Danh sách đã đi qua (D)
                    </div>
                    <div className="p-2">Đường hiện tại</div>
                </div>
                <div className="grid grid-cols-5 flex-1 overflow-y-auto font-mono text-[10px]">
                    <div className="p-3 border-r border-[#141414] flex flex-wrap gap-1 content-start">
                        {step?.currentNode && (
                            <span className="px-1 bg-orange-100 border border-orange-300 rounded font-bold">
                                {step.currentNode}
                            </span>
                        )}
                    </div>
                    <div className="p-3 border-r border-[#141414] flex flex-wrap gap-1 content-start">
                        {step?.currentNode &&
                            data?.nodes[step.currentNode]?.neighbors.map(
                                (neighborId) => (
                                    <span
                                        key={neighborId}
                                        className="px-1 bg-orange-50 border border-orange-200 rounded"
                                    >
                                        {neighborId}
                                    </span>
                                ),
                            )}
                    </div>
                    <div className="p-3 border-r border-[#141414] flex flex-wrap gap-1 content-start">
                        {step?.L.map((node) => (
                            <span
                                key={node.id}
                                className="px-1 bg-blue-100 border border-blue-300 rounded"
                            >
                                {node.id}(h={node.heuristic})
                            </span>
                        ))}
                    </div>
                    <div className="p-3 border-r border-[#141414] flex flex-wrap gap-1 content-start">
                        {step?.D.map((id) => (
                            <span
                                key={id}
                                className="px-1 bg-stone-100 border border-stone-300 rounded"
                            >
                                {id}
                            </span>
                        ))}
                    </div>
                    <div className="p-3 flex flex-wrap gap-1 content-start">
                        {step?.parent.map((id, i) => (
                            <span
                                key={id}
                                className="px-1 bg-green-100 border border-green-300 rounded font-bold"
                            >
                                {id}
                                {i < step.parent.length - 1 && (
                                    <span className="opacity-30">→</span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
