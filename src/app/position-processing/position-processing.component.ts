import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { TennisCourtComponent } from './tennis-court/tennis-court.component';
import { VideoComponent } from './video/video.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { DataPanelComponent } from './data-panel/data-panel.component';
import { ScorePanelComponent } from './score-panel/score-panel.component';

@Component({
  selector: 'app-position-processing',
  templateUrl: './position-processing.component.html',
  styleUrls: ['./position-processing.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PositionProcessingComponent implements OnInit {

  @ViewChild(TennisCourtComponent, {static: false}) tennisCourtComponent: TennisCourtComponent;
  @ViewChild(VideoComponent, {static: false}) videoComponent: VideoComponent;
  @ViewChild(ControlPanelComponent, {static: false}) controlPanelComponent: ControlPanelComponent;
  @ViewChild(DataPanelComponent, {static: false}) dataPanelComponent: DataPanelComponent;
  @ViewChild(ScorePanelComponent, {static: false}) scorePanelComponent: ScorePanelComponent;

  constructor() { }

  ngOnInit() {
  }

  highlightBallPoint() {
    this.tennisCourtComponent.highlightBallPoint();
  }

  dehighlightBallPoint() {
    this.tennisCourtComponent.dehighlightBallPoint();
  }

  dehighlightPlayerPoints() {
    this.tennisCourtComponent.dehighlightPlayerPoints();
  }

  highlightPlayerPoint(event) {
    this.tennisCourtComponent.highlightPlayerPoint(event);
  }

  resetAllPoints() {
    this.tennisCourtComponent.resetAllPoints();
  }

  showPlayerPoint(event) {
    this.tennisCourtComponent.showPlayerPoint(event.player, event.x, event.y);
  }

  showPoint(event) {
    this.tennisCourtComponent.showPoint(event.x, event.y);
  }

  activatePoint(event) {
  	this.tennisCourtComponent.activatePoint(event.x, event.y);
  }

  disactivatePoint(event) {
    this.tennisCourtComponent.disactivatePoint(event.x, event.y);
  }

  highlightPoint(event) {
    this.tennisCourtComponent.highlightPoint(event.x, event.y);
  }

  calibrationMode(event) {
    if (event) this.tennisCourtComponent.startCalibrationMode();
    else this.tennisCourtComponent.finishCalibrationMode();
  }


  positionsStatus(event) {
    this.controlPanelComponent.changeSaveButtonStatus(event);
  }

  gameResetEvent() {
    this.videoComponent.resetToLastGame();
  }

  pointResetEvent() {
    this.controlPanelComponent.loadPreviousPointEvents();
    this.dataPanelComponent.loadPreviousPoint();
    this.videoComponent.resetToLastPoint();
  }

  skipEvent() {
    this.videoComponent.nextKeyFrame();
  }

  saveEvent(event) {
    this.videoComponent.save(event);
    this.scorePanelComponent.processEvent(event);
  }

  updateScorePanelWithEvent(event) {
    this.scorePanelComponent.processEvent(event);
  }

  playerChangeEvent(event) {
    this.videoComponent.updateEventPanelByPlayer(event, false);
  }

  changeEvent() {
    this.videoComponent.updateEventPanel();
  }

  savePointEvent(event) {
    this.videoComponent.savePointData();
    this.videoComponent.processPointData(event);
    this.controlPanelComponent.saveEvents();
  }

  saveGameEvent(event) {
    this.videoComponent.processGameData(event);
  }

  saveSetEvent(event) {
    this.videoComponent.processSetData(event);
  }

  pointEvent(event) {
    switch (event) {
      case "end":
        this.controlPanelComponent.setStartPointControls();
        this.dataPanelComponent.clearData();
        break;

      case "let":
        this.controlPanelComponent.letButtonClick();
        this.videoComponent.setServe(true);
        break;

      case "winner":
        this.controlPanelComponent.setStartPointControls();
        this.dataPanelComponent.clearData();
        break;

      case "error":
        this.controlPanelComponent.setStartPointControls();
        this.dataPanelComponent.clearData();
        break;

      case "ace":
        this.controlPanelComponent.setStartPointControls();
        this.dataPanelComponent.clearData();
        break;

      case "fault":
        this.controlPanelComponent.faultButtonClick();
        this.videoComponent.setServe(true);
        break;

      case "doubleFault":
        this.controlPanelComponent.setStartPointControls();
        this.dataPanelComponent.clearData();
        break;
      
      default:
        break;
    }
  }

  eventUndoEvent() {
    this.videoComponent.resetToLastEvent();
    this.dataPanelComponent.removeLastData();
  }

  addEventToLog(event) {
    this.dataPanelComponent.addData(event);
  }

  serveSideAd(event) {
    this.controlPanelComponent.setServeSide(event);
  }

  eventType(event) {
    this.controlPanelComponent.setEventType(event);
  }

  playerShot(event) {
    this.controlPanelComponent.setPlayerShot(event);
  }

  strokeSide(event) {
    this.controlPanelComponent.setStrokeSide(event);
  }

}
