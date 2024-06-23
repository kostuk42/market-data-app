import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { RestApiService } from '../../services/rest-api.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CHART_DATA } from '../../constants/constants';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexTitleSubtitle, ApexDataLabels, ChartComponent } from 'ng-apexcharts';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    title: ApexTitleSubtitle;
    dataLabels: ApexDataLabels;
  };

@Component({
  selector: 'app-historical-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgApexchartsModule],
  templateUrl: './historical-chart.component.html',
  styleUrls: ['./historical-chart.component.css']
})
export class HistoricalChartComponent implements OnChanges {

    @Input() chartData: any[] = [];
    @ViewChild('chart') chart!: ChartComponent;
    chartOptions: ChartOptions = {
        series: [
          {
            name: 'Candlestick',
            data: []
          }
        ],
        chart: {
          type: 'candlestick',
          height: 350
        },
        title: {
          text: '',
          align: 'left'
        },
        xaxis: {
          type: 'datetime'
        },
        yaxis: {
          tooltip: {
            enabled: true
          }
        },
        dataLabels: {
          enabled: true
        }
      };
  constructor(private restApiService: RestApiService) { }

    ngOnChanges(): void {
        const formattedData = this.chartData.map((entry: any) => ({
            x: new Date(entry.t),
            y: [entry.o, entry.h, entry.l, entry.c]
          }));
            this.chartOptions.series = [{
                name: 'Candlestick',
                data: formattedData
            }];
        console.log("chartData", this.chartData);
    }
}
