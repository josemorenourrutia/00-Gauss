export function createLoop(update, render, setActiveControls) {
  // console.log("🚀 ~ loop.js:2 ~ createLoop ~ orbit:", orbit)
  let running = true;
  let rafId;

  function animate(time) {
    if (!running) return;
    update(time);
    render();
    rafId = requestAnimationFrame(animate);
  }

  // Arranca automáticamente al crear el loop
  rafId = requestAnimationFrame(animate);

  return {
    stop: () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      setActiveControls(false);
      render();
    },
    start: () => {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(animate);
        setActiveControls(true);

      }
    },
  };
}
