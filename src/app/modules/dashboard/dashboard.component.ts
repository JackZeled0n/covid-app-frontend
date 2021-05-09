import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Statistics } from 'src/app/core/interfaces/statistics';
import { StatisticsService } from 'src/app/core/services/statistics/statistics.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  statisticsArray: Statistics[];
  totalCases: number;
  totalTests: number;
  totalDeaths: number;
  continents: {};
  mapFilterContinent: Map<any, any>;

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    title: {
      text: 'Visual statistics from coronavirus in the world',
    },
    series: [
      {
        data: [
          ['Total cases', 45.0],
          ['Tests', 12.8],
          ['Deaths', 26.8],
        ],
        type: 'pie',
      },
    ],
    colors: ['#4CAF50', '#536DFE', '#F76B57'],
  };

  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.getStatisticsValues();

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 15,
    };
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getStatisticsValues(): void {
    this.statisticsService.getStatistics().subscribe((result) => {
      this.statisticsArray = result;
      this.getValues(this.statisticsArray);
      this.dtTrigger.next();
    });
  }

  getValues(statisticsArray): void {
    let summaryTotalCases = 0;
    let summaryTotalTests = 0;
    let summaryTotalDeaths = 0;
    const continentsSet = new Set();

    for (let i = 0; i < statisticsArray.length; i++) {
      summaryTotalCases += statisticsArray[i].cases.total || 0;
      summaryTotalTests += statisticsArray[i].tests.total || 0;
      summaryTotalDeaths += statisticsArray[i].deaths.total || 0;

      if (statisticsArray[i].continent !== null) {
        continentsSet.add(statisticsArray[i].continent);
      }
    }

    this.totalCases = summaryTotalCases;
    this.totalTests = summaryTotalTests;
    this.totalDeaths = summaryTotalDeaths;
    this.continents = continentsSet;

    console.log(this.continents);

    let map = new Map();

    for (const continent of continentsSet) {
      map.set(
        continent,
        statisticsArray.filter(function (e) {
          return e.continent == continent;
        })
      );
    }

    this.mapFilterContinent = map;
  }
}
