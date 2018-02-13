import {WIDTH,HEIGHT} from '../main.js';

export function createDashboardLayer(font,playerEnv){
	const LINE1 = font.size;
	const LINE2 = font.size * 2;

	const coins = 13;

	return function drawDashboard(ctx){
		const {score,time} = playerEnv.playerController;

		font.print('MARIO',ctx,16,LINE1);
		font.print(score.toString().padStart(6,'0'),ctx,16,LINE2);

		font.print('@x' + coins.toString().padStart(2,'0'),ctx,88,LINE2);

		font.print('WORLD',ctx,WIDTH - 112,LINE1);
		font.print('1-1',ctx,WIDTH - 104,LINE2);

		font.print('TIME',ctx,WIDTH - 48,LINE1);
		font.print(time.toFixed().toString().padStart(3,'0'),ctx,WIDTH - 40,LINE2);
	}
}