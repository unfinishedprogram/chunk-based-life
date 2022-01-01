import { Life, V2 } from "life";

const dirs:V2[] = [
	[1, 1], [-1, -1],
	[1, -1], [-1, 1],
	[1, 0], [0, 1],
	[-1, 0], [0, -1]
]

export class Chunk {
	data:Uint8Array;
	next:Uint8Array;
	private readonly offset:V2;
	imgData:ImageData;
	active = 10;
	constructor(private readonly size:number, private readonly pos:[number, number], private readonly system:Life) {
		this.offset = pos.map(n => n * size) as [number, number];

		this.next = new Uint8Array(size*size);
		this.data = new Uint8Array(size*size);
		
		this.imgData = new ImageData(size, size);
	}

	dispose() {
		(this.data as unknown as any) = undefined;
		(this.next as unknown as any) = undefined;
	}

	draw():ImageData {
		let s = this.size**2;

		for(let i = 0; i < s; i++) {
			this.imgData.data[i * 4 + 0] = 255 - this.data[i] * 255;
			this.imgData.data[i * 4 + 1] = 255 - this.data[i] * 255;
			this.imgData.data[i * 4 + 2] = 255 - this.data[i] * 255;
			this.imgData.data[i * 4 + 3] = 255;
		}

		return this.imgData;
	}

	getDataIndex(pos:V2):number {
		pos = this.toLocalPos(pos);

		return pos[0] + pos[1] * this.size;
	}

	toLocalPos(pos:V2):V2 {
		return [
			pos[0] - this.offset[0], 
			pos[1] - this.offset[1]
		];
	}

	flip():void{
		[this.next, this.data] = [this.data, this.next];
	}

	getCell(pos:V2) {
		return this.data[this.getDataIndex(pos)];
	}

	setCell(pos:V2, value:number) {
		this.next[this.getDataIndex(pos)] = value;
	}

	toString(){
		let str = `Chunk at ${this.pos}\n`;
		for(let i = 0; i < this.size; i++) {
			for(let j = 0; j < this.size; j++) {
				str += this.data[j  + i * this.size] ? "⬛" : "⬜";
			}
			str += "\n";
		}
		return str;
	}

	inBounds(pos:V2):boolean {
		pos = this.toLocalPos(pos);

		if(pos[0] < 0) return false;
		if(pos[0] >= this.size) return false;
		if(pos[1] < 0) return false;
		if(pos[1] >= this.size) return false;

		return true;
	}

	countSurrounding(pos:V2):number{
		let n = 0;
		let x = 0;
		let y = 0;

		for(let i = 0; i < 8; i++){
			x = pos[0] + dirs[i][0];
			y = pos[1] + dirs[i][1];

			if(this.inBounds([x, y])){
				let i = this.getDataIndex([x, y]);
				n += this.data[i];
			} else {
				n += this.system.getCell([x, y], !!this.data[this.getDataIndex(pos)]);
			}
		}

		return n;
	}

	nextState(current:number, surrounding:number):number {
		if(current){
			return (surrounding == 3 || surrounding == 2) ? 1 : 0;
		} else {
			return (surrounding == 3) ? 1 : 0;
		}
	}

	step(){
		this.active -= 1;
		for(let x = this.offset[0]; x < this.offset[0] + this.size; x++) {
			for(let y = this.offset[1]; y < this.offset[1] + this.size; y++) {
				let surrounding = this.countSurrounding([x, y]);
				let curState = this.data[this.getDataIndex([x, y])];
				if(curState) this.active = 10;
				let nextState = this.nextState(curState, surrounding);
				this.next[this.getDataIndex([x, y])] = nextState;
			}
		}
	}
}