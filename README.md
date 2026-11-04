# HCES Food Data Flow Chart

An interactive flow chart that guides users through the step-by-step process of cleaning, validating and analysing food consumption data from household surveys, following the guidelines published by FAO:
<https://openknowledge.fao.org/items/309602e9-96a6-4035-8116-aa583f389b46>

Users answer a set of questions about their survey design in a filter sidebar. The chart then hides the steps that do not apply and shows only the path relevant to that survey. The result can be printed or saved as a PDF (A1 poster format).

The app is a pure front-end application: no backend, no database, no server configuration. It can be hosted on any static web host.

**Live version:** https://bjornv1.github.io/FoodSecurityFlowChart/

---

## Tech stack

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) (build tool)
- [React Flow](https://reactflow.dev/) v11 (`reactflow` package) for the diagram
- [KaTeX](https://katex.org/) for the formulas

---

## Getting started

Requirements: [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install        # install dependencies
npm run dev        # start the development server (hot reload)
npm run build      # create the production build in dist/
npm run preview    # preview the production build locally
```

---

## Project structure

```
src/
  main.jsx          Entry point
  App.jsx           Root component, wraps the chart in <ReactFlowProvider>
  FlowDiagram.jsx   Main UI: header, filter sidebar, diagram, legend, printing
  diagramData.js    ALL nodes and edges of the chart (written by hand)
  filterLogic.js    Rules that decide which nodes/edges are visible
  nodeTypes.jsx     React components for each node type (colours, formulas)
```

**Important:** file names are case-sensitive on Linux (GitHub Actions, most web servers). Keep `FlowDiagram.jsx` and `diagramData.js` exactly as written, and make sure every `import` uses the same capitalisation.

---

## How the chart is defined (`diagramData.js`)

### Nodes (`allNodes`)

```js
{
  id: '4_q1_example',            // unique name; prefix = step number
  type: 'decision',              // which component draws it (see below)
  data: { label: 'Is this a question?', width: 200, height: 80 },
  position: { x: 500, y: 2850 }, // position on the canvas
  dependsOn: { filter5: 'no' },  // optional: filter rule
  strict: true                   // optional: see "Filters" below
}
```

| `type`        | Appearance | Meaning                                              |
|---------------|------------|------------------------------------------------------|
| `decision`    | blue       | A yes/no question                                    |
| `process`     | green      | An action or calculation step                        |
| `validation`  | yellow     | Start or end of a step                               |
| `flag`        | pink       | Flagged for review                                   |
| `drop`        | red        | Observation dropped                                  |
| `chosen`      | beige      | A decision already answered by a filter question     |
| `formulaText` | green      | Formula (LaTeX) with optional description and notes  |

Formula nodes use these `data` fields: `latex` (the formula), `description` (text above), `note` (small italic text below), `notex` (normal text below), plus `width` and `height`.

### Edges (`allEdges`)

```js
{
  id: 'e4_q1_yes_q2',
  type: 'straight',              // 'straight' or 'step' (right-angled)
  source: '4_q1_example',
  sourceHandle: 'out-bottom',    // where the arrow leaves the box
  target: '4_q2_example',
  targetHandle: 'in-top',        // where the arrow enters the box
  label: 'Yes',                  // optional text on the arrow
  dependsOn: { filter5: 'no' },  // optional: filter rule
  strict: true                   // optional
}
```

Handle names are `out-` / `in-` followed by `top`, `right`, `bottom` or `left`. Box nodes also have shifted positions, e.g. `in-top-25` and `in-top-75`.

### Layout helpers

Steps 5 to 10 are moved vertically with the constants `Y_SHIFT_STEP_5_10` and `Y_SHIFT_STEP_5_EMERGENCY` at the top of `diagramData.js`. The values are subtracted from `y`, so a negative number moves nodes down.

---

## Filters

### Defining a filter question

Filters are defined in the `FILTERS` list in `FlowDiagram.jsx`:

```js
{
  key: 'filter5',                       // name used in dependsOn
  question: 'Does the survey collect ...?',
  options: [['yes', 'Yes'], ['no', 'No']]   // [value, button label]
}
```

Each filter starts as unanswered (`null`). The user can select an option or press **Reset**.

### Using a filter on a node or edge

`dependsOn` is an object. When it contains several filters, **all** must match.

```js
dependsOn: { filter1: 'yes' }                    // show when filter1 is 'yes'
dependsOn: { filter5: ['no', 'yes_not_reliable'] } // show for any listed value
dependsOn: { filter1: UNSET }                    // show only when filter1 is unanswered
dependsOn: { filter7: 'yes', filter8: 'no' }     // both conditions must match
```

`UNSET` is imported from `filterLogic.js`.

### `strict`

- **Without `strict`** (default): an unanswered filter also counts as a match, so the element stays visible until the user starts filtering.
- **With `strict: true`:** the answer must match exactly. If the filter is unanswered, the element is hidden.

Note: in strict mode, a list containing `UNSET` (e.g. `[UNSET, 'no']`) does not match an unanswered filter. Use separate rules, or extend `matchesCondition` in `filterLogic.js`.

### Pattern for a filter-dependent question

For a question linked to a filter there are normally three nodes **at the same position**:

1. the neutral question (`type: 'decision'`, `dependsOn: { filterX: UNSET }`),
2. one `chosen` node per answer (`strict: true`), stating the answer as a fact.

Each version has its own set of edges. Nodes may share an `id` **only if the filter rules guarantee that at most one of them is visible in every filter state**, including the unanswered state.

### Edges follow their nodes

An edge is shown only if both its source and target nodes are visible and its own `dependsOn` rules (if any) match. Hiding a node therefore hides its edges automatically. To reconnect the remaining nodes, add a "bypass" edge with a matching `dependsOn`.

---

## Printing / saving as PDF

The **Print / save as PDF** button uses the browser's own print function. The diagram is shown alone on an A1 page, zoomed to fit the currently visible (filtered) nodes. Because the browser draws the SVG itself, text and arrows stay sharp at any size.

- The paper size is set in `PRINT_PAPER_MM` in `FlowDiagram.jsx` (default A1: `[594, 841]`). For A0 use `[841, 1189]`.
- Orientation (landscape/portrait) is chosen automatically from the shape of the visible diagram.
- In the print dialog: choose "Save as PDF" or a printer, set margins to "None", and enable "Background graphics". Chrome or Edge is recommended.
- Printer cannot do A1? Choose a supported paper size and set **Scale** to "Fit to printable area" (Edge: "Fit to page").
- Only an A4 printer, and want a poster? Save as PDF, open it in Adobe Reader and print with "Page Sizing & Handling" set to "Poster".

---

## Deployment

### GitHub Pages (current setup)

The workflow in `.github/workflows/deploy.yml` builds the app and publishes `dist/` on every push to `main`.

1. In the repository, go to **Settings > Pages** and set **Source** to **GitHub Actions**.
2. Push to `main`. The build runs under the **Actions** tab.
3. The site is published at `https://<user>.github.io/<repository>/`.

### Any other web host

```bash
npm ci
npm run build
```

Upload the contents of `dist/` to the web server.

### Important: the `base` setting

In `vite.config.js`, `base` must match the path the site is served from:

```js
export default defineConfig({
  plugins: [react()],
  base: '/FoodSecurityFlowChart/'   // GitHub Pages: '/<repository-name>/'
})
```

- Site in a sub-folder, e.g. `https://example.org/flowchart/`: use `'/flowchart/'`.
- Site at the domain root: use `'/'`.
- If unsure, `'./'` works in most setups.

A wrong `base` gives a blank page and 404 errors for the JS and CSS files.

### Embedding in another page

```html
<iframe src="https://example.org/flowchart/" style="width:100%;height:90vh;border:0"></iframe>
```

---

## Customising

| What                         | Where                                                        |
|------------------------------|--------------------------------------------------------------|
| Page title and intro text    | `PAGE_TITLE` and `PAGE_INTRO` in `FlowDiagram.jsx`           |
| Browser tab title            | `<title>` in `index.html`                                    |
| Filter questions             | `FILTERS` in `FlowDiagram.jsx`                               |
| Legend entries               | `LEGEND_ITEMS` in `FlowDiagram.jsx`                          |
| Node colours                 | `nodeTypes.jsx` (keep `LEGEND_ITEMS` in sync)                |
| Sidebar widths               | `SIDEBAR_WIDTH`, `LEGEND_WIDTH` in `FlowDiagram.jsx`         |
| Initial zoom and position    | `defaultViewport` in `FlowDiagram.jsx`                       |
| Print paper size             | `PRINT_PAPER_MM` in `FlowDiagram.jsx`                        |

To add a new node type: create a component in `nodeTypes.jsx`, register it in `nodeTypesStatic` in `FlowDiagram.jsx`, and add it to `LEGEND_ITEMS`.

---

## Troubleshooting

- **Build fails on GitHub with "Could not resolve './diagramData.js'":** a file name differs in capitalisation from the import. Linux is case-sensitive; Windows and macOS are not. Rename files with git via a temporary name (`git mv a.js tmp.js` then `git mv tmp.js A.js`).
- **Blank page after deployment:** check `base` in `vite.config.js`.
- **An arrow is missing:** check that source and target ids exist, that both nodes are visible for the current filter state, and that the edge's `dependsOn` matches.
- **Duplicate ids:** two visible nodes or edges with the same `id` can make elements disappear. Add a temporary check in `FlowDiagram.jsx` that logs duplicate ids among `visibleNodes` and `visibleEdges`.
- **Yes/No labels or arrows look wrong when printing:** use Chrome or Edge, and enable "Background graphics".

---

## License and content

The source code should carry its own license file (add a `LICENSE` to the repository). The libraries used (React, React Flow, KaTeX, Vite) are MIT licensed.

The content of the flow chart is based on the FAO guidelines linked above. Check with the content owner whether reuse requires permission or attribution, and keep the link to the guidelines in the intro text.
