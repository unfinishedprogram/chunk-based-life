export class Cell {
	active:boolean = true;
	neighbours: Cell[] = [];
	next:Cell = {} as Cell;

	constructor(public state:boolean){
		
	}

	setState(state:boolean) {
		this.state = state;
	}

	setNext(next:Cell) {
		this.next = next;
	}

	setNeighbours(neighbours:Cell[]) {
		this.neighbours = neighbours;
	}

	private getSurroundingCount():number {
		let sum = 0;
		this.neighbours.forEach(cell => sum += cell.state ? 1 : 0);
		return sum;
	}

	private getNextState() {
		const n = this.getSurroundingCount();
		if(this.state) {
			return (n == 3 || n == 2);
		} else {
			return (n == 3);
		}
	}

	public step(){
		this.next.setState(this.getNextState());
	}

	public filterDead(){
		this.neighbours = this.neighbours.filter (i => i.active); 
	}
}
