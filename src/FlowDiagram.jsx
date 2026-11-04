// FlowDiagram.jsx
//
// Interactive flow chart (React Flow) with:
//  - a filter sidebar that shows/hides nodes and edges depending on survey design
//  - a collapsible legend panel
//  - a one-click "Print / save as PDF" function (fixed A1 paper size)

import React, { useState, useMemo, useEffect } from 'react'
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  getNodesBounds,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { allNodes, allEdges } from './diagramData.js'
import { filterNodes, filterEdges } from './filterLogic'

import {
  DecisionNode,
  ProcessNode,
  ValidationNode,
  FlagNode,
  DropNode,
  FormulaNode,
  FormulaTextNode,
  ChosenNode
} from './nodeTypes.jsx'

// ---------------------------------------------------------------------------
// React Flow configuration
// ---------------------------------------------------------------------------

// Maps the "type" field on each node in diagramData.js to a React component.
// Defined outside the component so React Flow does not warn about new object
// references on every render.
const nodeTypesStatic = {
  decision: DecisionNode,
  process: ProcessNode,
  validation: ValidationNode,
  flag: FlagNode,
  drop: DropNode,
  formula: FormulaNode,
  formulaText: FormulaTextNode,
  chosen: ChosenNode
}

// 'straight' and 'step' are built-in edge types in React Flow,
// so no custom edge components are needed.
const edgeTypesStatic = {}

// Every edge gets a closed arrowhead at its end
const defaultEdgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 30,
    height: 30,
  }
}

// Initial view: top-left corner of the diagram, zoomed out to 50 %
const defaultViewport = { x: 50, y: 50, zoom: 0.5 }

// ---------------------------------------------------------------------------
// Page header text (edit freely)
// ---------------------------------------------------------------------------

const PAGE_TITLE = 'HCES Food Data Flow Chart'

// Intro text can contain JSX, e.g. links that open in a new tab
const PAGE_INTRO = (
  <>
    This flow chart illustrates the step-by-step process for cleaning, validating, and analysing food consumption data according to{' '}
    <a
      href="https://openknowledge.fao.org/items/309602e9-96a6-4035-8116-aa583f389b46"
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#3498DB', textDecoration: 'underline' }}
    >
      the guidelines
    </a>.
    {' '}Use the filters on the left to tailor the diagram to your specific survey design.
  </>
)

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

// Width (in px) of the left filter sidebar and the right legend panel
const SIDEBAR_WIDTH = 520
const LEGEND_WIDTH = 280

// localStorage keys, used to remember whether the panels were open
const SIDEBAR_STORAGE_KEY = 'flowdiagram_sidebar_open'
const LEGEND_STORAGE_KEY = 'flowdiagram_legend_open'

// ---------------------------------------------------------------------------
// Print settings
// ---------------------------------------------------------------------------

// Fixed paper size for printing: A1, as [short side, long side] in mm.
// The orientation (landscape/portrait) is chosen automatically from the
// shape of the visible diagram at print time.
const PRINT_PAPER_MM = [594, 841]

// Conversion from millimetres to CSS pixels (CSS assumes 96 dpi)
const MM_TO_PX = 96 / 25.4

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

// Filter configuration. To add, remove or change a filter, edit only this list.
// Each filter has:
//   key      - the name used in "dependsOn" on nodes/edges in diagramData.js
//   question - the text shown in the sidebar
//   options  - [value, label] pairs, one button per option
const FILTERS = [
  {
    key: 'filter1',
    question: 'Does the survey collect "Total quantity consumed"?',
    options: [['yes', 'Yes'], ['no', 'No']]
  },
  {
    key: 'filter3',
    question: 'Does the survey collect in-house food and FAFH (food away from home) in separate modules?',
    options: [['yes', 'Yes'], ['no', 'No']]
  },
  {
    key: 'filter4',
    question: 'For purchased foods, does the survey collect monetary values and their respective quantities only for last purchases?',
    options: [['yes', 'Yes'], ['no', 'No']]
  },
  {
    key: 'filter5',
    question: 'Does the survey collect reliable monetary values for non-purchased food items?',
    options: [['yes_reliable', 'Collected and considered reliable'], ['yes_not_reliable', 'Collected, but not considered reliable'], ['no', 'Not collected']]
  },
  {
    key: 'filter7',
    question: 'Does the survey collect information on visitors?',
    options: [['yes', 'Yes'], ['no', 'No']]
  },
  {
    key: 'filter8',
    question: 'Does the survey collect the number of meals consumed away from home?',
    options: [['yes', 'Yes'], ['no', 'No']]
  },
  {
    key: 'filter9',
    question: 'Does the survey collect FAFH at the individual level?',
    options: [['yes', 'Yes'], ['no', 'No']]
  },
  {
    key: 'filter6',
    question: 'Does the survey collect all food quantities in standard units?',
    options: [['yes', 'Yes'], ['no', 'No']]
  }
]

// Every filter starts as null = "not answered" (no filtering)
const initialAnswers = Object.fromEntries(FILTERS.map(f => [f.key, null]))

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

// Colours must match the node colours defined in nodeTypes.jsx
const LEGEND_ITEMS = [
  { color: '#D6EAF8', border: '#3498DB', label: 'Decision', description: 'A yes/no question' },
  { color: '#D5F5E3', border: '#27AE60', label: 'Process', description: 'An action or calculation step' },
  { color: '#FCF3CF', border: '#F1C40F', label: 'Start/end', description: 'Marks the start or the end of a step' },
  { color: '#f8c5f4', border: '#ec0dc7', label: 'Flag', description: 'Flagged for review' },
  { color: '#eb8d8d', border: '#ec0d18', label: 'Drop', description: 'Observation dropped' },
  { color: '#f0ede9', border: '#8d6c10', label: 'Chosen', description: 'Decision affected by filter question' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Returns the inline style for a filter button.
// Active (selected) buttons are highlighted; "reset" has its own grey colour.
function getButtonStyle(isActive, variant = 'option') {
  const activeColors = {
    option: { bg: '#3498DB', border: '#2874A6' },
    reset: { bg: '#95A5A6', border: '#7F8C8D' },
  }
  const { bg, border } = activeColors[variant]

  return {
    backgroundColor: isActive ? bg : '#FFFFFF',
    color: isActive ? '#FFFFFF' : '#222',
    border: isActive ? `2px solid ${border}` : '1px solid #CCC',
    borderRadius: 4,
    padding: '6px 12px',
    marginRight: 6,
    marginBottom: 6,
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    fontSize: 13,
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FlowDiagram() {
  // Gives access to React Flow's viewport controls (fitView etc.).
  // Requires <ReactFlowProvider> higher up in the tree (see App.jsx).
  const reactFlowInstance = useReactFlow()

  // Nodes and edges are defined manually in diagramData.js
  const [importedNodes] = useState(allNodes)
  const [importedEdges] = useState(allEdges)

  const nodeTypes = useMemo(() => nodeTypesStatic, [])
  const edgeTypes = useMemo(() => edgeTypesStatic, [])

  // Current answer for each filter (null = not answered)
  const [answers, setAnswers] = useState(initialAnswers)

  // Left sidebar open/closed, remembered between visits
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  })

  // Legend panel open/closed (closed by default), remembered between visits
  const [legendOpen, setLegendOpen] = useState(() => {
    const stored = localStorage.getItem(LEGEND_STORAGE_KEY)
    return stored === null ? false : stored === 'true'
  })

  // Print mode: while true, only the diagram is shown, sized to the paper.
  // printDims holds the paper size in CSS pixels.
  const [printing, setPrinting] = useState(false)
  const [printDims, setPrintDims] = useState({ wPx: 0, hPx: 0 })

  // Save panel states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen))
  }, [sidebarOpen])

  useEffect(() => {
    localStorage.setItem(LEGEND_STORAGE_KEY, String(legendOpen))
  }, [legendOpen])

  // Pressing Esc closes both panels
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        setLegendOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Update the answer for one filter
  const setAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  // Apply the filters: first nodes, then edges (edges also depend on which
  // nodes are visible and on their own "dependsOn" rules)
  const visibleNodes = filterNodes(importedNodes, answers)
  const visibleEdges = filterEdges(importedEdges, visibleNodes, answers)

  const memoNodes = useMemo(() => visibleNodes, [visibleNodes])
  const memoEdges = useMemo(() => visibleEdges, [visibleEdges])

  // -------------------------------------------------------------------------
  // Printing
  // -------------------------------------------------------------------------
  // Uses the browser's own print function instead of rendering an image:
  //  1. Set the paper size (A1) through a temporary @page rule.
  //  2. Switch to print mode so only the diagram is shown, in exactly the
  //     size of the paper.
  //  3. Zoom so all visible (filtered) nodes fit on the page.
  //  4. Open the print dialog. The user can print or choose "Save as PDF".
  // Because the browser draws the SVG itself, text and arrowheads stay sharp
  // (vector graphics) at any size.
  async function handlePrint() {
    if (memoNodes.length === 0) return

    // Choose landscape or portrait based on the shape of the visible diagram
    const bounds = getNodesBounds(memoNodes)
    const isLandscape = bounds.width >= bounds.height
    const [shortMm, longMm] = PRINT_PAPER_MM
    const wMm = isLandscape ? longMm : shortMm
    const hMm = isLandscape ? shortMm : longMm

    // Temporary stylesheet: paper size, exact colours, hide zoom controls
    const styleEl = document.createElement('style')
    styleEl.id = 'print-page-style'
    styleEl.textContent = `
      @page { size: ${wMm}mm ${hMm}mm; margin: 0; }
      @media print {
        html, body { margin: 0 !important; overflow: hidden !important; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .react-flow__controls, .react-flow__attribution { display: none !important; }
      }
    `
    document.head.appendChild(styleEl)

    // Enter print mode with the diagram area set to the paper size
    setPrintDims({ wPx: Math.round(wMm * MM_TO_PX), hPx: Math.round(hMm * MM_TO_PX) })
    setPrinting(true)

    const wait = (ms) => new Promise(r => setTimeout(r, ms))

    // Wait for the layout to resize, then zoom to fit the whole diagram.
    // Increase the delays if the diagram is not centred in the print preview.
    await wait(400)
    reactFlowInstance.fitView({ padding: 0.04, duration: 0, minZoom: 0.01 })
    await wait(400)

    // After printing (or cancelling), restore the normal view
    const cleanup = () => {
      document.getElementById('print-page-style')?.remove()
      setPrinting(false)
      setTimeout(() => reactFlowInstance.fitView({ padding: 0.2, duration: 0 }), 100)
    }
    window.addEventListener('afterprint', cleanup, { once: true })

    window.print()
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F5F5F5' }}>

      {/* HEADER: title and intro text (hidden while printing) */}
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #DDD',
          flexShrink: 0,
          display: printing ? 'none' : undefined,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, color: '#222' }}>{PAGE_TITLE}</h1>
        <p style={{ margin: '6px 0 0 0', fontSize: 14, color: '#555', maxWidth: 900 }}>
          {PAGE_INTRO}
        </p>
      </div>

      {/* MAIN AREA: sidebar + diagram + legend */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', minHeight: 0 }}>

        {/* LEFT SIDEBAR: filters and print button (hidden while printing) */}
        <div
          style={{
            width: sidebarOpen ? SIDEBAR_WIDTH : 0,
            minWidth: sidebarOpen ? SIDEBAR_WIDTH : 0,
            padding: sidebarOpen ? 16 : 0,
            backgroundColor: '#FFFFFF',
            borderRight: sidebarOpen ? '1px solid #DDD' : 'none',
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            boxSizing: 'border-box',
            transition: 'width 0.2s ease, padding 0.2s ease',
            display: printing ? 'none' : undefined,
          }}
        >
          {sidebarOpen && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#222', margin: 0 }}>Filters</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    fontSize: 18,
                    cursor: 'pointer',
                    color: '#666',
                  }}
                  title="Close filterpanel (Esc)"
                >
                  ✕
                </button>
              </div>

              {/* One block per filter: question, option buttons and a reset button */}
              {FILTERS.map(({ key, question, options }) => (
                <div key={key} style={{ marginBottom: 20 }}>
                  <p style={{ color: '#000000' }}>{question}</p>
                  {options.map(([value, label]) => {
                    const isActive = answers[key] === value
                    return (
                      <button
                        key={value}
                        onClick={() => setAnswer(key, value)}
                        style={getButtonStyle(isActive, 'option')}
                      >
                        {label}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setAnswer(key, null)}
                    style={getButtonStyle(answers[key] === null, 'reset')}
                  >
                    Reset
                  </button>
                </div>
              ))}

              {/* Print / save as PDF (A1) */}
              <div style={{ marginTop: 16, marginBottom: 20 }}>
                <button
                  onClick={handlePrint}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#27AE60',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  🖨 Print / save as PDF
                </button>
                {/* Short instructions shown under the print button */}
                <div style={{ fontSize: 12, color: '#555', marginTop: 8, lineHeight: 1.5 }}>
                  <p style={{ margin: '0 0 6px 0' }}>
                    <strong>Print or save as PDF (A1):</strong> the diagram is prepared for A1 paper
                    and shows the current filter selection. In the print dialog, set margins to
                    "None" and enable "Background graphics". Chrome or Edge is recommended.
                  </p>

                  <p style={{ margin: '0 0 6px 0' }}>
                    <strong>Printer cannot print A1?</strong> You can still print directly:
                  </p>
                  <ol style={{ margin: '0 0 6px 0', paddingLeft: 18 }}>
                    <li>In the print dialog, choose your printer and a paper size it supports (for example A4 or A3).</li>
                    <li>Open "More settings" and set <strong>Scale</strong> to <strong>"Fit to printable area"</strong>
                      (in Edge: "Fit to page"). Do not use "Default" or 100 %.</li>
                    <li>Check the preview. The whole diagram should be on the page, just smaller.</li>
                  </ol>
                  <p style={{ margin: '0 0 6px 0' }}>
                    Because the diagram is vector graphics, text and arrows stay sharp when scaled
                    down. On a small paper size such as A4, the text will be very small, so A3
                    or larger is recommended for reading.
                  </p>

                  <p style={{ margin: 0 }}>
                    <strong>Only have an A4 printer and want a poster?</strong> Save as PDF, open the
                    file in Adobe Reader, and print with "Page Sizing &amp; Handling" set to "Poster".
                    Then tape the sheets together.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Button to reopen the filter sidebar (only when closed) */}
        {!sidebarOpen && !printing && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 10,
              padding: '8px 12px',
              backgroundColor: '#3498DB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            title="Open filterpanel"
          >
            ☰ Filters
          </button>
        )}

        {/* FLOW AREA: normally fills the remaining space. In print mode it is
            fixed to the top-left corner at exactly the paper size. */}
        <div
          style={
            printing
              ? {
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: printDims.wPx,
                  height: printDims.hPx,
                  zIndex: 9999,
                  backgroundColor: '#FAFAFA',
                }
              : { flex: 1, position: 'relative' }
          }
        >
          <ReactFlow
            nodes={memoNodes}
            edges={memoEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            defaultViewport={defaultViewport}
            minZoom={0.05}
            maxZoom={2}
            style={{ width: '100%', height: '100%', backgroundColor: '#FAFAFA' }}
          >
            <Background color="#DDD" gap={16} />
            {/* Zoom controls are hidden in print mode */}
            {!printing && <Controls />}
          </ReactFlow>
        </div>

        {/* RIGHT PANEL: legend (hidden while printing) */}
        <div
          style={{
            width: legendOpen ? LEGEND_WIDTH : 0,
            minWidth: legendOpen ? LEGEND_WIDTH : 0,
            padding: legendOpen ? 16 : 0,
            backgroundColor: '#FFFFFF',
            borderLeft: legendOpen ? '1px solid #DDD' : 'none',
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            boxSizing: 'border-box',
            transition: 'width 0.2s ease, padding 0.2s ease',
            display: printing ? 'none' : undefined,
          }}
        >
          {legendOpen && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#222', margin: 0 }}>Legend</h3>
                <button
                  onClick={() => setLegendOpen(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    fontSize: 18,
                    cursor: 'pointer',
                    color: '#666',
                  }}
                  title="Close legend (Esc)"
                >
                  ✕
                </button>
              </div>

              {/* One row per node type: colour swatch, name and description */}
              {LEGEND_ITEMS.map(({ color, border, label, description }) => (
                <div key={label} style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 32,
                      height: 24,
                      flexShrink: 0,
                      backgroundColor: color,
                      border: `2px solid ${border}`,
                      borderRadius: 4,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 13, color: '#000000' }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#000000' }}>{description}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Button to reopen the legend (only when closed) */}
        {!legendOpen && !printing && (
          <button
            onClick={() => setLegendOpen(true)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              padding: '8px 12px',
              backgroundColor: '#27AE60',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            title="Open legend"
          >
            ℹ️ Legend
          </button>
        )}
      </div>
    </div>
  )
}