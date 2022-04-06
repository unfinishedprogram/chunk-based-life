import PerformanceMetrics from "./performanceMetrics";
import { Life, V2 } from "./life";

let l = new Life();

const randmizeBig = (size:number) => {
	for(let i = 0; i < 20000; i++){
		l.setCell(Math.floor(Math.random() * size) - size/2, Math.floor(Math.random() * size) - size/2, 1)
	}
}

l.setCell(0, 0, 1)
l.setCell(1, 0, 1)
l.setCell(1, 2, 1)
l.setCell(3, 1, 1)
l.setCell(4, 0, 1)
l.setCell(5, 0, 1)
l.setCell(6, 0, 1)



let ctx = (document.getElementById("canvas") as HTMLCanvasElement).getContext("2d")!;

const pos = [-256, -256] as V2;
const bounds = [512, 512] as V2;

ctx.translate(256, 256)

// const pos = [-64, -64] as V2;
// const bounds = [128, 128] as V2;

// ctx.translate(64, 64)

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
