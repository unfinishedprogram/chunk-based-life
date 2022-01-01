import { Life, V2 } from "life";

const dirs:V2[] = [
	[1, 1], [-1, -1],
	[1, -1], [-1, 1],
	[1, 0], [0, 1],
	[-1, 0], [0, -1]
]

export class Chunk {
	data:boolean[][];
	next:boolean[][];
	private readonly offsetX:number;
	private readonly offsetY:number;
	imgData:ImageData;
	active = 2;

	constructor(
		private readonly size:number, 
		private readonly posX:number, 
		private readonly posY:number,
		private readonly system:Life) {
		this.offsetX = posX * size;
		this.offsetY = posY * size;

		this.next = this.get2DArr(size);
		this.data = this.get2DArr(size);
		
		this.imgData = new ImageData(size, size);
	}

	get2DArr(size:number):boolean[][]{
		const arr:boolean[][] = new Array(size);

		for(let i = 0; i < size; i++){
			arr[i] = new Array(size);
			arr[i].fill(false);
		}

		return arr;
	}

	dispose() {
		(this.data as unknown as any) = undefined;
		(this.next as unknown as any) = undefined;
	}

	draw():ImageData {
		let s = this.size;
		for(let x = 0; x < s; x++){
			for(let y = 0; y < s; y++){

				let col = this.data[x][y] ? 0 : 255;
				let i = x + y * s;
				this.imgData.data[i * 4 + 0] = col;
				this.imgData.data[i * 4 + 1] = col;
				this.imgData.data[i * 4 + 2] = col;
				this.imgData.data[i * 4 + 3] = 255;
			}
		}
		return this.imgData;
	}

	flip():void{
		[this.next, this.data] = [this.data, this.next];
	}

	getCell(x:number, y:number) {
		return this.data[x-this.offsetX][y-this.offsetY];
	}

	setCell(x:number, y:number, value:number) {
		this.next[x-this.offsetX][y-this.offsetY] = !!value;
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

	countSurrounding(x:number, y:number, state:boolean):number{
		let n = 0;

		for(let i = 0; i < 8; i++){
			const dx = dirs[i][0];
			const dy = dirs[i][1];
			const px = x + dx;
			const py = y + dy;
			const ox = px + this.offsetX;
			const oy = py + this.offsetY;

			if(this.inBoundsXY(ox, oy)){
				if(this.data[px][py]) n++;
			} else {
				n += this.system.getCell([ox, oy], state);
			}
		}
		return n;
	}

	nextState(current:boolean, surrounding:number):boolean {
		if(current){
			return (surrounding == 3 || surrounding == 2);
		} else {
			return (surrounding == 3);
		}
	}

	step(){
		this.active -= 1;
		for(let x = 0; x < this.size; x++) {
			for(let y = 0; y < this.size; y++) {
				const curState = this.data[x][y];

				const surrounding = this.countSurrounding(x, y, curState);

				if(curState) this.active = 2;

				const nextState = this.nextState(curState, surrounding);

				this.next[x][y] = nextState;
			}
		}
	}
}