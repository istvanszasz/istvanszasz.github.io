angular.module('G5Data').service('ChartService', function(UtilService) {

    var vm = this;
    var countries = [];
    var chart;

    vm.addChart = function(game, country){
        var ctx = document.getElementById(game.name).getContext('2d');

        countries.push(country);
        var gameData = _.sortBy(country.gameData, function(data){return data.date});
        var labels = _.map(gameData, function(data){return moment(data.date).format('YYYY-MM-DD')});

        var datasets = getDataForChart(countries);        

        chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
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
});