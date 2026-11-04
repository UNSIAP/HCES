// filterLogic.js
//
// Decides which nodes and edges of the flow chart are visible, based on the
// answers the user has given in the filter sidebar.
//
// Nodes and edges in diagramData.js can have two optional fields:
//   dependsOn - an object with filter rules, e.g. { filter1: 'yes' }
//   strict    - if true, the rules must match exactly (see below)
//
// Rule values can be:
//   'yes'              - the filter must be answered with exactly this value
//   ['no', 'maybe']    - the filter must be answered with ONE of these values
//   UNSET              - the filter must NOT be answered (neutral state)
//
// If dependsOn has several filters, ALL of them must match.

// Special marker used in dependsOn to mean "only show when this filter is
// unanswered". The string is arbitrary, it just must never be a real answer.
export const UNSET = '__unset__'

// Strict check of a single filter rule: the answer must match exactly.
// An unanswered filter (null/undefined) only matches the UNSET marker.
function matchesCondition(filterKey, requiredValue, answers) {
  const userAnswer = answers[filterKey]

  // UNSET: matches only if the user has not answered this filter
  if (requiredValue === UNSET) {
    return userAnswer === null || userAnswer === undefined
  }

  // List of values: matches if the answer is ONE of them
  if (Array.isArray(requiredValue)) {
    return requiredValue.includes(userAnswer)
  }

  // Single value: the answer must be identical
  return userAnswer === requiredValue
}

// Strict mode: every rule in dependsOn must match exactly.
// Used when node/edge has "strict: true".
function matchesDependsOn(dependsOn, answers) {
  return Object.entries(dependsOn).every(([filterKey, requiredValue]) =>
    matchesCondition(filterKey, requiredValue, answers)
  )
}

// Loose mode (the default): like strict mode, except that an unanswered filter
// counts as a match. This keeps everything visible until the user starts
// filtering. Rules with UNSET are still exact.
function matchesDependsOnLoose(dependsOn, answers) {
  return Object.entries(dependsOn).every(([filterKey, requiredValue]) => {
    const userAnswer = answers[filterKey]

    // UNSET rules are always exact, also in loose mode
    if (requiredValue === UNSET) {
      return userAnswer === null || userAnswer === undefined
    }

    // Unanswered filter = "no filtering", so keep the element
    if (userAnswer === null || userAnswer === undefined) {
      return true
    }

    // List of values: the answer must be one of them
    if (Array.isArray(requiredValue)) {
      return requiredValue.includes(userAnswer)
    }

    return userAnswer === requiredValue
  })
}

// Returns only the nodes that should be visible for the current answers.
// Nodes without dependsOn are always visible.
export function filterNodes(nodes, answers) {
  return nodes.filter(node => {
    if (!node.dependsOn) return true

    return node.strict
      ? matchesDependsOn(node.dependsOn, answers)
      : matchesDependsOnLoose(node.dependsOn, answers)
  })
}

// Returns only the edges that should be visible. An edge is shown when:
//   1. both its source and target nodes are visible, and
//   2. its own dependsOn rules (if any) match the current answers.
export function filterEdges(edges, visibleNodes, answers) {
  const visibleIds = new Set(visibleNodes.map(n => n.id))

  return edges.filter(edge => {
    // Hide edges that connect to a hidden (or missing) node
    if (!visibleIds.has(edge.source) || !visibleIds.has(edge.target)) {
      return false
    }

    // No filter rules on the edge itself: always show it
    if (!edge.dependsOn) return true

    return edge.strict
      ? matchesDependsOn(edge.dependsOn, answers)
      : matchesDependsOnLoose(edge.dependsOn, answers)
  })
}