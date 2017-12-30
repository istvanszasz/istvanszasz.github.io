angular.module('G5Data').service('ChartService', function(UtilService) {

    var vm = this;
    var countries = [];
    var chart;

    const verticalLinePlugin = {
        getLinePosition: function (chart, pointIndex) {
            const meta = chart.getDatasetMeta(0); // first dataset is used to discover X coordinate of a point
            const data = meta.data;
            return data[pointIndex]._model.x;
        },
        renderVerticalLine: function (chartInstance, pointIndex) {
            const lineLeftOffset = this.getLinePosition(chartInstance, pointIndex);
            const scale = chartInstance.scales['y-axis-0'];
            const context = chartInstance.chart.ctx;
      
            // render vertical line
            context.beginPath();
            context.strokeStyle = '#000000';
            context.moveTo(lineLeftOffset, scale.top);
            context.lineTo(lineLeftOffset, scale.bottom);
            context.stroke();
      
            // write label
            context.fillStyle = "#000000";
            context.textAlign = 'center';
            context.fillText('', lineLeftOffset, (scale.bottom - scale.top) / 2 + scale.top);
        },
      
        afterDatasetsDraw: function (chart, easing) {
            if (chart.config.lineAtIndex) {
                chart.config.lineAtIndex.forEach(pointIndex => this.renderVerticalLine(chart, pointIndex));
            }
        }
        };
      
        Chart.plugins.register(verticalLinePlugin);

    vm.addChart = function(game, country){
        var ctx = document.getElementById(game.name).getContext('2d');

        countries.push(country);
        var gameData = _.sortBy(country.gameData, function(data){return data.date});
        var dates = _.map(gameData, function(data){return moment(data.date).format('YYYY-MM-DD')});
        var verticalLines = getQuarterLines(dates);
        var datasets = getDataForChart(countries);        

        chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: datasets
        },
        lineAtIndex: verticalLines,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
        });
    }

    function getDataForChart(countries){
        var dataSet = [];

        for(var i = 0; i < countries.length; i++){
            var country = countries[i];
            
            var gameData = _.sortBy(country.gameData, function(data){return data.date});
            var labels = _.map(gameData, function(data){return moment(data.date).format('YYYY-MM-DD')});
            var points = _.map(gameData, function(data){return data.placement});

            var color = UtilService.getRandomColor();
            var set = {
                label: country.name,
                data: points,
                fill:false,
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1
            }
            dataSet.push(set);
        }
        return dataSet;    
    }

    //Returns the indexes of the quarter end dates in the data set.
    function getQuarterLines(dates){
        var quarterOneEnd = '03-31';
        var quarterTwoEnd = '06-30';
        var quarterThreeEnd = '09-30';
        
        var result = [];

        for(var i = 0; i < dates.length; i++){
            var date = dates[i];
            date = date.slice(5); //remove year part of date string

            if(date === quarterOneEnd || date === quarterTwoEnd || date === quarterThreeEnd){
                result.push(i + 1);
            }
        }

        return result;
    }
});