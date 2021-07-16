import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-data-panel',
  templateUrl: './data-panel.component.html',
  styleUrls: ['./data-panel.component.css']
})
export class DataPanelComponent implements OnInit {
  @ViewChild('dataContent', { static: true }) dataContent: ElementRef;

  data = [];
  lastPointData = [];

  constructor() { }

  ngOnInit() {
  }

  removeLastData() {
    this.data.pop();
  }

  clearData() {
    if (this.data.length > 0) this.lastPointData = JSON.parse(JSON.stringify(this.data));

    this.data = [];
  }

  loadPreviousPoint() {
    this.data = this.lastPointData;
    this.data.pop();
  }

  addData(event) {
  	const line = {
  		timestamp: event.timestamp,
  		eventType: event.eventType,
  		hittingPlayerID: event.hittingPlayerID,
  		strokeSide: event.strokeSide,
  		strokeType: event.strokeType,
  		player1: `[${event.player1X}, ${event.player1Y}]`,
  		player2: `[${event.player2X}, ${event.player2Y}]`,
  		ball: `[${event.ballX}, ${event.ballY}]`
  	};

  	this.data.push(line);
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.dataContent.nativeElement.scrollTop = this.dataContent.nativeElement.scrollHeight;
    }, 100);
  }

}
