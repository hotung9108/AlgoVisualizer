import { useState } from "react";
import {
    Play,
    Pause,
    RotateCcw,
    SkipForward,
    Upload,
    Info,
    Edit3,
    Eye,
    Save,
    HelpCircle,
    X,
} from "lucide-react";
type Mode = "visualize" | "edit";

function App() {
    const [mode, setMode] = useState<Mode>("visualize");
    return (
        <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
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
                {/* <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-[#141414] rounded-full hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors text-sm font-medium"
                    >
                        <HelpCircle size={16} />
                        <span>Help</span>
                    </button>
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-[#141414] rounded-full hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors text-sm font-medium">
                        <Upload size={16} />
                        <span>Import</span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".txt"
                        />
                    </label>
                </div> */}
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-100px)]">
                {/* Left Panel: Input & Controls */}
                <div className="lg:col-span-4 border-r border-[#141414] flex flex-col overflow-hidden">
                    <div className="border-t border-[#141414] p-6 bg-white/30 backdrop-blur-sm">
                        {/* <h2 className="font-serif italic text-sm uppercase opacity-50 tracking-wider mb-2">
                            
                        </h2> */}
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
                        {/* {mode === "edit" ? (
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
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        setGraphData(
                                            parseInput(e.target.value),
                                        );
                                    }}
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
                                                setGraphData(
                                                    parseInput(content),
                                                );
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
                                {steps.length > 0 && (
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
                                                onClick={() =>
                                                    setIsPlaying(!isPlaying)
                                                }
                                                className="col-span-2 flex flex-col items-center justify-center p-3 border border-[#141414] bg-[#141414] text-[#E4E3E0] hover:opacity-90 transition-all"
                                            >
                                                {isPlaying ? (
                                                    <Pause size={18} />
                                                ) : (
                                                    <Play size={18} />
                                                )}
                                                <span className="text-[9px] mt-1 uppercase font-bold">
                                                    {isPlaying
                                                        ? "Pause"
                                                        : "Play"}
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
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="w-full accent-[#141414]"
                                            />
                                        </div>
                                        <p className="text-[10px] opacity-40 mt-2 italic">
                                            Tip: The algorithm prioritizes nodes
                                            with the lowest heuristic value.
                                        </p>
                                    </section>
                                )}
                            </div>
                        )} */}
                    </div>

                    {/* Status Bar */}
                    <div className="border-t border-[#141414] p-6 bg-white/30 backdrop-blur-sm">
                        <h2 className="font-serif italic text-sm uppercase opacity-50 tracking-wider mb-2">
                            Algorithm Status
                        </h2>
                        <div className="font-mono text-xs min-h-[3em]">
                            {/* {mode === "visualize" ? (
                                currentStep ? (
                                    <p className="animate-in fade-in slide-in-from-left-2 duration-300">
                                        {currentStep.message}
                                    </p>
                                ) : (
                                    <p className="opacity-30 italic">
                                        Ready to start...
                                    </p>
                                )
                            ) : (
                                <p className="opacity-50 italic">
                                    Editing mode active. Double-click canvas to
                                    add nodes.
                                </p>
                            )} */}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Visualization / Editor */}
                <div className="lg:col-span-8 p-6 flex flex-col gap-6 overflow-hidden">
                    <div className="flex-1 min-h-0">
                        {/* {mode === "visualize" ? (
                            <GraphView
                                data={graphData}
                                currentNode={currentStep?.currentNode || null}
                                openSet={currentStep?.openSet || []}
                                closedSet={currentStep?.closedSet || []}
                                path={currentStep?.path || []}
                            />
                        ) : (
                            <GraphEditor
                                data={graphData}
                                onChange={handleGraphChange}
                            />
                        )} */}
                    </div>

                    {/* Data Grid / Step Info */}
                    {/* {mode === "visualize" && (
                        <div className="h-48 border border-[#141414] bg-white overflow-hidden flex flex-col animate-in slide-in-from-bottom-8">
                            <div className="grid grid-cols-3 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] text-[10px] font-bold uppercase tracking-widest">
                                <div className="p-2 border-r border-[#E4E3E0]/20">
                                    Open Set (Priority Queue)
                                </div>
                                <div className="p-2 border-r border-[#E4E3E0]/20">
                                    Closed Set (Explored)
                                </div>
                                <div className="p-2">Current Path</div>
                            </div>
                            <div className="grid grid-cols-3 flex-1 overflow-y-auto font-mono text-[10px]">
                                <div className="p-3 border-r border-[#141414] flex flex-wrap gap-1 content-start">
                                    {currentStep?.openSet.map((id) => (
                                        <span
                                            key={id}
                                            className="px-1 bg-blue-100 border border-blue-300 rounded"
                                        >
                                            {id}(h=
                                            {graphData.nodes[id]?.heuristic})
                                        </span>
                                    ))}
                                </div>
                                <div className="p-3 border-r border-[#141414] flex flex-wrap gap-1 content-start">
                                    {currentStep?.closedSet.map((id) => (
                                        <span
                                            key={id}
                                            className="px-1 bg-stone-100 border border-stone-300 rounded"
                                        >
                                            {id}
                                        </span>
                                    ))}
                                </div>
                                <div className="p-3 flex flex-wrap gap-1 content-start">
                                    {currentStep?.path.map((id, i) => (
                                        <React.Fragment key={id}>
                                            <span className="px-1 bg-green-100 border border-green-300 rounded font-bold">
                                                {id}
                                            </span>
                                            {i <
                                                currentStep.path.length - 1 && (
                                                <span className="opacity-30">
                                                    →
                                                </span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )} */}
                </div>
            </main>
        </div>
    );
}

export default App;

// import { useState } from "react";

// function VisualizePage() {
//   return (
//     <div>
//       <header>
//         <h1>Best-First Search</h1>
//         <button onClick={() => {}}>VISUALIZE</button>
//         <button onClick={() => {}}>EDIT</button>
//       </header>
//       <div style={{ display: "flex" }}>
//         <section style={{ width: "30%", padding: 16 }}>
//           <h2>GRAPH DEFINITION</h2>
//           <textarea style={{ width: "100%", height: 300 }}>
// A
// D
// A - 20: C D E
// C - 15: F
// D - 6: F I
// F - 10: B
// I - 8: B G
// E - 7: K G
// G - 5: B
// H - 12
// B - 0
//           </textarea>
//           <div style={{ marginTop: 16 }}>
//             <em>Tip: You can also edit the graph visually on the right.</em>
//           </div>
//           <div style={{ marginTop: 32 }}>
//             <h3>ALGORITHM STATUS</h3>
//             <p>Editing mode active. Double-click canvas to add nodes.</p>
//           </div>
//         </section>
//         <section style={{ flex: 1, padding: 16 }}>
//           {/* Placeholder for graph visualization */}
//           <div style={{ border: "1px solid #ccc", height: 400 }}>
//             {/* Graph visualization here */}
//             <p>Graph visualization area</p>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

// function EditPage() {
//   return (
//     <div>
//       <header>
//         <h1>Best-First Search</h1>
//         <button onClick={() => {}}>VISUALIZE</button>
//         <button onClick={() => {}}>EDIT</button>
//       </header>
//       <div style={{ display: "flex" }}>
//         <section style={{ width: "30%", padding: 16 }}>
//           <h2>PLAYBACK CONTROLS</h2>
//           <button>RESET</button>
//           <button>PLAY</button>
//           <button>STEP</button>
//           <div>
//             <label>SPEED: 1000MS</label>
//             <input type="range" min="100" max="2000" defaultValue="1000" />
//           </div>
//           <div style={{ marginTop: 16 }}>
//             <em>Tip: The algorithm prioritizes nodes with the lowest heuristic value.</em>
//           </div>
//           <div style={{ marginTop: 32 }}>
//             <h3>ALGORITHM STATUS</h3>
//             <p>Goal reached! Path: A → D</p>
//           </div>
//         </section>
//         <section style={{ flex: 1, padding: 16 }}>
//           {/* Placeholder for graph visualization */}
//           <div style={{ border: "1px solid #ccc", height: 400 }}>
//             {/* Graph visualization here */}
//             <p>Graph visualization area</p>
//           </div>
//           <div style={{ marginTop: 32 }}>
//             <div style={{ display: "flex", gap: 16 }}>
//               <div>
//                 <h4>OPEN SET (PRIORITY QUEUE)</h4>
//                 <div>E(h=7) C(h=15)</div>
//               </div>
//               <div>
//                 <h4>CLOSED SET (EXPLORED)</h4>
//                 <div>A D</div>
//               </div>
//               <div>
//                 <h4>CURRENT PATH</h4>
//                 <div>A → D</div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

// function App() {
//   const [page, setPage] = useState<"visualize" | "edit">("visualize");

//   return (
//     <>
//       {page === "visualize" ? (
//         <VisualizePage />
//       ) : (
//         <EditPage />
//       )}
//       <div style={{ position: "fixed", top: 16, right: 16 }}>
//         <button onClick={() => setPage("visualize")}>VISUALIZE</button>
//         <button onClick={() => setPage("edit")}>EDIT</button>
//       </div>
//     </>
//   );
// }

// export default App;
