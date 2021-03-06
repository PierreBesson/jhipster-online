/**
 * Copyright 2017-2018 the original author or authors from the JHipster Online project.
 *
 * This file is part of the JHipster Online project, see https://github.com/jhipster/jhipster-online
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { NgxEchartsService } from 'ngx-echarts';

import { StatisticsService } from 'app/home/statistics/statistics.service';
import { HomeService } from 'app/home/home.service';
import { Chart, Frequency } from 'app/home/statistics/statistics.model';
import { barChartOptions, comparingLineChartOptions, pieChartOptions } from 'app/home/statistics/statistics.options';

@Component({
    selector: 'jhi-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['statistics.scss']
})
export class StatisticsComponent implements AfterViewInit, OnDestroy {
    @ViewChild('chartTrend1') chartTrend1: ElementRef;
    @ViewChild('chartTrend2') chartTrend2: ElementRef;
    @ViewChild('chartTrend3') chartTrend3: ElementRef;
    @ViewChild('chartTrend4') chartTrend4: ElementRef;
    @ViewChild('chartTrendFull1') chartTrendFull1: ElementRef;
    @ViewChild('chartTrendFull2') chartTrendFull2: ElementRef;
    @ViewChild('chartTrendFull3') chartTrendFull3: ElementRef;
    @ViewChild('chartTrendFull4') chartTrendFull4: ElementRef;
    @ViewChild('chartFrameworkLine') chartFrameworkLine: ElementRef;
    @ViewChild('chartFrameworkPie') chartFrameworkPie: ElementRef;
    @ViewChild('chartBuildtoolLine') chartBuildtoolLine: ElementRef;
    @ViewChild('chartBuildtoolPie') chartBuildtoolPie: ElementRef;
    @ViewChild('chartDeploymentLine') chartDeploymentLine: ElementRef;
    @ViewChild('chartDeploymentPie') chartDeploymentPie: ElementRef;
    @ViewChild('chartDBProdLine') chartDBProdLine: ElementRef;
    @ViewChild('chartDBProdPie') chartDBProdPie: ElementRef;
    @ViewChild('chartCacheLine') chartCacheLine: ElementRef;
    @ViewChild('chartCachePie') chartCachePie: ElementRef;
    @ViewChild('chartVersionLine') chartVersionLine: ElementRef;
    @ViewChild('chartVersionPie') chartVersionPie: ElementRef;
    @ViewChild('chartAppTypeLine') chartAppTypeLine: ElementRef;
    @ViewChild('chartAppTypePie') chartAppTypePie: ElementRef;
    @ViewChild('chartJDLLine') chartJDLLine: ElementRef;
    @ViewChild('chartJDLPie') chartJDLPie: ElementRef;

    countYoRcByDate: Observable<string>;
    countYos: Observable<string>;
    countJdls: Observable<string>;
    countUsers: Observable<string>;

    timeScale: string = Frequency.DEFAULT;
    generatedApps = true;

    constructor(
        private statisticsService: StatisticsService,
        private homeService: HomeService,
        private echartsService: NgxEchartsService
    ) {}

    ngAfterViewInit() {
        this.countYos = this.statisticsService.countYos();
        this.countJdls = this.statisticsService.countJdls();
        this.countUsers = this.statisticsService.countUsers();
        this.onSelectTimeScale(Frequency.DEFAULT);
    }

    public setTimeScale() {
        this.onSelectTimeScale(this.timeScale);
    }

    public toggleFullscreen() {
        this.homeService.toggleFullScreen();
    }

    public isFullScreen() {
        return this.homeService.isFullScreen();
    }

    public exitFullScreen() {
        this.homeService.exitFullScreen();
    }

    public onSelectTimeScale(event) {
        if (event === undefined) {
            return;
        }
        if (event) {
            this.timeScale = event;
        }

        this.refreshData();
    }

    public refreshData() {
        switch (this.timeScale) {
            case 'yearly':
                this.displayCharts(Frequency.MONTHLY);
                // this.displayGenerationCount(Frequency.YEARLY, this.chartJDL);
                break;
            case 'monthly':
                this.displayCharts(Frequency.WEEKLY);
                break;
            case 'weekly':
                this.displayCharts(Frequency.DAILY);
                break;
            case 'daily':
                this.displayCharts(Frequency.HOURLY);
                break;
            case 'default':
            default:
                this.generatedApps = true;
                if (this.isFullScreen()) {
                    this.displayGenerationCount(Frequency.YEARLY, this.chartTrendFull1);
                    this.displayGenerationCount(Frequency.MONTHLY, this.chartTrendFull2);
                    this.displayGenerationCount(Frequency.DAILY, this.chartTrendFull3);
                    this.displayGenerationCount(Frequency.HOURLY, this.chartTrendFull4);
                } else {
                    this.displayGenerationCount(Frequency.YEARLY, this.chartTrend1);
                    this.displayGenerationCount(Frequency.MONTHLY, this.chartTrend2);
                    this.displayGenerationCount(Frequency.DAILY, this.chartTrend3);
                    this.displayGenerationCount(Frequency.HOURLY, this.chartTrend4);
                }
                break;
        }
    }

    private displayGenerationCount(frequency: string, chart: any) {
        this.statisticsService.getCount(frequency).subscribe(data => new Chart(this.echartsService, barChartOptions(data), chart).build());
    }

    private displayEntityGenerationStats(frequency: string, field: string, lineChar: any, pieChart: any) {
        this.statisticsService.getEntityFieldCount(field, frequency).subscribe((data: any) => this.displayData(data, lineChar, pieChart));
    }

    private displayData(data: any, lineChart, pieChart) {
        data.sort((a: any, b: any) => new Date(a.date).toISOString().localeCompare(new Date(b.date).toISOString()));

        const linechartCompared1 = new Chart(this.echartsService, comparingLineChartOptions(data, 'Date', 'Amount'), lineChart).build();

        const pieChartData = data.reduce((acc, current) => {
            Object.keys(current.values).forEach(e => {
                const currentSum = acc[e] || 0;
                acc[e] = currentSum + current.values[e];
            });
            return acc;
        }, {});

        const lineChartCompared2 = new Chart(this.echartsService, pieChartOptions(pieChartData), pieChart).build();
        this.updateRelatedBasicChartOf(data, linechartCompared1.chartInstance, lineChartCompared2);
    }

    private displayChart(frequency: string, field: string, chartLine: any, chartPie: any) {
        this.statisticsService.getFieldCount(field, frequency).subscribe(data => {
            this.displayData(data, chartLine, chartPie);
        });
    }

    private displayDeploymentTools(frequency: string, lineChart, pieChart) {
        this.statisticsService.getDeploymentToolsCount(frequency).subscribe((data: any) => this.displayData(data, lineChart, pieChart));
    }

    private displayCharts(frequency: string) {
        this.generatedApps = false;

        this.displayChart(frequency, 'clientFramework', this.chartFrameworkLine, this.chartFrameworkPie);
        this.displayChart(frequency, 'buildTool', this.chartBuildtoolLine, this.chartBuildtoolPie);
        this.displayDeploymentTools(frequency, this.chartDeploymentLine, this.chartDeploymentPie);
        this.displayChart(frequency, 'prodDatabaseType', this.chartDBProdLine, this.chartDBProdPie);
        this.displayChart(frequency, 'cacheProvider', this.chartCacheLine, this.chartCachePie);
        this.displayChart(frequency, 'jhipsterVersion', this.chartVersionLine, this.chartVersionPie);
        this.displayChart(frequency, 'applicationType', this.chartAppTypeLine, this.chartAppTypePie);
        this.displayEntityGenerationStats(frequency, 'fields', this.chartJDLLine, this.chartJDLPie);
    }

    private updateRelatedBasicChartOf(data: any, chartInstance: any, basicChartInstance: Chart) {
        chartInstance.on('dataZoom', () => {
            const minDate = data[chartInstance.getOption().dataZoom[0].startValue].date;
            const maxDate = data[chartInstance.getOption().dataZoom[0].endValue].date;
            let arr = data.filter(obj => new Date(obj.date) >= new Date(minDate) && new Date(obj.date) <= new Date(maxDate));
            arr = arr.reduce((acc, current) => {
                Object.keys(current.values).forEach(e => {
                    const currentSum = acc[e] || 0;
                    acc[e] = currentSum + current.values[e];
                });
                return acc;
            }, {});

            timer(250).subscribe(() => {
                basicChartInstance.chartInstance.setOption(pieChartOptions(arr));
            });
        });
    }

    ngOnDestroy() {
        this.exitFullScreen();
    }
}
