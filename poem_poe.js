var canvasWidth = 550;
var canvasHeight = 1600;

var pCanvasElement;
var pContext;
var poem = new Array();
var doneAnimation = new Array();
var poemComplete;

// request animation frame for browser cross compatibility
window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	  window.setTimeout(callback, 10000 / 60);
	};
  })();

// object for possible placement of a circle in the container
function Place(xPos, yPos, radius, tangent1, tangent2, lambda, wordNo) {
	this.xPos = xPos;
    this.yPos = yPos;
    this.radius = radius;
	this.tangent1 = tangent1; // -100 = top side, -200 = left side, -300 = right side
	this.tangent2 = tangent2; // -100 = top side, -200 = left side, -300 = right side
	this.lambda = lambda;
	this.wordNo = wordNo;
}

// object for each word of the poem  
function Word(text, xPos, yPos, line, posFinal, xPosFinal, yPosFinal, wordNo) {
	this.xPos = xPos;
    this.yPos = yPos;
    this.text = text;
	this.line = line;
	this.posFinal = posFinal; // indicates whether circle is in its final position
	this.xPosFinal = xPosFinal; // final 'x' position calculated by optimization
	this.yPosFinal = yPosFinal; // final 'y' position calculated by optimization
	this.wordNo = wordNo;
	
	this.locked = false; // indicates whether circle is surrounded by other circles
	var length = pContext.measureText(text).width + 3;
	
	this.radius = Math.round(length*1.3);
	this.step = 0;
}

// sets final position of circle based on optimization 
Word.prototype.setPos = function(xPosFinal,yPosFinal,posFinal) {
	this.xPosFinal = xPosFinal;
	this.yPosFinal = yPosFinal;
	this.posFinal = posFinal;
}

// draws word and keeps track of animating movement
Word.prototype.drawWord = function(draw) {
	var goingUp, goingDown, goingRight, goingLeft, doneX2, doneY2;
	goingUp = false;
	goingDown = false;
	goingRight = false;
	goingLeft = false;
	doneX = doneAnimation[this.wordNo*2];
	doneY = doneAnimation[this.wordNo*2 + 1];

	this.step = 0.5; // determines speed of movement, linear motion for this example (can be made more interesting / realistic)

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
	
	// draw text
	pContext.font = "bold 16px sans-serif";
	pContext.fillStyle = "#000000";
	var offsetY = 8; //half of font size
	var offsetX = Math.round(this.radius/2);
	pContext.fillText(this.text, this.xPos - offsetX, this.yPos + offsetY);
	
	// draws circle around word (if 'draw' is true)
	if (draw) {
		
		pContext.beginPath();
		pContext.arc(this.xPos, this.yPos, this.radius, 0, Math.PI*2, false);
		pContext.strokeStyle = "#000000";
		pContext.stroke();	
	}
	
};

// animates the poem
function animate(){
	pContext.clearRect(0, 0, pCanvasElement.width, pCanvasElement.height);
	
	poemComplete = true;
	for (var i = 0; i < poem.length;i++) {
		poem[i].drawWord(true);
		if (!doneAnimation[i*2] || !doneAnimation[i*2 + 1]){ 
			poemComplete = false;
		}
	}
	//console.log(doneAnimation);
	//console.log(poemComplete);
	if (poemComplete) {
		return;
	}
	else {
		// request new frame
		requestAnimFrame(animate);
	}
}

// interaction
function playOnClick(e) {
    //var cell = getCursorPosition(e);

}

// initializes poem
function poemStartPosition() {
	//pContext.fillStyle = "#000000";
	//pContext.fillRect(0,0,canvasWidth,canvasHeight);

	poem = [new Word("From",50,750,1,false,0,0, 0),
			new Word("childhood's",103,750,1,false,0,0, 1),
			new Word("hour",205,750,1,false,0,0, 2),
			new Word(" I ",250,750,1,false,0,0, 3),
			new Word("have",263,750,1,false,0,0, 4),
			new Word("not",310,750,1,false,0,0, 5),
			new Word("been",345,750,1,false,0,0, 6),
			new Word("As",345,750,2,false,0,0, 7),
			new Word("others",345,750,2,false,0,0, 8),
			new Word("were",345,750,2,false,0,0, 9),
			new Word(" - ",345,750,2,false,0,0, 10),
			new Word(" I ",345,750,2,false,0,0, 11),
			new Word("have",345,750,2,false,0,0, 12),
			new Word("not",345,750,2,false,0,0, 13),
			new Word("seen",345,750,2,false,0,0, 14),
			new Word("As",345,750,3,false,0,0, 15),
			new Word("others",345,750,3,false,0,0, 16),
			new Word("saw",345,750,3,false,0,0, 17),
			new Word(" - ",345,750,3,false,0,0, 18),
			new Word(" I ",345,750,3,false,0,0, 19),
			new Word("could",345,750,3,false,0,0, 20),
			new Word("not",345,750,3,false,0,0, 21),
			new Word("bring",345,750,3,false,0,0, 22),
			new Word("My",345,750,4,false,0,0, 23),
			new Word("passions",345,750,4,false,0,0, 24),
			new Word("from",345,750,4,false,0,0, 25),
			new Word(" a ",345,750,4,false,0,0, 26),
			new Word("common",345,750,4,false,0,0, 27),
			new Word("spring",345,750,4,false,0,0, 28),
			new Word("From",345,750,5,false,0,0, 29),
			new Word("the",345,750,5,false,0,0, 30),
			new Word("same",345,750,5,false,0,0, 31),
			new Word("source",345,750,5,false,0,0, 32),
			new Word(" I ",345,750,5,false,0,0, 33),
			new Word("have",345,750,5,false,0,0, 34),
			new Word("not",345,750,5,false,0,0, 35),
			new Word("taken",345,750,5,false,0,0, 36),
			new Word("My",345,750,6,false,0,0, 37),
			new Word("sorrow",345,750,6,false,0,0, 38),
			new Word(" - ",345,750,6,false,0,0, 39),
			new Word(" I ",345,750,6,false,0,0, 40),
			new Word("could",345,750,6,false,0,0,41),
			new Word("not",345,750,6,false,0,0, 42),
			new Word("awaken",345,750,6,false,0,0, 43),
			new Word("My",345,750,7,false,0,0, 44),
			new Word("heart",345,750,7,false,0,0, 45),
			new Word("to",345,750,7,false,0,0, 46),
			new Word("joy",345,750,7,false,0,0, 47),
			new Word("at",345,750,7,false,0,0, 48),
			new Word("the",345,750,7,false,0,0, 49),
			new Word("same",345,750,7,false,0,0, 50),
			new Word("tone",345,750,7,false,0,0, 51),
			new Word(" - ",345,750,7,false,0,0, 52),
			new Word("And",345,750,8,false,0,0, 53),
			new Word("all",345,750,8,false,0,0, 54),
			new Word("I",345,750,8,false,0,0, 55),
			new Word("lov'd",345,750,8,false,0,0, 56),
			new Word(" - ",345,750,8,false,0,0, 57),
			new Word(" I ",345,750,8,false,0,0, 58),
			new Word("lov'd",345,750,8,false,0,0, 59),
			new Word("alone",345,750,8,false,0,0, 60),
			new Word(" - ",345,750,8,false,0,0, 61),
			new Word("Then",345,750,9,false,0,0, 62),
			new Word(" - ",345,750,9,false,0,0, 63),
			new Word("in",345,750,9,false,0,0, 64),
			new Word("my",345,750,9,false,0,0, 65),
			new Word("childhood",345,750,9,false,0,0, 66),
			new Word(" - ",345,750,9,false,0,0, 67),
			new Word("in",345,750,9,false,0,0, 68),
			new Word("the",345,750,9,false,0,0, 69),
			new Word("dawn",345,750,9,false,0,0, 70),
			new Word("Of",345,750,10,false,0,0, 71),
			new Word("a",345,750,10,false,0,0, 72),
			new Word("most",345,750,10,false,0,0, 73),
			new Word("stormy",345,750,10,false,0,0, 74),
			new Word("life",345,750,10,false,0,0, 75),
			new Word(" - ",345,750,10,false,0,0, 76),
			new Word("was",345,750,10,false,0,0, 77),
			new Word("drawn",345,750,10,false,0,0, 78),
			new Word("From",345,750,11,false,0,0, 79),
			new Word("ev'ry",345,750,11,false,0,0, 80),
			new Word("depth",345,750,11,false,0,0, 81),
			new Word("of",345,750,11,false,0,0, 82),
			new Word("good",345,750,11,false,0,0, 83),
			new Word("and",345,750,11,false,0,0, 84),
			new Word("ill",345,750,11,false,0,0, 85),
			new Word("The",345,750,12,false,0,0, 86),
			new Word("mystery",345,750,12,false,0,0, 87),
			new Word("which",345,750,12,false,0,0, 88),
			new Word("binds",345,750,12,false,0,0, 89),
			new Word("me",345,750,12,false,0,0, 90),
			new Word("still",345,750,12,false,0,0, 91),
			new Word(" - ",345,750,12,false,0,0, 92),
			new Word("From",345,750,13,false,0,0, 93),
			new Word("the",345,750,13,false,0,0, 94),
			new Word("torrent,",345,750,13,false,0,0, 95),
			new Word("or",345,750,13,false,0,0, 96),
			new Word("the",345,750,13,false,0,0, 97),
			new Word("fountain",345,750,13,false,0,0, 98),
			new Word(" - ",345,750,13,false,0,0, 99),
			new Word("From",345,750,14,false,0,0, 100),
			new Word("the",345,750,14,false,0,0, 101),
			new Word("red",345,750,14,false,0,0, 102),
			new Word("cliff",345,750,14,false,0,0, 103),
			new Word("of",345,750,14,false,0,0, 104),
			new Word("the",345,750,14,false,0,0, 105),
			new Word("mountain",345,750,14,false,0,0, 106),
			new Word(" - ",345,750,14,false,0,0, 107),
			new Word("From",345,750,15,false,0,0, 108),
			new Word("the",345,750,15,false,0,0, 109),
			new Word("sun",345,750,15,false,0,0, 110),
			new Word("that",345,750,15,false,0,0, 111),
			new Word("'round",345,750,15,false,0,0, 112),
			new Word("me",345,750,15,false,0,0, 113),
			new Word("roll'd",345,750,15,false,0,0,114),
			new Word("In",345,750,16,false,0,0, 115),
			new Word("its",345,750,16,false,0,0, 116),
			new Word("autumn",345,750,16,false,0,0, 117),
			new Word("tint",345,750,16,false,0,0, 118),
			new Word("of",345,750,16,false,0,0, 119),
			new Word("gold",345,750,16,false,0,0, 120),
			new Word(" - ",345,750,16,false,0,0, 121),
			new Word("From",345,750,17,false,0,0, 122),
			new Word("the",345,750,17,false,0,0, 123),
			new Word("lightning",345,750,17,false,0,0, 124),
			new Word("in",345,750,17,false,0,0, 125),
			new Word("the",345,750,17,false,0,0, 126),
			new Word("sky",345,750,17,false,0,0, 127),
			new Word("As",345,750,18,false,0,0, 128),
			new Word("it",345,750,18,false,0,0, 129),
			new Word("pass'd",345,750,18,false,0,0, 130),
			new Word("me",345,750,18,false,0,0, 131),
			new Word("flying",345,750,18,false,0,0, 132),
			new Word("by",345,750,18,false,0,0, 133),
			new Word(" - ",345,750,18,false,0,0, 134),
			new Word("From",345,750,19,false,0,0, 135),
			new Word("the",345,750,19,false,0,0, 136),
			new Word("thunder,",345,750,19,false,0,0, 137),
			new Word("and",345,750,19,false,0,0, 138),
			new Word("the",345,750,19,false,0,0, 139),
			new Word("storm",345,750,19,false,0,0, 140),
			new Word(" - ",345,750,19,false,0,0, 141),
			new Word("And",345,750,20,false,0,0, 142),
			new Word("the",345,750,20,false,0,0, 143),
			new Word("cloud",345,750,20,false,0,0, 144),
			new Word("that",345,750,20,false,0,0, 145),
			new Word("took",345,750,20,false,0,0, 146),
			new Word("the",345,750,20,false,0,0, 147),
			new Word("form",345,750,20,false,0,0, 148),
			new Word("(When",345,750,21,false,0,0, 149),
			new Word("the",345,750,21,false,0,0, 150),
			new Word("rest",345,750,21,false,0,0, 151),
			new Word("of",345,750,21,false,0,0, 152),
			new Word("Heaven",345,750,21,false,0,0, 153),
			new Word("was",345,750,21,false,0,0, 154),
			new Word("blue)",345,750,21,false,0,0, 155),
			new Word("Of",345,750,22,false,0,0, 156),
			new Word("a",345,750,22,false,0,0, 157),
			new Word("demon",345,750,22,false,0,0, 158),
			new Word("in",345,750,22,false,0,0, 159),
			new Word("my",345,750,22,false,0,0, 160),
			new Word("view",345,750,22,false,0,0, 161)
			]; 
			
	pContext.font = "bold 16px sans-serif";
	pContext.fillStyle = "#000000";
	for (var i = 0; i < poem.length;i++){
		pContext.fillText(poem[i].text, poem[i].xPos, poem[i].yPos);
	}
}

// optimizes to fit unequal circles into the rectangular container, see pseudocode for details
function poemCirclePacking() {
	var placements = new Array();
	var lambda, highestY, newX, newY;
	
	//first two words are placed in opposing corners
	poem[0].setPos(poem[0].radius, poem[0].radius, true);
	poem[1].setPos(canvasWidth - poem[1].radius, poem[1].radius, true);
	
	tempDrawCircle(poem[0].xPosFinal,poem[0].yPosFinal,poem[0].radius, false);
	tempDrawCircle(poem[1].xPosFinal,poem[1].yPosFinal,poem[1].radius, false);
	
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
			if (k == 40) {
				tempDrawCircle(placements[i].xPos,placements[i].yPos,placements[i].radius, true);
			}
		}
		poem[k].setPos(newX, newY, true);
		if (k == 40) {
			tempDrawCircle(poem[k].xPosFinal,poem[k].yPosFinal,poem[k].radius, true);
		}
		else {
			tempDrawCircle(poem[k].xPosFinal,poem[k].yPosFinal,poem[k].radius, false);
		}
		
	}
}

// debugging function, draws circles
function tempDrawCircle(x,y,rad, check){
		pContext.beginPath();
		pContext.arc(x, y, rad, 0, Math.PI*2, false);
		if (check) {
			pContext.strokeStyle = "#FF0000";
		}
		else {
			pContext.strokeStyle = "#000000";
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


// calling function to animate poem
function poemAnimate() {
	for (var i = 0; i < 2* poem.length;i++) {
		doneAnimation[i] = false;
	}
	animate();
}


function initplay(canvasElement) {
    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
	canvasElement.id = "a";
	document.body.appendChild(canvasElement);
    }
    pCanvasElement = canvasElement;
	pContext = pCanvasElement.getContext("2d");
	
	pCanvasElement.width = canvasWidth;
    pCanvasElement.height = canvasHeight;
    pCanvasElement.addEventListener("click", playOnClick, false);
	poemComplete = true;
	
	poemStartPosition();
	//poemCirclePacking();
	//poemFinalPosPrint();
	
	//var audio = new Audio('poe.mp3');
	//audio.play();
	
	//poemAnimate();
}
