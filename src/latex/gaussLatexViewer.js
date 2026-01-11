/* ======================================================
   gaussLatexViewer.js
   Requisitos:
   - MathJax cargado en el HTML
====================================================== */

export class GaussLatexViewer {

  constructor(divId = 'gaussSteps') {
    this.container = document.getElementById(divId);
    this.steps = [];
    this.index = 0;
  }

  /* ===============================
     API PUBLICA
  =============================== */

  loadSteps(steps) {
    this.steps = steps;
    console.log("🚀 ~ gaussLatexViewer.js:21 ~ GaussLatexViewer ~ loadSteps ~ steps:", steps)
    this.index = 0;
    this.renderCurrent();
  }

  next() {
    if (this.index < this.steps.length - 1) {
      this.index++;
      this.renderCurrent();
    }
  }

  prev() {
    if (this.index > 0) {
      this.index--;
      this.renderCurrent();
    }
  }

  play(delay = 100) {
    const loop = () => {
      if (this.index >= this.steps.length - 1) return;
      this.next();
      setTimeout(loop, delay);
    };
    loop();
  }

  /* ===============================
     RENDER
  =============================== */

  renderCurrent() {
    const step = this.steps[this.index];
    const latex =
      this.operationLatex(step.text) +
      this.matrixToLatex(step.matrix);

    this.container.innerHTML += latex;
    MathJax.typesetPromise([this.container]);
  }

  /* ===============================
     LATEX HELPERS
  =============================== */

  matrixToLatex(matrix) {
    console.log("🚀 ~ gaussLatexViewer.js:67 ~ GaussLatexViewer ~ matrixToLatex ~ matrix:", matrix)
    const cols = matrix[0].length - 1;
    const align = 'c'.repeat(cols) + '|c';

    const rows = matrix.map(row =>
      row.map(v => this.format(v)).join(' & ')
    ).join(' \\\\ ');

    return `
      \\[
      \\left[
      \\begin{array}{${align}}
      ${rows}
      \\end{array}
      \\right]
      \\]
    `;
  }

  operationLatex(text) {
    if (!text) return '';
    return `\\[ \\text{${text}} \\]`;
  }

  format(v) {
    return Number.isInteger(v)
      ? v
      : v.toFixed(2);
  }
}