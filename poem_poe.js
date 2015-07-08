var canvasWidth = 550;
var canvasHeight = 1055;

var pCanvasElement;
var pContext;

var pTextOffsets = new Array();
var poem = new Array(); // array of Word objects
var alphaTitle; // opacity for title
var speedStep; // for animation speed
var speedCount; // for animation

// global booleans
var pDraw;
var doneAnimation = new Array(); // array to check whether each word has reached its final (x,y) position
var poemComplete;
var showCircles;

// request animation frame for browser cross compatibility
window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	  window.setTimeout(callback, 10000 / 60);
	};
  })();

// class for possible placement of a circle in the container
function Place(xPos, yPos, radius, tangent1, tangent2, lambda, wordNo) {
	this.xPos = xPos;
    this.yPos = yPos;
    this.radius = radius;
	this.tangent1 = tangent1; // -100 = top side, -200 = left side, -300 = right side
	this.tangent2 = tangent2; // -100 = top side, -200 = left side, -300 = right side
	this.lambda = lambda;
	this.wordNo = wordNo;
}

// class for each word of the poem  
function Word(text, xPos, yPos, line, posFinal, xPosFinal, yPosFinal, wordNo) {
	this.xPos = xPos;
    this.yPos = yPos;
    this.text = text;
	this.line = line; // can be used to further prioritize by line (not done in this program)
	this.posFinal = posFinal; // indicates whether circle is in its final position
	this.xPosFinal = xPosFinal; // final 'x' position calculated by optimization
	this.yPosFinal = yPosFinal; // final 'y' position calculated by optimization
	this.wordNo = wordNo;
	
	this.locked = false; // indicates whether circle is surrounded by other circles
	var length = pContext.measureText(text).width + 3;
	
	this.step = 0;
	this.radius = Math.round(length*1.3);
	this.offsetX = Math.round(this.radius/2);
	this.offsetY = 8; //half of font size
}

// sets final position of circle based on optimization 
Word.prototype.setPos = function(xPosFinal,yPosFinal,posFinal) {
	this.xPosFinal = xPosFinal;
	this.yPosFinal = yPosFinal;
	this.posFinal = posFinal;
}

// draws word and keeps track of animating movement
Word.prototype.drawWord = function(draw, step, flip) {
	var goingUp, goingDown, goingRight, goingLeft, doneX2, doneY2, offsetX, offsetY;
	goingUp = false;
	goingDown = false;
	goingRight = false;
	goingLeft = false;
	doneX = doneAnimation[this.wordNo*2];
	doneY = doneAnimation[this.wordNo*2 + 1];
	offsetX = pTextOffsets[this.wordNo*2];
	offsetY = pTextOffsets[this.wordNo*2 + 1];

	this.step = step; // determines speed of movement, linear motion for this example (can be made more interesting / realistic)

	// update new position of word and direction in which it is moving
	if (!doneY) {
		if (this.yPosFinal >= this.yPos) {
			this.yPos += this.step;
			goingDown = true;
		}
		else {
			this.yPos -= this.step;
			goingUp = true;
		}
	}
	if (!doneX) {
		if (this.xPosFinal >= this.xPos) {
			this.xPos += this.step;
			goingRight = true;
		}
		else {
			this.xPos -= this.step;
			goingLeft = true;
		}
	}
	
	// checks for whether the word has reached its final position
	if (goingUp && this.yPosFinal >= this.yPos) {
		doneY = true;
	}
	else if (goingDown && this.yPosFinal <= this.yPos) {
		doneY = true;
	}
	if (goingRight && this.xPosFinal <= this.xPos) {
		doneX = true;
	}
	else if (goingLeft && this.xPosFinal >= this.xPos) {
		doneX = true;
	}
	
	// to check if the word is in its final position
	if (doneX && doneY) {
		doneAnimation[this.wordNo*2] = doneX;
		doneAnimation[this.wordNo*2+1] = doneY;
		this.xPos=this.xPosFinal;
		this.yPos=this.yPosFinal;
	}
	
	// fix text offset - to center text in circle
	if (offsetX < this.offsetX) {
		offsetX += this.step / 2;
		pTextOffsets[this.wordNo*2] = offsetX;
	}
	else {
		offsetX = this.offsetX
	}
	if (offsetY < this.offsetY) {
		offsetY += this.step / 2;
		pTextOffsets[this.wordNo*2+1] = offsetY;
	}
	else {
		offsetY = this.offsetY
	}
	
	// draws circle around word (if 'draw' is true)
	if (draw) {
		pContext.beginPath();
		pContext.arc(this.xPos, this.yPos, this.radius, 0, Math.PI*2, false);
		if (flip) {
			pContext.fillStyle = "#ff4040";
			pContext.fill();
			pContext.lineWidth = 3;
			pContext.strokeStyle = "#ff7373";
		}
		else {
			pContext.lineWidth = 1;
			pContext.strokeStyle = "#ffffff";
		}
		pContext.stroke();	
	}
	
	// draw text	
	pContext.font = "16px sans-serif";
	pContext.fillStyle = "#ffffff";
	pContext.fillText(this.text, this.xPos - offsetX, this.yPos + offsetY);	
};

// animates the poem
function poemAnimate(){
	pContext.clearRect(0, 0, pCanvasElement.width, pCanvasElement.height);
	pContext.fillStyle = "#191919";
	pContext.fillRect(0, 0, pCanvasElement.width, pCanvasElement.height);
	
	
	if (alphaTitle >= 0) {
		pContext.font = "bold 20px sans-serif";
		pContext.fillStyle = "#ffffff";
		pContext.globalAlpha = alphaTitle;
		pContext.fillText("Alone by Edgar Allan Poe", 100, 220);
		alphaTitle = alphaTitle - 0.01;
		pContext.globalAlpha = 1;
	}
	
	
	if (speedCount == 2500) {
		speedStep += 0.1;
	}
	
	speedCount++;
	poemComplete = true;
	for (var i = 0; i < poem.length;i++) {
		poem[i].drawWord(pDraw, speedStep, false);	
		if (!doneAnimation[i*2] || !doneAnimation[i*2 + 1]){ 
			poemComplete = false;
		}
	}

	if (poemComplete) {
		showCircles = true;
		pContext.clearRect(0, 0, pCanvasElement.width, pCanvasElement.height);
		pContext.fillStyle = "#191919";
		pContext.fillRect(0,0,pCanvasElement.width, pCanvasElement.height);
		for (var i = 0; i < poem.length;i++) {
			poem[i].drawWord(pDraw, speedStep, false);
			if (i == 129) {
				poem[i].drawWord(true, speedStep, true);
			}
		}
		return;
	}
	else {
		// request new frame
		requestAnimFrame(poemAnimate);
	}
}

// interaction
function playOnClick(e) {
    //var cell = getCursorPosition(e);

}

// initializes poem
function poemStartPosition() {
		poem = [new Word("From",100,250,1,false,34,34, 0),
			new Word("childhood's",150,250,1,false,478,72, 1),
			new Word("hour",250,250,1,false,99,31, 2),
			new Word(" I ",290,250,1,false,410,16, 3),
			new Word("have",310,250,1,false,164,34, 4),
			new Word("not",355,250,1,false,372,23, 5),
			new Word("been",390,250,1,false,233,35, 6),
			
			new Word("As",100,270,2,false,329,20, 7),
			new Word("others",130,270,2,false,299,74, 8),
			new Word("were",190,270,2,false,72,89, 9),
			new Word(" - ",230,270,2,false,280,16, 10),
			new Word(" I ",245,270,2,false,391,57, 11),
			new Word("have",265,270,2,false,197,94, 12),
			new Word("not",310,270,2,false,127,77, 13),
			new Word("seen",345,270,2,false,370,102, 14),
			
			new Word("As",100,290,3,false,249,110, 15),
			new Word("others",130,290,3,false,137,141, 16),
			new Word("saw",190,290,3,false,321,139, 17),
			new Word(" - ",225,290,3,false,16,81, 18),
			new Word(" I ",240,290,3,false,28,111, 19),
			new Word("could",255,290,3,false,54,156, 20),
			new Word("not",310,290,3,false,412,140, 21),
			new Word("bring",345,290,3,false,222,157, 22),
			
			new Word("My",100,310,4,false,529,150, 23),
			new Word("passions",130,310,4,false,465,200, 24),
			new Word("from",210,310,4,false,282,180, 25),
			new Word(" a ",250,310,4,false,365,156, 26),
			new Word("common",270,310,4,false,351,230, 27),
			new Word("spring",345,310,4,false,175,214, 28),
			
			new Word("From",100,330,5,false,101,208, 29),
			new Word("the",150,330,5,false,23,206, 30),
			new Word("same",185,330,5,false,248,236, 31),
			new Word("source",235,330,5,false,50,267, 32),
			new Word(" I ",290,330,5,false,279,129, 33),
			new Word("have",310,330,5,false,128,271, 34),
			new Word("not",355,330,5,false,420,266, 35),
			new Word("taken",390,330,5,false,512,282, 36),
			
			new Word("My",100,350,6,false,201,269, 37),
			new Word("sorrow",130,350,6,false,245,315, 38),
			new Word(" - ",190,350,6,false,534,233, 39),
			new Word(" I ",205,350,6,false,290,266, 40),
			new Word("could",225,350,6,false,385,314,41),
			new Word("not",275,350,6,false,312,298, 42),
			new Word("awaken",310,350,6,false,96,350, 43),
			
			new Word("My",100, 370, 7, false,454,294, 44),
			new Word("heart",130,370,7,false,476,345, 45),
			new Word("to",180,370,7,false,173,293, 46),
			new Word("joy",205,370,7,false,21,325, 47),
			new Word("at",240,370,7,false,155,319, 48),
			new Word("the",265,370,7,false,332,339, 49),
			new Word("same",300,370,7,false,182,363, 50),
			new Word("tone",350,370,7,false,416,373, 51),
			new Word(" - ",385,370,7,false,534,331, 52),
			
			new Word("And",100,390,8,false,291,371, 53),
			new Word("all",140,390,8,false,29,362, 54),
			new Word("I",170,390,8,false,67,8, 55),
			new Word("lov'd",185,390,8,false,356,387, 56),
			new Word(" - ",225,390,8,false,524,361, 57),
			new Word(" I ",240,390,8,false,233,373, 58),
			new Word("lov'd",260,390,8,false,505,404, 59),
			new Word("alone",300,390,8,false,250,424, 60),
			new Word(" - ",345,390,8,false,16,392, 61),
			
			new Word("Then",100,410,9,false,143,422, 62),
			new Word(" - ",140,410,9,false,458,393, 63),
			new Word("in",160,410,9,false,351,53, 64),
			new Word("my",185,410,9,false,50,406, 65),
			new Word("childhood",220,410,9,false,406,465, 66),
			new Word(" - ",300,410,9,false,315,409, 67),
			new Word("in",320,410,9,false,395,173, 68),
			new Word("the",345,410,9,false,86,431, 69),
			new Word("dawn",375,410,9,false,514,470, 70),
			
			new Word("Of",100,430,10,false,195,432, 71),
			new Word("a",125,430,10,false,537,12, 72),
			new Word("most",140,430,10,false,33,457, 73),
			new Word("stormy",185,430,10,false,303,485, 74),
			new Word("life",250,430,10,false,177,467, 75),
			new Word(" - ",275,430,10,false,334,435, 76),
			new Word("was",295,430,10,false,110,475, 77),
			new Word("drawn",335,430,10,false,223,507, 78),
			
			new Word("From",100,450,11,false,65,516, 79),
			new Word("ev'ry",150,450,11,false,152,515, 80),
			new Word("depth",195,450,11,false,478,536, 81),
			new Word("of",245,450,11,false,16,503, 82),
			new Word("good",270,450,11,false,352,546, 83),
			new Word("and",315,450,11,false,275,549, 84),
			new Word("ill",350,450,11,false,538,182, 85),
			
			new Word("The",100,470,12,false,414,554, 86),
			new Word("mystery",140,470,12,false,112,584, 87),
			new Word("which",215,470,12,false,199,581, 88),
			new Word("binds",270,470,12,false,514,602, 89),
			new Word("me",320,470,12,false,43,567, 90),
			new Word("still",350,470,12,false,309,584, 91),
			new Word(" - ",380,470,12,false,534,518, 92),
			
			new Word("From",100,490,13,false,384,607, 93),
			new Word("the",150,490,13,false,448,590, 94),
			new Word("torrent,",185,490,13,false,264,636, 95),
			new Word("or",250,490,13,false,19,535, 96),
			new Word("the",275,490,13,false,23,607, 97),
			new Word("fountain",310,490,13,false,452,666, 98),
			new Word(" - ",375,490,13,false,531,550, 99),
			
			new Word("From",100,510,14,false,167,646, 100),
			new Word("the",150,510,14,false,60,634, 101),
			new Word("red",185,510,14,false,334,634, 102),
			new Word("cliff",220,510,14,false,101,655, 103),
			new Word("of",255,510,14,false,16,645, 104),
			new Word("the",280,510,14,false,370,662, 105),
			new Word("mountain",315,510,14,false,319,728, 106),
			new Word(" - ",390,510,14,false,534,650, 107),
			
			new Word("From",100,530,15,false,41,688, 108),
			new Word("the",150,530,15,false,211,682, 109),
			new Word("sun",185,530,15,false,131,694, 110),
			new Word("that",220,530,15,false,178,719, 111),
			new Word("'round",255,530,15,false,89,747, 112),
			new Word("me",315,530,15,false,524,687, 113),
			new Word("roll'd",345,530,15,false,409,738,114),
			
			new Word("In",100,550,16,false,389,696, 115),
			new Word("its",120,550,16,false,248,698, 116),
			new Word("autumn",150,550,16,false,501,755, 117),
			new Word("tint",220,550,16,false,226,730, 118),
			new Word("of",255,550,16,false,16,731, 119),
			new Word("gold",280,550,16,false,156,772, 120),
			new Word(" - ",315,550,16,false,199,757, 121),
			
			new Word("From",100,570,17,false,243,783, 122),
			new Word("the",150,570,17,false,27,768, 123),
			new Word("lightning",185,570,17,false,386,821, 124),
			new Word("in",260,570,17,false,89,690, 125),
			new Word("the",280,570,17,false,295,807, 126),
			new Word("sky",315,570,17,false,193,810, 127),
			
			new Word("As",100,590,18,false,56,800, 128),
			new Word("it",130,590,18,false,247,78, 129),
			new Word("pass'd",150,590,18,false,111,830, 130),
			new Word("me",210,590,18,false,463,815, 131),
			new Word("flying",240,590,18,false,515,838, 132),
			new Word("by",290,590,18,false,18,808, 133),
			new Word(" - ",310,590,18,false,439,774, 134),
			
			new Word("From",100,610,19,false,257,850, 135),
			new Word("the",150,610,19,false,42,841, 136),
			new Word("thunder,",185,610,19,false,182,897, 137),
			new Word("and",255,610,19,false,456,863, 138),
			new Word("the",290,610,19,false,314,850, 139),
			new Word("storm",320,610,19,false,66,895, 140),
			new Word(" - ",365,610,19,false,19,872, 141),
			
			new Word("And",100,630,20,false,343,893, 142),
			new Word("the",140,630,20,false,416,893, 143),
			new Word("cloud",170,630,20,false,514,909, 144),
			new Word("that",220,630,20,false,288,902, 145),
			new Word("took",260,630,20,false,452,932, 146),
			new Word("the",300,630,20,false,112,932, 147),
			new Word("form",330,630,20,false,384,935, 148),
			
			new Word("(When",100,650,21,false,254,963, 149),
			new Word("the",155,650,21,false,320,940, 150),
			new Word("rest",185,650,21,false,70,957, 151),
			new Word("of",220,650,21,false,34,936, 152),
			new Word("Heaven",245,650,21,false,147,997, 153),
			new Word("was",310,650,21,false,495,969, 154),
			new Word("blue)",350,650,21,false,420,988, 155),
			
			new Word("Of",100,670,22,false,18,966, 156),
			new Word("a",125,670,22,false,190,315, 157),
			new Word("demon",140,670,22,false,342,1005, 158),
			new Word("in",200,670,22,false,16,902, 159),
			new Word("my",220,670,22,false,43,996, 160),
			new Word("view",250,670,22,false,520,1020, 161)
			]; 
	
	/* unfilled poem for circle packing analysis
		poem = [new Word("From",100,250,1,false,0,0, 0),
			new Word("childhood's",150,250,1,false,0,0, 1),
			new Word("hour",250,250,1,false,0,0, 2),
			new Word(" I ",290,250,1,false,0,0, 3),
			new Word("have",310,250,1,false,0,0, 4),
			new Word("not",355,250,1,false,0,0, 5),
			new Word("been",390,250,1,false,0,0, 6),
			
			new Word("As",100,270,2,false,0,0, 7),
			new Word("others",130,270,2,false,0,0, 8),
			new Word("were",190,270,2,false,0,0, 9),
			new Word(" - ",230,270,2,false,0,0, 10),
			new Word(" I ",245,270,2,false,0,0, 11),
			new Word("have",265,270,2,false,0,0, 12),
			new Word("not",310,270,2,false,0,0, 13),
			new Word("seen",345,270,2,false,0,0, 14),
			
			new Word("As",100,290,3,false,0,0, 15),
			new Word("others",130,290,3,false,0,0, 16),
			new Word("saw",190,290,3,false,0,0, 17),
			new Word(" - ",225,290,3,false,0,0, 18),
			new Word(" I ",240,290,3,false,0,0, 19),
			new Word("could",255,290,3,false,0,0, 20),
			new Word("not",310,290,3,false,0,0, 21),
			new Word("bring",345,290,3,false,0,0, 22),
			
			new Word("My",100,310,4,false,0,0, 23),
			new Word("passions",130,310,4,false,0,0, 24),
			new Word("from",210,310,4,false,0,0, 25),
			new Word(" a ",250,310,4,false,0,0, 26),
			new Word("common",270,310,4,false,0,0, 27),
			new Word("spring",345,310,4,false,0,0, 28),
			
			new Word("From",100,330,5,false,0,0, 29),
			new Word("the",150,330,5,false,0,0, 30),
			new Word("same",185,330,5,false,0,0, 31),
			new Word("source",235,330,5,false,0,0, 32),
			new Word(" I ",290,330,5,false,0,0, 33),
			new Word("have",310,330,5,false,0,0, 34),
			new Word("not",355,330,5,false,0,0, 35),
			new Word("taken",390,330,5,false,0,0, 36),
			
			new Word("My",100,350,6,false,0,0, 37),
			new Word("sorrow",130,350,6,false,0,0, 38),
			new Word(" - ",190,350,6,false,0,0, 39),
			new Word(" I ",205,350,6,false,0,0, 40),
			new Word("could",225,350,6,false,0,0,41),
			new Word("not",275,350,6,false,0,0, 42),
			new Word("awaken",310,350,6,false,0,0, 43),
			
			new Word("My",100, 370, 7, false,0,0, 44),
			new Word("heart",130,370,7,false,0,0, 45),
			new Word("to",180,370,7,false,0,0, 46),
			new Word("joy",205,370,7,false,0,0, 47),
			new Word("at",240,370,7,false,0,0, 48),
			new Word("the",265,370,7,false,0,0, 49),
			new Word("same",300,370,7,false,0,0, 50),
			new Word("tone",350,370,7,false,0,0, 51),
			new Word(" - ",385,370,7,false,0,0, 52),
			
			new Word("And",100,390,8,false,0,0, 53),
			new Word("all",140,390,8,false,0,0, 54),
			new Word("I",170,390,8,false,0,0, 55),
			new Word("lov'd",185,390,8,false,0,0, 56),
			new Word(" - ",225,390,8,false,0,0, 57),
			new Word(" I ",240,390,8,false,0,0, 58),
			new Word("lov'd",260,390,8,false,0,0, 59),
			new Word("alone",300,390,8,false,0,0, 60),
			new Word(" - ",345,390,8,false,0,0, 61),
			
			new Word("Then",100,410,9,false,0,0, 62),
			new Word(" - ",140,410,9,false,0,0, 63),
			new Word("in",160,410,9,false,0,0, 64),
			new Word("my",185,410,9,false,0,0, 65),
			new Word("childhood",220,410,9,false,0,0, 66),
			new Word(" - ",300,410,9,false,0,0, 67),
			new Word("in",320,410,9,false,0,0, 68),
			new Word("the",345,410,9,false,0,0, 69),
			new Word("dawn",375,410,9,false,0,0, 70),
			
			new Word("Of",100,430,10,false,0,0, 71),
			new Word("a",125,430,10,false,0,0, 72),
			new Word("most",140,430,10,false,0,0, 73),
			new Word("stormy",185,430,10,false,0,0, 74),
			new Word("life",250,430,10,false,0,0, 75),
			new Word(" - ",275,430,10,false,0,0, 76),
			new Word("was",295,430,10,false,0,0, 77),
			new Word("drawn",335,430,10,false,0,0, 78),
			
			new Word("From",100,450,11,false,0,0, 79),
			new Word("ev'ry",150,450,11,false,0,0, 80),
			new Word("depth",195,450,11,false,0,0, 81),
			new Word("of",245,450,11,false,0,0, 82),
			new Word("good",270,450,11,false,0,0, 83),
			new Word("and",315,450,11,false,0,0, 84),
			new Word("ill",350,450,11,false,0,0, 85),
			
			new Word("The",100,470,12,false,0,0, 86),
			new Word("mystery",140,470,12,false,0,0, 87),
			new Word("which",215,470,12,false,0,0, 88),
			new Word("binds",270,470,12,false,0,0, 89),
			new Word("me",320,470,12,false,0,0, 90),
			new Word("still",350,470,12,false,0,0, 91),
			new Word(" - ",380,470,12,false,0,0, 92),
			
			new Word("From",100,490,13,false,0,0, 93),
			new Word("the",150,490,13,false,0,0, 94),
			new Word("torrent,",185,490,13,false,0,0, 95),
			new Word("or",250,490,13,false,0,0, 96),
			new Word("the",275,490,13,false,0,0, 97),
			new Word("fountain",310,490,13,false,0,0, 98),
			new Word(" - ",375,490,13,false,0,0, 99),
			
			new Word("From",100,510,14,false,0,0, 100),
			new Word("the",150,510,14,false,0,0, 101),
			new Word("red",185,510,14,false,0,0, 102),
			new Word("cliff",220,510,14,false,0,0, 103),
			new Word("of",255,510,14,false,0,0, 104),
			new Word("the",280,510,14,false,0,0, 105),
			new Word("mountain",315,510,14,false,0,0, 106),
			new Word(" - ",390,510,14,false,0,0, 107),
			
			new Word("From",100,530,15,false,0,0, 108),
			new Word("the",150,530,15,false,0,0, 109),
			new Word("sun",185,530,15,false,0,0, 110),
			new Word("that",220,530,15,false,0,0, 111),
			new Word("'round",255,530,15,false,0,0, 112),
			new Word("me",315,530,15,false,0,0, 113),
			new Word("roll'd",345,530,15,false,0,0,114),
			
			new Word("In",100,550,16,false,0,0, 115),
			new Word("its",120,550,16,false,0,0, 116),
			new Word("autumn",150,550,16,false,0,0, 117),
			new Word("tint",220,550,16,false,0,0, 118),
			new Word("of",255,550,16,false,0,0, 119),
			new Word("gold",280,550,16,false,0,0, 120),
			new Word(" - ",315,550,16,false,0,0, 121),
			
			new Word("From",100,570,17,false,0,0, 122),
			new Word("the",150,570,17,false,0,0, 123),
			new Word("lightning",185,570,17,false,0,0, 124),
			new Word("in",260,570,17,false,0,0, 125),
			new Word("the",280,570,17,false,0,0, 126),
			new Word("sky",315,570,17,false,0,0, 127),
			
			new Word("As",100,590,18,false,0,0, 128),
			new Word("it",130,590,18,false,0,0, 129),
			new Word("pass'd",150,590,18,false,0,0, 130),
			new Word("me",210,590,18,false,0,0, 131),
			new Word("flying",240,590,18,false,0,0, 132),
			new Word("by",290,590,18,false,0,0, 133),
			new Word(" - ",310,590,18,false,0,0, 134),
			
			new Word("From",100,610,19,false,0,0, 135),
			new Word("the",150,610,19,false,0,0, 136),
			new Word("thunder,",185,610,19,false,0,0, 137),
			new Word("and",255,610,19,false,0,0, 138),
			new Word("the",290,610,19,false,0,0, 139),
			new Word("storm",320,610,19,false,0,0, 140),
			new Word(" - ",365,610,19,false,0,0, 141),
			
			new Word("And",100,630,20,false,0,0, 142),
			new Word("the",140,630,20,false,0,0, 143),
			new Word("cloud",170,630,20,false,0,0, 144),
			new Word("that",220,630,20,false,0,0, 145),
			new Word("took",260,630,20,false,0,0, 146),
			new Word("the",300,630,20,false,0,0, 147),
			new Word("form",330,630,20,false,0,0, 148),
			
			new Word("(When",100,650,21,false,0,0, 149),
			new Word("the",155,650,21,false,0,0, 150),
			new Word("rest",185,650,21,false,0,0, 151),
			new Word("of",220,650,21,false,0,0, 152),
			new Word("Heaven",245,650,21,false,0,0, 153),
			new Word("was",310,650,21,false,0,0, 154),
			new Word("blue)",350,650,21,false,0,0, 155),
			
			new Word("Of",100,670,22,false,0,0, 156),
			new Word("a",125,670,22,false,0,0, 157),
			new Word("demon",140,670,22,false,0,0, 158),
			new Word("in",200,670,22,false,0,0, 159),
			new Word("my",220,670,22,false,0,0, 160),
			new Word("view",250,670,22,false,0,0, 161)
			]; 
	*/	
	pContext.fillStyle = "#191919";
	pContext.fillRect(0,0,canvasWidth,canvasHeight);
	
	pContext.font = "bold 20px sans-serif";
	pContext.fillStyle = "#ffffff";
	pContext.globalAlpha = alphaTitle;
	pContext.fillText("Alone by Edgar Allan Poe", 100, 220);
	pContext.globalAlpha = 1;
	
	pContext.font = "16px sans-serif";
	for (var i = 0; i < poem.length;i++){
		pContext.fillText(poem[i].text, poem[i].xPos, poem[i].yPos);
	}

	for (var i = 0; i < 2* poem.length;i++) {
		doneAnimation[i] = false;
		pTextOffsets[i] = 0;
	}
}

// optimizes to fit unequal circles into the rectangular container, see pseudocode for details
function poemCirclePacking() {
	var placements = new Array();
	var lambda, highestY, newX, newY;
	
	//first two words are placed in opposing corners
	poem[0].setPos(poem[0].radius, poem[0].radius, true);
	poem[1].setPos(canvasWidth - poem[1].radius, poem[1].radius, true);
	
	//tempDrawCircle(poem[0].xPosFinal,poem[0].yPosFinal,poem[0].radius, false);
	//tempDrawCircle(poem[1].xPosFinal,poem[1].yPosFinal,poem[1].radius, false);
	
	for (var k = 2; k < poem.length; k++) {
		placements = findPlacements(poem[k]);
		lambda = -9999;
		newX = 0;
		newY = 0;
		highestY = canvasHeight; // this aims to prioritize filling up the top
		console.log(poem[k].text);
		
		/* placements are determined for next word only, in order to try and retain some structure
		of the poem. Ideally you would find the placements for all words / circles not yet placed
		(though you would not use JS). As an NP-hard problem this is ideally suited for Py, R or Matlab
		*/
		for (var i = 0; i < placements.length; i++) {
			for (var j = 0; j < poem.length; j++) { 
				if (poem[j].posFinal /*&& !poem[j].locked*/) { // check lambda measurement only for circles inside container and if circles are not locked (i.e. surrounded by other circles)
					dist = Math.sqrt(Math.pow((poem[j].xPosFinal - placements[i].xPos),2) + Math.pow((poem[j].yPosFinal - placements[i].yPos),2)) - poem[j].radius - placements[i].radius;
					dist = Math.round(dist);
					if (dist == 0) {
						lambda = 1;
						if (placements[i].yPos < highestY) { // prioritizes placements closer to the top
							highestY = placements[i].yPos;
							newX = placements[i].xPos;
							newY = highestY;
						}
						break;
					}
					else {
						if (lambda != 1) {
							if (1 - dist / placements[i].radius > lambda) {
								lambda = 1 - dist / placements[i].radius;
								newX = placements[i].xPos;
								newY = placements[i].yPos;
							}
							else {
								lambda = 1 - dist / placements[i].radius;
							}
						}
					}
					
					// this is done as a optimization as it allows us to skip a considerable chunk of circles as we get into the higher word numbers
					/*
					if (!poem[j].locked) {
						if ((overlapCheck(poem[j].xPosFinal + poem[j].radius + 10,poem[j].yPosFinal + poem[j].radius + 10, 10)) && (overlapCheck(poem[j].xPosFinal + poem[j].radius + 10,poem[j].yPosFinal + poem[j].radius - 10, 10)) && (overlapCheck(poem[j].xPosFinal + poem[j].radius - 10,poem[j].yPosFinal + poem[j].radius + 10, 10)) && (overlapCheck(poem[j].xPosFinal + poem[j].radius - 10,poem[j].yPosFinal + poem[j].radius - 10,10))) {
							poem[j].locked = true;
						}
					}
					*/
				}
			}
		}
		poem[k].setPos(newX, newY, true);
		//tempDrawCircle(poem[k].xPosFinal,poem[k].yPosFinal,poem[k].radius, false);
		
	}
}

// debugging function, draws circles
function tempDrawCircle(x,y,rad, check){
		pContext.beginPath();
		pContext.arc(x, y, rad, 0, Math.PI*2, false);
		if (check) {
			pContext.strokeStyle = "#ff0000";
		}
		else {
			pContext.strokeStyle = "#ffffff";
		}
		pContext.stroke();		
}

// finds all possible placements for the next circle entering the container, placement must meet all constraints of the optimization problem
function findPlacements (word){
	var j = 0;
	var value;
	var newX, newY, newCircle;
	var placements = new Array();
	
	for (var i = 0; i < poem.length;i++){
		if (poem[i].posFinal /*&& !poem[i].locked*/) {
			// check against top side
			if (poem[i].yPosFinal - poem[i].radius - word.radius <= 0) {
				value = findTangency(poem[i].xPosFinal, poem[i].yPosFinal, poem[i].radius, 1, 0, 0, word.radius);
				if (value[0] != 0 && value[1] != 0) {
					placements[j++] = new Place(value[0], value[1], word.radius, -100, poem[i].wordNo, 0, word.wordNo);
				}
			}
			
			// check against left side
			if (poem[i].xPosFinal - poem[i].radius  - word.radius <= 0) {
				value = findTangency(poem[i].xPosFinal, poem[i].yPosFinal, poem[i].radius, 0, 1, 0, word.radius);
				if (value[0] != 0 && value[1] != 0) {
					placements[j++] = new Place(value[0], value[1], word.radius, -200, poem[i].wordNo, 0, word.wordNo);
				}
			}			
			// check against right side
			if (poem[i].xPosFinal + poem[i].radius + word.radius >= canvasWidth) {
				value = findTangency(poem[i].xPosFinal, poem[i].yPosFinal, poem[i].radius, canvasWidth, 1, 0, word.radius);
				if (value[0] != 0 && value[1] != 0) {
					placements[j++] = new Place(value[0], value[1], word.radius, -300, poem[i].wordNo, 0, word.wordNo);
				}
			}
			// check against other circles
			for (var k = 0; k < poem.length; k++){ 
				if (poem[k].posFinal && poem[k].wordNo != poem[i].wordNo) {
					value = findTangency(poem[i].xPosFinal, poem[i].yPosFinal, poem[i].radius, poem[k].xPosFinal, poem[k].yPosFinal, poem[k].radius, word.radius);
					if (value[0] != 0 && value[1] != 0) {
						placements[j++] = new Place(value[0], value[1], word.radius, poem[k].wordNo, poem[i].wordNo, 0, word.wordNo);
					}
				}
			}
		}
	}
	return placements;
}

// returns the position (x,y) to place a cricle of radius radW given either two circles or a circle and a side
function findTangency(x1, y1, rad1, x2, y2, rad2, radW) {
	var finPos = [0, 0];
	var xStart, xFinish;
	var yStart, yFinish;
	var dist, dist2 = 0;
	
	if (rad2 == 0) { // one of the sides
		if (y2 == 0) { // top side
			xStart = x1 - rad1 - radW - 5 <= 0 ? radW : x1 - rad1 - radW - 5;
			xFinish = x1 + rad1 + radW + 5 >= canvasWidth ? canvasWidth - radW : x1 + rad1 + radW + 5;
			for (var x = xStart; x < xFinish; x++) {
				dist = Math.sqrt(Math.pow((x1 - x),2) + Math.pow((y1 - radW),2)) - rad1 - radW;
				dist = Math.round(dist);
				if (dist == 0 && !overlapCheck(x, radW, radW)) {
					finPos[0] = x;
					finPos[1] = radW;
					return finPos;
				}
			}
		}
		else if (x2 == 0) { // left side
			yStart = y1 - rad1 - radW - 5 <= 0 ? radW : y1 - rad1 - radW - 5;;
			yFinish = y1 + rad1 + radW + 5 >= canvasHeight ? canvasHeight - radW : y1 + rad1 + radW + 5;
			for (var y = yStart; y < yFinish; y++) {
				dist = Math.sqrt(Math.pow((x1 - radW),2) + Math.pow((y1 - y),2)) - rad1 - radW;
				dist = Math.round(dist);
				if (dist == 0 && !overlapCheck(radW, y, radW)) {
					finPos[0] = radW;
					finPos[1] = y;
					return finPos;
				}
			}
		}
		else { // right side
			yStart = y1 - rad1 - radW - 5 <= 0 ? radW : y1 - rad1 - radW - 5;;
			yFinish = y1 + rad1 + radW + 5 >= canvasHeight ? canvasHeight - radW : y1 + rad1 + radW + 5;
			for (var y = yStart; y < yFinish; y++) {
				dist = Math.sqrt(Math.pow((x1 - canvasWidth + radW),2) + Math.pow((y1 - y),2)) - rad1 - radW;
				dist = Math.round(dist);
				if (dist == 0 && !overlapCheck(canvasWidth - radW, y, radW)) {
					finPos[0] = canvasWidth - radW;
					finPos[1] = y;
					return finPos;
				}
			}
		}
	}
	else { // check tangency between two circles
			xStart = x1 - rad1 - radW <  x2 - rad2 - radW ? x1 - rad1 - radW : x2 - rad2 - radW;
			xFinish = x1 + rad1 + radW < x2 + rad2 + radW ? x2 + rad2 + radW : x1 + rad1 + radW;
			yStart = y1 - rad1 - radW < y2 - rad2 - radW  ? y1 - rad1 - radW : y2 - rad2 - radW ;
			yFinish = y1 + rad1 + radW < y2 + rad2 + radW ? y2 + rad2 + radW: y1 + rad1 + radW;
			for (var x = xStart; x < xFinish; x++) {
				for (var y = yStart; y < yFinish; y++) {
					dist = Math.sqrt(Math.pow(x1 - x,2) + Math.pow(y1 - y,2)) - rad1 - radW;
					dist = Math.round(dist);
					dist2 = Math.sqrt(Math.pow(x2 - x,2) + Math.pow(y2 - y,2)) - rad2 - radW;
					dist2 = Math.round(dist2);
					if (dist == 0 && dist2 == 0 && !overlapCheck(x, y, radW)) {
						finPos[0] = x;
						finPos[1] = y;
						return finPos;
					}
				}
			}
	}
	return finPos;
}

// returns true if overlap is found within words / circles in the container
function overlapCheck(x, y, rad) {
	var dist = 0;
	
	if (x < rad || x > canvasWidth - rad) { // check if outside canvas width
		return true;
	}
	if (y < rad || y > canvasHeight - rad) { // check if outside canvas height
		return true;
	}
	for (var i = 0; i < poem.length;i++){ // check overlap with other words
		if (poem[i].posFinal) {	// only checks circles in the container
			dist = Math.sqrt(Math.pow((poem[i].xPosFinal - x),2) + Math.pow((poem[i].yPosFinal - y),2)) - poem[i].radius - rad;
			dist = Math.round(dist);
			if (dist < 0) {
				return true;
			}
		}
	}
	return false;
}

// prints the results of the optimization to console
function poemFinalPosPrint(){
	for (var i = 0; i < poem.length;i++) {
		console.log(poem[i].text + ", " + poem[i].line + ", " + poem[i].wordNo + ": " + poem[i].xPosFinal + ", " + poem[i].yPosFinal + " | " + poem[i].locked);
	}
}

// calling function from 'show circles' link
function poemShowCircle() {
	pDraw = !pDraw;
	if (pDraw) {
		showHideLink.innerHTML = "Hide circles";
	}
	else {
		showHideLink.innerHTML = "Show circles";
	}
	if (showCircles) {
		pContext.clearRect(0, 0, pCanvasElement.width, pCanvasElement.height);
		pContext.fillStyle = "#191919";
		pContext.fillRect(0,0,pCanvasElement.width, pCanvasElement.height);
		for (var i = 0; i < poem.length;i++) {
			poem[i].drawWord(pDraw, speedStep, false);	
		}
	}
}

// calling function from 'play' icon
function poemStart() {
	var audio = new Audio('poe.mp3');	
	if (!startButton.disabled) {
		displayText.innerHTML = "Alone by EA Poe";
		startButton.disabled = true;
		audio.play();
		setTimeout(function(){ 
			poemAnimate();
		}, 3000);
	}
}

function initplay(canvasElement, startButton, displayText, showHideLink, divID) {
    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
	canvasElement.id = "a";
    }
	var div = document.getElementById(divID);
    div.appendChild(canvasElement);
	//document.body.appendChild(canvasElement);
	
    pCanvasElement = canvasElement;
	pContext = pCanvasElement.getContext("2d");
	
	pCanvasElement.width = canvasWidth;
    pCanvasElement.height = canvasHeight;
    //pCanvasElement.addEventListener("click", playOnClick, false);
	//pButton = startButton;
	pDraw = false;
	showCircles = false;
	poemComplete = false;
	alphaTitle = 0.5;
	speedStep = 0.1;
	speedCount = 0;
	
	poemStartPosition();
	//poemCirclePacking();
	//poemFinalPosPrint();
}
