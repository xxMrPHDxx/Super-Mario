import Entity,{Sides,Trait} from '../Entity.js';
import Killable from '../traits/Killable.js';
import PendulumMove from '../traits/PendulumMove.js';
import {loadSpriteSheet} from '../loaders.js';

export function loadKoopa(){
	return loadSpriteSheet('koopa')
	.then(createKoopaFactory);
}

const STATE = {
	WALKING: Symbol('walking'),
	HIDING: Symbol('hiding'),
	PANIC: Symbol('panic')
}

class Behavior extends Trait{
	constructor(){
		super('behavior');

		this.hideTime = 0;
		this.hideDuration = 5;

		this.walkSpeed = null;
		this.panicSpeed = 300;

		this.state = STATE.WALKING;
	}

	collides(us,them){
		if(us.killable.dead){
			return;
		}

		if(them.stomper){
			if(them.vel.y > us.vel.y){
				this.handleStomp(us,them);
			}else{
				this.handleNudge(us,them);
			}
		}
	}

	handleNudge(us,them){
		if(this.state === STATE.WALKING){
			them.killable.kill();
		}else if(this.state === STATE.HIDING){
			this.panic(us,them);
		}else if(this.state === STATE.PANIC){
			const travelDir = Math.sign(us.vel.x);
			const impactDir = Math.sign(us.pos.x - them.pos.x);
			if(travelDir !== 0 && travelDir !== impactDir){
				them.killable.kill();
			}
		}
	}

	handleStomp(us,them){
		if(this.state === STATE.WALKING){
			this.hide(us);
		}else if(this.state === STATE.HIDING){
			us.killable.kill();
			us.vel.set(100,-100);
			us.canCollide = false;
		}else if(this.state === STATE.PANIC){
			this.hide(us);
		}
	}

	hide(us){
		us.vel.x = 0;
		us.pendulumMove.enabled = false;
		if(this.walkSpeed === null){
			this.walkSpeed = us.pendulumMove.speed;
		}
		this.hideTime = 0;
		this.state = STATE.HIDING;
	}

	unhide(us){
		us.pendulumMove.enabled = true;
		us.pendulumMove.speed = this.walkSpeed;
		this.state = STATE.WALKING;
	}

	panic(us,them){
		us.pendulumMove.enabled = true;
		us.pendulumMove.speed = this.panicSpeed * Math.sign(them.vel.x);
		this.state = STATE.PANIC;
	}

	update(us,deltaTime){
		if(this.state === STATE.HIDING){
			this.hideTime += deltaTime;

			if(this.hideTime > this.hideDuration){
				this.unhide(us);
			}
		}
	}
}

function createKoopaFactory(sprite){
	const walkAnim = sprite.animations.get('walk');
	const wakeAnim = sprite.animations.get('wake');

	function routeAnim(koopa){
		if(koopa.behavior.state === STATE.HIDING){
			if(koopa.behavior.hideTime > 3){
				return wakeAnim(koopa.behavior.hideTime);
			}
			return 'hiding';
		}

		if(koopa.behavior.state === STATE.PANIC){
			return 'hiding';
		}

		return walkAnim(koopa.lifetime);
	}

	function drawKoopa(ctx){
		sprite.draw(routeAnim(this),ctx,0,0,this.vel.x < 0);
	}

	return function createKoopa(){
		const koopa = new Entity();
		koopa.size.set(16,16);
		koopa.offset.y = 8;

		koopa.addTrait(new PendulumMove());
		koopa.addTrait(new Behavior());
		koopa.addTrait(new Killable());

		koopa.draw = drawKoopa;

		return koopa;
	}
}
