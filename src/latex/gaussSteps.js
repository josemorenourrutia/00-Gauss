import katex from 'katex'; //https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs';
// import 'katex/dist/katex.min.css';

import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
// import 'nerdamer/Calculus';
import 'nerdamer/Solve';
// import 'nerdamer/Extra';

// Opciones globales
const defaultKaTeXOptions = {
  displayMode: true,
  throwOnError: false,
  strict: 'ignore'
};

// Helper global
export function renderLatexGlobal(element, latex, options = {}) {
  katex.render(latex, element, { ...defaultKaTeXOptions, ...options });
}

export function renderAllSteps1(steps) {
  const container = document.getElementById('gaussSteps');
  container.innerHTML = '';

  steps.forEach(step => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-container';

    // Combinar operación y matriz
    const latex = `
      ${step.text ? `\\[ \\text{${step.text}} \\] ` : ''}
      \\[
      \\left[ \\begin{array}{ccc|c}
      ${step.matrix.map(row => row.join(' & ')).join(' \\\\ ')}
      \\end{array} \\right]
      \\]      
    `;

    stepDiv.innerHTML = latex;
    container.appendChild(stepDiv);
  });

  // Renderizar todo con MathJax
  MathJax.typesetPromise([container]);
}

export function renderAllStepsLatex(steps) {
  const container = document.getElementById('gaussSteps1');
  container.innerHTML = '';
  steps.forEach((step, i) => {
    const stepDiv = document.createElement('div');
    container.appendChild(stepDiv);
    stepDiv.className = 'step-container';
    renderLatexGlobal(stepDiv, step)

  });
}

function rowToLatex(row) {
  return row
    .map(value => nerdamer(value).toTeX())
    .join(' & ');
}


export function renderAllSteps(steps) {
  const container = document.getElementById('gaussSteps');
  container.innerHTML = '';
  steps.forEach((step, i) => {
    const stepDiv = document.createElement('div');
    container.appendChild(stepDiv);
    stepDiv.className = 'step-container';

    // const p = step.matrixLatex.map(row => rowToLatex(row)).join(' \\\\ ')
    // console.log(`${step.matrixLatex.map(row => row.join(' & ')).join(' \\\\ ')}`)
    // ${step.matrixLatex.map(row => rowToLatex(row)).join(' \\\\ ')}
    renderLatexGlobal(stepDiv, String.raw`
      {${i === 0 ? '' : `{\\scriptsize \\text{Paso ${i}}}`}}\\
      \left[
      \begin{array}{ccc|c}
      ${step.matrixLatex.map(row => row.join(' & ')).join(' \\\\ ')}
      \end{array}
      \right]
      \underset{ ${steps[i + 1]?.text[1] ? `${steps[i + 1].text[1]}` : ''}}
      {\overset{${steps[i + 1]?.text[0] ? `${steps[i + 1].text[0]}` : ''}}
      {${steps[i + 1] != undefined ? String.raw`\longrightarrow` : ''}}}    
    `);

  });

}


