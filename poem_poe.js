var canvasWidth = 550;
var canvasHeight = 800;

var pCanvasElement;
var pContext;
var poem = new Array();
var doneAnimation = new Array();
var poemComplete = true;

window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	  window.setTimeout(callback, 10000 / 60);
	};
  })();

function Word(text, xPos, yPos, line, speed, xPosFinal, yPosFinal, wordNo) {
	this.xPos = xPos;
    this.yPos = yPos;
    this.text = text;
	this.line = line;
	this.speed = speed;
	this.xPosFinal = xPosFinal;
	this.yPosFinal = yPosFinal;
	this.wordNo = wordNo;
	
	this.radius = Math.round(text.length * 7);
	this.step = 0;
}

Word.prototype.drawWord = function(draw) {
	var goingUp, goingDown, goingRight, goingLeft, doneX2, doneY2;
	goingUp = false;
	goingDown = false;
	goingRight = false;
	goingLeft = false;
	doneX = doneAnimation[this.wordNo*2];
	doneY = doneAnimation[this.wordNo*2 + 1];

	this.step = 0.5;

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
	
	if (doneX && doneY) {
		doneAnimation[this.wordNo*2] = doneX;
		doneAnimation[this.wordNo*2+1] = doneY;
		this.xPos=this.xPosFinal;
		this.yPos=this.yPosFinal;
	}
	pContext.font = "bold 16px sans-serif";
	pContext.fillStyle = "#000000";
	pContext.fillText(this.text, this.xPos, this.yPos);
	if (draw) {
		var offsetY = 8; //half of font size
		var offsetX = Math.round(this.text.length*4);
		
		pContext.beginPath();
		pContext.arc(this.xPos + offsetX, this.yPos - offsetY, this.radius, 0, Math.PI*2, false);
		pContext.strokeStyle = "#000000";
		pContext.stroke();	
	}
	
};

function animate(){
	pContext.clearRect(0, 0, pCanvasElement.width, pCanvasElement.height);

	for (var i = 0; i < poem.length;i++) {
		poem[i].drawWord(true);
		if (!doneAnimation[i] || !doneAnimation[i+1]){
			poemComplete = false;
		}
		else {
			poemComplete = true;
		}
	}
	console.log(doneAnimation);
	console.log(poemComplete);
	if (poemComplete) {
		return;
	}
	else {
		// request new frame
		requestAnimFrame(animate);
	}
}

function playOnClick(e) {
    //var cell = getCursorPosition(e);

}

function poemStartPosition() {
	//pContext.fillStyle = "#000000";
	//pContext.fillRect(0,0,canvasWidth,canvasHeight);
	
	poem = [new Word("From",50,750,1,1,50,50, 0),
			new Word("childhood's",103,750,1,1,100,100, 1),
			new Word("hour",205,750,1,1,180,100, 2),
			new Word("I",250,750,1,1,220,100, 3),
			new Word("have",263,750,1,1,250,100, 4),
			new Word("not",310,750,1,1,650,100, 5),
			new Word("been",345,750,1,1,600,100, 6)
			];
	console.log(pContext.measureText(poem[1].text).width + poem[1].xPos+25);
			
	pContext.font = "bold 16px sans-serif";
	pContext.fillStyle = "#000000";
	for (var i = 0; i < poem.length;i++){
		pContext.fillText(poem[i].text, poem[i].xPos, poem[i].yPos);
	}
}

function poemCirclePacking() {
	for (var i = 0; i < poem.length - 1;i++){
		for (var j = i + 1; j < poem.length; j++){
			
		}
	}
	
}

function poemAnimate() {
	for (var i = 0; i < 2* poem.length;i++) {
		doneAnimation[i] = false;
	}
	animate();
	console.log("DONE");
	console.log("DONE2");

/*

From childhood’s hour I have not been
As others were—I have not seen
As others saw—I could not bring
My passions from a common spring—
From the same source I have not taken
My sorrow—I could not awaken
My heart to joy at the same tone—
And all I lov’d—I lov’d alone—
Then—in my childhood—in the dawn
Of a most stormy life—was drawn
From ev’ry depth of good and ill
The mystery which binds me still—
From the torrent, or the fountain—
From the red cliff of the mountain—
From the sun that ’round me roll’d
In its autumn tint of gold—
From the lightning in the sky
As it pass’d me flying by—
From the thunder, and the storm—
And the cloud that took the form
(When the rest of Heaven was blue)
Of a demon in my view—

font can be anything you would put in a CSS font rule. That includes font style, font variant, font weight, font size, line height, and font family.
textAlign controls text alignment. It is similar (but not identical) to a CSS text-align rule. Possible values are start, end, left, right, and center.
textBaseline controls where the text is drawn relative to the starting point. Possible values are top, hanging, middle, alphabetic, ideographic, or bottom.

*/

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
	
	poemStartPosition();
	poemCirclePacking();
	
	//poemAnimate();

}
