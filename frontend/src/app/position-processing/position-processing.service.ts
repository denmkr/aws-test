import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
};

@Injectable({
  providedIn: 'root'
})
export class PositionProcessingService {
  constructor(private http: HttpClient) { }

  getCourtPositionOfPoint(x: number, y: number) {
  	let httpParams = new HttpParams()
      .append('x', x.toFixed(2).toString())
      .append('y', y.toFixed(2).toString())

    return this.http.get<any>('http://127.0.0.1:5000/api/homography/position', { params: httpParams, reportProgress: true });
  }

  setHomography(points: any) {
    let pointsArray = [];
    points.forEach(p => { pointsArray.push([p.img_x, p.img_y]) });

    return this.http.post<any>('http://127.0.0.1:5000/api/homography/set', JSON.stringify(pointsArray), { headers: httpOptions.headers });
  }

  setStrokeProperties(netPoints: any) {
    let pointsArray = [];
    netPoints.forEach(p => { pointsArray.push([p.img_x, p.img_y]) });

    return this.http.post<any>('http://127.0.0.1:5000/api/stroke/set', JSON.stringify([pointsArray]), { headers: httpOptions.headers });
  }

  getStrokeSide(playerx: number, playery: number, ballx: number, bally: number, rightHand: boolean) {
    let httpParams = new HttpParams()
      .append('playerx', playerx.toFixed(2).toString())
      .append('playery', playery.toFixed(2).toString())
      .append('ballx', ballx.toFixed(2).toString())
      .append('bally', bally.toFixed(2).toString())
      .append('right_hand', rightHand.toString())

    return this.http.get<any>('http://127.0.0.1:5000/api/stroke/side', { params: httpParams, reportProgress: true });
  }

  getStrokePlayer(player1X: number, player1Y: number, player2X: number, player2Y: number, ballX: number, ballY: number) {
    let httpParams = new HttpParams()
      .append('player1x', player1X.toFixed(2).toString())
      .append('player1y', player1Y.toFixed(2).toString())
      .append('player2x', player2X.toFixed(2).toString())
      .append('player2y', player2Y.toFixed(2).toString())
      .append('ballx', ballX.toFixed(2).toString())
      .append('bally', ballY.toFixed(2).toString())

    return this.http.get<any>('http://127.0.0.1:5000/api/stroke/player', { params: httpParams, reportProgress: true });
  }
}
