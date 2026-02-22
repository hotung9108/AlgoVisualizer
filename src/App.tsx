import { useEffect, useRef, useState } from "react";
import {
    Play,
    Pause,
    RotateCcw,
    SkipForward,
    Info,
    Edit3,
    Eye,
    Save,
} from "lucide-react";
import { bestFirstSearch } from "./utils/BestFirstSearch";
import GraphView from "./pages/GraphViewPage";
import GraphEditor from "./pages/GraphEditorPage";
import type { Graph } from "./types/Graph";
import type { SearchStep } from "./types/SearchStep";
import { parseInput } from "./utils/ParseInput";
type Mode = "visualize" | "edit";
const DEFAULT_INPUT = `
A
B
A - 20: C D E
C - 15: F
D - 6: F I
F - 10: B
I - 8: B G
E - 7: K G
G - 5: B H
H - 12: B
B - 0:
`;

function App() {
    const [input, setInput] = useState(DEFAULT_INPUT);
    const [graph, setGraph] = useState<Graph>();
    const [steps, setSteps] = useState<SearchStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [mode, setMode] = useState<Mode>("visualize");
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(800);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // setGraph(parseInput(DEFAULT_INPUT));
        const parsed = parseInput(DEFAULT_INPUT);
        setGraph(parsed);
        setSteps(parsed.nodes ? bestFirstSearch(parsed) : []);
        setCurrentStepIndex(0);
    }, []);
    useEffect(() => {
        // Khi graph thay đổi, cập nhật input (chỉ khi không phải do textarea)
        if (graph && mode === "edit") {
            setInput(graphToInput(graph));
        }
    }, [graph, mode]);
    function graphToInput(graph: Graph): string {
        if (!graph || !graph.nodes) return "";
        let lines = [];
        lines.push(graph.startNode || "");
        lines.push(graph.endNode || "");
        Object.values(graph.nodes).forEach((node) => {
            lines.push(
                `${node.id} - ${node.heuristic}: ${node.neighbors.join(" ")}`,
            );
        });
        return lines.join("\n");
    }
    const handleInitialize = () => {
        const parsed = parseInput(input);
        setGraph(parsed);
        setSteps(parsed.nodes ? bestFirstSearch(parsed) : []);
        setCurrentStepIndex(0);
    };

    const handleEditorChange = (newGraph: Graph) => {
        // Tạo lại edges từ nodes
        const nodes = newGraph.nodes;
        const edges = Object.values(nodes).flatMap((node) =>
            node.neighbors.map((neighborId) => ({
                id: `${node.id}_${neighborId}`,
                from: node.id,
                to: neighborId,
            })),
        );
        const graphWithEdges = { ...newGraph, edges };
        setGraph(graphWithEdges);
        setInput(graphToInput(graphWithEdges));
        setSteps(graphWithEdges.nodes ? bestFirstSearch(graphWithEdges) : []);
        setCurrentStepIndex(0);
    };
    useEffect(() => {
        if (!isPlaying) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }
        if (currentStepIndex < steps.length - 1) {
            timerRef.current = setTimeout(() => {
                setCurrentStepIndex((idx) => idx + 1);
            }, playbackSpeed);
        } else {
            setIsPlaying(false);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentStepIndex, steps.length, playbackSpeed]);

    const handlePlayPause = () => {
        if (currentStepIndex >= steps.length - 1) {
            setCurrentStepIndex(0);
        }
        setIsPlaying((v) => !v);
    };
    const handleReset = () => {
        setCurrentStepIndex(0);
        setIsPlaying(false);
    };
    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex((idx) => idx + 1);
        }
    };
    return (
        <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] flex flex-col">
            <header className="border-b border-[#141414] p-6 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="font-serif italic text-3xl tracking-tight">
                            Best-First Search
                        </h1>
                        <p className="text-[11px] uppercase tracking-widest opacity-50 mt-1">
                            Algorithm Visualizer & Editor
                        </p>
                    </div>
                </div>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-12 flex flex-1 overflow-hidden">
                <div className="lg:col-span-4 border-r border-[#141414] flex flex-col h-full overflow-hidden">
                    <div className="p-6 backdrop-blur-sm">
                        <nav className="flex bg-white/50 p-1 rounded-full border border-[#141414] w-fit mx-auto">
                            <button
                                onClick={() => setMode("visualize")}
                                className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                                    mode === "visualize"
                                        ? "bg-[#141414] text-[#E4E3E0]"
                                        : "hover:bg-black/5"
                                }`}
                            >
                                <Eye size={14} />
                                Visualize
                            </button>
                            <button
                                onClick={() => setMode("edit")}
                                className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                                    mode === "edit"
                                        ? "bg-[#141414] text-[#E4E3E0]"
                                        : "hover:bg-black/5"
                                }`}
                            >
                                <Edit3 size={14} />
                                Edit
                            </button>
                        </nav>
                    </div>
                    <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                        {mode === "edit" ? (
                            <section className="animate-in fade-in slide-in-from-left-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="font-serif italic text-sm uppercase opacity-50 tracking-wider">
                                        Graph Definition
                                    </h2>
                                    <div className="group relative">
                                        <Info
                                            size={14}
                                            className="opacity-30 cursor-help"
                                        />
                                        <div className="absolute right-0 top-6 w-64 p-3 bg-white border border-[#141414] rounded shadow-xl text-[10px] hidden group-hover:block z-50">
                                            <p className="font-bold mb-1">
                                                Format:
                                            </p>
                                            <p>Line 1: Start Node (e.g. A)</p>
                                            <p>Line 2: End Node (e.g. B)</p>
                                            <p>
                                                Line 3+: Node - Heuristic:
                                                Neighbors
                                            </p>
                                            <p className="mt-2 italic opacity-70">
                                                Example: A - 20: C D E
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const content = event.target
                                                    ?.result as string;
                                                setInput(content);
                                                setGraph(parseInput(content));
                                            };
                                            reader.readAsText(file);
                                        }
                                    }}
                                    className="w-full h-96 bg-transparent border border-[#141414] p-4 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#141414] resize-none"
                                    placeholder="Enter graph data..."
                                />
                                <p className="text-[10px] opacity-40 mt-2 italic">
                                    Tip: You can also edit the graph visually on
                                    the right.
                                </p>
                                <button
                                    onClick={handleInitialize}
                                    className="w-full mt-4 bg-[#141414] text-[#E4E3E0] py-3 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    <Save size={14} />
                                    Apply Changes
                                </button>
                            </section>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* {steps.length > 0 && ( */}
                                <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                                    <h2 className="font-serif italic text-sm uppercase opacity-50 tracking-wider">
                                        Playback Controls
                                    </h2>
                                    <div className="grid grid-cols-4 gap-2">
                                        <button
                                            onClick={handleReset}
                                            className="flex flex-col items-center justify-center p-3 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                                        >
                                            <RotateCcw size={18} />
                                            <span className="text-[9px] mt-1 uppercase font-bold">
                                                Reset
                                            </span>
                                        </button>
                                        <button
                                            onClick={handlePlayPause}
                                            className="col-span-2 flex flex-col items-center justify-center p-3 border border-[#141414] bg-[#141414] text-[#E4E3E0] hover:opacity-90 transition-all"
                                        >
                                            {isPlaying ? (
                                                <Pause size={18} />
                                            ) : (
                                                <Play size={18} />
                                            )}
                                            <span className="text-[9px] mt-1 uppercase font-bold">
                                                {isPlaying ? "Pause" : "Play"}
                                            </span>
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={
                                                currentStepIndex >=
                                                steps.length - 1
                                            }
                                            className="flex flex-col items-center justify-center p-3 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit"
                                        >
                                            <SkipForward size={18} />
                                            <span className="text-[9px] mt-1 uppercase font-bold">
                                                Step
                                            </span>
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold opacity-50 block mb-1">
                                            Speed: {playbackSpeed}ms
                                        </label>
                                        <input
                                            type="range"
                                            min="100"
                                            max="2000"
                                            step="100"
                                            value={playbackSpeed}
                                            onChange={(e) =>
                                                setPlaybackSpeed(
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            className="w-full accent-[#141414]"
                                        />
                                    </div>
                                </section>
                                {/* )} */}
                            </div>
                        )}
                    </div>

                    {/* <div className="border-t border-[#141414] p-6 bg-white/30 backdrop-blur-sm">
                        <h2 className="font-serif italic text-sm uppercase opacity-50 tracking-wider mb-2">
                            Algorithm Status
                        </h2>
                        <div className="font-mono text-xs min-h-[3em]"></div>
                    </div> */}
                </div>

                <div className="lg:col-span-8 p-6 flex flex-col gap-6 overflow-hidden">
                    <div className="flex-1 min-h-0">
                        {mode === "visualize" ? (
                            <GraphView
                                data={graph}
                                step={steps[currentStepIndex]}
                            />
                        ) : (
                            <GraphEditor
                                data={graph}
                                onChange={handleEditorChange}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
