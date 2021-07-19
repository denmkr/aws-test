import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoComponent } from './position-processing/video/video.component';
import { TennisCourtComponent } from './position-processing/tennis-court/tennis-court.component';
import { PositionProcessingComponent } from './position-processing/position-processing.component';
import { ControlPanelComponent } from './position-processing/control-panel/control-panel.component';
import { ScorePanelComponent } from './position-processing/score-panel/score-panel.component';
import { DataPanelComponent } from './position-processing/data-panel/data-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    VideoComponent,
    TennisCourtComponent,
    PositionProcessingComponent,
    ControlPanelComponent,
    ScorePanelComponent,
    DataPanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
