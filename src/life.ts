import { Chunk } from "./chunk";

const chunk_size = 32;

export type V2 = [number, number];

export const chunkPos = (pos:V2):V2 => pos.map(n => Math.floor(n/chunk_size)) as V2;

export class Life {
	chunks = new Map<number, Map<number, Chunk>>();
	chunkCount = 0;

	draw(ctx:CanvasRenderingContext2D, pos:V2, size:V2){
		pos = chunkPos(pos);

		size = size.map(n => Math.ceil(n/chunk_size)) as V2;

		ctx.fillStyle = "pink";

		ctx.fillRect(
			pos[0] * chunk_size, 
			pos[1] * chunk_size, 
			size[0] * chunk_size,
			size[1] * chunk_size);

		for(let x = pos[0]; x <  pos[0] + size[0]; x++) {
			for(let y = pos[1]; y < pos[1] + size[1]; y++) {
				if(!this.chunks.has(x)) continue;
				let chunk = this.getChunk([x*chunk_size, y*chunk_size]);
				if(chunk) {
					ctx.putImageData(chunk.draw(), (x - pos[0]) * chunk_size, (y - pos[1]) * chunk_size);
				}
			}
		}
	}

	setCell(pos:V2, value:number){
		this.createChunk(chunkPos(pos));
		this.getChunk(pos)!.setCell(pos[0], pos[1], value);
	}

	getCell(pos:V2, createIfEmpty:boolean):number {
		let c = this.getChunk(pos);

		if(c){
			if(createIfEmpty) {
				c.active = 4;
			}
			return c.getCell(pos[0], pos[1]) ? 1 : 0;
		} else {
			if(createIfEmpty) {
				this.createChunk(pos.map(n => Math.floor(n/chunk_size)) as V2);
			}
			return 0;
		}
	}

	createChunk(pos:V2):Chunk {
		if(!this.chunks.has(pos[0])){
			this.chunks.set(pos[0], new Map());
		}

		const m = this.chunks.get(pos[0])!;

		if(!m.has(pos[1])){
			m.set(pos[1], new Chunk(chunk_size, pos[0], pos[1], this));
			m.get(pos[1])?.step();
			this.chunkCount++;
		}

		return m.get(pos[1])!;
	}

	getChunk(pos:V2): Chunk | undefined {
		pos = pos.map(n => Math.floor(n / chunk_size)) as V2;

		if(!this.chunks.has(pos[0])){
			return undefined;
		}

		const m = this.chunks.get(pos[0])!;

		if(!m.has(pos[1])){
			return undefined;
		}
		
		return m.get(pos[1]);
	}

	flipBuffers(){
		this.chunks.forEach(m => m.forEach(c => c.flip()));
	}

	step(){
		this.flipBuffers();
		this.chunks.forEach(m => m.forEach((c, i) => {
			c.step();
			if(!c.active) {
				c.dispose();
				m.delete(i);
				this.chunkCount -= 1;
			}
		}));
	}
}