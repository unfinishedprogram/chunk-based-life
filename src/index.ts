import PerformanceMetrics from "./performanceMetrics";
import { Life, V2 } from "./life";

let l = new Life();

l.setCell([0+128, 0+128], 1)
l.setCell([1+128, 0+128], 1)
l.setCell([2+128, 0+128], 1)
l.setCell([4+128, 0+128], 1)
l.setCell([0+128, 1+128], 1)
l.setCell([3+128, 2+128], 1)
l.setCell([4+128, 2+128], 1)
l.setCell([1+128, 3+128], 1)
l.setCell([2+128, 3+128], 1)
l.setCell([4+128, 3+128], 1)
l.setCell([0+128, 4+128], 1)
l.setCell([2+128, 4+128], 1)
l.setCell([4+128, 4+128], 1)


let ctx = (document.getElementById("canvas") as HTMLCanvasElement).getContext("2d")!;

const pos = [0, 0] as V2;
const bounds = [255, 255] as V2;

let metrics = new PerformanceMetrics();
document.body.appendChild(metrics.elm);
metrics.addMetric("step")
metrics.addMetric("draw")
metrics.addMetric("chunks")
metrics.addMetric("TPC")

const step = () => {
	let t = performance.now();
	l.step();
	let dt = performance.now() - t;
	metrics.setMetric("step", dt);
	metrics.setMetric("TPC", dt/l.chunkCount);
	t = performance.now();
	l.draw(ctx, pos, bounds);
	requestAnimationFrame(step)
	dt = performance.now() - t;
	metrics.setMetric("draw", dt);
	metrics.setMetric("chunks", l.chunkCount);
} 


step()
