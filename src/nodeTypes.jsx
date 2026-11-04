// nodeTypes.jsx
//
// React components for every node type used in the flow chart.
// The "type" field of a node in diagramData.js is mapped to one of these
// components in FlowDiagram.jsx (see nodeTypesStatic).
//
// Box types (decision, process, validation, flag, drop, chosen) share one
// generic box component and differ only in colour. Formula types render
// LaTeX with KaTeX.

import React from 'react'
import { Handle, Position } from 'reactflow'

import katex from "katex"
import "katex/dist/katex.min.css"

// Shared style for all box nodes
const baseStyle = {
  borderRadius: 6,
  padding: 10,
  border: '2px solid',
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  whiteSpace: 'pre-wrap',   // keeps line breaks ("\n") written in node labels
  overflow: 'hidden',
  textAlign: 'center',
  color: '#000000',
}

// All connection points ("handles") a box needs. Edges in diagramData.js refer
// to them by id through sourceHandle/targetHandle (e.g. 'out-right', 'in-top-75').
//   - 50 % handles sit in the middle of each side (visible dots).
//   - 25 % and 75 % handles are invisible extra points along each side. They
//     let an edge hit the box at an exact spot, e.g. "in-top-75".
const HANDLE_POSITIONS = [
  { id: 'top', side: 'top', offset: '50%' },
  { id: 'top-25', side: 'top', offset: '25%' },
  { id: 'top-75', side: 'top', offset: '75%' },
  { id: 'right', side: 'right', offset: '50%' },
  { id: 'right-25', side: 'right', offset: '25%' },
  { id: 'right-75', side: 'right', offset: '75%' },
  { id: 'bottom', side: 'bottom', offset: '50%' },
  { id: 'bottom-25', side: 'bottom', offset: '25%' },
  { id: 'bottom-75', side: 'bottom', offset: '75%' },
  { id: 'left', side: 'left', offset: '50%' },
  { id: 'left-25', side: 'left', offset: '25%' },
  { id: 'left-75', side: 'left', offset: '75%' },
]

// Maps our side names to React Flow's Position constants
const SIDE_TO_POSITION = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
}

// Builds the inline style for an extra (25 % / 75 %) handle: positioned along
// the chosen side, small, and fully transparent. The middle handles (50 %)
// keep React Flow's default look and need no custom style.
function extraHandleStyle(side, offset) {
  const vertical = side === 'top' || side === 'bottom'
  return {
    position: 'absolute',
    [side]: -6,
    [vertical ? 'left' : 'top']: offset,
    transform: vertical ? 'translateX(-50%)' : 'translateY(-50%)',
    width: 8,
    height: 8,
    background: '#333',
    opacity: 0,
  }
}

// Renders a source handle ("out-...") and a target handle ("in-...") for every
// position in HANDLE_POSITIONS.
function AllHandles() {
  return HANDLE_POSITIONS.map(({ id, side, offset }) => {
    const isMain = offset === '50%'
    const style = isMain ? undefined : extraHandleStyle(side, offset)
    const position = isMain ? SIDE_TO_POSITION[side] : null
    return (
      <React.Fragment key={id}>
        <Handle type="source" id={`out-${id}`} position={position} style={style} />
        <Handle type="target" id={`in-${id}`} position={position} style={style} />
      </React.Fragment>
    )
  })
}

// Generic rectangular box. Colour and border colour come from props.
// Size comes from data.width / data.height (defaults 180 x 80 px).
// All text box node types below are this component with different colours.
function BoxNode({ data, background, border }) {
  return (
    <div
      style={{
        ...baseStyle,
        backgroundColor: background,
        borderColor: border,
        width: data.width || 180,
        height: data.height || 80,
      }}
    >
      {data.label}
      <AllHandles />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Box node types (colours must match the legend in FlowDiagram.jsx)
// ---------------------------------------------------------------------------

// Green: an action or calculation step
export function ProcessNode({ data }) {
  return <BoxNode data={data} background="#D5F5E3" border="#27AE60" />
}

// Blue: a yes/no question
export function DecisionNode({ data }) {
  return <BoxNode data={data} background="#D6EAF8" border="#3498DB" />
}

// Yellow: start or end of a step
export function ValidationNode({ data }) {
  return <BoxNode data={data} background="#FCF3CF" border="#F1C40F" />
}

// Pink: flagged for review
export function FlagNode({ data }) {
  return <BoxNode data={data} background="#f8c5f4" border="#ec0dc7" />
}

// Red: observation dropped
export function DropNode({ data }) {
  return <BoxNode data={data} background="#eb8d8d" border="#ec0d18" />
}

// Beige: a decision already answered by a filter question
export function ChosenNode({ data }) {
  return <BoxNode data={data} background="#f0ede9" border="#8d6c10" />
}

// ---------------------------------------------------------------------------
// Formula node types (LaTeX rendered with KaTeX)
// ---------------------------------------------------------------------------

// Simple formula box: shows only the LaTeX formula (data.latex).
// Note: it has only one handle on each of the left and right sides, with no
// ids, so edges to it should not specify sourceHandle/targetHandle ids.
export function FormulaNode({ data }) {
  // Convert the LaTeX string to HTML. throwOnError: false shows the raw
  // text instead of crashing if the formula contains a mistake.
  const html = katex.renderToString(data.latex || '', {
    throwOnError: false,
    displayMode: true,
  })

  return (
    <div
      style={{
        backgroundColor: '#D5F5E3',
        border: '2px solid #27AE60',
        borderRadius: 6,
        padding: 10,
        width: data.width || 220,
        minHeight: data.height || 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000000',
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  )
}

// Formula box with optional text around the formula. data fields:
//   description - text above the formula
//   latex       - the formula (LaTeX)
//   note        - small italic text below the formula (e.g. explanation of symbols)
//   notex       - normal-sized text below the formula
//   width/height- size in px (height is a minimum, the box grows with content)
export function FormulaTextNode({ data }) {
  const html = katex.renderToString(data.latex || '', {
    throwOnError: false,
    displayMode: true,
  })

  return (
    <div
      style={{
        backgroundColor: '#D5F5E3',
        border: '2px solid #27AE60',
        borderRadius: 6,
        padding: '16px 20px',
        width: data.width || 380,
        minHeight: data.height || 220,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 14,
        fontFamily: 'Arial, sans-serif',
        color: '#000000',
      }}
    >
      {data.description && (
        <div style={{ fontSize: 14, lineHeight: 1.4 }}>
          {data.description}
        </div>
      )}

      <div
        style={{ fontSize: 15, textAlign: 'center' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {data.note && (
        <div style={{ fontSize: 12, fontStyle: 'italic', lineHeight: 1.4 }}>
          {data.note}
        </div>
      )}

      {data.notex && (
        <div style={{ fontSize: 15, lineHeight: 1.4 }}>
          {data.notex}
        </div>
      )}

      {/* One handle per side. Ids match the ones used by the box nodes
          ('out-left', 'in-top', ...), but without the 25 % / 75 % variants. */}
      <Handle type="source" id="out-left" position={Position.Left} />
      <Handle type="target" id="in-left" position={Position.Left} />
      <Handle type="source" id="out-right" position={Position.Right} />
      <Handle type="target" id="in-right" position={Position.Right} />
      <Handle type="source" id="out-top" position={Position.Top} />
      <Handle type="target" id="in-top" position={Position.Top} />
      <Handle type="source" id="out-bottom" position={Position.Bottom} />
      <Handle type="target" id="in-bottom" position={Position.Bottom} />
    </div>
  )
}