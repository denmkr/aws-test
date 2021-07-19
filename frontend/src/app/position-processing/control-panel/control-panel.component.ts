import { Component, OnInit, ViewEncapsulation, EventEmitter, Output, HostListener } from '@angular/core';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ControlPanelComponent implements OnInit {

  shotButtonActive: boolean;
  p1ShotButtonActive: boolean;
  forehandButtonActive: boolean;
  firstServeButtonActive: boolean;

  groundstrokeButtonActive: boolean;
  volleyButtonActive: boolean;
  serveButtonActive: boolean;

  deuceButtonActive: boolean;

  lastEventType: any;
  lastStrokeType: any;
  lastServeNumber: number;
  lastPlayerId: number;
  letEvent: boolean;

  currentServePlayer: number;

  saveButtonActive: boolean;
  eventsControlsActive: boolean;

  event: any;
  currentHitEvent: any;
  currentBounceEvent: any;

  eventStateData: Array<any> = [];
  eventsData: Array<any> = [];
  lastEventStateData: Array<any> = [];
  lastEventsData: Array<any> = [];
  

  @Output() skipEvent = new EventEmitter<any>();
  @Output() saveEvent = new EventEmitter<any>();
  @Output() playerChangeEvent = new EventEmitter<any>();
  @Output() changeEvent = new EventEmitter<any>();
  @Output() eventUndoEvent = new EventEmitter<any>();
  @Output() updateScorePanelWithEvent = new EventEmitter<any>();
  

  constructor() { }

  ngOnInit() {
    this.event = {};
    this.currentHitEvent = {};
    this.currentBounceEvent = {};
    this.currentServePlayer = 1;

    this.setStartPointControls();
  }

  onShotButtonClick() {
  	this.shotButtonActive = true;
    this.event = this.currentHitEvent;

    this.changeEvent.emit(true);

    if (this.lastEventType === 'hit') this.onVolleyButtonClick();
  }

  onBounceButtonClick() {
  	this.shotButtonActive = false;
    this.event = this.currentBounceEvent;
  }

  setServeNumber() {
    if (this.letEvent) {
      this.event['serveNumber'] = this.lastServeNumber;
      if (this.lastServeNumber === 1) this.firstServeButtonActive = true;
      else this.firstServeButtonActive = false;

      return;
    }

    if (this.lastStrokeType === 'serve' && this.lastServeNumber === 1 && this.lastPlayerId === this.event['hittingPlayerID']) {
      this.firstServeButtonActive = false;
      this.event['serveNumber'] = 2;
    }
    else {
      this.firstServeButtonActive = true;
      this.event['serveNumber'] = 1;
    }
  }

  onP1ShotButtonClick() {
  	this.p1ShotButtonActive = true;
    this.event['hittingPlayerID'] = 1;
    //this.lastPlayerId = 2;
    this.currentServePlayer = 1;

    this.playerChangeEvent.emit(1);

    this.setServeNumber();
  }

  onP2ShotButtonClick() {
  	this.p1ShotButtonActive = false;
    this.event['hittingPlayerID'] = 2;
    //this.lastPlayerId = 1;
    this.currentServePlayer = 2;

    this.playerChangeEvent.emit(2);

    this.setServeNumber();
  }

  onForehandButtonClick() {
  	this.forehandButtonActive = true;
    this.event['strokeSide'] = 'forehand';
  }

  onBackhandButtonClick() {
  	this.forehandButtonActive = false;
    this.event['strokeSide'] = 'backhand';
  }

  onGroundButtonClick() {
    this.groundstrokeButtonActive = true;
    this.volleyButtonActive = false;
    this.serveButtonActive = false;
    this.event['strokeType'] = 'groundstroke';
  }

  onVolleyButtonClick() {
    this.volleyButtonActive = true;
    this.groundstrokeButtonActive = false;
    this.serveButtonActive = false;
    this.event['strokeType'] = 'volley';
  }

  onServeButtonClick() {
    this.serveButtonActive = true;
    this.volleyButtonActive = false;
    this.groundstrokeButtonActive = false;
    this.deuceButtonActive = true;

    this.event['eventType'] = 'hit';
    this.event['strokeType'] = 'serve';
    this.event['serveSide'] = 'deuce';
    this.event['strokeSide'] = 'forehand';

    this.event['hittingPlayerID'] = this.currentServePlayer;
    if (this.currentServePlayer === 1) this.p1ShotButtonActive = true;
    else this.p1ShotButtonActive = false;

    this.setServeNumber();
  }

  onDeuceButtonClick() {
    this.deuceButtonActive = true;
    this.event['serveSide'] = 'deuce';
  }

  onAdButtonClick() {
    this.deuceButtonActive = false;
    this.event['serveSide'] = 'ad';
  }

  onFirstServeButtonClick() {
    this.firstServeButtonActive = true;
    this.event['serveNumber'] = 1;
  }

  onSecondServeButtonClick() {
    this.firstServeButtonActive = false;
    this.event['serveNumber'] = 2;
  }

  onSkipButtonClick() {
  	this.skipEvent.emit();
  }

  letButtonClick() {
    this.letEvent = true;

    this.setStartPointControls();
    this.setServeNumber();
  }

  faultButtonClick() {
    this.setStartPointControls();
    this.setServeNumber();
  }

  setStartPointControls() {
    this.shotButtonActive = true;
    this.event = this.currentHitEvent;

    this.serveButtonActive = true;
    this.volleyButtonActive = false;
    this.groundstrokeButtonActive = false;
    this.deuceButtonActive = true;

    this.event['eventType'] = 'hit';
    this.event['strokeType'] = 'serve';
    this.event['serveSide'] = 'deuce';
    this.event['strokeSide'] = 'forehand';

    this.event['serveNumber'] = 1;
    this.firstServeButtonActive = true;

    if (this.currentServePlayer !== undefined) {
      if (this.currentServePlayer === 1) this.p1ShotButtonActive = true;
      else this.p1ShotButtonActive = false;
      this.event['hittingPlayerID'] = this.currentServePlayer;
    }
    else {
      this.p1ShotButtonActive = true;
      this.event['hittingPlayerID'] = 1;
    }

    this.currentHitEvent = JSON.parse(JSON.stringify(this.event)); // clone
  }

  saveEvents() {
    if (this.eventStateData.length > 0 && this.eventsData.length > 0) {
      this.lastEventStateData = JSON.parse(JSON.stringify(this.eventStateData));
      this.lastEventsData = JSON.parse(JSON.stringify(this.eventsData));
    }
  }

  loadPreviousPointEvents() {
    this.eventStateData = this.lastEventStateData;
    this.eventsData = this.lastEventsData;

    // this.eventUndoEvent.emit(true);
    this.loadPreviousEventState();
    this.loadPreviousScorePanelData();
  }

  loadPreviousScorePanelData() {
    if (this.eventsData.length > 0) {
      let event = this.eventsData[this.eventsData.length - 1];
      if (this.eventsData.length > 1 && event['eventType'] === 'bounce') event = this.eventsData[this.eventsData.length - 2];
      
      this.updateScorePanelWithEvent.emit(event);
    }
  }

  saveEventState() {
    let state = {};
    state['lastStrokeType'] = this.lastStrokeType;
    state['lastPlayerId'] = this.lastPlayerId;
    state['lastEventType'] = this.lastEventType;
    state['lastServeNumber'] = this.lastServeNumber;
    state['letEvent'] = this.letEvent;

    state['currentHitEvent'] = this.currentHitEvent;
    state['currentBounceEvent'] = this.currentBounceEvent;

    this.eventStateData.push(state);
  }


  loadPreviousEventState() {
    const state = this.eventStateData.pop();

    this.lastStrokeType = state['lastStrokeType'];
    this.lastPlayerId = state['lastPlayerId'];
    this.lastEventType = state['lastEventType'];
    this.lastServeNumber = state['lastServeNumber'];
    this.letEvent = state['letEvent'];

    this.currentHitEvent = state['currentHitEvent'];
    this.currentBounceEvent = state['currentBounceEvent'];

    this.event = this.eventsData.pop();

    if (this.event['eventType'] === 'hit') {
      this.shotButtonActive = true;
      this.p1ShotButtonActive = (this.event['hittingPlayerID'] === 1);

      this.groundstrokeButtonActive = (this.event['strokeType'] === 'groundstroke');
      this.volleyButtonActive = (this.event['strokeType'] === 'volley');
      this.serveButtonActive = (this.event['strokeType'] === 'serve');

      this.forehandButtonActive = (this.event['strokeSide'] === 'forehand');
      this.deuceButtonActive = (this.event['serveSide'] === 'deuce');
      this.firstServeButtonActive = (this.event['serveNumber'] === 1);
    }
    else { // bounce
      this.shotButtonActive = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) { 
    if (event.code === 'Enter') this.onSaveButtonClick();
  }

  onSaveButtonClick() {
    if (!this.saveButtonActive)
      return;

    this.saveEventState();
    //if (this.event['eventType'] === 'hit' && this.event['strokeType'] !== 'serve') this.changeActivePlayer();
    this.saveEvent.emit(this.event);
    this.eventsData.push(JSON.parse(JSON.stringify(this.event)));

    if (this.event['eventType'] === 'hit' && this.event['strokeType'] !== '' && this.event['strokeType'] !== undefined) {
      this.lastStrokeType = this.event['strokeType'];
      this.lastPlayerId = this.event['hittingPlayerID'];
      if (this.event['strokeType'] === 'serve') this.lastServeNumber = this.event['serveNumber'];
    }
    this.lastEventType = this.event['eventType'];

    this.processNextEvent();
    this.letEvent = false;
  }

  changeActivePlayer() {
    if (this.lastPlayerId === 1) {
      this.event['hittingPlayerID'] = 2;
      this.p1ShotButtonActive = false;
    }
    else {
      this.event['hittingPlayerID'] = 1;
      this.p1ShotButtonActive = true;
    }
  }

  processNextEvent() {
    let event = JSON.parse(JSON.stringify(this.event));
    this.event = {};

    // this.changeActivePlayer();

    if (event['eventType'] === 'bounce') {
      this.shotButtonActive = true;
      this.forehandButtonActive = true;
      this.deuceButtonActive = true;

      this.groundstrokeButtonActive = true;
      this.volleyButtonActive = false;
      this.serveButtonActive = false;

      this.event['eventType'] = 'hit';
      this.event['strokeType'] = 'groundstroke';
      this.event['strokeSide'] = 'forehand';

      this.currentHitEvent = JSON.parse(JSON.stringify(this.event)); // clone
    }
    else {
      this.shotButtonActive = false;
      this.event['eventType'] = 'bounce';
      this.event['hittingPlayerID'] = '';
      this.event['strokeSide'] = '';
      this.event['strokeType'] = '';

      this.event['serveSide'] = '';
      this.event['serveNumber'] = '';

      this.currentBounceEvent = JSON.parse(JSON.stringify(this.event)); // clone
    }
  }

  onUndoButtonClick() {
    this.eventUndoEvent.emit(true);
    this.loadPreviousEventState();
    this.loadPreviousScorePanelData();
  }

  changeSaveButtonStatus(event) {
    this.saveButtonActive = event;
    this.eventsControlsActive = event;
  }

  setEventType(type: string) {
    if (type === 'hit') this.shotButtonActive = true;
    if (type === 'bounce') this.shotButtonActive = false;

    this.event['eventType'] = type;
  }

  setPlayerShot(player: number) {
    /*
  	if (this.event['strokeType'] !== 'serve') {
  		this.changeActivePlayer();
  		return;
  	}
    */

    if (player === 1) {
      this.p1ShotButtonActive = true;
      //this.lastPlayerId = 2;
    }
    if (player === 2) {
      this.p1ShotButtonActive = false;
      //this.lastPlayerId = 1;
    }

    this.event['hittingPlayerID'] = player;
    //this.setServeNumber();
  }

  setStrokeSide(side: string) {
    if (side === 'forehand') this.forehandButtonActive = true;
    if (side === 'backhand') this.forehandButtonActive = false;

    this.event['strokeSide'] = side;
  }

  setServeSide(ad: boolean) {
    if (ad) {
      this.deuceButtonActive = false;
      this.event['serveSide'] = 'ad';
    }
    else {
      this.deuceButtonActive = true;
      this.event['serveSide'] = 'deuce';
    }
  }

}
