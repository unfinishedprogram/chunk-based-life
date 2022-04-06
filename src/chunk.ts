import { Cell } from "./cell";
import { Life, V2 } from "./life";


type Matrix = Record<number, Record<number, Cell>>;

const dirs:V2[] = [
	[1, 1 ], [-1, -1],
	[1, -1], [-1, 1 ],
	[1, 0 ], [ 0, 1 ],
	[-1, 0], [ 0, -1]
]

export class Chunk {
	data:Matrix;
	next:Matrix;
	updatedThisStep:number = 0;
	private readonly offsetX:number;
	private readonly offsetY:number;
	imgData:ImageData;
	active:number = 1;
	hasCells:boolean = false;

	constructor (
		private readonly size:number, 
		readonly posX:number,
		readonly posY:number,
		private readonly system:Life
	) {

		this.offsetX = posX * size;
		this.offsetY = posY * size;

		this.next = this.makeMatrix(size);
		this.data = this.makeMatrix(size);
		
		this.imgData = new ImageData(size, size);

		this.assignNextCells();
		this.assignNeighbours();
	}

	makeMatrix(size:number):Matrix{
		const arr:Matrix = {};
		for(let i = 0; i < size; i++){
			arr[i] = {};
			for(let j = 0; j < size; j++){
				arr[i][j] = new Cell(false);
			}
		}
		return arr;
	}

	assignNextCells(){
		for(let x = 0; x < this.size; x++) {
			for(let y = 0; y < this.size; y++) {
				this.data[x][y].setNext(this.next[x][y]);
				this.next[x][y].setNext(this.data[x][y]);
			}
		}
	}

	assignNeighbours() {
		this.updatedThisStep = 2;
		for(let x = 0; x < this.size; x++) {
			for(let y = 0; y < this.size; y++) {
				const nextNeighbours = [];
				const dataNeighbours = [];

				for(let i = 0; i < 8; i++){
					const dx = dirs[i][0];
					const dy = dirs[i][1];
					const px = x + dx;
					const py = y + dy;
					const ox = px + this.offsetX;
					const oy = py + this.offsetY;
		
					if(this.inBoundsXY(ox, oy)){
						dataNeighbours.push(this.data[px][py]);
						nextNeighbours.push(this.next[px][py]);
					} else {
						let c = this.system.getCell(ox, oy, false);
						if(c) {
							dataNeighbours.push(c);
							nextNeighbours.push(c.next);
						}
					}
				}
				this.data[x][y].setNeighbours(dataNeighbours);
				this.next[x][y].setNeighbours(nextNeighbours);
			}
		}
	}

	dispose() {
		let s = this.size;
		for(let x = 0; x < s; x++){
			for(let y = 0; y < s; y++){
				this.data[x][y].active = false;
				this.next[x][y].active = false;
			}
		}
		(this.data as unknown as any) = undefined;
		(this.next as unknown as any) = undefined;
	}

	draw():ImageData {
		let s = this.size;
		for(let x = 0; x < s; x++){
			for(let y = 0; y < s; y++){
				let col = this.data[x][y].state ? 0 : 255;
				let i = x + y * s;
				this.imgData.data[i * 4 + 0] = col;
				this.imgData.data[i * 4 + 1] = col;
				this.imgData.data[i * 4 + 2] = this.updatedThisStep ? 0 : 255;
				this.imgData.data[i * 4 + 3] = 255;
			}
		}

		return this.imgData;
	}

	flip():void {
		[this.next, this.data] = [this.data, this.next];
	}

	getCell(x:number, y:number):Cell {
		return this.data[x-this.offsetX][y-this.offsetY];
	}

	setCell(x:number, y:number, value:number) {
		this.next[x-this.offsetX][y-this.offsetY].setState(!!value);
		this.data[x-this.offsetX][y-this.offsetY].setState(!!value);
		// this.assignNeighbours();
	}

	inBoundsXY(x:number, y:number):boolean {
		let lx = x - this.offsetX;
		let ly = y - this.offsetY;
		if(lx < 0) return false;
		if(lx >= this.size) return false;
		if(ly < 0) return false;
		if(ly >= this.size) return false;
		return true;
	}

	createAdjacentChunks(x:number, y:number) {
		dirs.forEach(dir => {
			this.system.getCell(x+dir[0]+this.offsetX, y+dir[1]+this.offsetY, true);
		})
	}

	step(){
		this.updatedThisStep--;
		this.hasCells = false;
		this.updatedThisStep = Math.max(this.updatedThisStep, 0);

		for(let x = 0; x < this.size; x++) {
			for(let y = 0; y < this.size; y++) {
				const cell = this.data[x][y];

				if(cell.state) this.hasCells = true;
				cell.filterDead();

				if(cell.state && cell.neighbours.length < 8){
					this.createAdjacentChunks(x, y);
					this.assignNeighbours();
				}

				cell.step();

				if(cell.next.state) this.hasCells = true;
			}
		}
		if(!this.hasCells){
			if(this.system.chunkHasSurroundingActive(this.posX, this.posY)){
				this.active = 1
			} else {
				this.active--;
			}
		}
	}
}