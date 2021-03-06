import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Statistics } from 'src/app/core/interfaces/statistics';
import { StatisticsService } from 'src/app/core/services/statistics/statistics.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ChartType, ChartOptions } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthServiceService } from 'src/app/core/services/auth-service.service';
import { Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import getError from '../utils/error';
import { SummaryStatistics } from 'src/app/core/interfaces/summary-statistics';
import { groupBy } from '../utils/group-by';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  statisticsArray: Statistics[];
  totalCases: number;
  totalTests: number;
  totalDeaths: number;
  continents: {};
  closeResult: string;
  public pieChartData: SingleDataSet = [0, 0, 0];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  dtTrigger: Subject<any> = new Subject<any>();
  singleCountry: Statistics;
  formGroupNewCases: FormGroup;
  formGroupTests: FormGroup;
  formGroupDeaths: FormGroup;
  modalInfo: boolean;
  modalReference: any;

  summaryStatistics: SummaryStatistics[] = [];
  destroyed$ = new Subject<void>();

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };

  public pieChartLabels: Label[] = [
    'Total cases',
    'Total tests',
    'Total deaths',
  ];

  public pieChartPlugins = [
    {
      afterLayout: function (chart) {
        chart.legend.legendItems.forEach((label) => {
          const value = chart.data.datasets[0].data[label.index];

          label.text += ': ' + value;
          return label;
        });
      },
    },
  ];

  colors: Color[] = [
    {
      backgroundColor: ['#28a745', '#007bff', '#dc3545'],
    },
  ];

  constructor(
    private statisticsService: StatisticsService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private authService: AuthServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getStatisticsValues(true);

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 15,
    };

    this.initFormNewCases();
    this.initFormTests();
    this.initFormDeaths();
  }

  initFormNewCases(): void {
    this.formGroupNewCases = new FormGroup({
      idNewCases: new FormControl('', [Validators.required]),
      newCases: new FormControl('', [Validators.required]),
      activeNewCases: new FormControl('', [Validators.required]),
      recoveredNewCases: new FormControl('', [Validators.required]),
      criticalNewCases: new FormControl('', [Validators.required]),
    });
  }

  initFormTests(): void {
    this.formGroupTests = new FormGroup({
      idCountryTestInfo: new FormControl('', [Validators.required]),
      newTests: new FormControl('', [Validators.required]),
    });
  }

  initFormDeaths(): void {
    this.formGroupDeaths = new FormGroup({
      idCountryDeathInfo: new FormControl('', [Validators.required]),
      newDeaths: new FormControl('', [Validators.required]),
    });
  }

  getStatisticsValues(flagTable: boolean): void {
    this.statisticsService
      .getStatistics()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((statistics) => {
        this.statisticsArray = statistics.filter(
          (statistic) =>
            statistic.continent !== 'All' && statistic.continent !== null
        );
        this.getValues(this.statisticsArray);
        if (flagTable === true) {
          this.dtTrigger.next();
        } else {
          this.rerender();
        }
      });
  }

  getValues(statisticsArray: any[]): void {
    let summaryTotalCases = 0;
    let summaryTotalTests = 0;
    let summaryTotalDeaths = 0;

    this.calculateSummaryStatistics(statisticsArray);

    for (const statistic of statisticsArray) {
      summaryTotalCases += statistic.cases.total || 0;
      summaryTotalTests += statistic.tests.total || 0;
      summaryTotalDeaths += statistic.deaths.total || 0;
    }

    this.totalCases = summaryTotalCases;
    this.totalTests = summaryTotalTests;
    this.totalDeaths = summaryTotalDeaths;

    this.pieChartData = [this.totalCases, this.totalTests, this.totalDeaths];
  }

  calculateSummaryStatistics(statisticsArray: Statistics[]): void {
    this.summaryStatistics = [];
    const groupContinents = groupBy(statisticsArray, 'continent');
    const resultado: any = Object.entries(groupContinents);

    for (let res of resultado) {
      const totalCases = res[1]
        .map((statistic: Statistics) => statistic.cases.total)
        .map(Number)
        .reduce((total1: number, total2: number) => total1 + total2);
      const totalTests = res[1]
        .map((statistic: Statistics) => statistic.tests.total)
        .map(Number)
        .reduce((total1: number, total2: number) => total1 + total2);
      const totalDeaths = res[1]
        .map((statistic: Statistics) => statistic.deaths.total)
        .map(Number)
        .reduce((total1: number, total2: number) => total1 + total2);

      this.summaryStatistics.push({
        continent: res[0],
        totalCases,
        totalTests,
        totalDeaths,
      });
    }
  }

  getStatisticsByContinent(continent: string): void {
    this.statisticsService
      .getByContinentName(continent)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((informationForContinent) => {
        this.statisticsArray = [...informationForContinent];
        this.rerender();
      });
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
      this.cdr.detectChanges();
    });
  }

  open(content: any, statistic: Statistics): void {
    this.modalInfo = false;
    this.singleCountry = statistic;
    this.setUpdateValuesInModal(this.singleCountry);

    this.modalReference = this.modalService.open(content);
  }

  openInfo(content: any, statistic: Statistics): void {
    this.modalInfo = true;
    this.singleCountry = statistic;
    this.setValuesInModal(this.singleCountry);

    this.modalService.open(content);
  }

  setValuesInModal(statistics: Statistics): void {
    this.formGroupNewCases.controls['idNewCases'].setValue(statistics._id);

    this.formGroupNewCases.controls['newCases'].setValue(
      statistics.cases.newCases
    );

    this.formGroupNewCases.controls['activeNewCases'].setValue(
      statistics.cases.active
    );

    this.formGroupNewCases.controls['recoveredNewCases'].setValue(
      statistics.cases.recovered
    );

    this.formGroupNewCases.controls['criticalNewCases'].setValue(
      statistics.cases.critical
    );

    this.formGroupTests.controls['idCountryTestInfo'].setValue(statistics._id);

    this.formGroupTests.controls['newTests'].setValue(statistics.tests.total);

    this.formGroupDeaths.controls['idCountryDeathInfo'].setValue(
      statistics._id
    );

    this.formGroupDeaths.controls['newDeaths'].setValue(
      statistics.deaths.total
    );
  }

  setUpdateValuesInModal(statistics: Statistics): void {
    this.formGroupNewCases.controls['idNewCases'].setValue(statistics._id);

    this.formGroupNewCases.controls['newCases'].setValue(0);

    this.formGroupNewCases.controls['activeNewCases'].setValue(0);

    this.formGroupNewCases.controls['recoveredNewCases'].setValue(0);

    this.formGroupNewCases.controls['criticalNewCases'].setValue(0);

    this.formGroupTests.controls['idCountryTestInfo'].setValue(statistics._id);

    this.formGroupTests.controls['newTests'].setValue(0);

    this.formGroupDeaths.controls['idCountryDeathInfo'].setValue(
      statistics._id
    );

    this.formGroupDeaths.controls['newDeaths'].setValue(0);
  }

  updateNewCases(): void {
    const data = {
      statisticId: this.formGroupNewCases.value.idNewCases,
      newCases: this.formGroupNewCases.value.newCases,
      active: this.formGroupNewCases.value.activeNewCases,
      recovered: this.formGroupNewCases.value.recoveredNewCases,
      critical: this.formGroupNewCases.value.criticalNewCases,
    };

    if (this.formGroupNewCases.valid) {
      this.statisticsService
        .updateCases(data)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (result) => {
            this.modalReference.close();
            this.getStatisticsValues(false);
          },
          (error: HttpErrorResponse) => {
            const errorMessage = getError(error);
            Swal.fire('Update new cases', errorMessage, 'error');
          }
        );
    }
  }

  updateTests(): void {
    const data = {
      statisticId: this.formGroupTests.value.idCountryTestInfo,
      newTests: this.formGroupTests.value.newTests,
    };

    if (this.formGroupTests.valid) {
      this.statisticsService
        .updateTests(data)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (result) => {
            this.modalReference.close();
            this.getStatisticsValues(false);
          },
          (error: HttpErrorResponse) => {
            const errorMessage = getError(error);
            Swal.fire('Update tests', errorMessage, 'error');
          }
        );
    }
  }

  updateDeaths(): void {
    const data = {
      statisticId: this.formGroupDeaths.value.idCountryDeathInfo,
      newDeaths: this.formGroupDeaths.value.newDeaths,
    };

    if (this.formGroupTests.valid) {
      this.statisticsService
        .updateDeaths(data)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (result) => {
            this.modalReference.close();
            this.getStatisticsValues(false);
          },
          (error: HttpErrorResponse) => {
            const errorMessage = getError(error);
            Swal.fire('Update deaths', errorMessage, 'error');
          }
        );
    }
  }

  synchronize(): void {
    this.statisticsService
      .synchronizeInfo()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((statistics) => {
        this.statisticsArray = statistics.filter(
          (statistic) =>
            statistic.continent !== 'All' && statistic.continent !== null
        );

        this.getValues(this.statisticsArray);
        this.rerender();
      });
  }

  logout() {
    this.authService
      .logout()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.router.navigateByUrl('/');
      });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
