var app = angular.module('G5Data',[]);

app.controller("MainController", function($scope, $http, ChartService, UtilService, DataService){

    $scope.gamesWanted = ['hidden city', 'mahjong journey', 'secret society', 'twin moons society', 'supermarket mania', 'pirates'];
    $scope.blacklistedWords = ['hd', 'full', '2'];
    $scope.useFilter = true;

    $scope.add = function() {
        var f = document.getElementById('file').files[0],
            r = new FileReader();

        r.onloadend = function(e) {
            var data = e.target.result;
            $scope.parseInData(UtilService.decode_utf8(data), true);
        }

        r.readAsBinaryString(f);
    }

    $scope.iphone = function(){
        DataService.getData($http, 'http://www.g5info.se/php/chartiphone.csv').then(function(response){
            $scope.parseInData(response.data);            
        })
    }

    $scope.ipad = function(){
        DataService.getData($http, 'http://www.g5info.se/php/chart.csv').then(function(response){
            $scope.parseInData(response.data);            
        })
    }

    $scope.google = function(){
        DataService.getData($http, 'http://www.g5info.se/php/chart_googleplay_topgrossing.csv').then(function(response){
            $scope.parseInData(response.data);            
        })
    }

    $scope.parseInData = function(data, applyChanges){
        var lines, lineNumber, length;
        $scope.games = [];
        lines = data.split('\n');
        lineNumber = 0;
        
        for (var i = lines.length - 1; i >= 0; i--) {
            l = lines[i];

            lineNumber++;
            data = l.split(';');

            var name = data[0];
            var place = data[1];
            var countryName = data[2];
            var date = data[3];

            if($scope.useFilter && (!name || !_.find($scope.gamesWanted, function(gameWanted){ return name.toLowerCase().indexOf(gameWanted) !== -1})
                     || _.find($scope.blacklistedWords, function(blacklistedWord){ return name.toLowerCase().indexOf(blacklistedWord) !== -1}))){
                continue; //if no name or game not wanted (not in gamesWanted list), move on
            }

            var trimmedName = name.replace('®', '');
            name = trimmedName.replace('™', '');

            var game = _.find($scope.games, function(game){ return name.toLowerCase().startsWith(game.name.toLowerCase())});

            if(!game){
                game = { name: name, countries : [], sortedData:[]}
                $scope.games.push(game);
            }

            var country = _.find(game.countries, function(country){ return country.name === countryName});

            if(!country){
                country = {name : countryName, gameData: []};
                game.countries.push(country);
            }

            country.gameData.push({placement: parseInt(place), date: new Date(date)});
        }

        if(applyChanges){
            $scope.$apply();
        }
    }

    $scope.countrySelected = function(game){
        $scope.prepareDataForCountry(game, true);
    }

    $scope.prepareDataForCountry = function(game, addToChart){
        var country = _.find(game.countries, function(c){ return c.name === game.selectedCountry});

        var gameData = country.gameData;

        for(var i = 0; i < gameData.length; i++){
            var data = gameData[i];
            data.quarter = moment(data.date).utc().quarter();
            data.year = moment(data.date).year();
        }

        gameData = _.chain(gameData)
                    .sortBy('year')
                    .sortBy('quarter')
                    .sortBy('date').value();

        var years = _(gameData).chain().flatten().pluck('year').unique().value()

        _.each(years, function(year){
            if(!year){
                return;
            }

            var firstQuarter = _.filter(gameData, function(data) { return data.quarter === 1 && data.year === year});
            var secondQuarter = _.filter(gameData, function(data) { return data.quarter === 2 && data.year === year});
            var thirdQuarter = _.filter(gameData, function(data) { return data.quarter === 3 && data.year === year});
            var fourthQuarter = _.filter(gameData, function(data) { return data.quarter === 4 && data.year === year});
            
            var quarterData = {
                    country:country.name,
                    year: year,
                    quarters: []
            };

            if(firstQuarter.length > 0){
                quarterData.quarters.push(
                    {
                        quarter: 1,
                        data: firstQuarter,
                        average: UtilService.average(_.map(firstQuarter, function(data){return data.placement})),
                        median: UtilService.median(_.map(firstQuarter, function(data){return data.placement})),
                        min: _.min(_.pluck(firstQuarter, 'placement')),
                        max: _.max(_.pluck(firstQuarter, 'placement'))
                    }
                )
            }

            if(secondQuarter.length > 0){
                quarterData.quarters.push(
                    {
                        quarter: 2,
                        data: secondQuarter,
                        average: UtilService.average(_.map(secondQuarter, function(data){return data.placement})),
                        median: UtilService.median(_.map(secondQuarter, function(data){return data.placement})),                        
                        min: _.min(_.pluck(secondQuarter, 'placement')),
                        max: _.max(_.pluck(secondQuarter, 'placement'))
                    }
                )
            }

            if(thirdQuarter.length > 0){
                quarterData.quarters.push(
                    {
                        quarter: 3,
                        data: thirdQuarter,
                        average: UtilService.average(_.map(thirdQuarter, function(data){return data.placement})),
                        median: UtilService.median(_.map(thirdQuarter, function(data){return data.placement})),                        
                        min: _.min(_.pluck(thirdQuarter, 'placement')),
                        max: _.max(_.pluck(thirdQuarter, 'placement'))
                    }
                )
            }

            if(fourthQuarter.length > 0){
                quarterData.quarters.push(
                    {
                        quarter: 4,
                        data: fourthQuarter,
                        average: UtilService.average(_.map(fourthQuarter, function(data){return data.placement})),
                        median: UtilService.median(_.map(fourthQuarter, function(data){return data.placement})),                        
                        min: _.min(_.pluck(fourthQuarter, 'placement')),
                        max: _.max(_.pluck(fourthQuarter, 'placement'))
                    }
                )
            }

            var oldData = _.find(game.sortedData, function(data){return data.country === quarterData.country && data.year === quarterData.year});
            if(oldData){
                oldData = quarterData;
            } else {
                game.sortedData.push(quarterData);
            }
        })

        if(addToChart){
            game.showChart = true;
            ChartService.addChart(game, country);
        }
    }

    $scope.showAll = function(game){
        game.allData = [];
        game.countries = _.sortBy(game.countries, function(country){ return country.name});

        _.each(game.countries, function(country){
            game.selectedCountry = country.name;
            $scope.prepareDataForCountry(game);
        });

        var lowestQuarters = [];
        //loop through every country and find the quarter with the lowest value
        for(var i = 0; i < game.sortedData.length; i++){
            var countryData = game.sortedData[i];
            var flattened = _.flatten(_.map(countryData, _.values));
            var lowestQuarterAverage = _.min(flattened, _.property('average'));

            if(lowestQuarterAverage){
                lowestQuarterAverage.isLowest = true;
                lowestQuarters.push(lowestQuarterAverage);
            }
        }

        for(var i = 1; i < 5; i++){ //each quarter
            var quarter = {quarter: i, values:[]};

            for(var j = 0; j < game.sortedData.length; j++){
                var countryData = game.sortedData[j];

                var quarterData = _.find(countryData.quarters, function(quarter){return quarter.quarter === i});
                var foundInLowest = _.find(lowestQuarters, function(quarter){return quarter.quarter === i && quarter.average === quarterData.average && quarter.min === quarterData.min && quarter.max === quarterData.max});

                if(quarterData){
                    quarter.values.push({value: quarterData.average, country: countryData.country, isLowest: foundInLowest != null});
                }
            }

            if(quarter.values.length > 0){ //only add quarters that have data
                game.allData.push(quarter);                
            }
        }        
    }
});