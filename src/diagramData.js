// diagramData.js
//
// Data for the flow chart: every node and every edge, written by hand.
//
// NODES (allNodes)
//   id        - unique name. Edges refer to it. Prefix = step number (e.g. "4_...").
//   type      - which component draws it (see nodeTypes in FlowDiagram.jsx):
//               decision   = yes/no question (blue)
//               process    = action (green)
//               validation = start/end of a step (yellow)
//               flag       = flagged for review (pink)
//               drop       = observation dropped (red)
//               chosen     = a decision that is already answered by a filter (beige)
//               formulaText= formula (KaTeX) with optional description/note
//   data      - label (plain text) or latex/description/note (formulaText),
//               plus optional width/height in px
//   position  - x/y on the canvas
//   dependsOn - optional filter rule, see "FILTER RULES" below
//   strict    - optional, see "FILTER RULES" below
//
// EDGES (allEdges)
//   id, source, target       - source/target are node ids
//   sourceHandle/targetHandle- where the arrow leaves/enters the box:
//                              out-/in- + top | right | bottom | left,
//                              optionally with -25 or -75 for a shifted position
//   type      - 'straight' or 'step' (right-angled line)
//   label     - text on the arrow (usually "Yes"/"No")
//   dependsOn / strict       - same filter rules as for nodes
//
// FILTER RULES (evaluated in filterLogic.js)
//   dependsOn: { filter1: 'yes' }  show only when filter1 is answered 'yes'
//   dependsOn: { filter5: ['no', 'yes_not_reliable'] }  show for any listed value
//   dependsOn: { filter1: UNSET }  show only when filter1 is NOT answered
//   Several filters in one object must ALL match.
//   Without strict: an unanswered filter also matches (the element stays visible).
//   With strict: true: the answer must match exactly (unanswered = hidden).
//
// PATTERN USED FOR FILTER-DEPENDENT QUESTIONS
//   For a question linked to a filter there are normally three nodes at the SAME
//   position: the neutral question (dependsOn UNSET), and one "chosen" node per
//   answer (strict). Each version has its own set of edges.
//
// LAYOUT HELPERS
//   Steps 5-10 are moved vertically with the constants below. Increase a value
//   to move the nodes up, decrease it to move them down (it is subtracted from y).

import { UNSET } from './filterLogic'

// Vertical shift of all nodes in steps 5-10 (subtracted from y, so a negative
// value moves them down). Used to make room for changes in step 4.
const Y_SHIFT_STEP_5_10 = -800

// Extra vertical shift applied on top of the one above, from step 6 onwards
const Y_SHIFT_STEP_5_EMERGENCY = 200

export const allNodes = [
  //
  // START
  //
  // ===== STEP 2: Domain editing, obvious and systematic errors (DOS) =====
  {id: '2_start', type: 'validation', data: { label: 'Step 2 starts\nDomain editing, obvious\nand systematic errors (DOS)', width: 200, height: 80 }, position: { x: 0, y: 0 } },
  {id: '2_p1new_set_to_missing', type: 'process', data: { label: 'Set to missing all monetary values or quantities that are negative or equal to 0' }, position: { x: 250, y: 0 } }, // new
  {id: '2_q2_both_missing', type: 'decision', data: { label: 'Are both quantity and monetary value missing? ' }, position: { x: 500, y: 0 } },
  {id: '2_p2_drop_observation', type: 'drop', data: { label: 'Drop the observation ' }, position: { x: 500, y: 150 } },

  // Filter 1: is "Total quantity consumed" collected? (neutral / yes / no versions)
  {id: '2_q3_total_qty_collected', type: 'decision', dependsOn: { filter1: UNSET }, data: { label: 'Is a variable on «Total quantity consumed» available in the dataset? ' }, position: { x: 750, y: 0 } }, // Only visible with neutral filter1
  {id: '2_q3_total_qty_collected_yes', type: 'chosen', dependsOn: { filter1: 'yes' }, strict: true, data: { label: '«Total quantity consumed» is available in the dataset ' }, position: { x: 750, y: 0 } }, // Only visible with filter1='yes'
  {id: '2_q3_total_qty_collected_no', type: 'chosen', dependsOn: { filter1: 'no' }, strict: true, data: { label: '«Total quantity consumed» is not available in the dataset ' }, position: { x: 750, y: 0 } }, // Only visible with filter1='no'


  {id: '2_q4_total_equals_sum', type: 'decision', dependsOn: { filter1: 'yes' }, data: { label: 'Does the total quantity collected correspond to the sum of the quantities collected by food source?', width: 260, height: 80 }, position: { x: 1250, y: 0 } },
  {id: '2_p3_drop_total_qty_var', type: 'process', dependsOn: { filter1: 'yes' }, data: { label: 'Drop the variable\n «Total quantity consumed» ' }, position: { x: 1500, y: 300 } },
  {id: '2_q5_units_same', type: 'decision', dependsOn: { filter1: 'yes' }, data: { label: 'Are all quantities collected by food source, in the same unit as the total quantity? ' }, position: { x: 1000, y: 0 } },
  {id: '2_p4_check_modify_error', type: 'process', dependsOn: { filter1: 'yes' }, data: { label: 'Check all the quantities and\n modify the likely error. ' }, position: { x: 1290, y: 150 } },

  // Filter 2: recall or diary? (currently commented out in FILTERS, so it stays neutral)
  {id: '2_q6_recall', type: 'decision', dependsOn: { filter2: UNSET }, data: { label: 'Is the data collected through a recall? ' }, position: { x: 1500, y: 450 } }, // Only visible with neutral filter2
  {id: '2_q6_recall_yes', type: 'chosen', dependsOn: { filter2: 'recall' }, strict: true, data: { label: 'Data is collected through a recall ' }, position: { x: 1500, y: 450 } }, // Only visible with filter2='recall'
  {id: '2_q6_recall_no', type: 'chosen', dependsOn: { filter2: 'diary' }, strict: true, data: { label: 'Data is collected through a diary ' }, position: { x: 1500, y: 450 } }, // Only visible with filter2='diary'

  {id: '2_q7_duplicates_nonrecall', type: 'decision', dependsOn: { filter2: 'diary' }, data: { label: 'Is there only one observation for each combination household/day/food item code/\nfood item description/quantity/value/unit/source?', width: 360, height: 80 }, position: { x: 1750, y: 450} },
  {id: '2_q8_duplicates_recall', type: 'decision', dependsOn: { filter2: 'recall' }, data: { label: 'Is there only one observation for the same combination of household/food item/value/quantity/unit/\nsource of consumption?', width: 360, height: 80 }, position: { x: 1750, y: 750 } },
  {id: '2_p5_delete_duplicates', type: 'process', data: { label: 'Check the raw data and delete duplicates ' }, position: { x: 1840, y: 600 } },
  {id: '2_p9_aggregate', type: 'process', data: { label: 'Aggregate data to one observation per household/food item code/\nfood item description/source/unit', width: 260, height: 80 }, position: { x: 2180, y: 600 } },
  {id: '2_q9_code_description_consistent', type: 'decision', data: { label: 'Are the code and the description of the food item consistent (i.e. inconsistency would be the code for "rice" associated to "wheat")? ', width: 260, height: 100 }, position: { x: 2180, y: 740 } },
  {id: '2_p6_correct_code_description', type: 'process', data: { label: 'Correct using national or own expert’s\njudgment or logical deduction ', width: 220, height: 80 }, position: { x: 2200, y: 900 } },
  {id: '2_q10_unit_plausible', type: 'decision', data: { label: 'Is the unit associated to the food item plausible? ' }, position: { x: 2610, y: 750 } },
  {id: '2_p7_correct_unit', type: 'process', data: { label: 'Correct using national or own expert’s\njudgment or logical deduction ', width: 220, height: 80 }, position: { x: 2590, y: 900 } },
  {id: '2_q11_source_correct', type: 'decision', data: { label: 'Is the source associated to the food item correct? ' }, position: { x: 2950, y: 750 } },
  {id: '2_p8_correct_source', type: 'process', data: { label: 'Correct using national or own expert’s\njudgment or logical deduction ', width: 220, height: 80 }, position: { x: 2930, y: 900 } },
  {id: '2_step_finished', type: 'validation', data: { label: 'Step 2 finished ' }, position: { x: 3230, y: 1050 } },
  
  // ===== STEP 3: Adjust and merge data files =====
  {id: '3_starts', type: 'validation', data: { label: 'Step 3 starts\nAdjust and merge\ndata files', width: 200, height: 80 }, position: { x: 0, y: 1200 } },
  {id: '3_q1_wide_form', type: 'decision', data: { label: 'Are the data in wide form (a column for each source of consumption)?' }, position: { x: 250, y: 1200 } },
  {id: '3_q2_wide_continue', type: 'decision', data: { label: 'Do you want to continue working in the wide form?' }, position: { x: 500, y: 1200 } },

  // Filter 3: FAFH collected in a separate module?
  {id: '3_q3_fafh_independent_wide', type: 'decision', dependsOn: { filter3: UNSET }, data: { label: 'Is FAFH consumption collected separately from in-house consumption?' }, position: { x: 1000, y: 1200 } },
  {id: '3_q5_fafh_independent_long', type: 'decision', dependsOn: { filter3: UNSET }, data: { label: 'Is FAFH consumption collected separately from in-house consumption?' }, position: { x: 500, y: 1800 } },
  {id: '3_q3_fafh_independent_wide_yes', type: 'chosen', strict: true, dependsOn: { filter3: 'yes' }, data: { label: 'FAFH is consumption collected separately from in-house consumption' }, position: { x: 1000, y: 1200 } },
  {id: '3_q5_fafh_independent_long_yes', type: 'chosen', strict: true, dependsOn: { filter3: 'yes' }, data: { label: 'FAFH is consumption collected separately from in-house consumption' }, position: { x: 500, y: 1800 } },
  {id: '3_q3_fafh_independent_wide_no', type: 'chosen', strict: true, dependsOn: { filter3: 'no' }, data: { label: 'FAFH is not consumption collected separately from in-house consumption' }, position: { x: 1000, y: 1200 } },
  {id: '3_q5_fafh_independent_long_no', type: 'chosen', strict: true, dependsOn: { filter3: 'no' }, data: { label: 'FAFH is not consumption collected separately from in-house consumption' }, position: { x: 500, y: 1800 } },

  // Filter 4: monetary values only for the last purchase?
  {id: '3_q4_monetary_values_at_least_one_source', type: 'decision', dependsOn: { filter4: UNSET }, strict: true, data: { label: 'Are the monetary values collected only for the last purchase?', width: 220, height: 80 }, position: { x: 480, y: 1500 } },
  {id: '3_q4_monetary_values_at_least_one_source_f4_yes', type: 'chosen', dependsOn: { filter4: 'yes' }, strict: true, data: { label: 'The monetary values are only collected for the last purchase', width: 220, height: 80 }, position: { x: 480, y: 1500 } },
  {id: '3_q4_monetary_values_at_least_one_source_f4_no', type: 'chosen', dependsOn: { filter4: 'no' }, strict: true, data: { label: 'The monetary values are not only collected for the last purchase', width: 220, height: 80 }, position: { x: 480, y: 1500 } },


  {id: '3_p1_restructure_to_long_form', type: 'process', data: { label: 'Restructure dataset to long form (one row per household, food item, source)', width: 220, height: 80 }, position: { x: 480, y: 1350 } },
  {id: '3_p3_add_fafh_wide', type: 'process', dependsOn: { filter3: 'yes' }, data: { label: 'Add FAFH data to the working dataset and create a FAFH dummy variable\n(1=FAFH, 0=in-house)\nto be used for filtering in step 4', width: 300, height: 100 }, position: { x: 940, y: 1490 } },
  {id: '3_p4_temp_file_for_imputation', type: 'process', dependsOn: { filter4: 'yes' }, data: { label: 'Create a temporary file with the monetary values and quantities from last purchases to be further used for imputation ', width: 300, height: 80 }, position: { x: 140, y: 1650 } },
  {id: '3_p5_assign_food_source', type: 'process', dependsOn: { filter3: 'yes' }, data: { label: 'Assign the corresponding food source in the variable «source»' }, position: { x: 750, y: 1800 } },
  {id: '3_p7_add_fafh_long', type: 'process', dependsOn: { filter3: 'yes' }, data: { label: 'Add FAFH data to the working dataset and create a FAFH dummy variable\n(1=FAFH, 0=in-house)\nto be used for filtering in step 4', width: 300, height: 100 }, position: { x: 1190, y: 1790 } },
  {id: '3_q6_number_of_meals_fafh_collected', type: 'decision', dependsOn: { filter8: UNSET }, strict: true, data: { label: 'Does the survey collect information on the number of meals consumed away from home?', width: 160, height: 120 }, position: { x: 1560, y: 1780 } },
  {id: '3_q6_number_of_meals_fafh_collected', type: 'chosen', dependsOn: { filter8: 'yes' }, strict: true, data: { label: 'The survey collects information on the number of meals consumed away from home', width: 160, height: 120 }, position: { x: 1560, y: 1780 } },
  {id: '3_q6_number_of_meals_fafh_collected', type: 'chosen', dependsOn: { filter8: 'no' }, strict: true, data: { label: 'The survey does not collect information on the number of meals consumed away from home', width: 160, height: 120 }, position: { x: 1560, y: 1780 } },

  {
    id: '3_p8_calc_in_house_meals',
    type: 'formulaText',
    dependsOn: { filter8: 'yes' },
    data: {
      latex:
        '\\text{In-house meals} = \\text{Household members present in the household during the reference period} \\times \\text{3 meals} \\times \\text{Number of days of the reference period - Number of meals consumed away from home in the reference period}',
      width: 1800,
      height: 60
    },
    position: { x: 1850, y: 1500 }
  },


  // Filters 7 and 8: visitors and meals away from home. Several nodes depend on both filters.
  {id: '3_q7_visitors_yes_meals_fafh', type: 'decision', dependsOn: { filter7: UNSET, filter8: UNSET }, strict: true, data: { label: 'Does the survey collect information on visitors?' }, position: { x: 2170, y: 1650 } },
  {id: '3_q7_visitors_yes_meals_fafh', type: 'decision', dependsOn: { filter7: UNSET, filter8: 'yes' }, strict: true, data: { label: 'Does the survey collect information on visitors?' }, position: { x: 2170, y: 1650 } },
  {id: '3_q7_visitors_yes_meals_fafh_yes', type: 'chosen', dependsOn: { filter7: 'yes', filter8: 'yes' }, strict: true, data: { label: 'Information on visitors is collected' }, position: { x: 2170, y: 1650 } },
  {id: '3_q7_visitors_yes_meals_fafh_yes', type: 'chosen', dependsOn: { filter7: 'yes', filter8: UNSET }, strict: true, data: { label: 'Information on visitors is collected' }, position: { x: 2170, y: 1650 } },
  {id: '3_q7_visitors_yes_meals_fafh_no', type: 'chosen', dependsOn: { filter7: 'no', filter8: 'yes' }, strict: true, data: { label: 'Information on visitors is not collected' }, position: { x: 2170, y: 1650 } },
  {id: '3_q7_visitors_yes_meals_fafh_no', type: 'chosen', dependsOn: { filter7: 'no', filter8: UNSET }, strict: true, data: { label: 'Information on visitors is not collected' }, position: { x: 2170, y: 1650 } },

  {id: '3_q10_visitors_no_meals_fafh', type: 'decision', dependsOn: { filter7: UNSET, filter8: 'no' }, strict: true, data: { label: 'Does the survey collect information on visitors?' }, position: { x: 1550, y: 2250 } },
  {id: '3_q10_visitors_no_meals_fafh', type: 'decision', dependsOn: { filter7: UNSET, filter8: UNSET }, strict: true, data: { label: 'Does the survey collect information on visitors?' }, position: { x: 1550, y: 2250 } },
  {id: '3_q10_visitors_no_meals_fafh_yes', type: 'chosen', dependsOn: { filter7: 'yes', filter8: 'no' }, strict: true, data: { label: 'Information on visitors is collected' }, position: { x: 1550, y: 2250 } },
  {id: '3_q10_visitors_no_meals_fafh_yes', type: 'chosen', dependsOn: { filter7: 'yes', filter8: UNSET }, strict: true, data: { label: 'Information on visitors is collected' }, position: { x: 1550, y: 2250 } },
  {id: '3_q10_visitors_no_meals_fafh_no', type: 'chosen', dependsOn: { filter7: 'no', filter8: 'no' }, strict: true, data: { label: 'Information on visitors is not collected' }, position: { x: 1550, y: 2250 } },
  {id: '3_q10_visitors_no_meals_fafh_no', type: 'chosen', dependsOn: { filter7: 'no', filter8: UNSET }, strict: true, data: { label: 'Information on visitors is not collected' }, position: { x: 1550, y: 2250 } },

  {id: '3_q8_meals_by_visitors_yes_meals_fafh', type: 'decision', dependsOn: { filter7: UNSET, filter8: UNSET }, strict: true, data: { label: 'Does the survey collect information on the number of meals consumed by visitors in the whole reference period?', width: 260, height: 80 }, position: { x: 2420, y: 1650 } },
  {id: '3_q8_meals_by_visitors_yes_meals_fafh', type: 'decision', dependsOn: { filter7: 'yes', filter8: UNSET }, strict: true, data: { label: 'Does the survey collect information on the number of meals consumed by visitors in the whole reference period?', width: 260, height: 80 }, position: { x: 2420, y: 1650 } },
  {id: '3_q8_meals_by_visitors_yes_meals_fafh', type: 'decision', dependsOn: { filter7: 'yes', filter8: 'yes' }, strict: true, data: { label: 'Does the survey collect information on the number of meals consumed by visitors in the whole reference period?', width: 260, height: 80 }, position: { x: 2420, y: 1650 } },
  {id: '3_q8_meals_by_visitors_yes_meals_fafh', type: 'decision', dependsOn: { filter7: UNSET, filter8: 'yes' }, strict: true, data: { label: 'Does the survey collect information on the number of meals consumed by visitors in the whole reference period?', width: 260, height: 80 }, position: { x: 2420, y: 1650 } },

  {id: '3_q9_visitors_days_stayed_yes_meals_fafh', type: 'decision', dependsOn: { filter7: UNSET, filter8: UNSET }, strict: true, data: { label: 'Does the survey collect information on the number of visitors and the number of days they stayed', width: 260, height: 80 }, position: { x: 2420, y: 1800 } },
  {id: '3_q9_visitors_days_stayed_yes_meals_fafh', type: 'decision', dependsOn: { filter7: 'yes', filter8: UNSET }, strict: true, data: { label: 'Does the survey collect information on the number of visitors and the number of days they stayed', width: 260, height: 80 }, position: { x: 2420, y: 1800 } },
  {id: '3_q9_visitors_days_stayed_yes_meals_fafh', type: 'decision', dependsOn: { filter7: 'yes', filter8: 'yes' }, strict: true, data: { label: 'Does the survey collect information on the number of visitors and the number of days they stayed', width: 260, height: 80 }, position: { x: 2420, y: 1800 } },
  {id: '3_q9_visitors_days_stayed_yes_meals_fafh', type: 'decision', dependsOn: { filter7: UNSET, filter8: 'yes' }, strict: true, data: { label: 'Does the survey collect information on the number of visitors and the number of days they stayed', width: 260, height: 80 }, position: { x: 2420, y: 1800 } },


  // Formulas for the number of partakers, one per combination of filters 7 and 8
  {
    id: '3_p9_calc_partakers_4',
    type: 'formulaText',
    dependsOn: { filter7: 'no', filter8: 'yes' },
    data: {
      latex:
        '\\text{Number of partakers} = \\dfrac{\\text{In-house meals}}{3\\text{ meals} \\times \\text{Number of days of the reference period}}',
      width: 950,
      height: 60
    },
    position: { x: 2750, y: 2100 }
  },
  {
    id: '3_p9_calc_partakers_1',
    type: 'formulaText',
    dependsOn: { filter7: 'yes', filter8: 'yes' },
    data: {
      latex:
        '\\text{Number of partakers} = \\dfrac{\\text{In-house meals} + \\text{Meals consumed by visitors during the reference period}}{3\\text{ meals} \\times \\text{Number of days of the reference period}}',
      width: 950,
      height: 60
    },
    position: { x: 2750, y: 1650 }
  },
  {
    id: '3_p10_calc_partakers_2',
    type: 'formulaText',
    dependsOn: { filter7: 'yes', filter8: 'yes' },
    data: {
      latex:
        '\\text{Number of partakers} = \\dfrac{\\text{In-house meals} + (\\text{Number of visitors} \\times \\text{Number of days they stayed with the household} \\times 3)}{3\\text{ meals} \\times \\text{Number of days of the reference period}}',
      width: 950,
      height: 60
    },
    position: { x: 2750, y: 1800 }
  },
  {
    id: '3_p11_calc_partakers_3',
    type: 'formulaText',
    dependsOn: { filter7: 'yes', filter8: 'yes' },
    data: {
      latex:
        '\\text{Number of partakers} = \\dfrac{\\text{In-house meals} + (\\text{Number of visitors} \\times \\text{Number of days of the reference period} \\times 3)}{3\\text{ meals} \\times \\text{Number of days of the reference period}}',
      width: 950,
      height: 60
    },
    position: { x: 2750, y: 1950 }
  },
  {
    id: '3_p12_calc_partakers_1b',
    type: 'formulaText',
    dependsOn: { filter7: 'no', filter8: 'no' },
    data: {
      latex:
        '\\text{Number of partakers} = \\text{Number of household members present in the household during the reference period}',
      width: 900,
      height: 60
    },
    position: { x: 2030, y: 2250 }
  },
  {
    id: '3_p13_calc_partakers_1b',
    type: 'formulaText',
    dependsOn: { filter7: 'yes', filter8: 'no' },
    data: {
      latex:
        '\\text{Number of partakers} = \\dfrac{(\\text{Household members present} \\times 3\\text{ meals} \\times \\text{Number of days of the reference period}) + \\text{Meals consumed by visitors during the reference period}}{3\\text{ meals} \\times \\text{Number of days of the reference period}}',
      width: 1500,
      height: 60
    },
    position: { x: 2030, y: 2400 }
  },
  {
    id: '3_p14_calc_partakers_1b',
    type: 'formulaText',
    dependsOn: { filter7: 'yes', filter8: 'no' },
    data: {
      latex:
        '\\text{Number of partakers} = \\dfrac{(\\text{Household members present} \\times \\text{Number of days of the reference period}) + (\\text{Number of visitors} \\times \\text{Number of days they stayed with the household})}{\\text{Number of days of the reference period}}',
      width: 1500,
      height: 60
    },
    position: { x: 2030, y: 2550 }
  },
  {
    id: '3_p15_calc_partakers_1b',
    type: 'formulaText',
    dependsOn: { filter7: 'yes', filter8: 'no' },
    data: {
      latex:
        '\\text{Number of partakers} = \\text{Number of household members present in the household during the reference period} + \\text{Number of visitors in the whole reference period}',
      width: 1500,
      height: 60
    },
    position: { x: 2030, y: 2700 }
  },


  {id: '3_q9_visitors_days_stayed_no_meals_fafh', type: 'decision', dependsOn: { filter7: 'yes', filter8: 'no' }, data: { label: 'Does the survey collect information on the number of visitors and the number of days they stayed', width: 260, height: 80 }, position: { x: 1510, y: 2550 } },
  {id: '3_q11_meals_by_visitors_no_meals_fafh', type: 'decision', dependsOn: { filter7: 'yes', filter8: 'no' }, data: { label: 'Does the survey collect information on the number of meals consumed by visitors in the whole reference period', width: 260, height: 80 }, position: { x: 1510, y: 2400 } },
  {id: '3_p16x_divide', type: 'process', data: { label: 'Divide monetary values and quantities of in-house consumption by number of partakers', width: 240, height: 80 }, position: { x: 3730, y: 2696 } },
  {id: '3_p16_merge_in_information', type: 'process', data: { label: 'Merge in other relevant external information' }, position: { x: 4040, y: 2696 } },
  {id: '3_finished', type: 'validation', data: { label: 'Step 3 finished' }, position: { x: 4290, y: 2696 } },

  // ===== STEP 4: Cleaning data at measurement level =====
  {id: '4_starts', type: 'validation', data: { label: 'Step 4 starts\nCleaning data at\nmeasurement level', width: 200, height: 80 }, position: { x: 0, y: 2850 } },
  {id: '4_p1x_fafh', type: 'decision', data: { label: 'Does the observation refer to FAFH (dummy variable equals to 1)?'}, position: { x: 250, y: 2850 } },

  {id: '4_p1_clone_original_values', type: 'process', data: { label: 'Clone all the original quantities and monetary values collected in the survey', width: 200, height: 80 }, position: { x: 500, y: 2850 } },

  // Filter 5: non-purchased food, monetary values collected / reliable?
  {id: '4_q1_collected_value_non_purch', type: 'decision', dependsOn: { filter5: UNSET }, strict: true, data: { label: 'Are the self reported monetary values for non-purchased food collected?' }, position: { x: 770, y: 2850 } },
  {id: '4_q1_collected_value_non_purch_filter5_yes1', type: 'chosen', dependsOn: { filter5: 'yes_reliable' }, strict: true, data: { label: 'The self reported monetary values for non-purchased food are collected' }, position: { x: 770, y: 2850 } },
  {id: '4_q1_collected_value_non_purch_filter5_yes2', type: 'chosen', dependsOn: { filter5: 'yes_not_reliable' }, strict: true, data: { label: 'The self reported monetary values for non-purchased food are collected' }, position: { x: 770, y: 2850 } },
  {id: '4_q1_collected_value_non_purch_filter5_no', type: 'chosen', dependsOn: { filter5: 'no' }, strict: true, data: { label: 'The self reported monetary values for non-purchased food are not collected' }, position: { x: 770, y: 2850 } },

  {id: '4_q2_values_non_purch_reliable', type: 'decision', dependsOn: { filter5: UNSET }, strict: true, data: { label: 'Are the self reported monetary values of non-purchased food items considered reliable?', width: 200, height: 80 }, position: { x: 760, y: 3000 } },
  {id: '4_q2_values_non_purch_reliable_filter5_yes_reliable', type: 'chosen', dependsOn: { filter5: 'yes_reliable' }, strict: true, data: { label: 'The self reported monetary values of non-purchased food items are considered reliable', width: 200, height: 80 }, position: { x: 760, y: 3000 } },
  {id: '4_q2_values_non_purch_reliable_filter5_yes_not_reliable', type: 'chosen', dependsOn: { filter5: 'yes_not_reliable' }, strict: true, data: { label: 'The self reported monetary values of non-purchased food items are not considered reliable', width: 200, height: 120 }, position: { x: 760, y: 3000 } },


  {id: '4_p2_self_reported_to_missing', type: 'process', dependsOn: { filter5: UNSET }, strict: true, data: { label: 'Set all the self reported monetary values to missing' }, position: { x: 1020, y: 3000 } },
  {id: '4_p2_self_reported_to_missing_filter5_yes_not_reliable', type: 'process', dependsOn: { filter5: 'yes_not_reliable' }, strict: true, data: { label: 'Set all the self reported monetary values to missing' }, position: { x: 1020, y: 3020 } },


  {id: '4_p3_use_original_non_purchased', type: 'process', dependsOn: { filter5: ['no', 'yes_not_reliable'] }, data: { label: 'Using the quantity of food consumed  from non-purchased foods' }, position: { x: 1020, y: 2850 } },
  {id: '4_p5_univariate_approach_per_partaker', dependsOn: { filter5: ['no', 'yes_not_reliable'] }, type: 'process', data: { label: 'Apply the univariate approach on the quantity per partaker' }, position: { x: 1520, y: 2850 } },
  {id: '4_q3_quantity_outlier', type: 'decision', dependsOn: { filter5: ['no', 'yes_not_reliable'] }, data: { label: 'Is the quantity detected as outlier?' }, position: { x: 1770, y: 2850 } },
  {id: '4_p6_def_level_of_agg', type: 'process', dependsOn: { filter5: ['no', 'yes_not_reliable'] }, data: { label: 'Define the level of aggregation to use' }, position: { x: 1770, y: 3000 } },
  {id: '4_p6x_non_purchased_aside', type: 'process', dependsOn: { filter5: ['no', 'yes_not_reliable'] }, data: { label: 'Set non-purchased foods aside for now and move to purchased foods' }, position: { x: 2020, y: 3150 } },
  {id: '4_p7_correct_quantity', type: 'process', dependsOn: { filter5: ['no', 'yes_not_reliable'] }, data: { label: 'Correct the quantity using aggregated quantity' }, position: { x: 1770, y: 3150 } },
  {id: '4_p8_use_multi_on_non_purchased', type: 'process', dependsOn: { filter5: 'yes_reliable' }, data: { label: 'Set non-purchased foods aside for now and move to purchased foods', width: 200, height: 80 }, position: { x: 760, y: 3150 } },

  // Filter 4: monetary values and quantities only for last purchases?
  {id: '4_q4_last_purchase', type: 'decision', dependsOn: { filter4: UNSET }, strict: true, data: { label: 'For purchased foods, are monetary values and their respective quantities collected only for last purchases?', width: 200, height: 100 }, position: { x: 1010, y: 3340 } },
  {id: '4_q4_last_purchase_f4_yes', type: 'chosen', dependsOn: { filter4: 'yes' }, strict: true, data: { label: 'Monetary values and their respective quantities are only collected for the last purchase', width: 200, height: 100 }, position: { x: 1010, y: 3340 } },
  {id: '4_q4_last_purchase_f4_no', type: 'chosen', dependsOn: { filter4: 'no' }, strict: true, data: { label: 'Monetary values and their respective quantities are not only collected for the last purchase', width: 200, height: 100 }, position: { x: 1010, y: 3340 } },


  {id: '4_p9_use_last_purchase', type: 'process', dependsOn: { filter4: 'yes' }, data: { label: 'Using quantity and monetary value of last  purchases' }, position: { x: 1270, y: 3350 } },

  {
    id: '4_p10_calc_unit_value',
    type: 'formulaText',
    dependsOn: { filter4: 'yes' },
      data: {
      description:
        'Calculate the unit value.',
      latex:
        '\\displaystyle \\text{Unit value (LCU per unit)} = \\dfrac{\\text{Monetary value}}{\\text{Quantity}}',
      height: 80
    },
    position: { x: 1520, y: 3331 }
  },

  {id: '4_p11_apply_univ_approach', type: 'process', dependsOn: { filter4: 'yes' }, data: { label: 'Apply the univariate approach on the unit value' }, position: { x: 2020, y: 3350 } },
  {id: '4_q5_unit_value_outlier', type: 'decision', dependsOn: { filter4: 'yes' }, data: { label: 'Is the unit value detected as an outlier?' }, position: { x: 2270, y: 3350 } },
  {id: '4_p12_flag_obs', type: 'flag', dependsOn: { filter4: 'yes' }, data: { label: 'Set unit value to missing and flag observation. This unit value CANNOT be used later for imputation', width: 240, height: 80 }, position: { x: 2520, y: 3350 } },
  {id: '4_q6_multi_approach_used', type: 'decision', dependsOn: { filter4: 'yes' }, data: { label: 'Should the multivariate approach be used on non-purchased food? (decided earlier)', width: 220, height: 80 }, position: { x: 2250, y: 3500 } },
  {id: '4_p14_apply_multi_approach', type: 'process', data: { label: 'Apply the multivariate approach to check consistency between quantity and monetary value per partaker on food item and unit level', width: 300, height: 80 }, position: { x: 1460, y: 3750 } },
  {id: '4_q7_quantity_outlier', type: 'decision', data: { label: 'Is the quantity detected as an outlier?' }, position: { x: 1830, y: 4040 } },
  {id: '4_q8_value_outlier_yes', type: 'decision', data: { label: 'Is the monetary value detected as an outlier?' }, position: { x: 2080, y: 3890 } },
  {id: '4_q9_unit_value_outlier_yes', type: 'decision', data: { label: 'Is the unit  value detected as an outlier?' }, position: { x: 2330, y: 3740 } },
  {id: '4_p15_flag both', type: 'flag', data: { label: 'Flag both the quantity and the monetary value' }, position: { x: 2580, y: 3740 } },
  {id: '4_p16_flag_quantity', type: 'flag', data: { label: 'Flag the quantity' }, position: { x: 2580, y: 3890 } },
  {id: '4_q10_value_outlier_no', type: 'decision', data: { label: 'Is the monetary value detected as an outlier?' }, position: { x: 2080, y: 4190 } },
  {id: '4_q11_unit_value_outlier_no', type: 'decision', data: { label: 'Is the unit value detected as an outlier?' }, position: { x: 2330, y: 4340 } },
  {id: '4_p17_flag_value', type: 'flag', data: { label: 'Flag the monetary value' }, position: { x: 2580, y: 4190 } },
  {id: '4_p18_flag_and_check', type: 'flag', data: { label: 'Flag, check and correct for obvious errors if possible' }, position: { x: 2580, y: 4340 } },
  {id: '4_q13_rel_market_prices', type: 'decision', data: { label: 'Do we have good and reliable market prices at the food item unit level?' }, position: { x: 2930, y: 4040 } },

  {
    id: '4_p19_market_price',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Price} = \\text{Market price}',
      width: 160,
      height: 68
    },
    position: { x: 3580, y: 4040 }
  },



  {id: '4_p20_def_level_agg', type: 'process', data: { label: 'Define the level of aggregation to use' }, position: { x: 2930, y: 4190 } },

  {
    id: '4_p21_med_unit_value',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Price} = \\text{Median unit value (LCU per unit)}',
      width: 300,
      height: 68
    },
    position: { x: 3180, y: 4190 }
  },


  {id: '4_q14_both_corrected', type: 'decision', data: { label: 'Must both quantity and monetary value be corrrected?' }, position: { x: 3580, y: 4340 } },
  {id: '4_p22_def_lev_agg_2', type: 'process', data: { label: 'Define the level of aggregation to use' }, position: { x: 3850, y: 4340 } },

  {
    id: '4_p23_corr_quant',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Corrected quantity (unit per partaker)} = \\text{Median quantity}',
      width: 550,
      height: 68
    },
    position: { x: 4100, y: 4340 }
  },

  {
    id: '4_p24_corr_mon_value',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Corrected monetary value (LCU per partaker)} = \\text{Corrected quantity (unit per partaker)} \\times \\text{price (LCU per unit)}',
      width: 900,
      height: 68
    },
    position: { x: 4750, y: 4340 }
  },


  {id: '4_q15_mon_value_corrected', type: 'decision', data: { label: 'Must the monetary value be corrected?' }, position: { x: 3580, y: 4490 } },

  {
    id: '4_p25_corr_mon_value_2',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Corrected monetary value (LCU)} = \\text{Price (LCU per unit)} \\times \\text{Original quantity (unit per partaker)}',
      width: 800,
      height: 68
    },
    position: { x: 3850, y: 4490 }
  },




    {
    id: '4_p26_corr_quantity_2',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Corrected quantity (unit)} = \\dfrac{\\text{Original monetary value (LCU per partaker)}}{\\text{Price (LCU per unit)}}',
      width: 800,
      height: 68
    },
    position: { x: 3850, y: 4640 }
  },

  // FAFH branch of step 4 (observations with FAFH dummy = 1). Filter 9: FAFH at individual level?
  {id: '4_p1x_clone_original_values', type: 'process', data: { label: 'Clone all the original quantities and monetary values collected in the survey', width: 200, height: 80 }, position: { x: 230, y: 5040 } },
  {id: '4_q2x_fafh_individual', type: 'decision', dependsOn: { filter9: UNSET }, strict: true, data: { label: 'Is FAFH collected at individual level?'}, position: { x: 500, y: 5040 } },
  {id: '4_q2x_fafh_individual_yes', type: 'chosen', dependsOn: { filter9: 'yes' }, strict: true, data: { label: 'FAFH is collected at individual level'}, position: { x: 500, y: 5040 } },
  {id: '4_q2x_fafh_individual_no', type: 'chosen', dependsOn: { filter9: 'no' }, strict: true, data: { label: 'FAFH is not collected at individual level'}, position: { x: 500, y: 5040 } },
  {id: '4_q3x_fafh_quantities_collected', type: 'decision', dependsOn: { filter9: 'yes' }, data: { label: 'Are quantities (or number of meals) consumed FAFH collected?'}, position: { x: 750, y: 5040 } },
  {id: '4_p2x_multi', type: 'process', dependsOn: { filter9: 'yes' }, data: { label: 'Apply multivariate to check consistency between quantities and monetary value of FAFH and follow same approach as above to correct outliers', width: 400, height: 80}, position: { x: 1250, y: 5040 } },
  {id: '4_p3x_outlier', type: 'process', dependsOn: { filter9: 'yes' }, data: { label: 'Perform outlier detection (univariate) on monetary value distribution and follow same approach as above to correct outliers', width: 400, height: 80}, position: { x: 1250, y: 5190 } },
  {id: '4_q4x_fafh_quantities_collected_2', type: 'decision', dependsOn: { filter9: 'no' }, data: { label: 'Are quantities (or number of meals) consumed FAFH collected?'}, position: { x: 750, y: 5340 } },
  {id: '4_p4x_divide_household', type: 'process', dependsOn: { filter9: 'no' }, data: { label: 'Divide monetary values and quantities by the household size'}, position: { x: 1000, y: 5340 } },
  {id: '4_p5x_multi', type: 'process', dependsOn: { filter9: 'no' }, data: { label: 'Apply multivariate to check consistency between quantities and monetary value of FAFH and follow same approach as above to correct outliers', width: 400, height: 80}, position: { x: 1250, y: 5340 } },
  {id: '4_p6x_divide_household', type: 'process', dependsOn: { filter9: 'no' }, data: { label: 'Divide monetary values by the household size'}, position: { x: 1000, y: 5490 } },
  {id: '4_p7x_outlier', type: 'process', dependsOn: { filter9: 'no' }, data: { label: 'Perform outlier detection (univariate) on monetary value distribution and follow same approach as above to correct outliers', width: 400, height: 80}, position: { x: 1250, y: 5490 } },

  {id: '4_finished', type: 'validation', data: { label: 'Step 4 finished\n' }, position: { x: 5750, y: 5490 } },

  // ===== STEP 5: Monetary value imputation =====
  {id: '5_starts', type: 'validation', data: { label: 'Step 5 starts\nMonetary value\nimputation', width: 200, height: 80 }, position: { x: 0, y: 4940 - Y_SHIFT_STEP_5_10 } },
  {id: '5_q1_mon_value_all', type: 'decision', dependsOn: { filter5: UNSET }, strict: true, data: { label: 'Does the survey collect reliable monetary values for non-purchased food items?' }, position: { x: 250, y: 4940 - Y_SHIFT_STEP_5_10 } },
  {id: '5_q1_mon_value_all_1', type: 'chosen', dependsOn: { filter5: 'yes_reliable' }, strict: true, data: { label: 'The survey collects reliable monetary values for non-purchased food items' }, position: { x: 250, y: 4940 - Y_SHIFT_STEP_5_10 } },
  {id: '5_q1_mon_value_all_2', type: 'chosen', dependsOn: { filter5: ['yes_not_reliable', 'no'] }, strict: true, data: { label: 'The survey does not collect reliable monetary values for non-purchased food items' }, position: { x: 250, y: 4940 - Y_SHIFT_STEP_5_10 } },
  {id: '5_q2_househ_unit_value_miss', type: 'decision', dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] }, data: { label: 'Is the household unit value for purchases available and reliable?' }, position: { x: 500, y: 4940 - Y_SHIFT_STEP_5_10 } },
  {id: '5_q3_unit_measurement_same', type: 'decision', dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] }, data: { label: 'Is the unit of measurement for the purchases and non purchases the same?' }, position: { x: 750, y: 4940 - Y_SHIFT_STEP_5_10 } },
  {id: '5_p1_imp_mon_value_household_unit_value', type: 'process', dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] }, data: { label: 'Use household’s unit value to impute missing monetary value' }, position: { x: 1000, y: 4940 - Y_SHIFT_STEP_5_10 } },

  {
    id: '5_p2_lcu',
    type: 'formulaText',
    dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] },
    data: {
      latex:
        '\\text{Monetary value of quantity consumed (LCU)} = \\text{Quantity consumed (unit)} \\times \\text{Unit value of purchases (LCU per unit)}',
      width: 950,
      height: 68
    },
    position: { x: 1250, y: 4940 - Y_SHIFT_STEP_5_10 }
  },


  {id: '5_q4_weight_in_gram_available', type: 'decision', dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] }, data: { label: 'Do we have a weight in grams of one unit of the non-purchased food?' }, position: { x: 750, y: 5090 - Y_SHIFT_STEP_5_10 } },
  {id: '5_p3_convert_lcu', type: 'flag', dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] }, data: { label: 'Flag the non-purchased food quantity. The monetary value corresponding to this quantity will be estimated at a later stage', width: 300, height: 80 }, position: { x: 1000, y: 5090 - Y_SHIFT_STEP_5_10 } },


  {
    id: '5_p7_lcu_3',
    type: 'formulaText', 
    dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] },
    data: {
      latex:
        '\\text{Monetary value of the quantity consumed (LCU)} = \\text{Quantity consumed (unit)} \\times \\text{Price (LCU per unit)}',
      width: 800,
      height: 68
    },
    position: { x: 1250, y: 5360 - Y_SHIFT_STEP_5_10 }
  },


  {id: '5_p8_best_source', type: 'process', dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] }, data: { label: 'Decide which is the best available source for prices' }, position: { x: 500, y: 5360 - Y_SHIFT_STEP_5_10 } },
  {id: '5_p9_market_survey', type: 'process', dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] }, data: { label: 'A well-undertaken market survey on price per unit (LCU) from the same area and time as the data collection', width: 260, height: 80 }, position: { x: 800, y: 5240 - Y_SHIFT_STEP_5_10 } },
  {id: '5_p10_agg_unit_values', type: 'process', dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] }, data: { label: 'Aggregated unit values based on collected values not flagged as outliers', width: 260, height: 80 }, position: { x: 800, y: 5360 - Y_SHIFT_STEP_5_10 } },
  {id: '5_p11_other', type: 'process', dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] }, data: { label: 'Other sources like ad-hoc surveys for collecting CPI/FPI', width: 260, height: 80 }, position: { x: 800, y: 5480 - Y_SHIFT_STEP_5_10 } },
  {id: '5_p12_no_prices', type: 'process', dependsOn: { filter5: [UNSET, 'yes_not_reliable', 'no'] }, data: { label: 'If no price available leave the monetary value as missing', width: 260, height: 80 }, position: { x: 800, y: 5600 - Y_SHIFT_STEP_5_10 } },
  {id: '5_finished', type: 'validation', data: { label: 'Step 5 finished' }, position: { x: 2200, y: 5690 - Y_SHIFT_STEP_5_10 } },

  // ===== STEP 6: Convert food quantities into grams. Filter 6: all quantities in standard units? =====
  {id: '6_starts', type: 'validation', data: { label: 'Step 6 starts\nConvert food quanities\ninto grams', width: 200, height: 80 }, position: { x: 0, y: 5840 - Y_SHIFT_STEP_5_10 } },

  {id: '6_q1_well_described', type: 'decision', data: { label: 'Is the food item  well described?' }, position: { x: 250, y: 5840 - Y_SHIFT_STEP_5_10 } },

  {id: '6_q2_standard_unit', type: 'decision', dependsOn: { filter6: [UNSET, 'no'] }, data: { label: 'Is the quantity reported in a standard unit of measurement?' }, position: { x: 520, y: 5840 - Y_SHIFT_STEP_5_10 } },
  {id: '6_q2_standard_unit_filter6_yes', type: 'chosen', dependsOn: { filter6: 'yes' }, strict: true, data: { label: 'All food items are measured in standard units' }, position: { x: 520, y: 5840 - Y_SHIFT_STEP_5_10 } },
  {id: '6_q9_rep_standard_unit', type: 'decision', dependsOn: { filter6: [UNSET, 'no'] }, data: { label: 'Is the quantity reported in a standard unit of measurement?' }, position: { x: 250, y: 6940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY} },
  {id: '6_q9_rep_standard_unit_filter6_yes', type: 'chosen', dependsOn: { filter6: 'yes' }, strict: true, data: { label: 'All food items are measured in standard units' }, position: { x: 250, y: 6940 - Y_SHIFT_STEP_5_10 } },


  {id: '6_q3_volumetric', type: 'decision', data: { label: 'Is the standard unit a volumetric measurement, such as litres or millilitres?' }, position: { x: 790, y: 5840 - Y_SHIFT_STEP_5_10 } },
  {id: '6_p1_density_factor', type: 'process', data: { label: 'Convert to grams using density factor (grams per ml)' }, position: { x: 1080, y: 5840 - Y_SHIFT_STEP_5_10 } },

  {
    id: '6_p2_calc_quant_in_grams',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Quantities in grams} = \\text{Quantities (ml)} \\times \\text{Density (grams per ml)}',
      width: 700,
      height: 68
    },
    position: { x: 1370, y: 5840 - Y_SHIFT_STEP_5_10 }
  },


  {id: '6_p3_convert_grams_standard_unit', type: 'process', data: { label: 'Convert to grams using the weight in gram of one standard unit ' }, position: { x: 1080, y: 5990 - Y_SHIFT_STEP_5_10 } },

  {
    id: '6_p2_calc_quant_in_grams_per_partaker',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Quantities (grams per partaker)} = \\text{Quantities (standard unit per partaker)} \\times \\text{Weight in gram of one standard unit}',
      width:950,
      height: 68
    },
    position: { x: 1370, y: 5990 - Y_SHIFT_STEP_5_10 }
  },

  {
    id: '6_p4_calc_price',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Unit value (LCU per gram)} = \\dfrac{\\text{Monetary value per partaker (LCU)}}{\\text{Quantity per partaker (grams)}}',
      notex: 'and set aside to be used to estimate the price from the survey.',  
      width: 600,
      height: 68
    },
    position: { x: 3155, y: 6120 - Y_SHIFT_STEP_5_10 }
  },

  {id: '6_q4_source', type: 'decision', dependsOn: { filter6: 'no' }, data: { label: 'Is a weight in grams for the non-standard unit available from a market survey or other reliable sources?', width: 240, height: 80 }, position: { x: 490, y: 6140 - Y_SHIFT_STEP_5_10 } },
  {id: '6_p5_convert_grams_standard_unit_2', type: 'process', dependsOn: { filter6: 'no' }, data: { label: 'Convert to grams using the weight in gram of one unit' }, position: { x: 800, y: 6140 - Y_SHIFT_STEP_5_10 } },

  {
    id: '6_p6_calc_quant_in_grams',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Quantities in grams} = \\text{Quantities (in non-standard units)} \\times \\text{Conversion factor (grams per non-standard unit)}',
      width: 900,
      height: 68
    },
    position: { x: 1080, y: 6140 - Y_SHIFT_STEP_5_10 }
  },

  {id: '6_q5x_flagged_step_5', type: 'decision', dependsOn: { filter6: 'no' }, data: { label: 'Was the non-purchased food quantity flagged in step 5?' }, position: { x: 2100, y: 6140 - Y_SHIFT_STEP_5_10 } },

  {
  id: '6_estimate_monetary_value',
  type: 'formulaText',
  data: {
    description:
      'Estimate monetary value using the price per gram available (from a market survey or estimated using the unit values from the survey).',
    latex:
        '\\text{Monetary value of quantity consumed (LCU)} = \\text{Quantity consumed (grams)} \\times \\text{Price (LCU per gram)}',
    width: 900,
    height: 100
  },
  position: { x: 1730, y: 6290 - Y_SHIFT_STEP_5_10 }
  },  

  {id: '6_q5_market_survey', type: 'decision', dependsOn: { filter6: 'no' }, data: { label: 'Is a well-undertaken market survey on prices per gram (LCU) from the same area and time as the data collection available?', width: 240, height: 100 }, position: { x: 490, y: 6290 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '6_q6_mon_value_available', type: 'decision', dependsOn: { filter6: 'no' }, data: { label: 'Is the monetary value corresponding to the collected quantity available?', width: 180, height: 100 }, position: { x: 800 , y: 6290 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '6_p7_calc_price_2',
    type: 'formulaText',
    dependsOn: { filter6: 'no' },
    data: {
      latex:
        '\\text{Price} = \\text{Market price per gram (LCU)}',
      width: 300,
      height: 68
    },
    position: { x: 1080, y: 6300 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },

  {id: '6_p8_conv_value_div_price', type: 'process', dependsOn: { filter6: 'no' }, data: { label: 'Convert into grams using monetary value divided by price per gram' }, position: { x: 1530, y: 6300 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '6_p9_calc_quant_in_grams_2',
    type: 'formulaText',
    dependsOn: { filter6: 'no' },
    data: {
      latex:
        '\\text{Quantities in grams} = \\dfrac{\\text{Monetary value (LCU)}}{\\text{Price (LCU per gram)}}',
      width: 500,
      height: 68
    },
    position: { x: 1830, y: 6298 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },


  {id: '6_val_flag', type: 'flag', dependsOn: { filter6: 'no' }, data: { label: 'Flag observation – if too many observations are flagged, it is important to refer to national experts or secondary sources to obtain the weight in grams – monetary value can later be estimated using the price in gram after the quantity is converted', width: 240, height: 200 }, position: { x: 770, y: 6480 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '6_p10_calc_price_3',
    type: 'formulaText',
    dependsOn: { filter6: 'no' },
    data: {
      latex:
        '\\text{Price} = \\text{Median unit value (LCU per gram)}',
      width: 300,
      height: 68
    },
    position: { x: 1460, y: 6780 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },


  {id: '6_q7_estimated', type: 'decision', dependsOn: { filter6: 'no' }, data: { label: 'Could a price per gram for that food item be estimated from the survey? (At least 10 observations, and 60 % of the quantities converted to grams)', width: 240, height: 100 }, position: { x: 490 , y: 6770 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '6_q8_mon_value_rep_quant', type: 'decision', dependsOn: { filter6: 'no' }, data: { label: 'Do we have the monetary value of the collected quantity?' }, position: { x: 800, y: 6780 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '6_p11_def_lev_agg', type: 'process', dependsOn: { filter6: 'no' }, data: { label: 'Define the level of aggregation to use' }, position: { x: 1080, y: 6780 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '6_p12_conv_to_grams', type: 'process', data: { label: 'Convert to grams' }, position: { x: 250, y: 7240 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '6_q10_same_food_group', type: 'decision', dependsOn: { filter6: 'no' }, data: { label: 'Does the food item refer to several foods from the same food group, like «other vegetables»?', width: 240, height: 80 }, position: { x: 490, y: 6940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '6_p13_later', type: 'flag', dependsOn: { filter6: 'no' }, data: { label: 'Quantities cannot be converted into grams. Nutrient values will be estimated at a later stage', width: 240, height: 80 }, position: { x: 490, y: 7090 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '6_p14_def_lev_agg', type: 'process', dependsOn: { filter6: 'no' }, data: { label: 'Define the level of aggregation to use' }, position: { x: 800, y: 6940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '6_p15_calc_price',
    type: 'formulaText',
    dependsOn: { filter6: 'no' },
    data: {
      latex:
        '\\text{Price} = \\text{Median unit value for the food group (LCU per gram)}',
      width: 400,
      height: 68
    },
    position: { x: 1080, y: 6940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },

  {id: '6_p16_conv_grams', type: 'process', dependsOn: { filter6: 'no' }, data: { label: 'Convert into grams using monetary value divided by price per gram' }, position: { x: 1600, y: 6940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '6_p17_calc_quant',
    type: 'formulaText',
    dependsOn: { filter6: 'no' },
    data: {
      latex:
        '\\text{Quantities in grams} = \\dfrac{\\text{Monetary value}}{\\text{Price for the food group (LCU per gram)}}',
      width: 500,
      height: 68
    },
    position: { x: 1930, y: 6940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },


  {id: '6_finished', type: 'validation', data: { label: 'Step 6 finished' }, position: { x: 3374, y: 7240 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  // ===== STEP 7: Editing after converting to grams =====
  {id: '7_starts', type: 'validation', data: { label: 'Step 7 starts\nEditing after converting\nto grams', width: 200, height: 80 }, position: { x: 0, y: 7490 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_q1_syst_missing', type: 'decision', data: { label: 'Are the quantities in grams systematically missing for the food item?' }, position: { x: 250, y: 7490 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_q2_mon_values', type: 'decision', data: { label: 'Does the food item have monetary values?' }, position: { x: 250, y: 7940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_p2_detect_outlier_mon_value', type: 'process', data: { label: 'Detect outliers in monetary values per food item per partaker' }, position: { x: 750, y: 7940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_q3_mon_value_outlier', type: 'decision', data: { label: 'Is the monetary value per partaker identified as an outlier? ' }, position: { x: 1000, y: 7940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_p3_def_lev_agg', type: 'process', data: { label: 'Define the level of aggregation to use' }, position: { x: 1250, y: 7940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '7_p4_calc_corr_mon_val',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Corrected monetary value (LCU)} = \\text{Median monetary value per partaker (LCU)}',
      width: 650,
      height: 68
    },
    position: { x: 1750, y: 7940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },

  {id: '7_p5_drop', type: 'drop', data: { label: 'Drop these observations if they correspond to very few cases' }, position: { x: 500, y: 8090 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_p6_det_outlier_quant', type: 'process', data: { label: 'Detect outliers in quantities in grams per food item per partaker' }, position: { x: 500, y: 7490 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_q4_quant_outlier', type: 'decision', data: { label: 'Is the quantity in grams per partaker identified as an outlier? ' }, position: { x: 750, y: 7490 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_q5_coll_mon_value_cons', type: 'decision', data: { label: 'Was the monetary value of food comsumption collected?' }, position: { x: 1000, y: 7490 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_p7_det_outlier_mon_value_2', type: 'process', data: { label: 'Detect outliers in monetary values per food item per partaker' }, position: { x: 1250, y: 7490 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_q6_mon_value_outlier_2', type: 'decision', data: { label: 'Is the monetary value per partaker identified as an outlier' }, position: { x: 1500, y: 7490 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '7_p8_calc_corr_quant',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Corrected quantities (grams per partaker)} = \\dfrac{\\text{Monetary value per partaker (LCU)}}{\\text{Price (LCU per gram)}}',
      width: 650,
      height: 68
    },
    position: { x: 1750, y: 7488 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },

  {id: '7_p9_def_lev_agg_2', type: 'process', data: { label: 'Define the level of aggregation to use' }, position: { x: 1000, y: 7640 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '7_p10_calc_corr_quant_2',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Corrected quantities (grams per partaker)} = \\text{Median quantity per partaker (grams)}',
      width: 650,
      height: 68
    },
    position: { x: 1750, y: 7640 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },

  {
    id: '7_p11_calc_corr_mon_value_3',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Corrected monetary value (LCU per partaker)} = \\text{Corrected quantity per partaker (grams)} \\times \\text{Price (LCU per gram)}',
      width: 900,
      height: 68
    },
    position: { x: 2550, y: 7640 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },

//  {id: '7_q7_coll_mon_value_cons_2', type: 'decision', data: { label: 'Does the survey collect the estimated monetary value of consumption?' }, position: { x: 750, y: 7790 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_p12_det_outlier_mon_value_3', type: 'process', data: { label: 'Detect outliers in monetary values per food item per partaker' }, position: { x: 1000, y: 7790 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '7_q8_mon_val_outlier_3', type: 'decision', data: { label: 'Is the monetary value per partaker identified as an outlier?' }, position: { x: 1250, y: 7790 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '7_p13_calc_corr_mon_value_4',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Corrected monetary value (LCU  per partaker)} = \\text{Quantity per partaker (grams)} \\times \\text{Price (LCU per gram)}',
      width: 850,
      height: 68
    },
    position: { x: 1750, y: 7790 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY}
  },

  {id: '7_finished', type: 'validation', data: { label: 'Step 7 finished' }, position: { x: 3500, y: 8090 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  // ===== STEP 8: Calculate dietary energy for food items reported in grams =====
  {id: '8_starts', type: 'validation', data: { label: 'Step 8 starts\nCalculate dietary energy\nfor food items\nreported in grams', width: 200, height: 120 }, position: { x: 0, y: 8370 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '8_p1_calc_quant',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Quantity (grams)} = \\text{Quantity (grams per partaker)} \\times \\text{Household size}',
      width: 850,
      height: 68
    },
    position: { x: 250, y: 8390 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },

  {
    id: '8_p2_calc_mon_value',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Monetary values (LCU)} = \\text{Monetary values (LCU per partaker)} \\times \\text{Household size}',
      width: 850,
      height: 68
    },
    position: { x: 300, y: 8540 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },

  {id: '8_p3_merge_nct', type: 'process', data: { label: 'Merge in the Nutrient Conversion Table (NCT)' }, position: { x: 1290, y: 8540 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '8_p4_corr_nct', type: 'process', data: { label: 'Correct the NCT or revise food matching' }, position: { x: 1540, y: 8390 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '8_q1_errors', type: 'decision', data: { label: 'Are there any errors detected in the merge?' }, position: { x: 1540, y: 8540 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {
    id: '8_p5_calc_ed_quant',
    type: 'formulaText',
    data: {
      description: 'Calculate edible quantity:',
      latex:
        '\\text{Edible quantity (grams)} = \\text{Quantity (grams)} \\times \\left(1 - \\dfrac{\\text{Refuse factor}}{100}\\right)',
      width: 700,
      height: 68
    },
    position: { x: 300, y: 8740 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },

  {
    id: '8_p6_calc_cal',
    type: 'formulaText',
    data: {
      description: 'Calculate calories:',
      latex:
        '\\text{Calories (kcal)} = \\text{Edible quantity (grams)} \\times \\dfrac{\\text{kcal per 100 edible grams}}{100}',
      width: 700,
      height: 68
    },
    position: { x: 300, y: 8940 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY}
  },

  {
    id: '8_p7_calc_macro',
    type: 'formulaText',
    data: {
      description: 'Calculate macronutrients (grams) – example:',
      latex:
        '\\text{Quantity of fats (grams)} = \\text{Edible quantity (grams)} \\times \\dfrac{\\text{Fat content (grams) per 100 edible grams}}{100}',
      width: 800,
      height: 160
    },
    position: { x: 250, y: 9140 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },

  {id: '8_finished', type: 'validation', data: { label: 'Step 8 finished' }, position: { x: 1220, y: 9186 - Y_SHIFT_STEP_5_10  + Y_SHIFT_STEP_5_EMERGENCY} },

  // ===== STEP 9: Impute dietary energy for the remaining food items =====
  {id: '9_starts', type: 'validation', data: { label: 'Step 9 starts\nImputing dietary energy\nfor the remaining\nfood items', width: 200, height: 120 }, position: { x: 0, y: 9420 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '9_calories_missing', type: 'decision', data: { label: 'Are the calories for the food item missing?' }, position: { x: 250, y: 9440 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '9_free_food', type: 'decision', data: { label: 'Is it free food, like school meals?' }, position: { x: 250, y: 9590 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY} },
  {id: '9_calculate_calories', type: 'process', data: { label: 'Obtain information on energy content in school meals from school meal provider', width: 240, height: 80 }, position: { x: 500, y: 9590 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '9_calories_from_school_meals', type: 'formulaText', data: {
    latex:
      '\\text{Calories from school meals (kcal)} = \\dfrac{\\text{Number of school meals}}{\\text{Energy content (kcal per meal)}}',
    width: 600,
    height: 120
  },
  position: { x: 800, y: 9564 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  {id: '9_specific_food_group', type: 'decision', data: { label: 'Does the food item belong to a specific food group, e.g. ‘other dairy products’?' }, position: { x: 250, y: 9890 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '9_unspecified_food', type: 'process', data: { label: 'Assign a food group to the ‘unspecified’ food' }, position: { x: 500, y: 9890 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '9_median_dietary_energy_unit_cost_food_group', type: 'process', data: { label: 'Calculate the median dietary energy unit cost for that food group' }, position: { x: 1570, y: 9890 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '9_level_of_disaggregation_1', type: 'process', data: { label: 'Define the level of aggregation to use' }, position: { x: 1320, y: 9890 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '9_level_of_disaggregation_2', type: 'process', data: { label: 'Define the level of aggregation to use' }, position: { x: 670, y: 10275 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '9_median_dietary_energy_unit_cost', type: 'process', data: { label: 'Calculate the median dietary energy unit cost' }, position: { x: 930, y: 10275 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '9_calculate_household_dietary_energy_1', type: 'formulaText', data: {
    description:
      'Calculate the household dietary energy unit cost for that food group (use only purchased food from in-house consumption with non-missing calories).',
    latex:
      '\\begin{array}{c}\\text{Dietary energy unit cost}\\\\[2pt]\\text{(LCU per one kcal)}_{hj}\\end{array} = \\dfrac{\\sum_{i=1}^{I} Value(LCU)_{ihj}}{\\sum_{i=1}^{I} DEC_{ihj}(kcal)}',
    note:
      'h refers to the household, j refers to the food group, i refers to the foods belonging to food group j (for example, milk, cheddar, etc.) and DEC refers to the dietary energy of food i expressed in kcal.',
    width: 480,
    height: 220
  },
  position: { x: 750, y: 9815 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {
  id: '9_impute_missing_1',
  type: 'formulaText',
  data: {
    description:
      "Impute the missing dietary energy by dividing the food monetary values for the unspecified food by the median dietary energy unit cost for the corresponding food group (for example, 'dairy products').",
    latex:
      '\\displaystyle DEC\\,(kcal)_{hk} = \\dfrac{Value(LCU)_{hk}}{\\text{Median dietary energy unit cost }(LCU\\text{ per }kcal)_{j} \\times m}',
    note:
      'where k refers to the unspecified foods (for which calories are missing), h refers to household, j refers to the food group to which the unspecified foods belongs to and m is a multiplier that may be applied to account for differences between the dietary energy unit cost in house and away from home.',
    width: 600,
    height: 220
  },
  position: { x: 1820, y: 9815 - Y_SHIFT_STEP_5_10  + Y_SHIFT_STEP_5_EMERGENCY}
  },
  {
  id: '9_calculate_household_dietary_energy_2',
  type: 'formulaText',
  data: {
    description:
      'Calculate the household dietary energy unit cost for all food items consumed from in-house purchases (use only records with non-missing calories).',
    latex:
      '\\begin{array}{c}\\text{Dietary energy unit cost}\\\\[2pt]\\text{(LCU per one kcal)}_{h}\\end{array} = \\dfrac{\\sum_{i=1}^{I} Monetary\\ value(LCU)_{ih}}{\\sum_{i=1}^{I} DEC_{ih}\\,(kcal)}',
    note:
      'h refers to the household, i refers to the foods independent of food category and DEC refers to the dietary energy of food i expressed in kcal.',
    width: 500,
    height: 220
  },
  position: { x: 80, y: 10199 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },  
  {
  id: '9_impute_missing_2',
  type: 'formulaText',
  data: {
    description:
      'Impute the missing dietary energy by dividing the food monetary values for the unspecified food by the median dietary energy unit cost.',
    latex:
      '\\displaystyle DEC\\,(kcal)_{hk} = \\dfrac{Value(LCU)_{hk}}{\\text{Median dietary energy unit cost }(LCU\\text{ per }kcal)}',
    note:
      'where k refers to the unspecified foods (for which calories are missing) and h refers to household.',
    width: 520,
    height: 200
  },
  position: { x: 1180, y: 10209 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },
  {id: '9_finished', type: 'validation', data: { label: 'Step 9 finished' }, position: { x: 2450, y: 10275 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },

  // ===== STEP 10: Aggregation and macro editing =====
  {id: '10_starts', type: 'validation', data: { label: 'Step 10 starts\nAggregation and\nmacro editing', width: 200, height: 80 }, position: { x: 0, y: 10875 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '10_hhsize_eq_partakers', type: 'decision', data: { label: 'Is the household size equal to the number of partakers?' }, position: { x: 250, y: 10875 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '10_per_capita_var', type: 'process', data: { label: 'Create per capita or per AME variables' }, position: { x: 500, y: 10875 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {
  id: '10_per_capita_and_ame_1',
  type: 'formulaText',
  data: {
    latex:
      '\\begin{array}{c}\\text{Calories per capita} = \\dfrac{\\text{Total household calories}}{\\text{Household size}}\\\\[14pt]\\text{OR}\\\\[14pt]\\text{Calories per AME} = \\dfrac{\\text{Total household calories}}{\\text{Household size expressed in AME}}\\end{array}',
    width: 500,
    height: 160
  },
  position: { x: 800, y: 10680 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },
  {
    id: '10_mon_per_cap',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Monetary value per capita} = \\dfrac{\\text{Total monetary value}}{\\text{Household size}}',
      width: 500,
      height: 100
    },
    position: { x: 800, y: 10960 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },
  {id: '10_obs_fafh', type: 'decision', data: { label: 'Does the observation refer to FAFH (dummy variable equals to 1)?' }, position: { x: 250, y: 11450 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '10_create_new_var', type: 'process', data: { label: 'Create a new variable for monetary value to be used for poverty analysis on food expenditure\n(which is not adjusted for partakers)', width: 350, height: 80 }, position: { x: 500, y: 11450 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY} },
  {
    id: '10_calc_exp',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Expenditure (LCU)} = \\dfrac{\\text{Monetary value} \\times \\text{Household size}}{\\text{Number of partakers}}',
      width: 500,
      height: 100
    },
    position: { x: 950, y: 11434 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },
  {id: '10_create_pc', type: 'process', data: { label: 'Create per capita variables' }, position: { x: 1550, y: 11450 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {
  id: '10_per_capita_and_ame_2',
  type: 'formulaText',
  data: {
    latex:
      '\\begin{array}{c}\\text{Calories per capita} = \\dfrac{\\text{Total household calories adjusted for partakers}}{\\text{Household size}}\\\\[14pt]\\text{OR}\\\\[14pt]\\text{Calories per AME} = \\dfrac{\\text{Total household calories adjusted per partaker}}{\\text{Household size expressed in AME}}\\end{array}',
    width: 650,
    height: 160
  },
  position: { x: 1850, y: 11180 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },
  {
    id: '10_monval_cap',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Monetary value per capita} = \\dfrac{\\text{Monetary value per partaker (LCU per partaker)}}{\\text{Household size}}',
      width: 650,
      height: 100
    },
    position: { x: 1850, y: 11434 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },
  {
    id: '10_expenditure',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Expenditure per capita} = \\dfrac{\\text{Expenditure (LCU)}}{\\text{Household size}}',
      width: 650,
      height: 100
    },
    position: { x: 1850, y: 11610 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },
  {
    id: '10_expenditure_yes',
    type: 'formulaText',
    data: {
      latex:
        '\\text{Expenditure (LCU))} = \\text{Monetary value (LCU)}',
      width: 380,
      height: 100
    },
    position: { x: 140, y: 11690 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY }
  },
  {id: '10_convert', type: 'process', data: { label: 'Convert to per day in deviding by the number of days of the reference period' }, position: { x: 2650, y: 11450 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '10_sum_up', type: 'process', data: { label: 'Sum up all the food consumption for each household' }, position: { x: 2650, y: 11650 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },
  {id: '10_finished', type: 'validation', data: { label: 'Step 10 finished' }, position: { x: 2650, y: 11850 - Y_SHIFT_STEP_5_10 + Y_SHIFT_STEP_5_EMERGENCY } },



]






// Edges are grouped by step, in the same order as the nodes. Edges that only exist for one filter answer carry dependsOn.
export const allEdges = [
  // ----- Step 2 edges -----
  { id: 'e2_start_p1', type: 'straight', source: '2_start', sourceHandle: 'out-right', target: '2_p1new_set_to_missing', targetHandle: 'in-left'},
  { id: 'e2_q2_yes_p2', type: 'straight', source: '2_q2_both_missing', sourceHandle: 'out-bottom', target: '2_p2_drop_observation', targetHandle: 'in-top', label: 'Yes'},
  { id: 'e2_q4_yes_p4', type: 'straight', source: '2_q4_total_equals_sum', sourceHandle: 'out-bottom', target: '2_p4_check_modify_error', targetHandle: 'in-top', label: 'No'},
  { id: 'e2_q5_yes_q4', type: 'step', source: '2_q5_units_same', sourceHandle: 'out-right', target: '2_q4_total_equals_sum', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e2_p4_yes_p3', type: 'step', source: '2_p4_check_modify_error', sourceHandle: 'out-right', target: '2_p3_drop_total_qty_var', targetHandle: 'in-top'},
  { id: 'e2_q7_yes_p9', type: 'step', source: '2_q7_duplicates_nonrecall', sourceHandle: 'out-right', target: '2_p9_aggregate', targetHandle: 'in-top', label: 'Yes'},
  { id: 'e2_q8_yes_q9', type: 'straight', source: '2_q8_duplicates_recall', sourceHandle: 'out-right', target: '2_q9_code_description_consistent', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e2_p5_yes_p9', type: 'straight', source: '2_p5_delete_duplicates', sourceHandle: 'out-right', target: '2_p9_aggregate', targetHandle: 'in-left'},
  { id: 'e2_p9_yes_q9', type: 'straight', source: '2_p9_aggregate', sourceHandle: 'out-bottom', target: '2_q9_code_description_consistent', targetHandle: 'in-top'},
  { id: 'e2_q9_yes_q10', type: 'straight', source: '2_q9_code_description_consistent', sourceHandle: 'out-right', target: '2_q10_unit_plausible', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e2_p6_yes_q10', type: 'step', source: '2_p6_correct_code_description', sourceHandle: 'out-right', target: '2_q10_unit_plausible', targetHandle: 'in-left'},
  { id: 'e2_q10_yes_q11', type: 'straight', source: '2_q10_unit_plausible', sourceHandle: 'out-right', target: '2_q11_source_correct', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e2_p8_yes_v3', type: 'step', source: '2_p7_correct_unit', sourceHandle: 'out-right', target: '2_q11_source_correct', targetHandle: 'in-left'},
  { id: 'e2_q1_no_q2', type: 'straight', source: '2_p1new_set_to_missing', sourceHandle: 'out-right', target: '2_q2_both_missing', targetHandle: 'in-left' },
  { id: 'e2_q4_no_p3', type: 'step', source: '2_q4_total_equals_sum', sourceHandle: 'out-right', target: '2_p3_drop_total_qty_var', targetHandle: 'in-top', label: 'Yes' },
  { id: 'e2_q5_no_p3', type: 'step', source: '2_q5_units_same', sourceHandle: 'out-bottom', target: '2_p3_drop_total_qty_var', targetHandle: 'in-left', label: 'No' },
  { id: 'e2_q7_no_p5', type: 'straight', source: '2_q7_duplicates_nonrecall', sourceHandle: 'out-bottom', target: '2_p5_delete_duplicates', targetHandle: 'in-top', label: 'No' },
  { id: 'e2_q8_no_p5', type: 'straight', source: '2_q8_duplicates_recall', sourceHandle: 'out-top', target: '2_p5_delete_duplicates', targetHandle: 'in-bottom', label: 'No' },
  { id: 'e2_q9_no_p6', type: 'straight', source: '2_q9_code_description_consistent', sourceHandle: 'out-bottom', target: '2_p6_correct_code_description', targetHandle: 'in-top', label: 'No' },
  { id: 'e2_q10_no_p7', type: 'straight', source: '2_q10_unit_plausible', sourceHandle: 'out-bottom', target: '2_p7_correct_unit', targetHandle: 'in-top', label: 'No' },
  { id: 'e2_q11_no_p8', type: 'straight', source: '2_q11_source_correct', sourceHandle: 'out-bottom', target: '2_p8_correct_source', targetHandle: 'in-top', label: 'No' },
  { id: 'e2_p8_finish', type: 'step', source: '2_p8_correct_source', sourceHandle: 'out-right', target: '2_step_finished', targetHandle: 'in-top' },
  { id: 'e2_q11_yes_v3', type: 'step', source: '2_q11_source_correct', sourceHandle: 'out-right', target: '2_step_finished', targetHandle: 'in-top', label: 'Yes'},
  { id: 'e2_finished_start', type: 'step', source: '2_step_finished', sourceHandle: 'out-bottom', target: '3_starts', targetHandle: 'in-top' },

// Step2 - edges depending on filters

// Filter1 neutral
  { id: 'e2_q1_yes_q3', type: 'straight', source: '2_q2_both_missing', sourceHandle: 'out-right', target: '2_q3_total_qty_collected', targetHandle: 'in-left', label: 'No', dependsOn: { filter1: UNSET }}, // Only visible with neutral filter1
  { id: 'e2_q3_no_q6', type: 'step', source: '2_q3_total_qty_collected', sourceHandle: 'out-bottom', target: '2_q6_recall', targetHandle: 'in-left', label: 'No', dependsOn: { filter1: UNSET, filter2: UNSET }, strict: true },
  { id: 'e2_q3_no_q6_recall', type: 'step', source: '2_q3_total_qty_collected', sourceHandle: 'out-bottom', target: '2_q6_recall', targetHandle: 'in-left', label: 'No', dependsOn: { filter1: UNSET, filter2: 'recall' }, strict: true },
  { id: 'e2_q3_no_q6_diary', type: 'step', source: '2_q3_total_qty_collected', sourceHandle: 'out-bottom', target: '2_q6_recall', targetHandle: 'in-left', label: 'No', dependsOn: { filter1: UNSET, filter2: 'diary' }, strict: true },
  { id: 'e2_q3_yes_q5', type: 'straight', source: '2_q3_total_qty_collected', sourceHandle: 'out-right', target: '2_q5_units_same', targetHandle: 'in-left', label: 'Yes',  dependsOn: { filter1: UNSET }},
  { id: 'e2_p3_yes_q6', type: 'straight', source: '2_p3_drop_total_qty_var', sourceHandle: 'out-bottom', target: '2_q6_recall', targetHandle: 'in-top', dependsOn: { filter1: UNSET, filter2: UNSET }, strict: true},
  { id: 'e2_p3_yes_q6_recall', type: 'straight', source: '2_p3_drop_total_qty_var', sourceHandle: 'out-bottom', target: '2_q6_recall_yes', targetHandle: 'in-top', dependsOn: { filter1: UNSET, filter2: 'recall' }, strict: true},
  { id: 'e2_p3_yes_q6_diary', type: 'straight', source: '2_p3_drop_total_qty_var', sourceHandle: 'out-bottom', target: '2_q6_recall_no', targetHandle: 'in-top', dependsOn: { filter1: UNSET, filter2: 'diary' }, strict: true},

// Filter1 'yes'
  { id: 'e2_q1_yes_q3_f1_yes', type: 'straight', source: '2_q2_both_missing', sourceHandle: 'out-right', target: '2_q3_total_qty_collected_yes', targetHandle: 'in-left', label: 'No', dependsOn: { filter1: 'yes' }, strict: true},
  { id: 'e2_q3_yes_q5_f1_yes', type: 'straight', source: '2_q3_total_qty_collected_yes', sourceHandle: 'out-right', target: '2_q5_units_same', targetHandle: 'in-left', dependsOn: { filter1: 'yes' }, strict: true},
  { id: 'e2_p3_yes_q6_f1_yes', type: 'straight', source: '2_p3_drop_total_qty_var', sourceHandle: 'out-bottom', target: '2_q6_recall', targetHandle: 'in-top', dependsOn: { filter1: 'yes', filter2: UNSET }, strict: true},
  { id: 'e2_p3_yes_q6_recall_f1_yes', type: 'straight', source: '2_p3_drop_total_qty_var', sourceHandle: 'out-bottom', target: '2_q6_recall_yes', targetHandle: 'in-top', dependsOn: { filter1: 'yes', filter2: 'recall' }, strict: true},
  { id: 'e2_p3_yes_q6_diary_f1_yes', type: 'straight', source: '2_p3_drop_total_qty_var', sourceHandle: 'out-bottom', target: '2_q6_recall_no', targetHandle: 'in-top', dependsOn: { filter1: 'yes', filter2: 'diary' }, strict: true},

// Filter1 'no'
  { id: 'e2_q1_yes_q3_f1_no', type: 'straight', source: '2_q2_both_missing', sourceHandle: 'out-right', target: '2_q3_total_qty_collected_no', targetHandle: 'in-left', label: 'No', dependsOn: { filter1: 'no' }, strict: true},
  { id: 'e2_p3_yes_q6_f1_no', type: 'step', source: '2_q3_total_qty_collected_no', sourceHandle: 'out-bottom', target: '2_q6_recall', targetHandle: 'in-left', dependsOn: { filter1: 'no', filter2: UNSET }, strict: true},
  { id: 'e2_p3_yes_q6_recall_f1_no', type: 'step', source: '2_q3_total_qty_collected_no', sourceHandle: 'out-bottom', target: '2_q6_recall_yes', targetHandle: 'in-left', dependsOn: { filter1: 'no', filter2: 'recall' }, strict: true},
  { id: 'e2_p3_yes_q6_diary_f1_no', type: 'step', source: '2_q3_total_qty_collected_no', sourceHandle: 'out-bottom', target: '2_q6_recall_no', targetHandle: 'in-left', dependsOn: { filter1: 'no', filter2: 'diary' }, strict: true},

// Filter2 neutral
  { id: 'e2_q6_yes_q7_no', type: 'straight', source: '2_q6_recall', sourceHandle: 'out-right', target: '2_q7_duplicates_nonrecall', targetHandle: 'in-left', label: 'No', dependsOn: { filter2: UNSET }, strict: true},
  { id: 'e2_q6_yes_q7_yes', type: 'step', source: '2_q6_recall', sourceHandle: 'out-bottom', target: '2_q8_duplicates_recall', targetHandle: 'in-left', label: 'Yes', dependsOn: { filter2: UNSET }, strict: true},

// Filter2 'diary'  
  { id: 'e2_q6_q7_diary', type: 'straight', source: '2_q6_recall_no', sourceHandle: 'out-right', target: '2_q7_duplicates_nonrecall', targetHandle: 'in-left', dependsOn: { filter2: 'diary' }, strict: true },

// Filter2 'recall'  
  { id: 'e2_q6_q8_recall', type: 'step', source: '2_q6_recall_yes', sourceHandle: 'out-bottom', target: '2_q8_duplicates_recall', targetHandle: 'in-left', dependsOn: { filter2: 'recall' }, strict: true },



// ----- Step 3 edges -----
  { id: 'e3_start_yes_q1', type: 'straight', source: '3_starts', sourceHandle: 'out-right', target: '3_q1_wide_form', targetHandle: 'in-left'},
  { id: 'e3_q1_yes_q2', type: 'straight',source: '3_q1_wide_form', sourceHandle: 'out-right', target: '3_q2_wide_continue', targetHandle: 'in-left', label: 'Yes'},

  { id: 'e3_q2_yes_q3', type: 'straight',source: '3_q2_wide_continue', sourceHandle: 'out-right', target: '3_q3_fafh_independent_wide', targetHandle: 'in-left', dependsOn: { filter3: UNSET }, label: 'Yes'},
  { id: 'e3_q3_yes_p2', type: 'straight',source: '3_q3_fafh_independent_wide', sourceHandle: 'out-bottom', target: '3_p3_add_fafh_wide', targetHandle: 'in-top', dependsOn: { filter3: UNSET }, label: 'Yes'},
  { id: 'e3_q3_no_q6', type: 'step',source: '3_q3_fafh_independent_wide', sourceHandle: 'out-right', target: '3_q6_number_of_meals_fafh_collected', targetHandle: 'in-top', dependsOn: { filter3: UNSET }, label: 'No'},

  { id: 'e3_q2_yes_q3_yes', type: 'straight',source: '3_q2_wide_continue', sourceHandle: 'out-right', target: '3_q3_fafh_independent_wide_yes', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e3_q3_yes_p2_yes', type: 'straight',source: '3_q3_fafh_independent_wide_yes', sourceHandle: 'out-bottom', target: '3_p3_add_fafh_wide', targetHandle: 'in-top'},

  { id: 'e3_q2_yes_q3_no', type: 'straight',source: '3_q2_wide_continue', sourceHandle: 'out-right', target: '3_q3_fafh_independent_wide_no', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e3_q3_no_q6_no', type: 'step',source: '3_q3_fafh_independent_wide_no', sourceHandle: 'out-right', target: '3_q6_number_of_meals_fafh_collected', targetHandle: 'in-top'},


  { id: 'e3_p1_yes_q4', type: 'straight',source: '3_p1_restructure_to_long_form', sourceHandle: 'out-bottom', target: '3_q4_monetary_values_at_least_one_source', targetHandle: 'in-top'},
  { id: 'e3_p1_yes_q4_yes', type: 'straight',source: '3_p1_restructure_to_long_form', sourceHandle: 'out-bottom', target: '3_q4_monetary_values_at_least_one_source_f4_yes', targetHandle: 'in-top'},
  { id: 'e3_p1_yes_q4_no', type: 'straight',source: '3_p1_restructure_to_long_form', sourceHandle: 'out-bottom', target: '3_q4_monetary_values_at_least_one_source_f4_no', targetHandle: 'in-top'},
  { id: 'e3_p2_yes_p3', type: 'straight',source: '3_p2_aggregate_fafh', sourceHandle: 'out-bottom', target: '3_p3_add_fafh_wide', targetHandle: 'in-top'},

  { id: 'e3_p4_yes_q5', type: 'step',source: '3_p4_temp_file_for_imputation', sourceHandle: 'out-bottom', target: '3_q5_fafh_independent_long', targetHandle: 'in-left'},
  { id: 'e3_p4_yes_q5', type: 'step',source: '3_p4_temp_file_for_imputation', sourceHandle: 'out-bottom', target: '3_q5_fafh_independent_long_yes', targetHandle: 'in-left'},
  { id: 'e3_p4_yes_q5', type: 'step',source: '3_p4_temp_file_for_imputation', sourceHandle: 'out-bottom', target: '3_q5_fafh_independent_long_no', targetHandle: 'in-left'},

  { id: 'e3_q4_yes_q5', type: 'straight',source: '3_q4_monetary_values_at_least_one_source', sourceHandle: 'out-bottom', target: '3_q5_fafh_independent_long', targetHandle: 'in-top', dependsOn: { filter3: UNSET, filter4: UNSET }, strict: true, label: 'No'},
  { id: 'e3_q4_yes_q5_f4_no', type: 'straight',source: '3_q4_monetary_values_at_least_one_source_f4_no', sourceHandle: 'out-bottom', target: '3_q5_fafh_independent_long', targetHandle: 'in-top', dependsOn: { filter3: UNSET, filter4: 'no' }, strict: true},

  { id: 'e3_q5_yes_p5', type: 'straight',source: '3_q5_fafh_independent_long', sourceHandle: 'out-right', target: '3_p5_assign_food_source', targetHandle: 'in-left', dependsOn: { filter3: UNSET }, label: 'Yes'},
  { id: 'e3_q5_no_q6', type: 'step', source: '3_q5_fafh_independent_long', sourceHandle: 'out-bottom', target: '3_q6_number_of_meals_fafh_collected', targetHandle: 'in-bottom', dependsOn: { filter3: UNSET }, label: 'No' },

  { id: 'e3_q4_yes_q5_f3_yes', type: 'straight',source: '3_q4_monetary_values_at_least_one_source', sourceHandle: 'out-bottom', target: '3_q5_fafh_independent_long_yes', targetHandle: 'in-top', dependsOn: { filter5: UNSET }, label: 'No'},
  { id: 'e3_q4_yes_q5_f3_yes_f4_no', type: 'straight',source: '3_q4_monetary_values_at_least_one_source_f4_no', sourceHandle: 'out-bottom', target: '3_q5_fafh_independent_long_yes', targetHandle: 'in-top', dependsOn: { filter4: 'no' }, strict: true},
  { id: 'e3_q5_yes_p5_f3_yes', type: 'straight',source: '3_q5_fafh_independent_long_yes', sourceHandle: 'out-right', target: '3_p7_add_fafh_long', targetHandle: 'in-left'},

  { id: 'e3_q4_yes_q5_f3_no', type: 'straight',source: '3_q4_monetary_values_at_least_one_source', sourceHandle: 'out-bottom', target: '3_q5_fafh_independent_long_no', targetHandle: 'in-top', label: 'No'},
  { id: 'e3_q5_no_q6_f3_no', type: 'step', source: '3_q5_fafh_independent_long_no', sourceHandle: 'out-right', target: '3_q6_number_of_meals_fafh_collected', targetHandle: 'in-left' },

  { id: 'e3_p5_yes_p6', type: 'straight',source: '3_p5_assign_food_source', sourceHandle: 'out-right', target: '3_p7_add_fafh_long', targetHandle: 'in-left'},
  { id: 'e3_p6_yes_p7', type: 'straight',source: '3_p6_aggregate', sourceHandle: 'out-right', target: '3_p7_add_fafh_long', targetHandle: 'in-left'},
  { id: 'e3_p7_yes_q6', type: 'straight',source: '3_p7_add_fafh_long', sourceHandle: 'out-right', target: '3_q6_number_of_meals_fafh_collected', targetHandle: 'in-left'},
  { id: 'e3_q6_yes_p8', type: 'step', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-right', target: '3_p8_calc_in_house_meals', targetHandle: 'in-left', dependsOn: { filter8: UNSET}, strict: true, label: 'Yes'},
  { id: 'e3_q6_yes_p8', type: 'step', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-right', target: '3_p8_calc_in_house_meals', targetHandle: 'in-left', dependsOn: { filter8: 'yes'}, strict: true},

  //filter 7
  { id: 'e3_p8_yes_q7', type: 'step',source: '3_p8_calc_in_house_meals', sourceHandle: 'out-bottom', target: '3_q7_visitors_yes_meals_fafh', targetHandle: 'in-top', dependsOn: { filter7: UNSET}, strict: true},
  { id: 'e3_p8_yes_q7_filter7_yes', type: 'step',source: '3_p8_calc_in_house_meals', sourceHandle: 'out-bottom', target: '3_q7_visitors_yes_meals_fafh_yes', targetHandle: 'in-top', dependsOn: { filter7: 'yes'}, strict: true},
  { id: 'e3_p8_yes_q7_filter7_no', type: 'step',source: '3_p8_calc_in_house_meals', sourceHandle: 'out-bottom', target: '3_q7_visitors_yes_meals_fafh_no', targetHandle: 'in-top', dependsOn: { filter7: 'no'}, strict: true},


  //filter 7
  { id: 'e3_q7_yes_q8', type: 'straight', source: '3_q7_visitors_yes_meals_fafh', sourceHandle: 'out-right', target: '3_q8_meals_by_visitors_yes_meals_fafh', targetHandle: 'in-left', dependsOn: { filter7: UNSET}, strict: true, label: 'Yes'},
  { id: 'e3_q7_yes_q8_filter7_yes', type: 'straight', source: '3_q7_visitors_yes_meals_fafh_yes', sourceHandle: 'out-right', target: '3_q8_meals_by_visitors_yes_meals_fafh', targetHandle: 'in-left', dependsOn: { filter7: 'yes'}, strict: true},

  { id: 'e3_q8_yes_p9', type: 'straight', source: '3_q8_meals_by_visitors_yes_meals_fafh', sourceHandle: 'out-right', target: '3_p9_calc_partakers_1', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e3_q9_yes_p10', type: 'straight', source: '3_q9_visitors_days_stayed_yes_meals_fafh', sourceHandle: 'out-right', target: '3_p10_calc_partakers_2', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e3_p9_yes_p16', type: 'step', source: '3_p9_calc_partakers_1', sourceHandle: 'out-right', target: '3_p16x_divide', targetHandle: 'in-top'},
  { id: 'e3_p10_yes_p16', type: 'step', source: '3_p10_calc_partakers_2', sourceHandle: 'out-right', target: '3_p16x_divide', targetHandle: 'in-top'},
  { id: 'e3_p11_yes_p16', type: 'step', source: '3_p11_calc_partakers_3', sourceHandle: 'out-right', target: '3_p16x_divide', targetHandle: 'in-top'},
  { id: 'e3_q10_yes_q11', type: 'straight', source: '3_q10_visitors_no_meals_fafh', sourceHandle: 'out-bottom', target: '3_q11_meals_by_visitors_no_meals_fafh', targetHandle: 'in-top', dependsOn: { filter7: UNSET }, label: 'Yes'},
  { id: 'e3_q10_yes_q11_f7_yes', type: 'straight', source: '3_q10_visitors_no_meals_fafh_yes', sourceHandle: 'out-bottom', target: '3_q11_meals_by_visitors_no_meals_fafh', targetHandle: 'in-top', dependsOn: { filter7: 'yes' }, strict: true},

  { id: 'e3_p12_yes_p16', type: 'step', source: '3_p12_calc_partakers_1b', sourceHandle: 'out-right', target: '3_p16x_divide', targetHandle: 'in-top'},
  { id: 'e3_q11_yes_p13', type: 'straight', source: '3_q11_meals_by_visitors_no_meals_fafh', sourceHandle: 'out-right', target: '3_p13_calc_partakers_1b', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e3_p13_yes_p16', type: 'step', source: '3_p13_calc_partakers_1b', sourceHandle: 'out-right', target: '3_p16x_divide', targetHandle: 'in-top'},
  { id: 'e3_q9_yes_p14', type: 'straight', source: '3_q9_visitors_days_stayed_no_meals_fafh', sourceHandle: 'out-right', target: '3_p14_calc_partakers_1b', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e3_p14_yes_p16', type: 'step', source: '3_p14_calc_partakers_1b', sourceHandle: 'out-right', target: '3_p16x_divide', targetHandle: 'in-top'},
  { id: 'e3_p15_yes_p16', type: 'step', source: '3_p15_calc_partakers_1b', sourceHandle: 'out-right', target: '3_p16x_divide', targetHandle: 'in-left'},
  { id: 'e3_p16x_yes_p16', type: 'straight', source: '3_p16x_divide', sourceHandle: 'out-right', target: '3_p16_merge_in_information', targetHandle: 'in-left'},

  { id: 'e3_p16_yes_finished', type: 'straight', source: '3_p16_merge_in_information', sourceHandle: 'out-right', target: '3_finished', targetHandle: 'in-left'},
  { id: 'e3_p3_yes_q6', type: 'step', source: '3_p3_add_fafh_wide', sourceHandle: 'out-bottom', target: '3_q6_number_of_meals_fafh_collected', targetHandle: 'in-top'},
  { id: 'e3_q1_no_q4', type: 'step', source: '3_q1_wide_form', sourceHandle: 'out-bottom', target: '3_q4_monetary_values_at_least_one_source', targetHandle: 'in-left', label: 'No' },
  { id: 'e3_q1_no_q4_f4_yes', type: 'step', source: '3_q1_wide_form', sourceHandle: 'out-bottom', target: '3_q4_monetary_values_at_least_one_source_f4_yes', targetHandle: 'in-left', label: 'No' },
  { id: 'e3_q1_no_q4_f4_no', type: 'step', source: '3_q1_wide_form', sourceHandle: 'out-bottom', target: '3_q4_monetary_values_at_least_one_source_f4_no', targetHandle: 'in-left', label: 'No' },

  { id: 'e3_q2_no_p1', type: 'straight', source: '3_q2_wide_continue', sourceHandle: 'out-bottom', target: '3_p1_restructure_to_long_form', targetHandle: 'in-top', label: 'No' },

// filter5
  { id: 'e3_q4_no_p4', type: 'step', source: '3_q4_monetary_values_at_least_one_source', sourceHandle: 'out-bottom', target: '3_p4_temp_file_for_imputation', targetHandle: 'in-top', dependsOn: { filter4: UNSET}, label: 'Yes' },
  { id: 'e3_q4_no_p4_f5_yes', type: 'step', source: '3_q4_monetary_values_at_least_one_source_f4_yes', sourceHandle: 'out-bottom', target: '3_p4_temp_file_for_imputation', targetHandle: 'in-top', dependsOn: { filter4: 'yes'}, strict: true },

  { id: 'e3_q6_no_q10', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom-75', target: '3_q10_visitors_no_meals_fafh', targetHandle: 'in-top-75', dependsOn: { filter3: UNSET, filter7: UNSET, filter8: UNSET}, strict: true, label: 'No' },
  { id: 'e3_q6_no_q10_f3_yes', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh', targetHandle: 'in-top', dependsOn: { filter3: 'yes', filter7: UNSET, filter8: UNSET }, strict: true, label: 'No' },
  { id: 'e3_q6_no_q10_f3_no', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh', targetHandle: 'in-top', dependsOn: { filter3: 'no', filter7: UNSET, filter8: UNSET }, strict: true, label: 'No' },
  { id: 'e3_q6_no_q10_f7_yes', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom-75', target: '3_q10_visitors_no_meals_fafh_yes', targetHandle: 'in-top-75', dependsOn: { filter3: UNSET, filter7: 'yes', filter8: UNSET }, strict: true, label: 'No' },
  { id: 'e3_q6_no_q10_f7_no', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom-75', target: '3_q10_visitors_no_meals_fafh_no', targetHandle: 'in-top-75', dependsOn: { filter3: UNSET, filter7: 'no', filter8: UNSET }, strict: true, label: 'No' },
  { id: 'e3_q6_no_q10_f3_yes_f7_yes', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh_yes', targetHandle: 'in-top', dependsOn: { filter3: 'yes', filter7: 'yes', filter8: UNSET }, strict: true, label: 'No' },
  { id: 'e3_q6_no_q10_f3_no_f7_yes', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh_yes', targetHandle: 'in-top', dependsOn: { filter3: 'no', filter7: 'yes', filter8: UNSET }, strict: true, label: 'No' },
  { id: 'e3_q6_no_q10_f3_yes_f7_no', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh_no', targetHandle: 'in-top', dependsOn: { filter3: 'yes', filter7: 'no', filter8: UNSET }, strict: true, label: 'No' },
  { id: 'e3_q6_no_q10_f3_no_f7_no', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh_no', targetHandle: 'in-top', dependsOn: { filter3: 'no', filter7: 'no', filter8: UNSET }, strict: true, label: 'No' },

  { id: 'e3_q6_no_q10', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom-75', target: '3_q10_visitors_no_meals_fafh', targetHandle: 'in-top-75', dependsOn: { filter3: UNSET, filter7: UNSET, filter8: 'no'}, strict: true },
  { id: 'e3_q6_no_q10_f3_yes', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh', targetHandle: 'in-top', dependsOn: { filter3: 'yes', filter7: UNSET, filter8: 'no' }, strict: true },
  { id: 'e3_q6_no_q10_f3_no', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh', targetHandle: 'in-top', dependsOn: { filter3: 'no', filter7: UNSET, filter8: 'no' }, strict: true },
  { id: 'e3_q6_no_q10_f7_yes', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom-75', target: '3_q10_visitors_no_meals_fafh_yes', targetHandle: 'in-top-75', dependsOn: { filter3: UNSET, filter7: 'yes', filter8: 'no' }, strict: true },
  { id: 'e3_q6_no_q10_f7_no', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom-75', target: '3_q10_visitors_no_meals_fafh_no', targetHandle: 'in-top-75', dependsOn: { filter3: UNSET, filter7: 'no', filter8: 'no' }, strict: true },
  { id: 'e3_q6_no_q10_f3_yes_f7_yes', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh_yes', targetHandle: 'in-top', dependsOn: { filter3: 'yes', filter7: 'yes', filter8: 'no' }, strict: true },
  { id: 'e3_q6_no_q10_f3_no_f7_yes', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh_yes', targetHandle: 'in-top', dependsOn: { filter3: 'no', filter7: 'yes', filter8: 'no' }, strict: true },
  { id: 'e3_q6_no_q10_f3_yes_f7_no', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh_no', targetHandle: 'in-top', dependsOn: { filter3: 'yes', filter7: 'no', filter8: 'no' }, strict: true },
  { id: 'e3_q6_no_q10_f3_no_f7_no', type: 'straight', source: '3_q6_number_of_meals_fafh_collected', sourceHandle: 'out-bottom', target: '3_q10_visitors_no_meals_fafh_no', targetHandle: 'in-top', dependsOn: { filter3: 'no', filter7: 'no', filter8: 'no' }, strict: true },

  { id: 'e3_q7_no_p16', type: 'step', source: '3_q7_visitors_yes_meals_fafh', sourceHandle: 'out-bottom', target: '3_p9_calc_partakers_4', targetHandle: 'in-left', dependsOn: { filter7: UNSET }, strict: true, label: 'No' },
  { id: 'e3_q7_no_p16_filter7_no', type: 'step', source: '3_q7_visitors_yes_meals_fafh_no', sourceHandle: 'out-bottom', target: '3_p9_calc_partakers_4', targetHandle: 'in-left', dependsOn: { filter7: 'no' }, strict: true },
  { id: 'e3_p9_no_p16x', type: 'step', source: '3_p9_calc_partakers_4', sourceHandle: 'out-right', target: '3_p16x_divide', targetHandle: 'in-top' },
  { id: 'e3_q8_no_q9', type: 'step', source: '3_q8_meals_by_visitors_yes_meals_fafh', sourceHandle: 'out-bottom', target: '3_q9_visitors_days_stayed_yes_meals_fafh', targetHandle: 'in-top', label: 'No' },
  { id: 'e3_q9_no_p11', type: 'step', source: '3_q9_visitors_days_stayed_yes_meals_fafh', sourceHandle: 'out-bottom', target: '3_p11_calc_partakers_3', targetHandle: 'in-left', label: 'No' },
  { id: 'e3_q10_no_p12', type: 'step', source: '3_q10_visitors_no_meals_fafh', sourceHandle: 'out-right', target: '3_p12_calc_partakers_1b', targetHandle: 'in-left', label: 'No' },
  { id: 'e3_q10_no_p12_f7_no', type: 'step', source: '3_q10_visitors_no_meals_fafh_no', sourceHandle: 'out-right', target: '3_p12_calc_partakers_1b', targetHandle: 'in-left', dependsOn: { filter7: 'no' }, strict: true },

  { id: 'e3_q11_no_q9', type: 'step', source: '3_q11_meals_by_visitors_no_meals_fafh', sourceHandle: 'out-bottom', target: '3_q9_visitors_days_stayed_no_meals_fafh', targetHandle: 'in-top', label: 'No' },
  { id: 'e3_q9_no_p15', type: 'step', source: '3_q9_visitors_days_stayed_no_meals_fafh', sourceHandle: 'out-bottom', target: '3_p15_calc_partakers_1b', targetHandle: 'in-left', label: 'No' },
  { id: 'e3_finished_start', type: 'step', source: '3_finished', sourceHandle: 'out-bottom', target: '4_starts', targetHandle: 'in-top'},

// ----- Step 4 edges -----
  { id: 'e4_start_yes_p1x', type: 'straight', source: '4_starts', sourceHandle: 'out-right', target: '4_p1x_fafh', targetHandle: 'in-left'},
  { id: 'e4_p1_no_p1x', type: 'step', source: '4_p1x_fafh', sourceHandle: 'out-right', target: '4_p1_clone_original_values', targetHandle: 'in-left', label: 'No'},
  { id: 'e4_p1_yes_p1x', type: 'step', source: '4_p1x_fafh', sourceHandle: 'out-bottom', target: '4_p1x_clone_original_values', targetHandle: 'in-top', label: 'Yes'},

//filter 5
  { id: 'e4_p1_yes_q1', type: 'straight', source: '4_p1_clone_original_values', sourceHandle: 'out-right', target: '4_q1_collected_value_non_purch', targetHandle: 'in-left', dependsOn: { filter5: UNSET }, strict: true},
  { id: 'e4_p1_yes_q1_f5_yes1', type: 'straight', source: '4_p1_clone_original_values', sourceHandle: 'out-right', target: '4_q1_collected_value_non_purch_filter5_yes1', targetHandle: 'in-left', dependsOn: { filter5: 'yes_reliable' }, strict: true},
  { id: 'e4_p1_yes_q1_f5_yes2', type: 'straight', source: '4_p1_clone_original_values', sourceHandle: 'out-right', target: '4_q1_collected_value_non_purch_filter5_yes2', targetHandle: 'in-left', dependsOn: { filter5: 'yes_not_reliable' }, strict: true},
  { id: 'e4_p1_yes_q1_f5_no', type: 'straight', source: '4_p1_clone_original_values', sourceHandle: 'out-right', target: '4_q1_collected_value_non_purch_filter5_no', targetHandle: 'in-left', dependsOn: { filter5: 'no' }, strict: true},

  { id: 'e4_q1_yes_q2', type: 'straight', source: '4_q1_collected_value_non_purch', sourceHandle: 'out-bottom', target: '4_q2_values_non_purch_reliable', targetHandle: 'in-top', label: 'Yes', dependsOn: { filter5: UNSET }, strict: true},
  { id: 'e4_q1_yes_q2_f5_yes1', type: 'straight', source: '4_q1_collected_value_non_purch_filter5_yes1', sourceHandle: 'out-bottom', target: '4_q2_values_non_purch_reliable_filter5_yes_reliable', targetHandle: 'in-top', dependsOn: { filter5: 'yes_reliable' }, strict: true},
  { id: 'e4_q1_yes_q2_f5_yes2', type: 'straight', source: '4_q1_collected_value_non_purch_filter5_yes2', sourceHandle: 'out-bottom', target: '4_q2_values_non_purch_reliable_filter5_yes_not_reliable', targetHandle: 'in-top', dependsOn: { filter5: 'yes_not_reliable' }, strict: true},
  
  //Filter 5
  { id: 'e4_q2_yes_p8', type: 'straight', source: '4_q2_values_non_purch_reliable', sourceHandle: 'out-bottom', target: '4_p8_use_multi_on_non_purchased', targetHandle: 'in-top', label: 'Yes', dependsOn: { filter5: UNSET }, strict: true},
  { id: 'e4_q2_yes_p8_f5_yes_reliable', type: 'straight', source: '4_q2_values_non_purch_reliable_filter5_yes_reliable', sourceHandle: 'out-bottom', target: '4_p8_use_multi_on_non_purchased', targetHandle: 'in-top', dependsOn: { filter5: 'yes_reliable' }, strict: true},


  //Filter 5
  { id: 'e4_p2_yes_p3', type: 'straight', source: '4_p2_self_reported_to_missing', sourceHandle: 'out-top', target: '4_p3_use_original_non_purchased', targetHandle: 'in-bottom', dependsOn: { filter5: UNSET }, strict: true},
  { id: 'e4_p2_yes_p3_f5_yes_not_reliable', type: 'straight', source: '4_p2_self_reported_to_missing_filter5_yes_not_reliable', sourceHandle: 'out-top', target: '4_p3_use_original_non_purchased', targetHandle: 'in-bottom', dependsOn: { filter5: 'yes_not_reliable' }, strict: true},


  { id: 'e4_p3_yes_p4', type: 'straight', source: '4_p3_use_original_non_purchased', sourceHandle: 'out-right', target: '4_p5_univariate_approach_per_partaker', targetHandle: 'in-left'},
  { id: 'e4_p5_yes_q3', type: 'straight', source: '4_p5_univariate_approach_per_partaker', sourceHandle: 'out-right', target: '4_q3_quantity_outlier', targetHandle: 'in-left'},
  { id: 'e4_q3_yes_p6', type: 'straight', source: '4_q3_quantity_outlier', sourceHandle: 'out-bottom', target: '4_p6_def_level_of_agg', targetHandle: 'in-top', label: 'Yes'},
  { id: 'e4_p6_yes_p7', type: 'straight', source: '4_p6_def_level_of_agg', sourceHandle: 'out-bottom', target: '4_p7_correct_quantity', targetHandle: 'in-top'},


  { id: 'e4_p7_yes_p6x', type: 'step', source: '4_p7_correct_quantity', sourceHandle: 'out-right', target: '4_p6x_non_purchased_aside', targetHandle: 'in-left'},

  { id: 'e4_p8_yes_q4', type: 'step', source: '4_p8_use_multi_on_non_purchased', sourceHandle: 'out-bottom', target: '4_q4_last_purchase', targetHandle: 'in-left'},
  { id: 'e4_p8_yes_q4_f4_yes', type: 'step', source: '4_p8_use_multi_on_non_purchased', sourceHandle: 'out-bottom', target: '4_q4_last_purchase_f4_yes', targetHandle: 'in-left'},
  { id: 'e4_p8_yes_q4_f4_no', type: 'step', source: '4_p8_use_multi_on_non_purchased', sourceHandle: 'out-bottom', target: '4_q4_last_purchase_f4_no', targetHandle: 'in-left'},

  { id: 'e4_q4_yes_p9', type: 'straight', source: '4_q4_last_purchase', sourceHandle: 'out-right', target: '4_p9_use_last_purchase', targetHandle: 'in-left', dependsOn: { filter4: UNSET }, strict: true, label: 'Yes'},
  { id: 'e4_q4_yes_p9_f4_yes', type: 'straight', source: '4_q4_last_purchase_f4_yes', sourceHandle: 'out-right', target: '4_p9_use_last_purchase', targetHandle: 'in-left', dependsOn: { filter4: 'yes' }, strict: true},

  { id: 'e4_p9_yes_p10', type: 'straight', source: '4_p9_use_last_purchase', sourceHandle: 'out-right', target: '4_p10_calc_unit_value', targetHandle: 'in-left'},
  { id: 'e4_p10_yes_p11', type: 'straight', source: '4_p10_calc_unit_value', sourceHandle: 'out-right', target: '4_p11_apply_univ_approach', targetHandle: 'in-left'},
  { id: 'e4_p11_yes_q5', type: 'straight', source: '4_p11_apply_univ_approach', sourceHandle: 'out-right', target: '4_q5_unit_value_outlier', targetHandle: 'in-left'},
  { id: 'e4_q5_yes_p12', type: 'straight', source: '4_q5_unit_value_outlier', sourceHandle: 'out-right', target: '4_p12_flag_obs', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_p12_yes_q6', type: 'step', source: '4_p12_flag_obs', sourceHandle: 'out-bottom', target: '4_q6_multi_approach_used', targetHandle: 'in-top'},
  { id: 'e4_q6_yes_p14', type: 'step', source: '4_q6_multi_approach_used', sourceHandle: 'out-left', target: '4_p14_apply_multi_approach', targetHandle: 'in-top', label: 'Yes'},
  { id: 'e4_p13_yes_p14', type: 'step', source: '4_q4_last_purchase_f4_no', sourceHandle: 'out-bottom', target: '4_p14_apply_multi_approach', targetHandle: 'in-top'},
  { id: 'e4_p14_yes_q7', type: 'step', source: '4_p14_apply_multi_approach', sourceHandle: 'out-bottom', target: '4_q7_quantity_outlier', targetHandle: 'in-left'},
  { id: 'e4_q7_yes_q8', type: 'step', source: '4_q7_quantity_outlier', sourceHandle: 'out-top', target: '4_q8_value_outlier_yes', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_q8_yes_q9', type: 'step', source: '4_q8_value_outlier_yes', sourceHandle: 'out-top', target: '4_q9_unit_value_outlier_yes', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_q9_yes_p15', type: 'straight', source: '4_q9_unit_value_outlier_yes', sourceHandle: 'out-right', target: '4_p15_flag both', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_p15_yes_q12', type: 'step', source: '4_p15_flag both', sourceHandle: 'out-right', target: '4_q13_rel_market_prices', targetHandle: 'in-left'},
  { id: 'e4_p16_yes_q12', type: 'step', source: '4_p16_flag_quantity', sourceHandle: 'out-right', target: '4_q13_rel_market_prices', targetHandle: 'in-left'},
  { id: 'e4_q10_yes_p17', type: 'step', source: '4_q10_value_outlier_no', sourceHandle: 'out-right', target: '4_p17_flag_value', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_q11_yes_p18', type: 'straight', source: '4_q11_unit_value_outlier_no', sourceHandle: 'out-right', target: '4_p18_flag_and_check', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_p17_yes_q12', type: 'step', source: '4_p17_flag_value', sourceHandle: 'out-right', target: '4_q13_rel_market_prices', targetHandle: 'in-left'},
  { id: 'e4_p18_yes_q12', type: 'step', source: '4_p18_flag_and_check', sourceHandle: 'out-right', target: '4_q13_rel_market_prices', targetHandle: 'in-left'},
  { id: 'e4_q13_yes_p19', type: 'straight', source: '4_q13_rel_market_prices', sourceHandle: 'out-right', target: '4_p19_market_price', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_p19_yes_p20', type: 'step', source: '4_p19_market_price', sourceHandle: 'out-bottom', target: '4_q14_both_corrected', targetHandle: 'in-top'},
  { id: 'e4_p20_yes_p21', type: 'straight', source: '4_p20_def_level_agg', sourceHandle: 'out-right', target: '4_p21_med_unit_value', targetHandle: 'in-left'},
  { id: 'e4_p21_yes_q14', type: 'step', source: '4_p21_med_unit_value', sourceHandle: 'out-right', target: '4_q14_both_corrected', targetHandle: 'in-top'},
  { id: 'e4_q14_yes_p22', type: 'straight', source: '4_q14_both_corrected', sourceHandle: 'out-right', target: '4_p22_def_lev_agg_2', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_p22_yes_p23', type: 'straight', source: '4_p22_def_lev_agg_2', sourceHandle: 'out-right', target: '4_p23_corr_quant', targetHandle: 'in-left'},
  { id: 'e4_p23_yes_p24', type: 'straight', source: '4_p23_corr_quant', sourceHandle: 'out-right', target: '4_p24_corr_mon_value', targetHandle: 'in-left'},
  { id: 'e4_p24_yes_finished', type: 'step', source: '4_p24_corr_mon_value', sourceHandle: 'out-right', target: '4_finished', targetHandle: 'in-top'},
  { id: 'e4_q15_yes_p25', type: 'straight', source: '4_q15_mon_value_corrected', sourceHandle: 'out-right', target: '4_p25_corr_mon_value_2', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_p25_yes_finished', type: 'step', source: '4_p25_corr_mon_value_2', sourceHandle: 'out-right', target: '4_finished', targetHandle: 'in-top'},
  { id: 'e4_p26_yes_finished', type: 'step', source: '4_p26_corr_quantity_2', sourceHandle: 'out-right', target: '4_finished', targetHandle: 'in-top'},
  { id: 'e4_finished_yes_starts', type: 'step', source: '4_finished', sourceHandle: 'out-bottom', target: '5_starts', targetHandle: 'in-top'},

//filter 5
  { id: 'e4_q1_no_p3', type: 'straight', source: '4_q1_collected_value_non_purch', sourceHandle: 'out-right', target: '4_p3_use_original_non_purchased', targetHandle: 'in-left', label: 'No', dependsOn: { filter5: UNSET }, strict: true },
  { id: 'e4_q1_no_p3_filter5_no', type: 'straight', source: '4_q1_collected_value_non_purch_filter5_no', sourceHandle: 'out-right', target: '4_p3_use_original_non_purchased', targetHandle: 'in-left', dependsOn: { filter5: 'no' }, strict: true},

  { id: 'e4_q2_no_p2', type: 'straight', source: '4_q2_values_non_purch_reliable', sourceHandle: 'out-right', target: '4_p2_self_reported_to_missing', targetHandle: 'in-left', label: 'No', dependsOn: { filter5: UNSET }, strict: true },
  { id: 'e4_q2_no_p2_f5_yes_no_reliable', type: 'straight', source: '4_q2_values_non_purch_reliable_filter5_yes_not_reliable', sourceHandle: 'out-right', target: '4_p2_self_reported_to_missing_filter5_yes_not_reliable', targetHandle: 'in-left', dependsOn: { filter5: 'yes_not_reliable' }, strict: true },

  { id: 'e4_q3_no_p6x', type: 'step', source: '4_q3_quantity_outlier', sourceHandle: 'out-right', target: '4_p6x_non_purchased_aside', targetHandle: 'in-top', label: 'No' },
  
  { id: 'e4_q3_no_q4', type: 'step', source: '4_p6x_non_purchased_aside', sourceHandle: 'out-bottom', target: '4_q4_last_purchase', targetHandle: 'in-top' },
  { id: 'e4_q3_no_q4_f4_yes', type: 'step', source: '4_p6x_non_purchased_aside', sourceHandle: 'out-bottom', target: '4_q4_last_purchase_f4_yes', targetHandle: 'in-top' },
  { id: 'e4_q3_no_q4_f4_no', type: 'step', source: '4_p6x_non_purchased_aside', sourceHandle: 'out-bottom', target: '4_q4_last_purchase_f4_no', targetHandle: 'in-top' },


  { id: 'e4_q4_no_p13', type: 'step', source: '4_q4_last_purchase', sourceHandle: 'out-bottom', target: '4_p14_apply_multi_approach', targetHandle: 'in-top', dependsOn: { filter4: UNSET }, strict: true, label: 'No' },
  { id: 'e4_q4_no_p13_f4_no', type: 'step', source: '4_q4_last_purchase_f4_no', sourceHandle: 'out-bottom', target: '4_p14_apply_multi_approach', targetHandle: 'in-top', dependsOn: { filter4: 'no' }, strict: true },


  { id: 'e4_q5_no_q6', type: 'straight', source: '4_q5_unit_value_outlier', sourceHandle: 'out-bottom', target: '4_q6_multi_approach_used', targetHandle: 'in-top', label: 'No' },
  { id: 'e4_q6_no_finished', type: 'step', source: '4_q6_multi_approach_used', sourceHandle: 'out-right', target: '4_finished', targetHandle: 'in-top', label: 'No' },
  { id: 'e4_q7_no_q10', type: 'step', source: '4_q7_quantity_outlier', sourceHandle: 'out-bottom', target: '4_q10_value_outlier_no', targetHandle: 'in-left', label: 'No' },
  { id: 'e4_q8_no_p16', type: 'straight', source: '4_q8_value_outlier_yes', sourceHandle: 'out-right', target: '4_p16_flag_quantity', targetHandle: 'in-left', label: 'No' },
  { id: 'e4_q9_no_finished', type: 'step', source: '4_q9_unit_value_outlier_yes', sourceHandle: 'out-top', target: '4_finished', targetHandle: 'in-top', label: 'No' },
  { id: 'e4_q10_no_q11', type: 'step', source: '4_q10_value_outlier_no', sourceHandle: 'out-bottom', target: '4_q11_unit_value_outlier_no', targetHandle: 'in-left', label: 'No' },
  { id: 'e4_q11_no_finished', type: 'step', source: '4_q11_unit_value_outlier_no', sourceHandle: 'out-bottom', target: '4_finished', targetHandle: 'in-top', label: 'No' },
  { id: 'e4_q13_no_p20', type: 'straight', source: '4_q13_rel_market_prices', sourceHandle: 'out-bottom', target: '4_p20_def_level_agg', targetHandle: 'in-top', label: 'No' },
  { id: 'e4_q14_no_q15', type: 'straight', source: '4_q14_both_corrected', sourceHandle: 'out-bottom', target: '4_q15_mon_value_corrected', targetHandle: 'in-top', label: 'No' },
  { id: 'e4_q15_no_p26', type: 'step', source: '4_q15_mon_value_corrected', sourceHandle: 'out-bottom', target: '4_p26_corr_quantity_2', targetHandle: 'in-left', label: 'No' },

// New module FAFH  
  { id: 'e4_p1x_yes_q2x', type: 'straight', source: '4_p1x_clone_original_values', sourceHandle: 'out-right', target: '4_q2x_fafh_individual', targetHandle: 'in-left'},
  { id: 'e4_p1x_yes_q2x_yes', type: 'straight', source: '4_p1x_clone_original_values', sourceHandle: 'out-right', target: '4_q2x_fafh_individual_yes', targetHandle: 'in-left'},
  { id: 'e4_p1x_yes_q2x_no', type: 'straight', source: '4_p1x_clone_original_values', sourceHandle: 'out-right', target: '4_q2x_fafh_individual_no', targetHandle: 'in-left'},

  { id: 'e4_q2x_yes_q3x', type: 'straight', source: '4_q2x_fafh_individual', sourceHandle: 'out-right', target: '4_q3x_fafh_quantities_collected', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_q2x_yes_q3x_yes', type: 'straight', source: '4_q2x_fafh_individual_yes', sourceHandle: 'out-right', target: '4_q3x_fafh_quantities_collected', targetHandle: 'in-left'}, //filter

  { id: 'e4_q3x_yes_p2x', type: 'straight', source: '4_q3x_fafh_quantities_collected', sourceHandle: 'out-right', target: '4_p2x_multi', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_p2x_finish', type: 'step', source: '4_p2x_multi', sourceHandle: 'out-right', target: '4_finished', targetHandle: 'in-left'},
  { id: 'e4_q3x_no_p3x', type: 'step', source: '4_q3x_fafh_quantities_collected', sourceHandle: 'out-bottom', target: '4_p3x_outlier', targetHandle: 'in-left', label: 'No'},
  { id: 'e4_p3x_finish', type: 'step', source: '4_p3x_outlier', sourceHandle: 'out-right', target: '4_finished', targetHandle: 'in-left'},

  { id: 'e4_q2x_no_q3x', type: 'step', source: '4_q2x_fafh_individual', sourceHandle: 'out-bottom', target: '4_q4x_fafh_quantities_collected_2', targetHandle: 'in-left', label: 'No'},
  { id: 'e4_q2x_no_q3x_no', type: 'step', source: '4_q2x_fafh_individual_no', sourceHandle: 'out-bottom', target: '4_q4x_fafh_quantities_collected_2', targetHandle: 'in-left'}, //filter

  { id: 'e4_q3x_yes_p4x', type: 'straight', source: '4_q4x_fafh_quantities_collected_2', sourceHandle: 'out-right', target: '4_p4x_divide_household', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e4_p4x_yes_p5x', type: 'straight', source: '4_p4x_divide_household', sourceHandle: 'out-right', target: '4_p5x_multi', targetHandle: 'in-left'},
  { id: 'e4_p5x_finish', type: 'step', source: '4_p5x_multi', sourceHandle: 'out-right', target: '4_finished', targetHandle: 'in-left'},

  { id: 'e4_q4x_no_p6x', type: 'step', source: '4_q4x_fafh_quantities_collected_2', sourceHandle: 'out-bottom', target: '4_p6x_divide_household', targetHandle: 'in-left', label: 'No'},
  { id: 'e4_p6x_no_p7x', type: 'straight', source: '4_p6x_divide_household', sourceHandle: 'out-right', target: '4_p7x_outlier', targetHandle: 'in-left'},
  { id: 'e4_p7x_finish', type: 'step', source: '4_p7x_outlier', sourceHandle: 'out-right', target: '4_finished', targetHandle: 'in-left'},

  // ----- Step 5 edges -----
  { id: 'e5_starts_yes_q1', type: 'straight', source: '5_starts', sourceHandle: 'out-right', target: '5_q1_mon_value_all', targetHandle: 'in-left'},
  { id: 'e5_q1_yes_finished', type: 'step', source: '5_q1_mon_value_all', sourceHandle: 'out-bottom', target: '5_finished', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e5_starts_yes_q1_1', type: 'straight', source: '5_starts', sourceHandle: 'out-right', target: '5_q1_mon_value_all_1', targetHandle: 'in-left'},
  { id: 'e5_q1_yes_finished_1', type: 'step', source: '5_q1_mon_value_all_1', sourceHandle: 'out-bottom', target: '5_finished', targetHandle: 'in-left'},

  { id: 'e5_starts_yes_q1_2', type: 'straight', source: '5_starts', sourceHandle: 'out-right', target: '5_q1_mon_value_all_2', targetHandle: 'in-left'},
  { id: 'e5_q1_no_q2_1', type: 'straight', source: '5_q1_mon_value_all_2', sourceHandle: 'out-right', target: '5_q2_househ_unit_value_miss', targetHandle: 'in-left' },

  { id: 'e5_q2_yes_q3', type: 'straight', source: '5_q2_househ_unit_value_miss', sourceHandle: 'out-right', target: '5_q3_unit_measurement_same', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e5_q3_yes_p1', type: 'straight', source: '5_q3_unit_measurement_same', sourceHandle: 'out-right', target: '5_p1_imp_mon_value_household_unit_value', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e5_p1_yes_p2', type: 'straight', source: '5_p1_imp_mon_value_household_unit_value', sourceHandle: 'out-right', target: '5_p2_lcu', targetHandle: 'in-left'},
  { id: 'e5_p2_yes_finished', type: 'step', source: '5_p2_lcu', sourceHandle: 'out-right', target: '5_finished', targetHandle: 'in-top'},
  { id: 'e5_q4_yes_p3', type: 'straight', source: '5_q4_weight_in_gram_available', sourceHandle: 'out-right', target: '5_p3_convert_lcu', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e5_p3_yes_p4', type: 'straight', source: '5_p3_convert_lcu', sourceHandle: 'out-right', target: '5_p4_unit_value_of_purch', targetHandle: 'in-left'},
  { id: 'e5_p4_yes_p5', type: 'straight', source: '5_p4_unit_value_of_purch', sourceHandle: 'out-right', target: '5_p5_divide_unit_value', targetHandle: 'in-left'},
  { id: 'e5_p5_yes_p6', type: 'straight', source: '5_p5_divide_unit_value', sourceHandle: 'out-right', target: '5_p6_lcu_2', targetHandle: 'in-left'},
  { id: 'e5_p6_yes_finished', type: 'step', source: '5_p3_convert_lcu', sourceHandle: 'out-right', target: '5_finished', targetHandle: 'in-top'},
  { id: 'e5_p8_yes_p8', type: 'step', source: '5_q2_househ_unit_value_miss', sourceHandle: 'out-bottom', target: '5_p8_best_source', targetHandle: 'in-top', label: 'No'},
  { id: 'e5_p9_yes_finished', type: 'step', source: '5_p9_market_survey', sourceHandle: 'out-right', target: '5_p7_lcu_3', targetHandle: 'in-top'},
  { id: 'e5_p10_yes_finished', type: 'straight', source: '5_p10_agg_unit_values', sourceHandle: 'out-right', target: '5_p7_lcu_3', targetHandle: 'in-left'},
  { id: 'e5_p11_yes_finished', type: 'step', source: '5_p11_other', sourceHandle: 'out-right', target: '5_p7_lcu_3', targetHandle: 'in-bottom'},
  { id: 'e5_p7_finished', type: 'step', source: '5_p7_lcu_3', sourceHandle: 'out-right', target: '5_finished', targetHandle: 'in-top'},

  { id: 'e5_finished_yes_ep_6_starts', type: 'step', source: '5_finished', sourceHandle: 'out-bottom', target: 'Step 6 starts', targetHandle: 'in-top'},
  { id: 'e5_q1_no_q2', type: 'straight', source: '5_q1_mon_value_all', sourceHandle: 'out-right', target: '5_q2_househ_unit_value_miss', targetHandle: 'in-left', label: 'No' },
  { id: 'e5_q3_no_q4', type: 'straight', source: '5_q3_unit_measurement_same', sourceHandle: 'out-bottom', target: '5_q4_weight_in_gram_available', targetHandle: 'in-top', label: 'No' },
  { id: 'e5_q4_no_p8', type: 'step', source: '5_q4_weight_in_gram_available', sourceHandle: 'out-left', target: '5_p8_best_source', targetHandle: 'in-top-75', label: 'No' },
  { id: 'e5_p8_no_p9', type: 'step', source: '5_p8_best_source', sourceHandle: 'out-right', target: '5_p9_market_survey', targetHandle: 'in-left' },
  { id: 'e5_p8_no_p10', type: 'step', source: '5_p8_best_source', sourceHandle: 'out-right', target: '5_p10_agg_unit_values', targetHandle: 'in-left' },
  { id: 'e5_p8_no_p11', type: 'step', source: '5_p8_best_source', sourceHandle: 'out-right', target: '5_p11_other', targetHandle: 'in-left' },
  { id: 'e5_p8_no_p12', type: 'step', source: '5_p8_best_source', sourceHandle: 'out-right', target: '5_p12_no_prices', targetHandle: 'in-left' },
  { id: 'e5_p12_finished', type: 'step', source: '5_p12_no_prices', sourceHandle: 'out-right', target: '5_finished', targetHandle: 'in-top'},


  { id: 'e5_finished_starts', type: 'step', source: '5_finished', sourceHandle: 'out-bottom', target: '6_starts', targetHandle: 'in-top'},

  // ----- Step 6 edges -----
  { id: 'e6_starts_yes_q1', type: 'straight', source: '6_starts', sourceHandle: 'out-right', target: '6_q1_well_described', targetHandle: 'in-left'},

//filter 6 yes 
  { id: 'e6_q1_yes_q2', type: 'straight', source: '6_q1_well_described', sourceHandle: 'out-right', target: '6_q2_standard_unit', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e6_q1_yes_q2_f6_yes', type: 'straight', source: '6_q1_well_described', sourceHandle: 'out-right', target: '6_q2_standard_unit_filter6_yes', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e6_q1_no_q2', type: 'straight', source: '6_q1_well_described', sourceHandle: 'out-bottom', target: '6_q9_rep_standard_unit', targetHandle: 'in-top', label: 'No'},
  { id: 'e6_q1_no_q2_f6_yes', type: 'straight', source: '6_q1_well_described', sourceHandle: 'out-bottom', target: '6_q9_rep_standard_unit_filter6_yes', targetHandle: 'in-top', label: 'No'},
  { id: 'e6_q2_yes_q3', type: 'straight', source: '6_q2_standard_unit', sourceHandle: 'out-right', target: '6_q3_volumetric', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e6_q2_yes_q3_yes', type: 'straight', source: '6_q2_standard_unit_filter6_yes', sourceHandle: 'out-right', target: '6_q3_volumetric', targetHandle: 'in-left'},
  { id: 'e6_q9_yes_p12', type: 'straight', source: '6_q9_rep_standard_unit', sourceHandle: 'out-bottom', target: '6_p12_conv_to_grams', targetHandle: 'in-top', label: 'Yes'},
  { id: 'e6_q9_yes_p12_yes', type: 'straight', source: '6_q9_rep_standard_unit_filter6_yes', sourceHandle: 'out-bottom', target: '6_p12_conv_to_grams', targetHandle: 'in-top'},

  { id: 'e6_q3_yes_p1', type: 'straight', source: '6_q3_volumetric', sourceHandle: 'out-right', target: '6_p1_density_factor', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e6_p1_yes_p2', type: 'straight', source: '6_p1_density_factor', sourceHandle: 'out-right', target: '6_p2_calc_quant_in_grams', targetHandle: 'in-left'},
  { id: 'e6_p2_yes_p4', type: 'step', source: '6_p2_calc_quant_in_grams', sourceHandle: 'out-right', target: '6_p4_calc_price', targetHandle: 'in-top'},
  { id: 'e6_p3_yes_p2x', type: 'step', source: '6_p3_convert_grams_standard_unit', sourceHandle: 'out-right', target: '6_p2_calc_quant_in_grams_per_partaker', targetHandle: 'in-left'},
  { id: 'e6_p2x_yes_p4', type: 'step', source: '6_p2_calc_quant_in_grams_per_partaker', sourceHandle: 'out-right', target: '6_p4_calc_price', targetHandle: 'in-top'},

  { id: 'e6_p4_yes_finished', type: 'step', source: '6_p4_calc_price', sourceHandle: 'out-bottom', target: '6_finished', targetHandle: 'in-top'},
  { id: 'e6_q4_yes_p5', type: 'straight', source: '6_q4_source', sourceHandle: 'out-right', target: '6_p5_convert_grams_standard_unit_2', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e6_p5_yes_p6', type: 'straight', source: '6_p5_convert_grams_standard_unit_2', sourceHandle: 'out-right', target: '6_p6_calc_quant_in_grams', targetHandle: 'in-left'},
  { id: 'e6_p6_yes_p4', type: 'step', source: '6_p6_calc_quant_in_grams', sourceHandle: 'out-right', target: '6_q5x_flagged_step_5', targetHandle: 'in-left'},
  { id: 'e6_p6_no_p4x', type: 'step', source: '6_q5x_flagged_step_5', sourceHandle: 'out-right', target: '6_p4_calc_price', targetHandle: 'in-left', label: 'No'},
  { id: 'e6_p6_yes_p4x', type: 'step', source: '6_q5x_flagged_step_5', sourceHandle: 'out-bottom', target: '6_estimate_monetary_value', targetHandle: 'in-top', label: 'Yes'},
  { id: 'e6_p4x_no_p4', type: 'step', source: '6_estimate_monetary_value', sourceHandle: 'out-right', target: '6_finished', targetHandle: 'in-top'},
  
  { id: 'e6_q5_yes_q6', type: 'straight', source: '6_q5_market_survey', sourceHandle: 'out-right', target: '6_q6_mon_value_available', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e6_q6_yes_p7', type: 'straight', source: '6_q6_mon_value_available', sourceHandle: 'out-right', target: '6_p7_calc_price_2', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e6_p7_yes_p8', type: 'straight', source: '6_p7_calc_price_2', sourceHandle: 'out-right', target: '6_p8_conv_value_div_price', targetHandle: 'in-left'},
  { id: 'e6_p8_yes_p9', type: 'straight', source: '6_p8_conv_value_div_price', sourceHandle: 'out-right', target: '6_p9_calc_quant_in_grams_2', targetHandle: 'in-left'},
  { id: 'e6_p9_yes_finished', type: 'step', source: '6_p9_calc_quant_in_grams_2', sourceHandle: 'out-right', target: '6_finished', targetHandle: 'in-top'},
  { id: 'e6_p10_yes_p8', type: 'straight', source: '6_p10_calc_price_3', sourceHandle: 'out-top', target: '6_p8_conv_value_div_price', targetHandle: 'in-bottom'},
  { id: 'e6_q7_yes_q8', type: 'straight', source: '6_q7_estimated', sourceHandle: 'out-right', target: '6_q8_mon_value_rep_quant', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e6_q8_yes_p11', type: 'straight', source: '6_q8_mon_value_rep_quant', sourceHandle: 'out-right', target: '6_p11_def_lev_agg', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e6_p11_yes_p10', type: 'straight', source: '6_p11_def_lev_agg', sourceHandle: 'out-right', target: '6_p10_calc_price_3', targetHandle: 'in-left'},
  { id: 'e6_p12_yes_finished', type: 'straight', source: '6_p12_conv_to_grams', sourceHandle: 'out-right', target: '6_finished', targetHandle: 'in-left'},
  { id: 'e6_q10_yes_p14', type: 'straight', source: '6_q10_same_food_group', sourceHandle: 'out-right', target: '6_p14_def_lev_agg', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e6_p13_yes_finished', type: 'step', source: '6_p13_later', sourceHandle: 'out-bottom', target: '6_finished', targetHandle: 'in-left'},
  { id: 'e6_p14_yes_p15', type: 'straight', source: '6_p14_def_lev_agg', sourceHandle: 'out-right', target: '6_p15_calc_price', targetHandle: 'in-left'},
  { id: 'e6_p15_yes_p16', type: 'straight', source: '6_p15_calc_price', sourceHandle: 'out-right', target: '6_p16_conv_grams', targetHandle: 'in-left'},
  { id: 'e6_p16_yes_p17', type: 'straight', source: '6_p16_conv_grams', sourceHandle: 'out-right', target: '6_p17_calc_quant', targetHandle: 'in-left'},
  { id: 'e6_p17_yes_finished', type: 'step', source: '6_p17_calc_quant', sourceHandle: 'out-right', target: '6_finished', targetHandle: 'in-top'},

  { id: 'e6_q2_no_q4', type: 'straight', source: '6_q2_standard_unit', sourceHandle: 'out-bottom', target: '6_q4_source', targetHandle: 'in-top', label: 'No' },
  { id: 'e6_q3_no_p3', type: 'step', source: '6_q3_volumetric', sourceHandle: 'out-bottom', target: '6_p3_convert_grams_standard_unit', targetHandle: 'in-left', label: 'No' },
  { id: 'e6_q4_no_q5', type: 'straight', source: '6_q4_source', sourceHandle: 'out-bottom', target: '6_q5_market_survey', targetHandle: 'in-top', label: 'No' },
  { id: 'e6_q5_no_q7', type: 'straight', source: '6_q5_market_survey', sourceHandle: 'out-bottom', target: '6_q7_estimated', targetHandle: 'in-top', label: 'No' },
  { id: 'e6_q6_no_val', type: 'straight', source: '6_q6_mon_value_available', sourceHandle: 'out-bottom', target: '6_val_flag', targetHandle: 'in-top', label: 'No' },
  { id: 'e6_q7_no_val', type: 'step', source: '6_q7_estimated', sourceHandle: 'out-top-75', target: '6_val_flag', targetHandle: 'in-left', label: 'No' },
  { id: 'e6_q8_no_val', type: 'straight', source: '6_q8_mon_value_rep_quant', sourceHandle: 'out-top', target: '6_val_flag', targetHandle: 'in-bottom', label: 'No' },
  { id: 'e6_q9_no_q10', type: 'straight', source: '6_q9_rep_standard_unit', sourceHandle: 'out-right', target: '6_q10_same_food_group', targetHandle: 'in-left', label: 'No' },
  { id: 'e6_q10_no_p13', type: 'straight', source: '6_q10_same_food_group', sourceHandle: 'out-bottom', target: '6_p13_later', targetHandle: 'in-top', label: 'No' },
  { id: 'e6_finished_start', type: 'step', source: '6_finished', sourceHandle: 'out-bottom', target: '7_starts', targetHandle: 'in-top' },

  // ----- Step 7 edges -----
  { id: 'e7_starts_yes_q1', type: 'straight', source: '7_starts', sourceHandle: 'out-right', target: '7_q1_syst_missing', targetHandle: 'in-left'},
  { id: 'e7_q1_yes_q2', type: 'straight', source: '7_q1_syst_missing', sourceHandle: 'out-bottom', target: '7_q2_mon_values', targetHandle: 'in-top', label: 'Yes'},
  { id: 'e7_q2_yes_p1', type: 'straight', source: '7_q2_mon_values', sourceHandle: 'out-right', target: '7_p2_detect_outlier_mon_value', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e7_p1_yes_p2', type: 'straight', source: '7_p2_detect_outlier_mon_value', sourceHandle: 'out-right', target: '7_p2_detect_outlier_mon_value', targetHandle: 'in-left'},
  { id: 'e7_p2_yes_q3', type: 'straight', source: '7_p2_detect_outlier_mon_value', sourceHandle: 'out-right', target: '7_q3_mon_value_outlier', targetHandle: 'in-left'},
  { id: 'e7_q3_yes_p3', type: 'straight', source: '7_q3_mon_value_outlier', sourceHandle: 'out-right', target: '7_p3_def_lev_agg', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e7_p3_yes_p4', type: 'straight', source: '7_p3_def_lev_agg', sourceHandle: 'out-right', target: '7_p4_calc_corr_mon_val', targetHandle: 'in-left'},
  { id: 'e7_p4_yes_finished', type: 'step', source: '7_p4_calc_corr_mon_val', sourceHandle: 'out-right', target: '7_finished', targetHandle: 'in-top'},
  { id: 'e7_p5_yes_finished', type: 'step', source: '7_p5_drop', sourceHandle: 'out-right', target: '7_finished', targetHandle: 'in-left'},
  { id: 'e7_p6_yes_q4', type: 'straight', source: '7_p6_det_outlier_quant', sourceHandle: 'out-right', target: '7_q4_quant_outlier', targetHandle: 'in-left'},
  { id: 'e7_q4_yes_q5', type: 'straight', source: '7_q4_quant_outlier', sourceHandle: 'out-right', target: '7_q5_coll_mon_value_cons', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e7_q5_yes_p7', type: 'straight', source: '7_q5_coll_mon_value_cons', sourceHandle: 'out-right', target: '7_p7_det_outlier_mon_value_2', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e7_p7_yes_q6', type: 'straight', source: '7_p7_det_outlier_mon_value_2', sourceHandle: 'out-right', target: '7_q6_mon_value_outlier_2', targetHandle: 'in-left'},
  { id: 'e7_q6_yes_p9', type: 'step', source: '7_q6_mon_value_outlier_2', sourceHandle: 'out-bottom', target: '7_p9_def_lev_agg_2', targetHandle: 'in-top-75', label: 'Yes'},
  { id: 'e7_p8_yes_finished', type: 'step', source: '7_p8_calc_corr_quant', sourceHandle: 'out-right', target: '7_finished', targetHandle: 'in-top'},
  { id: 'e7_p9_yes_p10', type: 'straight', source: '7_p9_def_lev_agg_2', sourceHandle: 'out-right', target: '7_p10_calc_corr_quant_2', targetHandle: 'in-left'},
  { id: 'e7_p10_yes_p11', type: 'straight', source: '7_p10_calc_corr_quant_2', sourceHandle: 'out-right', target: '7_p11_calc_corr_mon_value_3', targetHandle: 'in-left'},
  { id: 'e7_p11_yes_finished', type: 'step', source: '7_p11_calc_corr_mon_value_3', sourceHandle: 'out-right', target: '7_finished', targetHandle: 'in-top'},
  { id: 'e7_q7_yes_p12', type: 'straight', source: '7_q7_coll_mon_value_cons_2', sourceHandle: 'out-right', target: '7_p12_det_outlier_mon_value_3', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e7_p12_yes_p12', type: 'straight', source: '7_p12_det_outlier_mon_value_3', sourceHandle: 'out-right', target: '7_q8_mon_val_outlier_3', targetHandle: 'in-left'},
  { id: 'e7_q8_yes_p13', type: 'straight', source: '7_q8_mon_val_outlier_3', sourceHandle: 'out-right', target: '7_p13_calc_corr_mon_value_4', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e7_p13_yes_finished', type: 'step', source: '7_p13_calc_corr_mon_value_4', sourceHandle: 'out-right', target: '7_finished', targetHandle: 'in-top'},
  { id: 'e7_finished_yes_starts', type: 'step', source: '7_finished', sourceHandle: 'out-bottom', target: '8_starts', targetHandle: 'in-top'},

  { id: 'e7_q1_no_p6', type: 'straight', source: '7_q1_syst_missing', sourceHandle: 'out-right', target: '7_p6_det_outlier_quant', targetHandle: 'in-left', label: 'No' },
  { id: 'e7_q2_no_p5', type: 'step', source: '7_q2_mon_values', sourceHandle: 'out-bottom', target: '7_p5_drop', targetHandle: 'in-left', label: 'No' },
  { id: 'e7_q3_no_finished', type: 'step', source: '7_q3_mon_value_outlier', sourceHandle: 'out-bottom', target: '7_finished', targetHandle: 'in-top', label: 'No' },
  { id: 'e7_q4_no_q7', type: 'step', source: '7_q4_quant_outlier', sourceHandle: 'out-bottom', target: '7_p12_det_outlier_mon_value_3', targetHandle: 'in-left', label: 'No' },
  { id: 'e7_q5_no_p9', type: 'straight', source: '7_q5_coll_mon_value_cons', sourceHandle: 'out-bottom', target: '7_p9_def_lev_agg_2', targetHandle: 'in-top', label: 'No' },
  { id: 'e7_q6_no_p8', type: 'straight', source: '7_q6_mon_value_outlier_2', sourceHandle: 'out-right', target: '7_p8_calc_corr_quant', targetHandle: 'in-left', label: 'No' },
  { id: 'e7_q7_no_finished', type: 'step', source: '7_q7_coll_mon_value_cons_2', sourceHandle: 'out-bottom', target: '7_finished', targetHandle: 'in-top', label: 'No' },
  { id: 'e7_q8_no_finished', type: 'step', source: '7_q8_mon_val_outlier_3', sourceHandle: 'out-top', target: '7_finished', targetHandle: 'in-top', label: 'No' },

  // ----- Step 8 edges -----
  { id: 'e8_starts_yes_p1', type: 'straight', source: '8_starts', sourceHandle: 'out-right', target: '8_p1_calc_quant', targetHandle: 'in-left'},
  { id: 'e8_p1_yes_p2', type: 'step', source: '8_p1_calc_quant', sourceHandle: 'out-right', target: '8_p2_calc_mon_value', targetHandle: 'in-left'},
  { id: 'e8_p2_yes_p3', type: 'straight', source: '8_p2_calc_mon_value', sourceHandle: 'out-right', target: '8_p3_merge_nct', targetHandle: 'in-left'},
  { id: 'e8_p3_yes_q1', type: 'straight', source: '8_p3_merge_nct', sourceHandle: 'out-right', target: '8_q1_errors', targetHandle: 'in-left'},
  { id: 'e8_p4_yes_p3', type: 'step', source: '8_p4_corr_nct', sourceHandle: 'out-left', target: '8_p3_merge_nct', targetHandle: 'in-top'},
  { id: 'e8_q1_yes_p4', type: 'step', source: '8_q1_errors', sourceHandle: 'out-top', target: '8_p4_corr_nct', targetHandle: 'in-bottom', label: 'Yes'},
  { id: 'e8_p5_yes_p6', type: 'step', source: '8_p5_calc_ed_quant', sourceHandle: 'out-bottom', target: '8_p6_calc_cal', targetHandle: 'in-top'},
  { id: 'e8_p6_yes_p7', type: 'step', source: '8_p6_calc_cal', sourceHandle: 'out-bottom', target: '8_p7_calc_macro', targetHandle: 'in-top'},
  { id: 'e8_p7_yes_finished', type: 'step', source: '8_p7_calc_macro', sourceHandle: 'out-right', target: '8_finished', targetHandle: 'in-left'},
  { id: 'e8_finished_yes_starts', type: 'step', source: '8_finished', sourceHandle: 'out-bottom', target: '9_starts', targetHandle: 'in-top'},
  { id: 'e8_q1_no_p5', type: 'step', source: '8_q1_errors', sourceHandle: 'out-right', target: '8_p5_calc_ed_quant', targetHandle: 'in-top', label: 'No' },

  // ----- Step 9 edges -----
  { id: 'e9_starts_yes_calories', type: 'straight', source: '9_starts', sourceHandle: 'out-right', target: '9_calories_missing', targetHandle: 'in-left'},
  { id: 'e9_calories_yes_free', type: 'straight', source: '9_calories_missing', sourceHandle: 'out-bottom', target: '9_free_food', targetHandle: 'in-top', label: 'Yes'},
  { id: 'e9_free_yes_calculate', type: 'straight', source: '9_free_food', sourceHandle: 'out-right', target: '9_calculate_calories', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e9_calculate_yes_finished', type: 'step', source: '9_calculate_calories', sourceHandle: 'out-right', target: '9_calories_from_school_meals', targetHandle: 'in-left'},
  { id: 'e9_calories_finished', type: 'step', source: '9_calories_from_school_meals', sourceHandle: 'out-right', target: '9_finished', targetHandle: 'in-top'},
  
  { id: 'e9_specific_yes_unspecified', type: 'straight', source: '9_specific_food_group', sourceHandle: 'out-right', target: '9_unspecified_food', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e9_unspecified_yes_calculate', type: 'straight', source: '9_unspecified_food', sourceHandle: 'out-right', target: '9_calculate_household_dietary_energy_1', targetHandle: 'in-left'},
  { id: 'e9_median_yes_impute', type: 'straight', source: '9_median_dietary_energy_unit_cost_food_group', sourceHandle: 'out-right', target: '9_impute_missing_1', targetHandle: 'in-left'},
  { id: 'e9_level_yes_median', type: 'straight', source: '9_level_of_disaggregation_1', sourceHandle: 'out-right', target: '9_median_dietary_energy_unit_cost_food_group', targetHandle: 'in-left'},
  { id: 'e9_level2_yes_median', type: 'straight', source: '9_level_of_disaggregation_2', sourceHandle: 'out-right', target: '9_median_dietary_energy_unit_cost', targetHandle: 'in-left'},
  { id: 'e9_median2_yes_impute', type: 'straight', source: '9_median_dietary_energy_unit_cost', sourceHandle: 'out-right', target: '9_impute_missing_2', targetHandle: 'in-left'},
  { id: 'e9_calculate_yes_level', type: 'straight', source: '9_calculate_household_dietary_energy_1', sourceHandle: 'out-right', target: '9_level_of_disaggregation_1', targetHandle: 'in-left'},
  { id: 'e9_impute_yes_calculate', type: 'straight', source: '9_specific_food_group', sourceHandle: 'out-bottom', target: '9_calculate_household_dietary_energy_2', targetHandle: 'in-top', label: 'No'},
  { id: 'e9_calculate2_yes_level', type: 'straight', source: '9_calculate_household_dietary_energy_2', sourceHandle: 'out-right', target: '9_level_of_disaggregation_2', targetHandle: 'in-left'},
  { id: 'e9_impute_yes_finished', type: 'step', source: '9_impute_missing_2', sourceHandle: 'out-right', target: '9_finished', targetHandle: 'in-left'},
  { id: 'e9_finished_yes_', type: 'step', source: '9_finished', sourceHandle: 'out-bottom', target: '10_starts', targetHandle: 'in-top'},

  { id: 'e9_calories_no_finished', type: 'step', source: '9_calories_missing', sourceHandle: 'out-right', target: '9_finished', targetHandle: 'in-top', label: 'No' },
  { id: 'e9_free_no_specific', type: 'straight', source: '9_free_food', sourceHandle: 'out-bottom', target: '9_specific_food_group', targetHandle: 'in-top', label: 'No' },
  { id: 'e9_specific_finished', type: 'step', source: '9_specific_food_group', sourceHandle: 'out-right', target: '9_finished', targetHandle: 'in-top' },

  // ----- Step 10 edges -----
  { id: 'e10_starts_hhsize', type: 'straight', source: '10_starts', sourceHandle: 'out-right', target: '10_hhsize_eq_partakers', targetHandle: 'in-left'},
  { id: 'e10_hhsize_yes_per_cap', type: 'straight', source: '10_hhsize_eq_partakers', sourceHandle: 'out-right', target: '10_per_capita_var', targetHandle: 'in-left', label: 'Yes'},
  { id: 'e10_hhsize_no_fafh', type: 'straight', source: '10_hhsize_eq_partakers', sourceHandle: 'out-bottom', target: '10_obs_fafh', targetHandle: 'in-top', label: 'No'},
  { id: 'e10_per_cap_1', type: 'step', source: '10_per_capita_var', sourceHandle: 'out-right', target: '10_per_capita_and_ame_1', targetHandle: 'in-left'},
  { id: 'e10_per_cap_2', type: 'step', source: '10_per_capita_var', sourceHandle: 'out-right', target: '10_mon_per_cap', targetHandle: 'in-left'},
  { id: 'e10_cal_pc_conv', type: 'step', source: '10_per_capita_and_ame_1', sourceHandle: 'out-right', target: '10_convert', targetHandle: 'in-top'},
  { id: 'e10_mon_conv', type: 'step', source: '10_mon_per_cap', sourceHandle: 'out-right', target: '10_convert', targetHandle: 'in-top'},
  { id: 'e10_fafh_new', type: 'straight', source: '10_obs_fafh', sourceHandle: 'out-right', target: '10_create_new_var', targetHandle: 'in-left', label: 'No'},
  { id: 'e10_fafh_exp', type: 'step', source: '10_obs_fafh', sourceHandle: 'out-bottom', target: '10_expenditure_yes', targetHandle: 'in-top', label: 'Yes'},
  { id: 'e10_newvar_exp', type: 'straight', source: '10_create_new_var', sourceHandle: 'out-right', target: '10_calc_exp', targetHandle: 'in-left'},
  { id: 'e10_exp_percap', type: 'straight', source: '10_calc_exp', sourceHandle: 'out-right', target: '10_create_pc', targetHandle: 'in-left'},
  { id: 'e10_percap_cal', type: 'step', source: '10_create_pc', sourceHandle: 'out-right', target: '10_per_capita_and_ame_2', targetHandle: 'in-left'},
  { id: 'e10_percap_mon', type: 'step', source: '10_create_pc', sourceHandle: 'out-right', target: '10_monval_cap', targetHandle: 'in-left'},
  { id: 'e10_percap_exp', type: 'step', source: '10_create_pc', sourceHandle: 'out-right', target: '10_expenditure', targetHandle: 'in-left'},
  { id: 'e10_cal_pc2_conv', type: 'step', source: '10_per_capita_and_ame_2', sourceHandle: 'out-right', target: '10_convert', targetHandle: 'in-left'},
  { id: 'e10_monval_conv', type: 'step', source: '10_monval_cap', sourceHandle: 'out-right', target: '10_convert', targetHandle: 'in-left'},
  { id: 'e10_exp_conv', type: 'step', source: '10_expenditure', sourceHandle: 'out-right', target: '10_convert', targetHandle: 'in-left'},
  { id: 'e10_conv_sum', type: 'straight', source: '10_convert', sourceHandle: 'out-bottom', target: '10_sum_up', targetHandle: 'in-top'},
  { id: 'e10_sum_finish', type: 'straight', source: '10_sum_up', sourceHandle: 'out-bottom', target: '10_finished', targetHandle: 'in-top'},
  { id: 'e10_exp1_percap', type: 'step', source: '10_expenditure_yes', sourceHandle: 'out-right', target: '10_create_pc', targetHandle: 'in-bottom'},










]


















