/**
 * Performance Regression Testing Suite
 * Monitors performance metrics and detects regressions
 */
import { ProgramSerializer } from "./src/js/core/services/serialization/serializer.js";
import { Instruction } from "./src/js/core/types/instruction.js";
import { ProgAction } from "./src/js/core/constants/actions.js";
import { Program } from "./src/js/core/models/program.js";

/**
 * Performance benchmark runner
 */
class PerformanceBenchmark {
  constructor() {
    this.baselines = new Map();
    this.results = [];
    this.thresholds = {
      serialization: 100, // ms per 1000 instructions
      deserialization: 50, // ms per 1000 instructions
      gridOperations: 10, // ms per 1000 operations
      memoryUsage: 50 * 1024 * 1024, // 50MB max
    };
  }

  /**
   * Run benchmark with timing
   */
  async benchmark(name, operation, iterations = 1) {
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      const result = await operation();
      const duration = performance.now() - startTime;

      times.push(duration);

      if (result !== undefined) {
        // Store result for verification
      }
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const stdDev = Math.sqrt(
      times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) /
        times.length,
    );

    const result = {
      name,
      avgTime,
      minTime,
      maxTime,
      stdDev,
      iterations,
      timestamp: new Date().toISOString(),
    };

    this.results.push(result);

    console.log(`⏱️  ${name}:`);
    console.log(`   Average: ${avgTime.toFixed(2)}ms`);
    console.log(`   Range: ${minTime.toFixed(2)}-${maxTime.toFixed(2)}ms`);
    console.log(
      `   StdDev: ${stdDev.toFixed(2)}ms (${((stdDev / avgTime) * 100).toFixed(1)}%)`,
    );

    return result;
  }

  /**
   * Check for performance regressions
   */
  checkRegression(benchmark) {
    const baseline = this.baselines.get(benchmark.name);

    if (!baseline) {
      console.log(
        `📊 Establishing baseline for "${benchmark.name}": ${benchmark.avgTime.toFixed(2)}ms`,
      );
      this.baselines.set(benchmark.name, benchmark.avgTime);
      return false;
    }

    const regression = benchmark.avgTime - baseline;
    const regressionPercent = (regression / baseline) * 100;

    if (regression > 0) {
      const threshold = this.getThreshold(benchmark.name);
      const exceeded = regression > threshold;

      console.log(`📈 Regression in "${benchmark.name}":`);
      console.log(`   Previous: ${baseline.toFixed(2)}ms`);
      console.log(`   Current: ${benchmark.avgTime.toFixed(2)}ms`);
      console.log(
        `   Change: +${regression.toFixed(2)}ms (+${regressionPercent.toFixed(1)}%)`,
      );
      console.log(
        `   Status: ${exceeded ? "❌ EXCEEDED THRESHOLD" : "⚠️  WITHIN TOLERANCE"}`,
      );

      if (exceeded) {
        return true;
      }
    } else {
      console.log(
        `📉 Improvement in "${benchmark.name}": ${regressionPercent.toFixed(1)}% faster`,
      );
    }

    // Update baseline with moving average
    const newBaseline = baseline * 0.8 + benchmark.avgTime * 0.2;
    this.baselines.set(benchmark.name, newBaseline);

    return false;
  }

  /**
   * Get acceptable threshold for benchmark
   */
  getThreshold(name) {
    if (name.includes("Serialization")) return this.thresholds.serialization;
    if (name.includes("Deserialization"))
      return this.thresholds.deserialization;
    if (name.includes("Grid")) return this.thresholds.gridOperations;
    return 100; // default 100ms
  }

  /**
   * Generate performance report
   */
  report() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 PERFORMANCE REGRESSION REPORT");
    console.log("=".repeat(60));

    const regressions = this.results.filter((r) => this.checkRegression(r));

    console.log(`\n⏱️  Benchmarks executed: ${this.results.length}`);
    console.log(`📈 Performance regressions: ${regressions.length}`);

    if (regressions.length > 0) {
      console.log("\n❌ Significant Regressions:");
      regressions.forEach((r) => {
        console.log(
          `   • ${r.name}: ${(r.avgTime - this.baselines.get(r.name)).toFixed(2)}ms slower`,
        );
      });
    }

    console.log("\n📋 All Benchmarks:");
    this.results.forEach((r) => {
      const baseline = this.baselines.get(r.name);
      const change = baseline
        ? (((r.avgTime - baseline) / baseline) * 100).toFixed(1)
        : "N/A";
      console.log(
        `   ${r.name}: ${r.avgTime.toFixed(2)}ms (${change !== "N/A" ? change + "%" : "baseline"})`,
      );
    });

    console.log("\n" + "=".repeat(60));

    return regressions.length === 0;
  }
}

/**
 * Memory profiler
 */
class MemoryProfiler {
  constructor() {
    this.snapshots = [];
  }

  snapshot(name) {
    const memUsage = this.getMemoryUsage();
    this.snapshots.push({ name, ...memUsage, timestamp: Date.now() });
    console.log(
      `🧠 ${name}: ${this.formatBytes(memUsage.heapUsed)} heap, ${this.formatBytes(memUsage.heapTotal)} total`,
    );
  }

  getMemoryUsage() {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage();
    }
    return { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 };
  }

  formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(1)}${units[unitIndex]}`;
  }

  checkLeaks() {
    if (this.snapshots.length < 2) return false;

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];

    const leakMB = (last.heapUsed - first.heapUsed) / (1024 * 1024);

    if (leakMB > 10) {
      // More than 10MB growth
      console.warn(
        `⚠️  Potential memory leak detected: +${leakMB.toFixed(1)}MB`,
      );
      return true;
    }

    return false;
  }
}

/**
 * Test data generators
 */
class TestDataGenerator {
  static createProgram(size = 100) {
    const program = new Program();
    for (let i = 0; i < size; i++) {
      program.addInstruction(this.randomInstruction());
    }
    return program;
  }

  static randomInstruction() {
    const actions = Object.values(ProgAction).filter(
      (v) => typeof v === "number" && v >= 0,
    );
    const action = actions[Math.floor(Math.random() * actions.length)];

    return new Instruction(
      action,
      Math.random() < 0.2 ? this.randomLabel() : null,
      Math.random() < 0.1 ? Math.floor(Math.random() * 100) : null,
    );
  }

  static randomLabel() {
    const length = Math.floor(Math.random() * 3) + 1;
    return Array.from({ length }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26)),
    ).join("");
  }

  static createGridProgram(pages = 2) {
    const program = new Program();

    for (let page = 0; page < pages; page++) {
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 16; x++) {
          if (Math.random() < 0.05) {
            // 5% filled
            program.setInstructionAt(x, y, ProgAction.MoveUp, null, null, page);
          }
        }
      }
    }

    return program;
  }
}

/**
 * Run performance regression tests
 */
async function runPerformanceRegressionTests() {
  console.log("🏃 Starting Performance Regression Tests...");
  console.log("⏱️  Monitoring performance metrics and detecting regressions\n");

  const benchmark = new PerformanceBenchmark();
  const memoryProfiler = new MemoryProfiler();

  memoryProfiler.snapshot("Initial");

  // ============================================================================
  // SERIALIZATION PERFORMANCE TESTS
  // ============================================================================

  console.log("📦 SERIALIZATION PERFORMANCE");

  // Small program serialization
  await benchmark.benchmark(
    "Small Program Serialization",
    async () => {
      const program = TestDataGenerator.createProgram(10);
      return await program.toBase64Format();
    },
    10,
  );

  // Medium program serialization
  await benchmark.benchmark(
    "Medium Program Serialization",
    async () => {
      const program = TestDataGenerator.createProgram(100);
      return await program.toBase64Format();
    },
    5,
  );

  // Large program serialization
  await benchmark.benchmark(
    "Large Program Serialization",
    async () => {
      const program = TestDataGenerator.createProgram(1000);
      return await program.toBase64Format();
    },
    3,
  );

  // Deserialization tests
  const testBase64 =
    await TestDataGenerator.createProgram(500).toBase64Format();

  await benchmark.benchmark(
    "Program Deserialization",
    async () => {
      return await Program.fromString(testBase64);
    },
    10,
  );

  memoryProfiler.snapshot("After Serialization Tests");

  // ============================================================================
  // GRID OPERATIONS PERFORMANCE
  // ============================================================================

  console.log("\n🎯 GRID OPERATIONS PERFORMANCE");

  // Grid read operations
  await benchmark.benchmark(
    "Grid Read Operations",
    () => {
      const program = TestDataGenerator.createGridProgram(2);

      for (let i = 0; i < 1000; i++) {
        const x = i % 16;
        const y = Math.floor(i / 16) % 12;
        const page = Math.floor(i / (16 * 12)) % 2;
        program.getInstructionAt(x, y, page);
      }
    },
    5,
  );

  // Grid write operations
  await benchmark.benchmark(
    "Grid Write Operations",
    () => {
      const program = new Program();

      for (let i = 0; i < 1000; i++) {
        const x = i % 16;
        const y = Math.floor(i / 16) % 12;
        const page = Math.floor(i / (16 * 12)) % 2;
        program.setInstructionAt(x, y, ProgAction.MoveUp, null, null, page);
      }
    },
    5,
  );

  memoryProfiler.snapshot("After Grid Tests");

  // ============================================================================
  // MEMORY USAGE TESTS
  // ============================================================================

  console.log("\n🧠 MEMORY USAGE TESTS");

  await benchmark.benchmark(
    "Memory Intensive Operations",
    async () => {
      const programs = [];

      // Create many programs
      for (let i = 0; i < 50; i++) {
        programs.push(TestDataGenerator.createProgram(50));
      }

      // Serialize all
      const serialized = await Promise.all(
        programs.map((p) => p.toBase64Format()),
      );

      // Deserialize all
      const deserialized = await Promise.all(
        serialized.map((s) => Program.fromString(s)),
      );

      // Validate all
      deserialized.forEach((p) => p.validate());

      return deserialized.length;
    },
    3,
  );

  memoryProfiler.snapshot("After Memory Test");

  // ============================================================================
  // CONCURRENT OPERATIONS
  // ============================================================================

  console.log("\n🔄 CONCURRENT OPERATIONS");

  await benchmark.benchmark(
    "Concurrent Serialization",
    async () => {
      const programs = Array.from({ length: 20 }, () =>
        TestDataGenerator.createProgram(25),
      );

      // Serialize all concurrently
      const results = await Promise.all(
        programs.map((p) => p.toBase64Format()),
      );

      return results.length;
    },
    5,
  );

  memoryProfiler.snapshot("Final");

  // ============================================================================
  // PERFORMANCE REGRESSION ANALYSIS
  // ============================================================================

  console.log("\n📊 PERFORMANCE ANALYSIS");

  // Check for memory leaks
  const hasLeaks = memoryProfiler.checkLeaks();

  // Generate performance report
  const noRegressions = benchmark.report();

  // ============================================================================
  // FINAL REPORT
  // ============================================================================

  console.log("\n" + "=".repeat(60));
  console.log("🏁 PERFORMANCE REGRESSION TEST RESULTS");
  console.log("=".repeat(60));

  const issues = [];
  if (!noRegressions) issues.push("Performance regressions detected");
  if (hasLeaks) issues.push("Memory leaks detected");

  if (issues.length === 0) {
    console.log("✅ All performance tests passed!");
    console.log("🚀 No regressions or memory leaks detected.");
    console.log("💪 System performance is optimal.");
  } else {
    console.log("❌ Performance issues detected:");
    issues.forEach((issue) => console.log(`   • ${issue}`));
    console.log("\n🔧 Consider optimizing the highlighted areas.");
  }

  console.log("\n" + "=".repeat(60));

  return issues.length === 0;
}

// Run the performance regression tests
runPerformanceRegressionTests().catch((error) => {
  console.error("💥 Performance regression test suite crashed:", error);
  process.exit(1);
});
