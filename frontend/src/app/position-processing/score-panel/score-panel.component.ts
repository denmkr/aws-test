import { Component, OnInit, ViewEncapsulation, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-score-panel',
  templateUrl: './score-panel.component.html',
  styleUrls: ['./score-panel.component.css']
})
export class ScorePanelComponent implements OnInit {

  sets: any;
  games: any;
  points: any;
  currentSet: number;

  prevSets: any;
  prevGames: any;
  prevPoints: any;
  prevGamePoints: any;
  prevCurrentSet: number;

  p1ButtonActive: boolean;

  winButtonActive: boolean;
  aceButtonActive: boolean;
  letButtonActive: boolean;

  forcedErrorButtonActive: boolean;
  unforcedErrorButtonActive: boolean;
  faultButtonActive: boolean;
  doubleFaultButtonActive: boolean;

  p1SetCount: number;
  p2SetCount: number;
  servingPlayer: number;

  finishGameButtonActive: boolean;
  finishSetButtonActive: boolean;
  resetPointButtonActive: boolean;
  resetGameButtonActive: boolean;

  @Output() pointResetEvent = new EventEmitter<any>();
  @Output() gameResetEvent = new EventEmitter<any>();

  @Output() pointEvent = new EventEmitter<any>();
  @Output() savePointEvent = new EventEmitter<any>();
  @Output() saveGameEvent = new EventEmitter<any>();
  @Output() saveSetEvent = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  	this.sets = [];
    this.p1SetCount = 0;
    this.p2SetCount = 0;

  	this.games = {p1: 0, p2: 0};
  	this.points = {p1: 0, p2: 0};

  	this.currentSet = 1;

    this.p1ButtonActive = true;
    this.winButtonActive = false;
    this.aceButtonActive = false;
    this.letButtonActive = false;
    this.forcedErrorButtonActive = false;
    this.unforcedErrorButtonActive = false;
    this.faultButtonActive = false;
    this.doubleFaultButtonActive = false;
    this.finishGameButtonActive = false;
    this.finishSetButtonActive = false;
    this.resetPointButtonActive = false;
    this.resetGameButtonActive = false;

    this.activateServe2Buttons();
  }

  reset() {
    /*
    this.sets = this.prevSets;
    this.games = this.prevGames;
    this.points = this.prevPoints;
    this.currentSet = this.prevCurrentSet;
    */

    this.points = this.prevPoints;
    this.pointResetEvent.emit(true);
  }

  resetGame() {
    this.games = this.prevGames;
    this.points = this.prevGamePoints;
    this.gameResetEvent.emit(true);

    this.resetPointButtonActive = true;
    this.resetGameButtonActive = false;
  }

  finishGame() {
    confirm("The game will be finished!");
    this.saveGameData();

    if (this.points.p1 > this.points.p2) this.games.p1++;
    else this.games.p2++;

    this.points = {p1: 0, p2: 0};

    this.pointEvent.emit('end');
    this.finishGameButtonActive = false;
    this.finishSetButtonActive = true;
    this.resetPointButtonActive = false;
    this.resetGameButtonActive = true;
  }

  finishSet() {
    confirm("The set will be finished!");
    this.saveSetData();

    if (this.sets.length < 4) {
      this.sets.push({p1: this.games.p1, p2: this.games.p2});
      this.currentSet++;

      this.games = {p1: 0, p2: 0};
      this.points = {p1: 0, p2: 0};
    }

    this.finishGameButtonActive = false;
    this.finishSetButtonActive = false;
    this.resetPointButtonActive = false;
    this.resetGameButtonActive = false;
  }

  letPoint() {

  }

  savePointData(winningplayerid, outcomeExpl) {
    let pointRow = {};

    pointRow['pointsequencenumber'] = this.points.p1 + this.points.p2;
    pointRow['gamesequencenumber'] = this.games.p1 + this.games.p2;
    pointRow['setsequencenumber'] = this.currentSet - 1;

    if (winningplayerid === 1) {
      pointRow['winningplayerid'] = 1;
      pointRow['losingplayerid'] = 2;
    }
    else {
      pointRow['winningplayerid'] = 2;
      pointRow['losingplayerid'] = 1;
    }

    if (this.servingPlayer === 1) {
      pointRow['servingplayerid'] = 1;
      pointRow['receivingplayerid'] = 2;
    }
    else {
      pointRow['servingplayerid'] = 2;
      pointRow['receivingplayerid'] = 1;
    }

    pointRow['player1startingpointcount'] = this.points.p1;
    pointRow['player2startingpointcount'] = this.points.p2;

    pointRow['outcomeexplanation'] = outcomeExpl.toUpperCase();

    this.savePointEvent.emit(pointRow);
    this.savePoint();
  }

  saveGameData() {
    let gameRow = {};

    gameRow['gamesequencenumber'] = this.games.p1 + this.games.p2;
    gameRow['setsequencenumber'] = this.currentSet - 1;

    gameRow['player1startinggamecount'] = this.games.p1;
    gameRow['player2startinggamecount'] = this.games.p2;

    if (this.points.p1 > this.points.p2) {
      gameRow['winningplayerid'] = 1;
      gameRow['losingplayerid'] = 2;
    }
    else {
      gameRow['winningplayerid'] = 2;
      gameRow['losingplayerid'] = 1;
    }

    if (this.servingPlayer === 1) {
      gameRow['servingplayerid'] = 1;
      gameRow['receivingplayerid'] = 2;
    }
    else {
      gameRow['servingplayerid'] = 2;
      gameRow['receivingplayerid'] = 1;
    }

    gameRow['player1finalpointcount'] = this.points.p1;
    gameRow['player2finalpointcount'] = this.points.p2;

    this.saveGameEvent.emit(gameRow);
    this.saveGame();
  }

  saveSetData() {
    let setRow = {};

    setRow['setsequencenumber'] = this.currentSet - 1;

    setRow['player1startingsetcount'] = this.p1SetCount;
    setRow['player2startingsetcount'] = this.p2SetCount;

    if (this.games.p1 > this.games.p2) {
      setRow['winningplayerid'] = 1;
      setRow['losingplayerid'] = 2;
      this.p1SetCount++;
    }
    else {
      setRow['winningplayerid'] = 2;
      setRow['losingplayerid'] = 1;
      this.p2SetCount++;
    }

    setRow['player1finalgamecount'] = this.games.p1;
    setRow['player2finalgamecount'] = this.games.p2;

    this.saveSetEvent.emit(setRow);
  }

  savePoint() {
    // Clone objects
    this.prevPoints = JSON.parse(JSON.stringify(this.points));
  }

  saveGame() {
    this.prevGames = JSON.parse(JSON.stringify(this.games));
    this.prevGamePoints = JSON.parse(JSON.stringify(this.points));
  }

  increaseP1Point(outcomeExpl) {
    this.savePointData(1, outcomeExpl);
    this.points.p1++;
  }

  increaseP2Point(outcomeExpl) {
    this.savePointData(2, outcomeExpl);
    this.points.p2++;
  }

  winButtonClick() {
    if (this.p1ButtonActive) this.increaseP1Point('winner');
    else this.increaseP2Point('winner');

    this.pointEvent.emit('winner');
    this.finishGameButtonActive = true;
    this.finishSetButtonActive = false;
    this.resetPointButtonActive = true;
    this.resetGameButtonActive = false;
  }

  aceButtonClick() {
  	if (this.p1ButtonActive) this.increaseP1Point('ace');
    else this.increaseP2Point('ace');

    this.pointEvent.emit('ace');
    this.finishGameButtonActive = true;
    this.finishSetButtonActive = false;
    this.resetPointButtonActive = true;
    this.resetGameButtonActive = false;
  }

  letButtonClick() {
  	this.pointEvent.emit('let');
  }

  faultButtonClick() {
    this.pointEvent.emit('fault');
  }

  doubleFaultButtonClick() {
    if (this.p1ButtonActive) this.increaseP2Point('double_fault');
    else this.increaseP1Point('double_fault');

    this.pointEvent.emit('doubleFault');
    this.finishGameButtonActive = true;
    this.finishSetButtonActive = false;
    this.resetPointButtonActive = true;
    this.resetGameButtonActive = false;
  }

  forcedErrorButtonClick() {
  	if (this.p1ButtonActive) this.increaseP2Point('forced_error');
    else this.increaseP1Point('forced_error');

    this.pointEvent.emit('error');
    this.finishGameButtonActive = true;
    this.finishSetButtonActive = false;
    this.resetPointButtonActive = true;
    this.resetGameButtonActive = false;
  }

  unforcedErrorButtonClick() {
  	if (this.p1ButtonActive) this.increaseP2Point('unforced_error');
    else this.increaseP1Point('unforced_error');

    this.pointEvent.emit('error');
    this.finishGameButtonActive = true;
    this.finishSetButtonActive = false;
    this.resetPointButtonActive = true;
    this.resetGameButtonActive = false;
  }

  setActivePlayer(playerNum: number) {
    if (playerNum === 1) this.p1ButtonActive = true;
    else this.p1ButtonActive = false;
  }

  p1ButtonClick() {
    this.p1ButtonActive = true;
  }

  p2ButtonClick() {
    this.p1ButtonActive = false;
  }

  disableStrokeButtons() {
    this.winButtonActive = false;
    this.forcedErrorButtonActive = false;
    this.unforcedErrorButtonActive = false;
  }

  disableServeButtons() {
    this.aceButtonActive = false;
    this.letButtonActive = false;
    this.faultButtonActive = false;
    this.doubleFaultButtonActive = false;
  }

  activateServe1Buttons() {
    this.aceButtonActive = true;
    this.letButtonActive = true;
    this.faultButtonActive = true;

    this.doubleFaultButtonActive = false;
    this.disableStrokeButtons();
  }

  activateServe2Buttons() {
    this.aceButtonActive = true;
    this.letButtonActive = true;
    this.doubleFaultButtonActive = true;

    this.faultButtonActive = false;
    this.disableStrokeButtons();
  }

  activateStrokeButtons() {
    this.winButtonActive = true;
    this.forcedErrorButtonActive = true;
    this.unforcedErrorButtonActive = true;

    this.disableServeButtons();
  }


  processEvent(event: any) {
    // Process only strokes
    if (event['eventType'] === 'bounce') 
      return;

    this.setActivePlayer(event['hittingPlayerID']);

    if (event['strokeType'] === 'serve') {
      if (event['serveNumber'] === 1) this.activateServe1Buttons();
      else this.activateServe2Buttons();

      // Save serving player id
      this.servingPlayer = event['hittingPlayerID'];
    } 
    else {
      // Normal stroke
      this.activateStrokeButtons();
    }

    this.finishGameButtonActive = false;
    this.finishSetButtonActive = false;
    this.resetPointButtonActive = false;
    this.resetGameButtonActive = false;
  }

}
