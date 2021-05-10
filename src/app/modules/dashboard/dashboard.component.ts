import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Statistics } from 'src/app/core/interfaces/statistics';
import { StatisticsService } from 'src/app/core/services/statistics/statistics.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ChartType, ChartOptions } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

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
  public pieChartPlugins = [];
  dtTrigger: Subject<any> = new Subject<any>();
  singleCountry: Statistics;
  formGroupNewCases: FormGroup;

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };

  public pieChartLabels: Label[] = [
    'Total cases',
    'Total tests',
    'Total deaths',
  ];

  constructor(
    private statisticsService: StatisticsService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.getStatisticsValues();

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 15,
    };

    this.initFormNewCases();
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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getStatisticsValues(): void {
    this.statisticsService.getStatistics().subscribe((statistics) => {
      this.statisticsArray = statistics.filter(
        (statistic) =>
          statistic.continent !== 'All' && statistic.continent !== null
      );
      this.getValues(this.statisticsArray);
      this.dtTrigger.next();
    });
  }

  getValues(statisticsArray: any[]): void {
    let summaryTotalCases = 0;
    let summaryTotalTests = 0;
    let summaryTotalDeaths = 0;
    const continentsSet = new Set();

    for (const statistic of statisticsArray) {
      summaryTotalCases += statistic.cases.total || 0;
      summaryTotalTests += statistic.tests.total || 0;
      summaryTotalDeaths += statistic.deaths.total || 0;

      continentsSet.add(statistic.continent);
    }

    this.totalCases = summaryTotalCases;
    this.totalTests = summaryTotalTests;
    this.totalDeaths = summaryTotalDeaths;
    this.continents = continentsSet;

    this.pieChartData = [this.totalCases, this.totalTests, this.totalDeaths];
  }

  getStatisticsByContinent(continent: string): void {
    this.statisticsService
      .getByContinentName(continent)
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
    this.singleCountry = statistic;

    this.formGroupNewCases.controls['idNewCases'].setValue(
      this.singleCountry._id
    );

    this.formGroupNewCases.controls['newCases'].setValue(
      this.singleCountry.cases.newCases
    );

    this.formGroupNewCases.controls['activeNewCases'].setValue(
      this.singleCountry.cases.active
    );

    this.formGroupNewCases.controls['recoveredNewCases'].setValue(
      this.singleCountry.cases.recovered
    );

    this.formGroupNewCases.controls['criticalNewCases'].setValue(
      this.singleCountry.cases.critical
    );

    this.modalService
      .open(content, { ariaLabelledBy: 'modal-edit-statistics' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
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
      this.statisticsService.updateCases(data).subscribe(
        (result) => {
          console.log(result);
          alert(result);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          console.log(error.error.message);
        }
      );
    }
  }
}
