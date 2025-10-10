// Test file for react-metrics-ignore-ligne annotations

// Cette fonction sera détectée (pas d'annotation)
function normalFunction() {
  console.log('This will be detected');
}

// react-metrics-ignore-ligne
function ignoredFunction() {
  console.log('This should be ignored');
}

/* react-metrics-ignore-ligne */
const ignoredArrowFunction = () => {
  return 'ignored';
};

// Cette fonction sera détectée (pas d'annotation)
function specificIgnoredFunction() {
  return 'specific ignore';
}

// This constant will be detected
const normalConstant = 'detected';

// react-metrics-ignore-ligne
const ignoredConstant = 'ignored';

// Multi-line annotation
/*
 * This function is temporarily unused
 * react-metrics-ignore-ligne
 */
function temporaryFunction() {
  return 'temporary';
}

// react-metrics-ignore-ligne
function mixedIgnoredFunction() {
  return 'mixed';
}
// react-metrics-ignore-ligne
const mixedIgnoredConstant = 'mixed constant';

export { normalConstant, normalFunction };
