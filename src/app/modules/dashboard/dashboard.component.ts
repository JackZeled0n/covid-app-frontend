import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    title : {
      text: 'Visual statistics from coronavirus in the world'
   }
   , series: [{
      data: [
        ['Total cases',   45.0]
        , ['Tests',       12.8]
        , ['Deaths',       26.8]
      ],
      type: 'pie'
    }]
    , colors: [
      '#4CAF50',
      '#536DFE',
      '#F76B57'
    ],
  };

  constructor() { }

  ngOnInit(): void {
  }

}
