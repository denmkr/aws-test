import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { PositionProcessingService } from '../position-processing.service';
import { DraggableObject } from './draggableobject';
import { VideoLoupe } from './video-loupe';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VideoComponent implements OnInit {
  
  @Output() writeEvent = new EventEmitter<any>();

  @Output() dehighlightBallPoint = new EventEmitter<any>();
  @Output() highlightBallPoint = new EventEmitter<any>();
  @Output() dehighlightPlayerPoints = new EventEmitter<any>();
  @Output() highlightPlayerPoint = new EventEmitter<any>();
  @Output() resetAllPoints = new EventEmitter<any>();
  @Output() showPlayerPoint = new EventEmitter<any>();
  @Output() showPoint = new EventEmitter<any>();
  @Output() activatePoint = new EventEmitter<any>();
  @Output() highlightPoint = new EventEmitter<any>();
  @Output() disactivatePoint = new EventEmitter<any>();
  @Output() calibrationMode = new EventEmitter<any>();

  @Output() eventType = new EventEmitter<any>();
  @Output() playerShot = new EventEmitter<any>();
  @Output() strokeSide = new EventEmitter<any>();
  @Output() serveSideAd = new EventEmitter<any>();
  @Output() positionsStatus = new EventEmitter<any>();

  @ViewChild('video', { static: true }) video: ElementRef;
  @ViewChild('frame', { static: true }) frame: ElementRef;
  @ViewChild('p1Label', { static: true }) p1Label: ElementRef;
  @ViewChild('p2Label', { static: true }) p2Label: ElementRef;
  @ViewChild('ballLabel', { static: true }) ballLabel: ElementRef;

  @ViewChild('settingsButton', { static: true }) settingsButton: ElementRef;
  @ViewChild('settingsWindow', { static: true }) settingsWindow: ElementRef;

  videoButtonText: string = "Video file";
  ballDataText: string = "Ball data csv";
  playersDataText: string = "Players data csv";
  handSettingsActive: boolean = false;

  p1RightButtonActive: boolean = true;
  p2RightButtonActive: boolean = true;

  courtPosition: string;

  widthDiv: number;
  heightDiv: number;

  next: boolean;
  frameNum: number;
  frames: Array<number>;
  currentPoint: number;

  frameRate: number;
  frameDiff: number;

  data: Array<any>;
  playersData: Array<any>;

  outputData: Array<any>;
  pointsData: Array<any>;
  gamesData: Array<any>;
  setsData: Array<any>;
  eventStateData: Array<any> = [];
  previousPointEventStateData: Array<any> = [];
  previousPointOutputData: Array<any> = [];

  currentGameNumber: number = 0;
  currentPointNumber: number = 0;
  currentSetNumber: number = 0;
  currentEventNumber: number = 0;
  currentHittingPlayer: number = 1;

  currentEvent: any;
  isServe: boolean;

  isPlayersChoosingMode: boolean;
  currentPlayerChoosing: number;

  isCalibrationMode: boolean;
  isCalibrationReady: boolean;
  calibrationPoints: Array<any> = [];

  loupeTimeOut: any;
  loupe: any;

  /* Params for wheel speed */ 
  WHEEL_SPEED_1: number = 5; // Ctrl key
  WHEEL_SPEED_2: number = 20; // Shift key
  WHEEL_SPEED_3: number = 50; // Ctrl + Shift key

  constructor(private positionProcessingService: PositionProcessingService) { }

  ngOnInit() {
  	let video = this.video.nativeElement;

  	const originalWidth = 1920; // 1280
  	const originalHeight = 1080; // 720

  	this.widthDiv = originalWidth / video.width;
  	this.heightDiv = originalHeight / video.height;

    let draggableBall = new DraggableObject(this.ballLabel.nativeElement);
    let draggableP1 = new DraggableObject(this.p1Label.nativeElement);
    let draggableP2 = new DraggableObject(this.p2Label.nativeElement);

    this.isPlayersChoosingMode = false;
    this.currentPlayerChoosing = 1;

  	this.isCalibrationMode = false;
    this.isCalibrationReady = false;
  	this.next = true;
  	this.frameNum = 0;

  	this.frames = [];

  	this.data = [];
    this.playersData = [];
    this.outputData = [];
    this.pointsData = [];
    this.gamesData = [];
    this.setsData = [];

    this.courtPosition = 'Unknown';

    this.frameRate = 29.97;
    this.frameDiff = 0;

    this.currentEvent = {};

  }

  /*** Listeners ***/

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event) { 
    if (event.code === 'Enter' || event.code === 'ShiftLeft' || event.code === 'ShiftRight')
      return;

    if (this.isCalibrationMode) 
      return;

    clearTimeout(this.loupeTimeOut);

    this.resetLabels();
    this.currentPlayerChoosing = 1;
    this.isPlayersChoosingMode = false;
    this.dehighlightPlayerPoints.emit(true);
    this.resetAllPoints.emit(true);

  	let video = this.video.nativeElement;
    const frames = this.frames;

  	// (video.currentTime * 29.97).toPrecision(6)
  	if (event.code === 'ArrowUp') video.currentTime += (1 / this.frameRate);
  	if (event.code === 'ArrowDown') video.currentTime -= (1 / this.frameRate);
    if (event.code === 'Space') {
      if (video.paused) this.nextKeyFrame();
      else video.pause();
    }
    else if (!video.paused) video.pause();

    // Create a new loupe for the video
    this.loupeTimeOut = setTimeout(() => {
      this.updateLoupe();
    }, 200);

    while (video.currentTime < frames[this.frameNum] / this.frameRate) this.frameNum--;

    let currentFrame = Math.round(video.currentTime * this.frameRate) + this.frameDiff;
  	const frame = this.data[currentFrame];
    const playersFrame = this.playersData[currentFrame];

    let time = this.getTime(video.currentTime);

    if (frame !== undefined) {
      const ballX = frame['ball_x'];
      const ballY = frame['ball_y'];

      if (ballX !== '' && ballY !== '') {
        this.processBall(ballX, ballY);
      }

      // time = this.getTime(frame['frame'] / this.frameRate);
    }

    if (playersFrame !== undefined) {
      /* PLAYERS */
      let player1X = playersFrame['player1_x'];
      let player1Y = playersFrame['player1_y'];
      let player2X = playersFrame['player2_x'];
      let player2Y = playersFrame['player2_y'];

      if (player1X !== '' && player1Y !== '') {
        this.processPlayers(player1X, player1Y, 1);
      }
      else {
        this.currentPlayerChoosing = 1;
        this.isPlayersChoosingMode = true;
        this.highlightPlayerPoint.emit(1);
      }

      if (player2X !== '' && player2Y !== '') {
        this.processPlayers(player2X, player2Y, 2);
      }
    }

    this.checkLabelChoosing();

    this.currentEvent['timestamp'] = time;
  }

  @HostListener('wheel', ['$event'])
  onWheelScroll(event: WheelEvent) {
    if (this.isCalibrationMode) 
      return;

    clearTimeout(this.loupeTimeOut);
    //this.loupe.remove();

    // Change wheel scroll speed
    const scrollSpeedAccelerator = this.getScrollSpeedAccelerator(event);

    this.resetLabels();
    this.currentPlayerChoosing = 1;
    this.isPlayersChoosingMode = false;
    this.dehighlightPlayerPoints.emit(true);
    this.resetAllPoints.emit(true);

  	let video = this.video.nativeElement;
  	const frames = this.frames;
  	const delta = event.deltaY || event.detail;

  	if (!video.paused) video.pause();

  	if (delta > 0) video.currentTime += (1 / this.frameRate) * scrollSpeedAccelerator;
  	else {
      video.currentTime -= (1 / this.frameRate) * scrollSpeedAccelerator;
      while (video.currentTime < frames[this.frameNum] / this.frameRate) this.frameNum--;
  	}

    // Create a new loupe for the video
    this.loupeTimeOut = setTimeout(() => {
      this.updateLoupe();
    }, 200);
    

  	let currentFrame = Math.round(video.currentTime * this.frameRate) + this.frameDiff;
  	const frame = this.data[currentFrame];
    const playersFrame = this.playersData[currentFrame];

    let time = this.getTime(video.currentTime);

    if (frame !== undefined) {
      const ballX = frame['ball_x'];
      const ballY = frame['ball_y'];

      if (ballX !== '' && ballY !== '') {
        this.processBall(ballX, ballY);
      }

      //time = this.getTime(frame['frame'] / this.frameRate);
    }

    if (playersFrame !== undefined) {
      /* PLAYERS */
      let player1X = playersFrame['player1_x'];
      let player1Y = playersFrame['player1_y'];
      let player2X = playersFrame['player2_x'];
      let player2Y = playersFrame['player2_y'];

      if (player1X !== '' && player1Y !== '') {
        this.processPlayers(player1X, player1Y, 1);
      }
      else {
        this.isPlayersChoosingMode = true;
        this.highlightPlayerPoint.emit(1);
      }

      if (player2X !== '' && player2Y !== '') {
        this.processPlayers(player2X, player2Y, 2);
      }
    }

    this.checkLabelChoosing();

    this.currentEvent['timestamp'] = time;
  }

  /*** Functions ***/
  getScrollSpeedAccelerator(event) {
    let scrollSpeedAccelerator = 1;

    if (event.ctrlKey) scrollSpeedAccelerator = this.WHEEL_SPEED_1;
    if (event.shiftKey) scrollSpeedAccelerator = this.WHEEL_SPEED_2;
    if (event.ctrlKey && event.shiftKey) scrollSpeedAccelerator = this.WHEEL_SPEED_3;

    return scrollSpeedAccelerator;
  }

  syncBack() {
    let video = this.video.nativeElement;

    this.frameDiff--;
    this.onKeyDown({code: 'ArrowUp'});
    this.onKeyDown({code: 'ArrowDown'});
  }

  syncForward() {
  	/*
    let video = this.video.nativeElement;
    let currentFrame = Math.floor(video.currentTime * this.frameRate);
    const wrongVideoCurrentTime = video.currentTime;

    video.currentTime = currentFrame / this.frameRate;

    if (video.currentTime < wrongVideoCurrentTime)
    	*/
    let video = this.video.nativeElement;
    
    this.frameDiff++;
    this.onKeyDown({code: 'ArrowUp'});
    this.onKeyDown({code: 'ArrowDown'});
  }

  videoPaused() {
  	let video = this.video.nativeElement;

  	let currentFrame = Math.round(video.currentTime * this.frameRate) + this.frameDiff;
  	let frame = this.data[currentFrame];

    let playersFrame = this.playersData[currentFrame];

    this.isPlayersChoosingMode = false;

    // Create a new loupe for the video
    this.updateLoupe();

    if (frame !== undefined) {
      let ballX = frame['ball_x'];
      let ballY = frame['ball_y'];

      if (currentFrame === this.frames[this.frameNum]) {
      	// frame = this.data[this.frames[this.frameNum]]
      	ballX = frame['key_event_x'];
      	ballY = frame['key_event_y'];
      }
      
      if (ballX !== '' && ballY !== '') {
      	this.processBall(ballX, ballY);
      	this.processEvent(frame);

        this.resetAllPoints.emit(true);
      }
    }

    if (playersFrame !== undefined) {
      /* PLAYERS */
      let player1X = playersFrame['player1_x'];
      let player1Y = playersFrame['player1_y'];
      let player2X = playersFrame['player2_x'];
      let player2Y = playersFrame['player2_y'];

      if (player1X !== '' && player1Y !== '') {
        this.processPlayers(player1X, player1Y, 1);
      }

      if (player2X !== '' && player2Y !== '') {
        this.processPlayers(player2X, player2Y, 2);
      }
    }

    this.checkLabelChoosing();

  }

  checkLabelChoosing() {
    if (this.ballLabel.nativeElement.style.display !== 'block') {
      this.isPlayersChoosingMode = false;
      this.highlightBallPoint.emit();
      this.dehighlightPlayerPoints.emit();
    }
    else {
      this.dehighlightBallPoint.emit();
      if (this.p1Label.nativeElement.style.display !== 'block') {
        this.isPlayersChoosingMode = true;
        this.currentPlayerChoosing = 1;
        this.highlightPlayerPoint.emit(1);
      }
      else {
        if (this.p2Label.nativeElement.style.display !== 'block') {
          this.isPlayersChoosingMode = true;
          this.currentPlayerChoosing = 2;
          this.highlightPlayerPoint.emit(2);
        }
        else {
          this.isPlayersChoosingMode = false;
          this.currentPlayerChoosing = 1;

          // Finish locations specifying
          this.positionsStatus.emit(true);

          if (this.currentEventNumber === 0 || this.isServe) this.updateEventPanel();
          else this.updateEventPanelByPlayer(this.currentHittingPlayer, true);
        }
      }
    }
  }

  processEvent(data) {
    // console.log(this.getTime(this.video.nativeElement.currentTime));
    // time: 0.674011, position: {x: 993, y: 314}, event: "hit", side: "Forehand", player: 1

    //const time = this.getTime(data.frame / this.frameRate);
    const time = this.getTime(this.video.nativeElement.currentTime);

    const event = data.event;
    const side = data.side;
    const player = data.player;

    //this.eventType.emit(event);
    //this.playerShot.emit(player);
    //this.strokeSide.emit(side);

    this.currentEvent['eventType'] = (event === undefined) ? '' : event;
    this.currentEvent['hittingPlayerID'] = (player === undefined) ? '' : player;
    this.currentEvent['strokeSide'] = (side === undefined) ? '' : side;
    this.currentEvent['strokeType'] = '';
    this.currentEvent['timestamp'] = time;

    this.currentEvent['player1X'] = '';
    this.currentEvent['player1Y'] = '';
    this.currentEvent['player2X'] = '';
    this.currentEvent['player2Y'] = '';
  }

  processBall(x, y) {
    const transformedX = x / this.widthDiv;
    const transformedY = y / this.heightDiv;

    this.ballLabel.nativeElement.style.display = 'block';
    this.ballLabel.nativeElement.style.left = `${transformedX}px`;
    this.ballLabel.nativeElement.style.top = `${transformedY}px`;

    this.positionProcessingService.getCourtPositionOfPoint(x, y).subscribe(point => {
      // Show position on court only if bounce
      //if (this.data[this.frameNum].event === 'bounce') 
      this.showPoint.emit({x: point[0], y: point[1]});

      this.currentEvent['ballX'] = point[0];
      this.currentEvent['ballY'] = point[1];
    });

    this.dehighlightBallPoint.emit();
    /*
    this.isPlayersChoosingMode = true;
    this.currentPlayerChoosing = 1;
    this.highlightPlayerPoint.emit(this.currentPlayerChoosing);
    */
  }

  videoPlaying() {
  	let video = this.video.nativeElement;
  	let frameNum = this.frameNum;
  	let next = this.next;
  	const frames = this.frames;
  	const frameRate = this.frameRate;
  	let frameDiff = this.frameDiff;

  	function step() {
  	  if (next && (video.currentTime >= (frames[frameNum] - frameDiff) / frameRate)) {
        video.pause();
        next = false;

        video.currentTime = (frames[frameNum] - frameDiff) / frameRate;
  	  }

  	  requestAnimationFrame(step);
  	}

	  requestAnimationFrame(step);
  }

  videoLoaded() {
  	let video = this.video.nativeElement;

  	// video.width = 1000;
  	// video.height = 562;
  	video.currentTime = 0;
  	video.autoplay = false;
  	video.muted = true;
  	video.playbackRate = 2;

    // Create a new loupe for the video
    this.createLoupe();
  }

  updateLoupe() {
    let video = this.video.nativeElement;
    this.loupe.update(video, 1.25);
  }

  createLoupe() {
    let video = this.video.nativeElement;
    let canvas = this.frame.nativeElement;

    this.loupe = new VideoLoupe(video, canvas, 1.25);
  }

  fileChanged(event) {
  	let video = this.video.nativeElement;

    const file = event.target.files[0];
    const fileURL = URL.createObjectURL(file);

    video.src = fileURL;
    this.videoButtonText = file.name;
  }

  positionsFileChanged(event) {
    let reader = new FileReader();
    let file = event.target.files[0];

    this.ballDataText = file.name;

    reader.readAsText(file);
    reader.onload = (e: any) => {
    	let csv = e.target.result;
	  	let lines = [];

      lines.push({'frame': 0, 'ball_x': '', 'ball_y': '', 'key_event_x': '', 'key_event_y': ''});

  		let allTextLines = csv.split(/\r\n|\n/);
  	    for (let i=1; i<allTextLines.length; i++) {
          let data = allTextLines[i].split(',');
          let tarr = [];
          for (let j=0; j<data.length; j++) {
          	if (data[j] !== '') data[j] = parseFloat(data[j]);
            tarr.push(data[j]);
          }

          lines.push({'frame': tarr[0], 'ball_x': tarr[1], 'ball_y': tarr[2], 'key_event_x': tarr[3], 'key_event_y': tarr[4]});
  	    }

  	    this.data = lines;
  	    this.data.map(a => { if (a['key_event_x'] !== '') this.frames.push(a.frame + 1) });
      }
  }

  playersPositionsFileChanged(event) {
    let reader = new FileReader();
    let file = event.target.files[0];

    this.playersDataText = file.name;

    reader.readAsText(file);
    reader.onload = (e: any) => {
      let csv = e.target.result;
      let lines = [];

      lines.push({'frame': 0, 'player1_x': '', 'player1_y': '', 'player2_x': '', 'player2_y': ''});

      let allTextLines = csv.split(/\r\n|\n/);
        for (let i=1; i<allTextLines.length; i++) {
          let data = allTextLines[i].split(',');
          let tarr = [];
          for (let j=0; j<data.length; j++) {
            if (data[j] !== '') data[j] = parseFloat(data[j]);
            tarr.push(data[j]);
          }

          lines.push({'frame': tarr[0], 'player1_x': tarr[1], 'player1_y': tarr[2], 'player2_x': tarr[3], 'player2_y': tarr[4]});
        }

        this.playersData = lines;
      }
  }

  resetLabels() {
    this.p1Label.nativeElement.style.display = 'none';
    this.p2Label.nativeElement.style.display = 'none';
    this.ballLabel.nativeElement.style.display = 'none';

    this.positionsStatus.emit(false);
  }

  labelMouseDown() {
    this.loupe.remove();
  }

  canvasMouseUp() {
    this.loupe.show();

    if (this.isCalibrationMode)
      return;

    if (this.isBallLabelExist()) {
      const x = parseInt(this.ballLabel.nativeElement.style.left, 10) * this.widthDiv;
      const y = parseInt(this.ballLabel.nativeElement.style.top, 10) * this.heightDiv;

      //if (this.data[this.frameNum].event === 'bounce') {
      this.positionProcessingService.getCourtPositionOfPoint(x, y).subscribe(point => {
        this.showPoint.emit({x: point[0], y: point[1]});

        this.currentEvent['ballX'] = point[0];
        this.currentEvent['ballY'] = point[1];
      });
      //}
    }

    if (this.isLabelExistOfPlayer(1)) {
      let transformedX = parseInt(this.p1Label.nativeElement.style.left, 10) * this.widthDiv;
      let transformedY = parseInt(this.p1Label.nativeElement.style.top, 10) * this.heightDiv;

      this.positionProcessingService.getCourtPositionOfPoint(transformedX, transformedY).subscribe(point => {
        this.showPlayerPoint.emit({player: 1, x: point[0], y: point[1]});

        this.currentEvent['player1X'] = point[0];
        this.currentEvent['player1Y'] = point[1];
      });
    }

    if (this.isLabelExistOfPlayer(2)) {
      let transformedX = parseInt(this.p2Label.nativeElement.style.left, 10) * this.widthDiv;
      let transformedY = parseInt(this.p2Label.nativeElement.style.top, 10) * this.heightDiv;

      this.positionProcessingService.getCourtPositionOfPoint(transformedX, transformedY).subscribe(point => {
        this.showPlayerPoint.emit({player: 2, x: point[0], y: point[1]});

        this.currentEvent['player2X'] = point[0];
        this.currentEvent['player2Y'] = point[1];
      });
    }

    if (this.isBallLabelExist() && this.isLabelExistOfPlayer(1) && this.isLabelExistOfPlayer(2)) {
      if (this.currentEventNumber === 0 || this.isServe) this.updateEventPanel();
      else this.updateEventPanelByPlayer(this.currentHittingPlayer, true);
    }
  }

  setServe(serve) {
    this.isServe = serve;
  }

  setNextPlayer() {
    if (this.currentHittingPlayer === 1) this.currentHittingPlayer = 2;
    else this.currentHittingPlayer = 1;
  }

  isLabelExistOfPlayer(player: number) {
    let el = this.p1Label;
    if (player === 2) el = this.p2Label;
     
    if (el.nativeElement.style.display === 'none') return false;
    return true;
  }

  isBallLabelExist() {
    if (this.ballLabel.nativeElement.style.display === 'none') return false;
    return true;
  }

  canvasClicked(event) {
  	let video = this.video.nativeElement;
  	let frame = this.frame.nativeElement;

  	const widthDiv = this.widthDiv;
  	const heightDiv = this.heightDiv;

  	const framePos = frame.getBoundingClientRect();
  	const x = event.clientX - framePos.x;
  	const y = event.clientY - framePos.y;

  	console.log(`${x} ${y}`);

    /* If calibration mode is enabled */
  	if (this.isCalibrationMode) {
      this.drawCircle(x, y);
      this.processCalibration(x * widthDiv, y * heightDiv);
    }
    else {
      if (this.isPlayersChoosingMode) this.processPlayers(x * widthDiv, y * heightDiv, this.currentPlayerChoosing);
      else this.processBall(x * widthDiv, y * heightDiv);
    }

    this.checkLabelChoosing();
  }

  processPlayers(x, y, playerNum) {
    const transformedX = x / this.widthDiv;
    const transformedY = y / this.heightDiv;
    
    this.positionProcessingService.getCourtPositionOfPoint(x, y).subscribe(point => {
      this.showPlayerPoint.emit({player: playerNum, x: point[0], y: point[1]});

      this.currentEvent[`player${playerNum}X`] = point[0];
      this.currentEvent[`player${playerNum}Y`] = point[1];
    });
    
    if (playerNum === 1) {
      this.p1Label.nativeElement.style.display = 'block';
      this.p1Label.nativeElement.style.left = `${transformedX}px`;
      this.p1Label.nativeElement.style.top = `${transformedY}px`;
    }
    if (playerNum === 2) {
      this.p2Label.nativeElement.style.display = 'block';
      this.p2Label.nativeElement.style.left = `${transformedX}px`;
      this.p2Label.nativeElement.style.top = `${transformedY}px`;
    }
    
    /*
    this.currentPlayerChoosing = playerNum + 1;

    // Stop players position choosing
    if (this.currentPlayerChoosing > 2) {
      if (this.p1Label.nativeElement.style.display == 'block')
        this.isPlayersChoosingMode = false;

      this.currentPlayerChoosing = 1;

      // Finish locations specifying
      this.positionsStatus.emit(true);

      if (this.currentEventNumber === 0 || this.isServe) this.updateEventPanel();
      else this.updateEventPanelByPlayer(this.currentHittingPlayer, true);
      
    }
    else this.highlightPlayerPoint.emit(this.currentPlayerChoosing);
    */
  }

  updateEventPanelByPlayer(player, update) {
    const ballX = parseInt(this.ballLabel.nativeElement.style.left) * this.widthDiv;
    const ballY = parseInt(this.ballLabel.nativeElement.style.top) * this.heightDiv;
    
    let playerX = parseInt(this.p1Label.nativeElement.style.left) * this.widthDiv;
    let playerY = parseInt(this.p1Label.nativeElement.style.top) * this.heightDiv;
    let rightHand = this.p1RightButtonActive;

    if (player === 2) {
      playerX = parseInt(this.p2Label.nativeElement.style.left) * this.widthDiv;
      playerY = parseInt(this.p2Label.nativeElement.style.top) * this.heightDiv;
      rightHand = this.p2RightButtonActive;
    }

    if (update) this.playerShot.emit(player);
    this.currentHittingPlayer = player;

    this.positionProcessingService.getStrokeSide(playerX, playerY, ballX, ballY, rightHand).subscribe(result => {
      console.log(result);
      this.strokeSide.emit(result[0].stroke_side);
    });
  }

  updateEventPanel() {
    const player1X = parseInt(this.p1Label.nativeElement.style.left) * this.widthDiv;
    const player1Y = parseInt(this.p1Label.nativeElement.style.top) * this.heightDiv;
    const player2X = parseInt(this.p2Label.nativeElement.style.left) * this.widthDiv;
    const player2Y = parseInt(this.p2Label.nativeElement.style.top) * this.heightDiv;
    const ballX = parseInt(this.ballLabel.nativeElement.style.left) * this.widthDiv;
    const ballY = parseInt(this.ballLabel.nativeElement.style.top) * this.heightDiv;

    this.serveSideAd.emit(this.currentPointNumber & 1);

    this.positionProcessingService.getStrokePlayer(player1X, player1Y, player2X, player2Y, ballX, ballY).subscribe(result => {
      let playerX = player1X;
      let playerY = player1Y;
      let rightHand = this.p1RightButtonActive;

      if (result[0].stroke_player === 'p2') {
        playerX = player2X;
        playerY = player2Y;
        rightHand = this.p2RightButtonActive;
        this.currentHittingPlayer = 2;
        this.playerShot.emit(2);
      }
      else {
        this.currentHittingPlayer = 1;
        this.playerShot.emit(1);
      }

      this.positionProcessingService.getStrokeSide(playerX, playerY, ballX, ballY, rightHand).subscribe(result => {
        console.log(result);
        this.strokeSide.emit(result[0].stroke_side);
      });
    });
  }

  drawCircle(x, y) {
    let ctx = this.frame.nativeElement.getContext('2d');

    ctx.beginPath();
    ctx.fillStyle = 'green';
    
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  removeCircle(x, y) {
    let ctx = this.frame.nativeElement.getContext('2d');
    const r = 6;

    ctx.clearRect(x - r/2, y - r/2, r, r);
  }

  clearCanvas() {
    let canvas = this.frame.nativeElement;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  restore() {
    if (this.currentPoint > 0) this.currentPoint--;

    const x = this.calibrationPoints[this.currentPoint].img_x / this.widthDiv;
    const y = this.calibrationPoints[this.currentPoint].img_y / this.heightDiv;

    this.removeCircle(x, y);

    if (!this.isCalibrationReady) this.disactivatePoint.emit(this.calibrationPoints[this.currentPoint + 1]);
    this.highlightPoint.emit(this.calibrationPoints[this.currentPoint]);

    this.isCalibrationReady = false;
  }

  processCalibration(x, y) {
    if (!this.isCalibrationReady) {
      this.calibrationPoints[this.currentPoint].img_x = x;
      this.calibrationPoints[this.currentPoint].img_y = y;

      this.activatePoint.emit(this.calibrationPoints[this.currentPoint]);
      this.currentPoint++;
    }
    
    if (this.currentPoint >= 19) this.isCalibrationReady = true;
    else this.highlightPoint.emit(this.calibrationPoints[this.currentPoint]);
  }

  finishCalibration() {
    this.isCalibrationMode = false;
    this.isCalibrationReady = false;
    this.calibrationMode.emit(false);

    this.clearCanvas();
    this.positionProcessingService.setHomography(this.calibrationPoints).subscribe(points => {
      const court_points = points[0].points;
      console.log("Court:");
      console.log(court_points[0]);
      console.log(court_points[4]);
      console.log(court_points[20]);
      console.log(court_points[24]);

      const courtPosition = `[[${court_points[0]}], [${court_points[4]}], [${court_points[24]}], [${court_points[20]}]]`;
      alert(courtPosition);
    });

    const netPoints = [this.calibrationPoints[7], this.calibrationPoints[11]];
    this.positionProcessingService.setStrokeProperties(netPoints).subscribe(points => {
      console.log(points);
    });

    this.loupe.remove();

    let video = this.video.nativeElement;
    let canvas = this.frame.nativeElement;
    this.loupe = new VideoLoupe(video, canvas, 1.25);

    // this.videoPaused();
    // console.log(this.calibrationPoints);
  }

  stopCalibration() {
    this.isCalibrationMode = false;
    this.isCalibrationReady = false;
    this.calibrationMode.emit(false);

    this.clearCanvas();
    this.loupe.remove();
    // this.videoPaused();

    let video = this.video.nativeElement;
    let canvas = this.frame.nativeElement;
    this.loupe = new VideoLoupe(video, canvas, 1.25);
  }

  startCalibration() {
    if (this.isCalibrationMode)
      return;

    // Create a new loupe for the video
    let video = this.video.nativeElement;
    let canvas = this.frame.nativeElement;
    this.loupe = new VideoLoupe(video, canvas, 1.6);

    this.resetLabels();
    this.currentPlayerChoosing = 1;
    this.dehighlightPlayerPoints.emit(true);
    this.resetAllPoints.emit(true);

  	this.isCalibrationMode = true;
    this.calibrationMode.emit(true);

    this.calibrationPoints = [{x: 0, y: 0}, {x: 4.5, y: 0}, {x: 31.5, y: 0}, {x: 36, y: 0}, 
      {x: 4.5, y: 18}, {x: 18, y: 18}, {x: 31.5, y: 18}, 
      {x: 0, y: 39}, {x: 4.5, y: 39}, {x: 18, y: 39}, {x: 31.5, y: 39}, {x: 36, y: 39},
      {x: 4.5, y: 60}, {x: 18, y: 60}, {x: 31.5, y: 60},
      {x: 0, y: 78}, {x: 4.5, y: 78}, {x: 31.5, y: 78}, {x: 36, y: 78}];

    this.currentPoint = 0;
    this.highlightPoint.emit(this.calibrationPoints[this.currentPoint]);
  }

  start() {
    let video = this.video.nativeElement;
    video.play();
  }

  save(controlEvent) {
    const event = this.currentEvent;

    if (controlEvent.eventType !== undefined) event['eventType'] = controlEvent.eventType;
    if (controlEvent.hittingPlayerID !== undefined) event['hittingPlayerID'] = controlEvent.hittingPlayerID;
    if (controlEvent.strokeSide !== undefined) event['strokeSide'] = controlEvent.strokeSide;
    if (controlEvent.strokeType !== undefined) event['strokeType'] = controlEvent.strokeType;
    
    if (event['eventType'] === 'hit') {
      let playerId = event['hittingPlayerID'];

      // Add ReceivingPlayerId attribute
      if (playerId === 1) event['receivingPlayerID'] = 2;
      else event['receivingPlayerID'] = 1;
      
      let sign = 1;
      if (event['strokeType'] === 'serve') {
        event['serveSide'] = controlEvent.serveSide;
        event['serveNumber'] = controlEvent.serveNumber;

        let serveNumber = '1st';
        if (event['serveNumber'] === 2) serveNumber = '2nd';
        event['strokeType'] = `${event['serveSide']} ${serveNumber} ${event['strokeType']}`;

        sign = 0;
      }
      if (event['strokeSide'] === 'backhand') sign *= -1;
      
      if (event[`player${playerId}Y`] < 39) sign *= -1;

      if (event[`player${playerId}X`] !== '') {
        event['ballX'] = event[`player${playerId}X`] + (3 * sign);
        event['ballY'] = event[`player${playerId}Y`];
      }
      else {
        event['ballX'] = 999;
        event['ballY'] = 999;
      }
    }
    else {
      event['hittingPlayerID'] = '';
      event['receivingPlayerID'] = '';
      event['strokeSide'] = '';
      event['strokeType'] = '';
    }

    event['clippedNet'] = 0;
    event['inNet'] = 0;
    event['spin'] = 'Flat';

    event['pointSequenceNumber'] = this.currentPointNumber;
    event['gameSequenceNumber'] = this.currentGameNumber;
    event['setSequenceNumber'] = this.currentSetNumber;
    event['eventSequenceNumber'] = this.currentEventNumber;

    this.saveState();

    delete event['serveNumber'];
    delete event['serveSide'];
    delete event['timestamp_seconds'];

    this.currentEventNumber++;
    this.isServe = false;

    this.writeEvent.emit(event);
    this.outputData.push(event);

    if (event['eventType'] === 'hit') this.setNextPlayer();

    this.currentEvent = {};
    this.nextKeyFrame();
  }

  saveState() {
    let state = {};

    state['frameNum'] = this.frameNum;
    state['timestamp_seconds'] = this.video.nativeElement.currentTime;
    state['currentEventNumber'] = this.currentEventNumber;
    state['isServe'] = this.isServe;
    state['currentHittingPlayer'] = this.currentHittingPlayer;
    state['p1XPosition'] = this.p1Label.nativeElement.style.left;
    state['p1YPosition'] = this.p1Label.nativeElement.style.top;
    state['p2XPosition'] = this.p2Label.nativeElement.style.left;
    state['p2YPosition'] = this.p2Label.nativeElement.style.top;
    state['ballXPosition'] = this.ballLabel.nativeElement.style.left;
    state['ballYPosition'] = this.ballLabel.nativeElement.style.top;

    this.eventStateData.push(state);
  }

  loadLastState() {
    const state = this.eventStateData.pop();

    this.video.nativeElement.currentTime = state['timestamp_seconds'];
    this.frameNum = state['frameNum'];
    // previousSavedFrame(lastEvent['timestamp_seconds'])

    this.currentEventNumber = state['currentEventNumber'];
    this.isServe = state['isServe'];
    this.currentHittingPlayer = state['currentHittingPlayer'];
    this.p1Label.nativeElement.style.left = state['p1XPosition'];
    this.p1Label.nativeElement.style.top = state['p1YPosition'];
    this.p2Label.nativeElement.style.left = state['p2XPosition'];
    this.p2Label.nativeElement.style.top = state['p2YPosition'];
    this.ballLabel.nativeElement.style.left = state['ballXPosition'];
    this.ballLabel.nativeElement.style.top = state['ballYPosition'];

    this.p1Label.nativeElement.style.display = 'block';
    this.p2Label.nativeElement.style.display = 'block';
    this.ballLabel.nativeElement.style.display = 'block';
    this.positionsStatus.emit(true);
  }

  resetToLastGame() {
    this.currentGameNumber--;
    this.gamesData.pop();
  }

  resetToLastPoint() {
    this.currentPointNumber--;
    this.pointsData.pop();

    this.outputData = this.previousPointOutputData;
    this.eventStateData = this.previousPointEventStateData;
    this.resetToLastEvent();
  }

  resetToLastEvent() {
    if (this.eventStateData.length === 0)
      return;

    const lastEvent = this.outputData.pop();

    this.loadLastState();
    this.currentEvent = lastEvent;

    this.showPlayerPoint.emit({player: 1, x: lastEvent['player1X'], y: lastEvent['player1Y']});
    this.showPlayerPoint.emit({player: 2, x: lastEvent['player2X'], y: lastEvent['player2Y']});
    this.showPoint.emit({x: lastEvent['ballX'], y: lastEvent['ballY']});
  }

  savePointData() {
    if (this.eventStateData.length > 0) {
      this.previousPointEventStateData = JSON.parse(JSON.stringify(this.eventStateData));
      this.previousPointOutputData = JSON.parse(JSON.stringify(this.outputData));
    }
  }

  processPointData(data) {
    this.currentPointNumber++;
    this.currentEventNumber = 0;
    this.isServe = true;

    this.eventStateData = [];
    // this.outputData = [];
    this.pointsData.push(data);
  }

  processGameData(data) {
    this.currentGameNumber++;
    this.currentPointNumber = 0;
    this.currentEventNumber = 0;
    this.isServe = true;

    this.gamesData.push(data);
  }

  processSetData(data) {
    this.currentSetNumber++;
    this.currentGameNumber = 0;
    this.currentPointNumber = 0;
    this.currentEventNumber = 0;
    this.isServe = true;

    this.setsData.push(data);
  }

  downloadEventsCSV() {
    this.generateCSV(this.outputData, 'events');
  }

  downloadPointsCSV() {
    this.generateCSV(this.pointsData, 'points');
  }

  downloadGamesCSV() {
    this.generateCSV(this.gamesData, 'games');
  }

  downloadSetsCSV() {
    this.generateCSV(this.setsData, 'sets');
  }


  /* Hand Settings */
  handSettingsToggle() {
    this.handSettingsActive = !this.handSettingsActive;

    if (this.handSettingsActive)
      this.settingsWindow.nativeElement.style.left = this.settingsButton.nativeElement.getBoundingClientRect().left + 'px';
  }

  onP1LeftButtonClick() {
    this.p1RightButtonActive = false;
  }

  onP1RightButtonClick() {
    this.p1RightButtonActive = true;
  }

  onP2LeftButtonClick() {
    this.p2RightButtonActive = false;
  }

  onP2RightButtonClick() {
    this.p2RightButtonActive = true;
  }



  /* Go to previous saved frame (event) */
  previousSavedFrame(timestamp) {
    let video = this.video.nativeElement;

    this.frameNum--;
    video.currentTime = timestamp;

    this.resetLabels();
    this.dehighlightPlayerPoints.emit(true);
    this.resetAllPoints.emit(true);
  }

  /* Play until next key frame */
  nextKeyFrame() {
    let video = this.video.nativeElement;
    const frames = this.frames;

    this.frameNum++;
    while (video.currentTime >= frames[this.frameNum] / this.frameRate) this.frameNum++;

    this.next = true;

    this.resetLabels();
    this.currentPlayerChoosing = 1;
    this.dehighlightPlayerPoints.emit(true);
    // this.highlightPlayerPoint.emit(this.currentPlayerChoosing);
    this.resetAllPoints.emit(true);

    video.play();
  }

  /* Get timestamp */
  getTime(timeInSeconds) {
    let pad = function(num, size) { return ('000' + num).slice(size * -1); };

    let time = parseFloat(timeInSeconds).toFixed(3);
    let hours = Math.floor(parseFloat(time) / 60 / 60);
    let minutes = Math.floor(parseFloat(time) / 60) % 60;
    let seconds = Math.floor(parseFloat(time) - minutes * 60);
    let milliseconds = time.slice(-3);

    return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milliseconds, 3);
  }

  /* Download CSV File */
  generateCSV(data, filename) {
    // Clone an object (without references)
    let csvData = JSON.parse(JSON.stringify(data));
    const csvContent = 'data:text/csv;charset=utf-8,' + this.exportToCsv(csvData, ',');

    //var encodedUri = encodeURI(csvContent);
    //window.open(encodedUri);

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename + ".csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
  }

  exportToCsv(data, columnDelimiter) {
    console.log(data);
    const lineDelimiter = '\n';
    let result, ctr, keys;

    if (data === null || !data.length) {
      return null;
    }

    keys = Object.keys(data[0]);

    result = "";
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(item => {
      ctr = 0;
      keys.forEach(key => {
        if (ctr > 0) {
          result += columnDelimiter;
        }

        result += typeof item[key] === "string" && item[key].includes(columnDelimiter) ? `"${item[key]}"` : item[key];
        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  }


}
