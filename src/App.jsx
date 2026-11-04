// App.jsx
//
// Root component of the application.
// It renders the flow chart and wraps it in the provider that React Flow needs.

import { ReactFlowProvider } from 'reactflow'
import FlowDiagram from './FlowDiagram'

function App() {
  return (
    // ReactFlowProvider makes React Flow's internal state available to every
    // component below it. FlowDiagram needs this because it uses the
    // useReactFlow() hook (for fitView and viewport control when printing).
    // Without the provider, that hook would throw an error.
    <ReactFlowProvider>
      {/* The interactive flow chart: header, filters, diagram and legend */}
      <FlowDiagram />
    </ReactFlowProvider>
  )
}

export default App