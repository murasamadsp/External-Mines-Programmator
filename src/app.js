// Mines Programmator Main Entry Point
// Initializes the application when DOM is ready

// Initialize application
console.log("🚀 EMP (External Mines Programmator) starting...");
console.log("🔧 LZMA compression ready with lzma-purejs (mode 7)");

// Now initialize the app
import("./components/editor/programmator-ui.js").then(({ ProgrammatorUI }) => {
  console.log("📱 Loading ProgrammatorUI...");

  let programmatorUI;

  try {
    programmatorUI = new ProgrammatorUI();
    console.log("✅ Programmator initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Programmator:", error);
    // Create fallback UI
    createFallbackUI(error);
  }
}).catch(error => {
  console.error("❌ Failed to load ProgrammatorUI:", error);
  createFallbackUI(error);
});

/**
 * Create fallback UI if main app fails
 */
function createFallbackUI(error) {
  const container = document.querySelector(".programmer-container");
  if (container) {
    container.innerHTML = `
      <div style="color: red; padding: 20px; border: 2px solid red; border-radius: 5px; background: #ffe6e6;">
        <h2>❌ Помилка ініціалізації</h2>
        <p><strong>EMP не зміг завантажитися:</strong></p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 3px; overflow: auto;">${error.message}</pre>
        <p><strong>Перевірте консоль браузера для деталей</strong></p>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Перезавантажити сторінку
        </button>
      </div>
    `;
  }
}

// Export for potential external use
export { };
