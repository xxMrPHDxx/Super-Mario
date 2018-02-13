import {WIDTH,HEIGHT,ROW,COLUMN} from '../main.js';
import TileResolver from '../TileResolver.js';

export function createBackgroundLayer(level,tiles,sprites){
	const resolver = new TileResolver(tiles);

	const buffer = document.createElement('canvas');
	buffer.width = WIDTH + 16;
	buffer.height = HEIGHT;

	const ctx = buffer.getContext('2d');

	function redraw(startIndex,endIndex){
		ctx.clearRect(0,0,buffer.width,buffer.height);

		for(let x=startIndex;x<=endIndex;x++){
			const col = tiles.grid[x];
			if(col){
				col.forEach((tile,y) => {
					if(sprites.animations.has(tile.name)){
						sprites.drawAnim(tile.name,ctx,x - startIndex,y,level.totalTime);
					}else{
						sprites.drawTile(tile.name,ctx,x - startIndex,y);
					}
				});
			}
		}
	}

	return function drawBackgroundLayer(ctx,camera){
		const drawWidth = resolver.toIndex(camera.size.x);
		const drawFrom = resolver.toIndex(camera.pos.x);
		const drawTo = drawFrom + drawWidth;
		redraw(drawFrom,drawTo);

		ctx.drawImage(
			buffer,
			-camera.pos.x % 16,
			-camera.pos.y
		);
	};
}
