// library init
kaboom();

// sprite loading
loadSprite("pirates", "/sprites/pirates.png", { sliceX: 8, sliceY: 8 }); // player sprite
loadSprite("pirates-bg", "/sprites/pirates-bg.png"); // the blue sea background

// define game layers, with last one drawn last (on top); default layer is game
layers([
    "bg",
    "game",
    "ui",
], "game");

// define main scene
scene("main", (level_index) => {

    // add pirates-bg picture and tile image on background layer
	add([
		sprite("pirates-bg", { 
			tiled: true, width: width(), height: height() }),
		layer("bg"),
	]);

	const SPEED = 320;

	// character dialog data
	const characters = {
		"a": {
			sprite: "pirates",
			msg: "ohhi how are you?",
		},
		"b": {
			sprite: "pirates",
			msg: "get out!",
		},
	};

    // level layouts
    const levels = [
        [
            "                          ",
            " ad                       ",
            " ij                       ",
            "   @                      ",
            "  aeb                     ",
            " aGUn                     ",
            " iOVn                     ",
            "  imj         rs          ",
            "              zA          ",
            "                          ",
        ],
		[
			"        ",
			"        ",
			"        ",
			"        ",
			"        ",
			"        ",
			"        ",
			"        ",
		],
	];

	addLevel(levels[level_index], {
		width: 32,
		height: 32,
		//pos: vec2(32, 32),
		"@": () => [
			sprite("pirates", { frame: 42, width: 32, height: 32 }),
			area(),
			solid(),
			"player",
		],
		any(ch) {
			let frame;
			if (ch >= 'a' && ch <= 'z') {
				frame = ch.charCodeAt(0) - 'a'.charCodeAt(0);
			}
			else if (ch >= 'A' && ch <= 'Z') {
				frame = ch.charCodeAt(0) - 'A'.charCodeAt(0) + 26;
			}
			else {
				return;
			}
			console.log(ch, frame);
			return [
				sprite("pirates", { frame, width: 32, height: 32 }),
				area(),
				solid(),
			];
		},
	});

	// get the player game obj by tag
	const player = get("player")[0];

	function addDialog() {
		const h = 160;
		const pad = 16;
		const bg = add([
			pos(0, height() - h),
			rect(width(), h),
			color(0, 0, 0),
			z(100),
		]);
		const txt = add([
			text("", {
				width: width(),
			}),
			pos(0 + pad, height() - h + pad),
			z(100),
		]);
		bg.hidden = true;
		txt.hidden = true;
		return {
			say(t) {
				txt.text = t;
				bg.hidden = false;
				txt.hidden = false;
			},
			dismiss() {
				if (!this.active()) {
					return;
				}
				txt.text = "";
				bg.hidden = true;
				txt.hidden = true;
			},
			active() {
				return !bg.hidden;
			},
			destroy() {
				bg.destroy();
				txt.destroy();
			},
		};
	}

	let hasKey = false;
	const dialog = addDialog();

	player.onCollide("key", (key) => {
		destroy(key);
		hasKey = true;
	});

	player.onCollide("door", () => {
		if (hasKey) {
			if (level_index + 1 < levels.length) {
				go("main", level_index + 1);
			} else {
				go("win");
			}
		} else {
			dialog.say("you got no key!");
		}
	});

	// talk on touch
	player.onCollide("character", (ch) => {
		dialog.say(ch.msg);
	});

	const dirs = {
		"left": LEFT,
		"right": RIGHT,
		"up": UP,
		"down": DOWN,
	};

	for (const dir in dirs) {
		onKeyPress(dir, () => {
			dialog.dismiss();
		});
		onKeyDown(dir, () => {
			player.move(dirs[dir].scale(SPEED));
		});
	}

});

// define win scene
scene("win", () => {
	add([
		text("You Win!"),
		pos(width() / 2, height() / 2),
		origin("center"),
	]);
});

// define menu scene
scene("menu", () => {
    // add pirates-bg picture and tile image on background layer
    add([
        sprite("pirates-bg", { tiled: true, width: width(), height: height() }),
        layer("bg"),
    ]);
    // add text to game layer
    add([
        text("Press space to go pirating!"),
        pos(width() / 2, height() / 2),
        origin("center"),
    ]);
    // register key handler for space
    onKeyPress("space", () => {
        go("main", 0);
    });
});

// start menu scene
go("menu", 0);
