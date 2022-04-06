import { Chunk } from "./chunk";
import { Cell } from "./cell";

const chunk_size = 4;

const dirs:V2[] = [
	[1, 1 ], [-1, -1],
	[1, -1], [-1, 1 ],
	[1, 0 ], [ 0, 1 ],
	[-1, 0], [ 0, -1]
]

interface Chunks {[index:number] : {[index:number]:Chunk}}

export type V2 = [number, number];

export const chunkPos = (pos:V2):V2 => pos.map(n => Math.floor(n/chunk_size)) as V2;

export class Life {
	chunks:Chunks = {};
	chunkCount = 0;

	draw(ctx:CanvasRenderingContext2D, pos:V2, size:V2){
		pos = chunkPos(pos);

		size = size.map(n => Math.ceil(n/chunk_size)) as V2;

		ctx.fillStyle = "lightgreen";

		ctx.fillRect(
			pos[0] * chunk_size,
			pos[1] * chunk_size, 
			size[0] * chunk_size,
			size[1] * chunk_size);

		for(let x = pos[0]; x <  pos[0] + size[0]; x++) {
			for(let y = pos[1]; y < pos[1] + size[1]; y++) {
				if(!this.chunks[x]) continue;
				let chunk = this.getChunk(x*chunk_size, y*chunk_size);
				if(chunk) {
					ctx.putImageData(chunk.draw(), (x - pos[0]) * chunk_size, (y - pos[1]) * chunk_size);
				}
			}
		}
	}

	setCell(x:number, y:number, value:number){
		this.createChunkAbs(Math.floor(x/chunk_size), Math.floor(y/chunk_size)).setCell(x, y, value);
	}

	getCell(x:number, y:number, createIfEmpty:boolean):Cell | undefined {
		let c = this.getChunk(x, y);

		if(c){
			if(createIfEmpty) {
				c.active = 4;
			}
			return c.getCell(x, y);
		} else {
			if(createIfEmpty) {
				this.createChunk(x, y);
			}
		}
	}

	createChunk(x:number, y:number):Chunk {
		return this.createChunkAbs(Math.floor(x/chunk_size), Math.floor(y/chunk_size));
	}

	createChunkAbs(x:number, y:number):Chunk {
		if(!this.chunks[x]) this.chunks[x] = {};

		if(!this.getChunkAbs(x, y)){
			this.chunks[x][y] = new Chunk(chunk_size, x, y, this);
			this.chunks[x][y].step();
			this.updateSurroundingChunkBorders(x, y);
			this.chunkCount++;
		} 

		return this.getChunkAbs(x, y)!;
	}



	updateSurroundingChunkBorders(x:number, y:number){
		dirs.forEach(dir => {
			this.getChunkAbs(x + dir[0], y + dir[1])?.assignNeighbours();
		})
	}

	chunkHasSurroundingActive(x:number, y:number):boolean {
		dirs.forEach(dir => {
			if(this.getChunkAbs(x + dir[0], y + dir[1])?.hasCells) {
				return true
			}
		})
		return false;
	}

	getChunkAbs(x:number, y:number):Chunk | undefined {
		return this.chunks[x] ? this.chunks[x][y] :  undefined;
	}
 
	getChunk(x:number, y:number): Chunk | undefined {
		x = Math.floor(x / chunk_size);
		y = Math.floor(y / chunk_size);
		return this.chunks[x] ? this.chunks[x][y] :  undefined;
	}

	flipBuffers(){
		for(let i in this.chunks) {
			for(let j in this.chunks[i]){
				this.chunks[i][j].flip();
			}
		}
	}

	step(){
		this.flipBuffers();
		for(let i in this.chunks) {
			for(let j in this.chunks[i]){
				this.chunks[i][j].step();
				if(this.chunks[i][j].active <= 0){
					this.chunks[i][j].dispose();
					delete this.chunks[i][j];
					this.chunkCount -= 1;
				}
			}
		}
	}
}