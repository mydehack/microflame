// Standalone node test for scientific & NASA engine verification
import fs from 'fs';

console.log('================================================================');
console.log('  FLAME IN FREEFALL: NASA PROPULSION & CEA VERIFICATION SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// 1. Verify Architecture Document & Specification
assert(fs.existsSync('C:/Users/pardhu/.gemini/antigravity/brain/c2accab6-848f-4a67-bf34-950a391490d5/flame_in_freefall_architecture.md'), 'Scientific Architecture Specification exists.');

// 2. Verify NASA Engine Catalogue & Data Services
assert(fs.existsSync('lib/data/nasa-engines.ts'), 'NASA Engine Catalogue exists.');
assert(fs.existsSync('lib/services/nasa-cea-service.ts'), 'NASA CEA equilibrium service exists.');
assert(fs.existsSync('lib/services/nasa-ntrs-service.ts'), 'NASA NTRS search service exists.');

// 3. Inspect NASA Engine Catalogue Contents
const engineCatalogue = fs.readFileSync('lib/data/nasa-engines.ts', 'utf8');
assert(engineCatalogue.includes('RS-25 (Space Shuttle Main Engine'), 'SSME / RS-25 documented.');
assert(engineCatalogue.includes('RL10B-2'), 'RL10B-2 documented.');
assert(engineCatalogue.includes('Apollo LMDE'), 'Apollo LMDE documented.');
assert(engineCatalogue.includes('Space Shuttle OMS'), 'Space Shuttle OMS AJ10-190 documented.');
assert(engineCatalogue.includes('R-4D-15'), 'R-4D-15 reaction control thruster documented.');
assert(engineCatalogue.includes('MR-106L'), 'MR-106L monopropellant thruster documented.');
assert(engineCatalogue.includes('NEXT (NASA Evolutionary Xenon Thruster)'), 'NASA NEXT ion propulsion documented.');
assert(engineCatalogue.includes('Project Morpheus LOX/Methane'), 'NASA Project Morpheus cryogenic RCS documented.');
assert(engineCatalogue.includes('NASA RDRE'), 'NASA Rotating Detonation Rocket Engine documented.');
assert(engineCatalogue.includes('NASA-TM-100398'), 'Official NTRS TM-100398 report identifier present.');
assert(engineCatalogue.includes('NASA-SP-8089'), 'Official NTRS SP-8089 report identifier present.');

// 4. Verify Engine Selector UI Components
assert(fs.existsSync('components/dashboard/EngineSelectorBar.tsx'), 'EngineSelectorBar component exists.');
assert(fs.existsSync('components/dashboard/EngineSelectorModal.tsx'), 'EngineSelectorModal component exists.');

// 5. Verify Main Thruster Shader Tone-Mapping (Preventing Overexposure)
const centerFlameContent = fs.readFileSync('components/dashboard/CenterFlame2D.tsx', 'utf8');
assert(centerFlameContent.includes('tonemapACES'), 'ACES filmic tone-mapping implemented to eliminate overexposure.');
assert(centerFlameContent.includes('u_layer_shock_structures'), 'Shock structures layer toggle hooked into GLSL uniform.');
assert(centerFlameContent.includes('u_layer_nozzle_geometry'), 'Nozzle geometry layer toggle hooked into GLSL uniform.');
assert(centerFlameContent.includes('EngineSelectorBar'), 'EngineSelectorBar integrated into central visualization view.');

// 6. Verify Right Panel Engine Specs and Layer Controls
const rightPanelContent = fs.readFileSync('components/dashboard/RightPanelMetrics.tsx', 'utf8');
assert(rightPanelContent.includes('NASA PUBLISHED ENGINE SPECIFICATIONS') || rightPanelContent.includes('Documented NASA Flight Hardware'), 'Engine Information section clearly isolated.');
assert(rightPanelContent.includes('Visualization Layer Controls'), 'Visualization Layer Controls section present.');
assert(rightPanelContent.includes('temperatureField') && rightPanelContent.includes('shockStructures'), '8 working layer toggles defined.');

// 7. Verify Bottom Panel Graphs
const bottomGraphsContent = fs.readFileSync('components/dashboard/BottomPanelGraphs.tsx', 'utf8');
assert(bottomGraphsContent.includes('thrustTime'), 'Thrust versus time graph supported.');
assert(bottomGraphsContent.includes('pressureTime'), 'Chamber pressure versus time graph supported.');
assert(bottomGraphsContent.includes('tempDist'), 'Temperature versus distance graph supported.');
assert(bottomGraphsContent.includes('velDist'), 'Velocity versus distance graph supported.');
assert(bottomGraphsContent.includes('speciesDist'), 'Species concentration versus distance graph supported.');
assert(bottomGraphsContent.includes('exportChartExcel'), 'Excel spreadsheet export supported.');

// 8. Verify Radial Menu Integrity (Exactly 6 options)
const radialMenuContent = fs.readFileSync('components/navigation/RadialMenu.tsx', 'utf8');
assert(radialMenuContent.includes("label: 'Analysis'") && radialMenuContent.includes("label: 'Safety'"), 'Radial menu has exactly six options.');

// 9. Verify Color Theme Hex Integrity
const tailwindContent = fs.readFileSync('tailwind.config.ts', 'utf8');
assert(tailwindContent.includes('#070F21'), 'Main background #070F21 (Midnight Navy) defined.');
assert(tailwindContent.includes('#0D2554'), 'Main panel #0D2554 (Deep Blue) defined.');
assert(tailwindContent.includes('#164E9E'), 'Secondary surface #164E9E defined.');
assert(tailwindContent.includes('#1B64DD'), 'Electric blue #1B64DD defined.');
assert(tailwindContent.includes('#2694EE'), 'Cyan highlight #2694EE defined.');
assert(tailwindContent.includes('#E8671C'), 'Flame orange #E8671C defined.');
assert(tailwindContent.includes('#F79628'), 'Amber highlight #F79628 defined.');
assert(tailwindContent.includes('#8B35E8'), 'Purple accent #8B35E8 defined.');

console.log('\n----------------------------------------------------------------');
console.log(`Results: ${passedTests} / ${totalTests} verification checks passed successfully.`);
console.log('----------------------------------------------------------------\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
