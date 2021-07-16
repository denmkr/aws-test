import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-tennis-court',
  templateUrl: './tennis-court.component.html',
  styleUrls: ['./tennis-court.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TennisCourtComponent implements OnInit {

  isInfoBlockShown: boolean = false;

  points: Array<any>;
  ballGroup: any;
  cornerCirclesGroup: any;
  playerCirclesGroup: any;

  ballCircle: any;
  ballLabel: any;

  p1Circle: any;
  p1Label: any;

  p2Circle: any;
  p2Label: any;

  constructor() { }

  ngOnInit() {
    this.cornerCirclesGroup = d3.select('svg').append('g').attr('id', 'corner-circles');
    this.ballGroup = d3.select('svg').append('g').attr('id', 'ball-circle');
    this.playerCirclesGroup = d3.select('svg').append('g').attr('id', 'player-circles');
    
    this.addPlayerCircles();
    this.addBallCircle();
  }

  addBallCircle() {
    this.ballCircle = this.ballGroup.append('circle')
      .attr('cx', 42)
      .attr('cy', 39)
      .attr('r', 1)
      .attr('fill', 'red')
      .call(d3.drag()
        .on('drag', function() {
          d3.select(this.parentNode).select('text').attr('x', parseFloat(d3.event.x.toFixed()) + 3.0 + 'px').attr('y', parseFloat(d3.event.y.toFixed()) + 1.0 + 'px');
          d3.select(this).attr('cx', d3.event.x.toFixed()).attr('cy', d3.event.y.toFixed());
        })
        .on('end', function() { console.log(d3.event.x.toFixed(), d3.event.y.toFixed()); })
      );

    this.ballLabel = this.ballGroup.append('text')
      .attr('x', 42 + 3.0)
      .attr('y', 39 + 1.0)
      .attr('class', 'text-label')
      .text('Ball');
  }

  addPlayerCircles() {
    let p1Group = this.playerCirclesGroup.append('g').attr('id', 'p1-group');
    let p2Group = this.playerCirclesGroup.append('g').attr('id', 'p2-group');

    this.p1Circle = p1Group.append('circle')
      .attr('cx', 42)
      .attr('cy', 45)
      .attr('r', 1.5)
      .attr('fill', 'steelblue')
      .call(d3.drag()
        .on('drag', function() {
          d3.select(this.parentNode).select('text').attr('x', parseFloat(d3.event.x.toFixed()) + 3.0 + 'px').attr('y', parseFloat(d3.event.y.toFixed()) + 1.0 + 'px');
          d3.select(this).attr('cx', d3.event.x.toFixed()).attr('cy', d3.event.y.toFixed());
        })
        .on('end', function() { console.log(d3.event.x.toFixed(), d3.event.y.toFixed()); })
      );

    this.p1Label = p1Group.append('text')
      .attr('x', 42 + 3.0)
      .attr('y', 45 + 1.0)
      .attr('class', 'text-label')
      .text('P1');
    
    this.p2Circle = p2Group.append('circle')
      .attr('cx', 42)
      .attr('cy', 33)
      .attr('r', 1.5)
      .attr('fill', 'orange')
      .call(d3.drag()
        .on('drag', function() {
          d3.select(this.parentNode).select('text').attr('x', parseFloat(d3.event.x.toFixed()) + 3.0 + 'px').attr('y', parseFloat(d3.event.y.toFixed()) + 1.0 + 'px');
          d3.select(this).attr('cx', d3.event.x.toFixed()).attr('cy', d3.event.y.toFixed());
        })
        .on('end', function() { console.log(d3.event.x.toFixed(), d3.event.y.toFixed()); })
      );

    this.p2Label = p2Group.append('text')
      .attr('x', 42 + 3.0)
      .attr('y', 33 + 1.0)
      .attr('class', 'text-label')
      .text('P2');
  }

  startCalibrationMode() {
    this.showCornerPoints();
    this.isInfoBlockShown = true;

    this.cornerCirclesGroup.attr('display', 'block');
    this.playerCirclesGroup.attr('display', 'none');
    this.ballGroup.attr('display', 'none');
  }

  finishCalibrationMode() {
    this.disactivatePoints();
    this.isInfoBlockShown = false;
    this.playerCirclesGroup.attr('display', 'block');
    this.ballGroup.attr('display', 'block');
  }

  showCornerPoints() {
  	this.points = [{x: 0, y: 0}, {x: 4.5, y: 0}, {x: 31.5, y: 0}, {x: 36, y: 0}, 
  	  {x: 4.5, y: 18}, {x: 18, y: 18}, {x: 31.5, y: 18}, 
  	  {x: 0, y: 39}, {x: 4.5, y: 39}, {x: 18, y: 39}, {x: 31.5, y: 39}, {x: 36, y: 39},
  	  {x: 4.5, y: 60}, {x: 18, y: 60}, {x: 31.5, y: 60},
  	  {x: 0, y: 78}, {x: 4.5, y: 78}, {x: 31.5, y: 78}, {x: 36, y: 78}];

    this.cornerCirclesGroup.selectAll().data(this.points).enter()
  	  .append('circle')
  	    .attr('cx', d => d.x)
  	    .attr('cy', d => d.y)
  	    .attr('r', 1.6)
  	    .attr('fill', 'gray')
  	    .attr('fill-opacity', '0.4');
  }

  resetAllPoints() {
    this.p1Circle.attr('cx', 42).attr('cy', 45);
    this.p1Label.attr('x', 42 + 3).attr('y', 45 + 1);

    this.p2Circle.attr('cx', 42).attr('cy', 33);
    this.p2Label.attr('x', 42 + 3).attr('y', 33 + 1);

    this.ballCircle.attr('cx', 42).attr('cy', 39);
    this.ballLabel.attr('x', 42 + 3).attr('y', 39 + 1);
  }

  showPlayerPoint(playerNum: number, x: number, y: number) {
    if (playerNum === 1) {
      this.p1Circle.classed('blink', false);
      this.p1Circle.attr('cx', x + 4.5).attr('cy', y);
      this.p1Label.attr('x', x + 4.5 + 3).attr('y', y + 1);
    }
    else {
      this.p2Circle.classed('blink', false);
      this.p2Circle.attr('cx', x + 4.5).attr('cy', y);
      this.p2Label.attr('x', x + 4.5 + 3).attr('y', y + 1);
    }
  }

  highlightPlayerPoint(playerNum: number) {
    if (playerNum === 1) this.p1Circle.classed('blink', true);
    else this.p2Circle.classed('blink', true);
  }

  dehighlightPlayerPoints() {
    this.p1Circle.classed('blink', false);
    this.p2Circle.classed('blink', false);
  }

  showPoint(x: number, y: number) {
    this.ballCircle.attr('cx', x + 4.5).attr('cy', y);
    this.ballLabel.attr('x', x + 4.5 + 3).attr('y', y + 1);
  }

  highlightBallPoint() {
    this.ballCircle.classed('blink', true);
  }

  dehighlightBallPoint() {
    this.ballCircle.classed('blink', false);
  }

  disactivatePoints() {
    this.cornerCirclesGroup.selectAll('circle').classed('completed', false).classed('blink-red', false);
    this.cornerCirclesGroup.attr('display', 'none');
  }

  disactivatePoint(x: number, y: number) {
    this.cornerCirclesGroup.selectAll('circle').filter(d => d.x === x && d.y === y).classed('completed', false).classed('blink-red', false);
  }

  activatePoint(x: number, y: number) {
    this.cornerCirclesGroup.selectAll('circle').filter(d => d.x === x && d.y === y).classed('blink-red', false).classed('completed', true);
  }

  highlightPoint(x: number, y: number) {
  	this.cornerCirclesGroup.selectAll('circle').filter(d => d.x === x && d.y === y).classed('completed', false).classed('blink-red', true);
  }

}
