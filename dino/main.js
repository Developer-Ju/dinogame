const dino_canvas_elem = document.getElementById("dinogame");
var dino_canvas = dino_canvas_elem.getContext("2d");

var firstLoop = true;

var mousePos = [0, 0];
var button_replay_hover = false;
var button_replay_clicking = false;

// States:
//
//  0 - start screen
//  1 - playing
//  2 - dead
//
var state = 0;
var speed = 1;

var score = 0;
var score_timer = 0;
var highscore = 0;

var sprite_dino_standing = document.createElement("img");
sprite_dino_standing.src = "dino/sprites/dino-standing.png";
var sprite_dino_dead = document.createElement("img");
sprite_dino_dead.src = "dino/sprites/dino-dead.png";
var sprite_dino_walking_1 = document.createElement("img");
sprite_dino_walking_1.src = "dino/sprites/dino-walking-1.png";
var sprite_dino_walking_2 = document.createElement("img");
sprite_dino_walking_2.src = "dino/sprites/dino-walking-2.png";

var sprite_ground = document.createElement("img");
sprite_ground.src = "dino/sprites/ground.png";

var sprite_cactus_1 = document.createElement("img");
sprite_cactus_1.src = "dino/sprites/cactus-1.png";
var sprite_cactus_2 = document.createElement("img");
sprite_cactus_2.src = "dino/sprites/cactus-2.png";
var sprite_cactus_3 = document.createElement("img");
sprite_cactus_3.src = "dino/sprites/cactus-3.png";


var sprite_bird_1 = document.createElement("img");
sprite_bird_1.src = "dino/sprites/bird-1.png";
var sprite_bird_2 = document.createElement("img");
sprite_bird_2.src = "dino/sprites/bird-2.png";

var sprite_button_replay = document.createElement("img");
sprite_button_replay.src = "dino/sprites/button-replay.png";

var color_main = "#535353";
var color_secondary = "#f7f7f7";

var dino = {
	position: [80, 90],
	velocity_y: 0,
	hitbox_origin: [10, 6],
	hitbox_size: [23, 31],
	onground: false,
	sprite: sprite_dino_standing,
	animation_walking_timer: 0
};

var text_start = {
	value: "Press Space or click to start",
	animation_blink_timer: 0
};

var ground_level = 4;
var ground = [
	[0, 0],
	[0, 0]
];

var base_speed = 5;

var obstacles = [];
var obstacles_spawn_timer = 0;


window.addEventListener("load", function() {
	var cookie_highscore = getCookie("hi");
	if (cookie_highscore != "") {
		highscore = parseInt(cookie_highscore);
	}
});


function dinoLoop() { // main loop
	if (firstLoop) {
		firstLoop = false;
		onFirstFrame();
	}
	
	switch (state) {
	
		case 0:
			dino_canvas_elem.style.cursor = "pointer";
			break;
		
		case 1:
			
			dino_canvas_elem.style.cursor = "";
			
			if (score_timer <= 0) {
				score ++;
				score_timer = 6;
			}
			score_timer--;
			
			if (dino.velocity_y < 10) {
				dino.velocity_y += 0.6;
			}
			
			dino.position[1] += dino.velocity_y;
			
			if (dino.position[1] + dino.sprite.height > dino_canvas_elem.height-1 - ground_level) {
				dino.position[1] = dino_canvas_elem.height-1 - ground_level - dino.sprite.height;
				dino.velocity_y = 0;
				dino.onground = true;
			}
			
			for (var obstacle in obstacles) { // Obstacles
				
				switch (obstacles[obstacle].type) {
					
					case 1:
						obstacles[obstacle].position[0] -= base_speed * speed;
						break;
					
					case 2:
						
						obstacles[obstacle].position[0] -= (base_speed + 1.5) * speed;
						
						obstacles[obstacle].animation_flying_timer ++;
						
						if (obstacles[obstacle].animation_flying_timer >= 80) {
							obstacles[obstacle].animation_flying_timer = 0;
						}
						
						if (obstacles[obstacle].animation_flying_timer >= 40) {
							obstacles[obstacle].sprite = sprite_bird_1;
						}
						else {
							obstacles[obstacle].sprite = sprite_bird_2;
						}
						
						break;
				}
				
				// Collisions
				
				if (
						obstacles[obstacle].position[0] + obstacles[obstacle].hitbox_origin[0] < dino.position[0] + dino.hitbox_origin[0] + dino.hitbox_size[0] &&
						obstacles[obstacle].position[0] + obstacles[obstacle].hitbox_origin[0] + obstacles[obstacle].hitbox_size[0] > dino.position[0] + dino.hitbox_origin[0] &&
						obstacles[obstacle].position[1] + obstacles[obstacle].hitbox_origin[1] < dino.position[1] + dino.hitbox_origin[1] + dino.hitbox_size[1] &&
						obstacles[obstacle].position[1] + obstacles[obstacle].hitbox_origin[1] + obstacles[obstacle].hitbox_size[1] > dino.position[1] + dino.hitbox_origin[1]
					) {
					state = 2;
					if (score > highscore) {
						highscore = score;
						document.cookie = "hi=" + highscore + "; expires=Wed, 31 Dec 3000 23:59:59 UTC; path=/";
					}
				}
				
				// Despawn
				
				if (obstacles[obstacle].position[0] + obstacles[obstacle].sprite.width < 0) {
					obstacles.splice(obstacle, 1);
					obstacle --;
					break;
				}
			}
			
			for (var ground_part in ground) {
				ground[ground_part][0] -= base_speed * speed;
			}
			
			if (ground[1][0] <= -10) { // Put first ground element behind second one if it isn't visible anymore
				var ground_part_temp = ground[0];
				ground.shift();
				ground.push(ground_part_temp);
				ground[ground.length-1][0] = ground[ground.length-2][0] + sprite_ground.width;
			}
			
			speed += 0.0001;
			
			// Spawn obstacles
			
			obstacles_spawn_timer --;
			
			if (obstacles_spawn_timer <= 0) {
				obstacles_spawn_timer = randint(60, 120) / speed;
				
				var obstacles_new_type = randint(1, 2);
				
				switch(obstacles_new_type) {
					
					case 1: // Cactus
						obstacles.push(
							{
								type: obstacles_new_type,
								sprite: eval("sprite_cactus_" + randint(1, 3)),
								position: [dino_canvas_elem.width + 10, dino_canvas_elem.height-1 - ground_level - 50],
								hitbox_origin: [0, 0],
								hitbox_size: [0, 0]
							}
						);
						obstacles[obstacles.length-1].hitbox_size = [obstacles[obstacles.length-1].sprite.width, obstacles[obstacles.length-1].sprite.height];
						break;
					
					case 2: // Bird
						obstacles.push(
							{
								type: obstacles_new_type,
								sprite: sprite_bird_1,
								animation_flying_timer: randint(1, 80),
								position: [dino_canvas_elem.width + 10, dino_canvas_elem.height-1 - ground_level - randint(50, 100)],
								hitbox_origin: [0, 6],
								hitbox_size: [40, 26]
							}
						);
						break;
				}
			}
			
			break;
		
		case 2:
			dino_canvas_elem.style.cursor = "";
			
			if (button_replay_hover) {
				dino_canvas_elem.style.cursor = "pointer";
			}
			
			break;
	}
	
	// Draw
	dino_draw();
	
	window.requestAnimationFrame(dinoLoop);
	
}

window.addEventListener("load", function() {
	window.requestAnimationFrame(dinoLoop);
});


function onFirstFrame() {
	dino.position[1] = dino_canvas_elem.height-1 - ground_level - dino.sprite.height;
	
	for (var ground_part in ground) {
		ground[ground_part][0] = sprite_ground.width*ground_part;
		ground[ground_part][1] = dino_canvas_elem.height - sprite_ground.height - 2;
	}
}

function dino_draw() { // Draw Function
	
	dino_canvas.clearRect(0, 0, dino_canvas_elem.width, dino_canvas_elem.height); // clear screen
	
	dino_canvas.fillStyle = color_secondary;
	dino_canvas.fillRect(0, 0, dino_canvas_elem.width, dino_canvas_elem.height); // background color
	
	
	switch (state) {
		
		case 0:
			dino.sprite = sprite_dino_standing;
			break;
		
		case 1:
			text_start.animation_blink_timer = 0;
			
			dino.animation_walking_timer ++;
			if (dino.animation_walking_timer > 18) {
				dino.animation_walking_timer = 0;
			}
			if (dino.animation_walking_timer >= 9) {
				dino.sprite = sprite_dino_walking_2;
			} else {
				dino.sprite = sprite_dino_walking_1;
			}
			break;
		
		case 2:
			dino.sprite = sprite_dino_dead;
			
			text_start.animation_blink_timer = 0;
			
			break;
	}
	
	for (var ground_part in ground) { // Draw ground
		dino_canvas.drawImage(sprite_ground, ground[ground_part][0], ground[ground_part][1]);
	}
	
	for (var obstacle in obstacles) { // Obstacles
		dino_canvas.drawImage(obstacles[obstacle].sprite, obstacles[obstacle].position[0], obstacles[obstacle].position[1]);
	}
	
	dino_canvas.drawImage(dino.sprite, dino.position[0], dino.position[1]);
	
	
	 // text and hud-elements
	
	if (highscore > 0) {
		dino_canvas.textAlign = "left";
		dino_canvas.font = "25px silkscreen";
		dino_canvas.fillStyle = color_main;
		dino_canvas.fillText("HI " + highscore.toString().padStart(6, "0"), 10, 25);
	}
	
	switch (state) {
		
		case 0:
			
			if (text_start.animation_blink_timer < 60) {
				dino_canvas.textAlign = "center";
				dino_canvas.font = "20px silkscreen-expanded-bold";
				dino_canvas.fillStyle = color_main;
				dino_canvas.fillText(text_start.value, dino_canvas_elem.width/2, dino_canvas_elem.height/2+10);
			}
			text_start.animation_blink_timer ++;
			if (text_start.animation_blink_timer >= 120) {
				text_start.animation_blink_timer = 0;
			}
			
			break;
		
		case 1:
			
			dino_canvas.textAlign = "right";
			dino_canvas.font = "25px silkscreen";
			dino_canvas.fillStyle = color_main;
			dino_canvas.fillText(score.toString().padStart(6, "0"), dino_canvas_elem.width - 10, 25);
			
			break;
		
		case 2:
			dino_canvas.textAlign = "center";
			dino_canvas.font = "35px silkscreen-expanded-bold";
			dino_canvas.fillStyle = color_main;
			dino_canvas.fillText("GAME OVER", dino_canvas_elem.width/2, dino_canvas_elem.height/2-10);
			
			if (button_replay_hover) {
				dino_canvas.filter = "brightness(1.5)";
			}
			if (button_replay_clicking) {
				dino_canvas.filter = "brightness(0.7)";
			}
			dino_canvas.drawImage(sprite_button_replay, dino_canvas_elem.width/2 - sprite_button_replay.width/2, dino_canvas_elem.height/2 + 15);
			dino_canvas.filter = "none";
			
			
			dino_canvas.textAlign = "right";
			dino_canvas.font = "25px silkscreen";
			dino_canvas.fillStyle = color_main;
			dino_canvas.fillText(score.toString().padStart(6, "0"), dino_canvas_elem.width - 10, 25);
			
			break;
	}
	
	// DEV display
	/* 
	dino_canvas.textAlign = "left";
	dino_canvas.font = "13px Times New Roman";
	dino_canvas.fillStyle = "#00A000";
	dino_canvas.fillText("[DEV] " + "Obstacle count: " + obstacles.length, 10, 20);
	 */
	
}

dino_canvas_elem.oncontextmenu = function(event) {
	return false;
};


document.onkeydown = function(event) {
	
	if (event.keyCode === 32 && dino.onground && state === 1) { // jump
		jump();
	}
	else if (event.keyCode === 32 && state === 0) {
		start();
		jump();
	}
	else if (event.keyCode === 32 && state === 2) {
		start();
		jump();
	}
	
};

dino_canvas_elem.onmousemove = function(event) {
	var mousePos_relativeTo_canvas = [event.clientX - dino_canvas_elem.getBoundingClientRect().left -1,
										event.clientY - dino_canvas_elem.getBoundingClientRect().top -1];
	
	var realPixels_per_canvasPixel = dino_canvas_elem.clientWidth / dino_canvas_elem.width;
	
	mousePos = [mousePos_relativeTo_canvas[0] / realPixels_per_canvasPixel, mousePos_relativeTo_canvas[1] / realPixels_per_canvasPixel];
	
	if (state === 2) {
		if (
				mousePos[0] >= dino_canvas_elem.width/2 - sprite_button_replay.width/2 &&
				mousePos[0] < dino_canvas_elem.width/2 - sprite_button_replay.width/2 + sprite_button_replay.width &&
				mousePos[1] >= dino_canvas_elem.height/2 + 11 &&
				mousePos[1] < dino_canvas_elem.height/2 + 11 + sprite_button_replay.width
			) {
			button_replay_hover = true;
		}
		else {
			button_replay_hover = false;
		}
	}
	else {
		button_replay_hover = false;
	}
};

dino_canvas_elem.onmousedown = function(event) {
	
	if (event.button === 0 && dino.onground && state === 1) {
		jump();
	}
	else if (event.button === 0 && state === 0) {
		start();
		jump();
	}
	else if (event.button === 0 && state === 2 && button_replay_hover) {
		button_replay_clicking = true;
	}
	
};

document.onmouseup = function(event) {
	
	if (event.button === 0 && state === 2 && button_replay_hover && button_replay_clicking) {
		start();
	}
	else {
		button_replay_clicking = false;
	}
	
};

function jump() {
	dino.velocity_y = -11.5;
	dino.onground = false;
}

function start() {
	state = 1;
	speed = 1;
	score = 0;
	score_timer = 0;
	dino.sprite = sprite_dino_walking_1;
	dino.animation_walking_timer = 0;
	dino.position[1] = dino_canvas_elem.height-1 - ground_level - dino.sprite.height;
	dino.velocity_y = 0;
	obstacles_spawn_timer = 60;
	obstacles = [];
	for (var ground_part in ground) {
		ground[ground_part][0] = sprite_ground.width*ground_part;
		ground[ground_part][1] = dino_canvas_elem.height - sprite_ground.height - 2;
	}
}

function randint(min, max) {
	return Math.floor((Math.random() * max) + min);
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
