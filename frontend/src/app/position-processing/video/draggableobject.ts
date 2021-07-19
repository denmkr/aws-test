import { Component, OnInit, ElementRef, HostListener } from '@angular/core';

export class DraggableObject {

  prevX: number;
  prevY: number;
  elem: any;

  constructor(elem) {
    this.elem = elem;
    
    this.elem.addEventListener('mousedown', (event) => this.onMouseDown(event));
    this.elem.addEventListener('dragstart', () => { return false });
  }

  onMouseDown(e) {
    let elem = this.elem;

    const coords = this.getCoords(elem);
    let shiftX = e.pageX - coords.left;
    let shiftY = e.pageY - coords.top;

    let prevX = e.pageX - shiftX;
    let prevY = e.pageY - shiftY;

    let slowValue = 0;
    if (e.shiftKey) slowValue = 0.7;

    moveAt(e);

    function moveAt(e) {
      const x = e.pageX - shiftX;
      const y = e.pageY - shiftY;

      // Slow down the position movement when SHIFT is pressed
      let xSlow = (prevX - x) * slowValue;
      let ySlow = (prevY - y) * slowValue;

      elem.style.left = `${x + xSlow}px`;
      elem.style.top = `${y + ySlow}px`;
    }

    document.onmousemove = function(e) {
      moveAt(e);
    };

    document.onmouseup = function() {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }

  getCoords(elem) { // except IE8-
    const containerXShift = elem.parentElement.getBoundingClientRect().x;
    const containerYShift = elem.parentElement.getBoundingClientRect().y;

    const pointShift = 5;

    const box = elem.getBoundingClientRect();
    return {
      top: box.top + pageYOffset - containerYShift + pointShift,
      left: box.left + pageXOffset - containerXShift + pointShift
    };
  }

}
