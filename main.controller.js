var app = angular.module('G5Data',[]);

app.controller("MainController", function($scope, $http, $q, ChartService, UtilService, DataService){

    $scope.gamesWanted = ['hidden city', 'mahjong journey', 'secret society', 'twin moons society', 'supermarket mania', 'pirates'];
    $scope.blacklistedWords = ['hd', 'full', '2'];
    $scope.useFilter = true;
    $scope.isLoading = false;
    var above1000 = '>1000';
    var currentPlatform;
    var IPHONE = 'IPHONE';
    var IPAD = 'IPAD';
    var GOOGLE = 'GOOGLE';

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
        currentPlatform = IPHONE;
        ChartService.clearData();
        $scope.isLoading = true;
        DataService.getData($http, 'http://www.g5info.se/php/chartiphone_2017.csv').then(function(history){
            DataService.getData($http, 'http://www.g5info.se/php/chartiphone.csv').then(function(response){

                $scope.parseInData(history.data + response.data);
                $scope.isLoading = false;
            })
        })
    }

    $scope.ipad = function(){
        currentPlatform = IPAD;        
        ChartService.clearData();        
        $scope.isLoading = true;
        DataService.getData($http, 'http://www.g5info.se/php/chart_2017.csv').then(function(history){
            DataService.getData($http, 'http://www.g5info.se/php/chart.csv').then(function(response){
                $scope.parseInData(history.data + response.data);
                $scope.isLoading = false;
            })
        })
    }

    $scope.google = function(){
        currentPlatform = GOOGLE;        
        ChartService.clearData();
        $scope.isLoading = true;
        DataService.getData($http, 'http://www.g5info.se/php/chart_googleplay_topgrossing_2017.csv').then(function(history){
            DataService.getData($http, 'http://www.g5info.se/php/chart_googleplay_topgrossing.csv').then(function(response){
                $scope.parseInData(history.data + response.data);
                $scope.isLoading = false;
            })
        })
    }

    function iphonefree(country){
        return $q(function(resolve){

            $scope.isLoading = true;
            DataService.getData($http, 'http://www.g5info.se/php/chartiphone_free_2017.csv').then(function(history){
                DataService.getData($http, 'http://www.g5info.se/php/chartiphone_free.csv').then(function(response){

                    var game = parseFreeDownloadsData(history.data + response.data, country);
                    $scope.isLoading = false;

                    resolve(game);
                })
            })
        })        
    }

    function ipadfree(country){
        return $q(function(resolve){

            $scope.isLoading = true;
            DataService.getData($http, 'http://www.g5info.se/php/chart_free_2017.csv').then(function(history){
                DataService.getData($http, 'http://www.g5info.se/php/chart_free.csv').then(function(response){

                    var game = parseFreeDownloadsData(history.data + response.data, country);
                    $scope.isLoading = false;

                    resolve(game);
                })
            })
        })        
    }

    function googlefree(country){
        return $q(function(resolve){

            $scope.isLoading = true;
            DataService.getData($http, 'http://www.g5info.se/php/chart_googleplay_topselling_free_2017.csv').then(function(history){
                DataService.getData($http, 'http://www.g5info.se/php/chart_googleplay_topselling_free.csv').then(function(response){

                    var game = parseFreeDownloadsData(history.data + response.data, country);
                    $scope.isLoading = false;

                    resolve(game);
                })
            })
        })
    }

    $scope.addDownloads = function(game){
        if(!game || !game.showDownloads || !game.selectedCountry){
            return;
        }

        if(currentPlatform === IPHONE){
            var country = game.selectedCountry;
            iphonefree(country).then(function(currentGame){
                $scope.prepareDataForCountry(currentGame, true, true);
            });
        }

        if(currentPlatform === IPAD){
            var country = game.selectedCountry;
            ipadfree(country).then(function(currentGame){
                $scope.prepareDataForCountry(currentGame, true, true);
            });
        }

        if(currentPlatform === GOOGLE){
            var country = game.selectedCountry;
            googlefree(country).then(function(currentGame){
                $scope.prepareDataForCountry(currentGame, true, true);
            });
        }
    }

    function parseFreeDownloadsData(data, selectedCountry){
        var lines, lineNumber, length;
        // $scope.games = [];
        lines = data.split('\n');
        lineNumber = 0;
        
        for (var i = lines.length - 1; i >= 0; i--) {
            l = lines[i];

            lineNumber++;
            data = l.split(';');

            var name = data[0];
            var place = data[1];
            var countryName = data[2];

            if(countryName !== selectedCountry){
                continue;
            }

            countryName = countryName + '_free';

            var date = data[3];

            if(isGameUnwanted(name)){
                continue; //if no name or game not wanted (not in gamesWanted list), move on
            }

            var whiteListedGameName = _.find($scope.gamesWanted, function(wantedGame){return name.toLowerCase().indexOf(wantedGame) !== -1});

            var game = _.find($scope.games, function(game){ return whiteListedGameName.toLowerCase().startsWith(game.name.toLowerCase())});

            if(!game){
                game = { name: whiteListedGameName, countries : [], sortedData:[]}
                $scope.games.push(game);
            }

            var country = _.find(game.countries, function(country){ return country.name === countryName});

            if(!country){
                country = {name : countryName, gameData: []};
                game.countries.push(country);
            }

            country.gameData.push({placement: parseInt(place), date: new Date(date)});
        }

        return game;
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

            if(isGameUnwanted(name)){
                continue; //if no name or game not wanted (not in gamesWanted list), move on
            }

            var whiteListedGameName = _.find($scope.gamesWanted, function(wantedGame){return name.toLowerCase().indexOf(wantedGame) !== -1});

            var game = _.find($scope.games, function(game){ return whiteListedGameName.toLowerCase().startsWith(game.name.toLowerCase())});

            if(!game){
                game = { name: whiteListedGameName, countries : [], sortedData:[]}
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

    function isGameUnwanted(name){
        return $scope.useFilter && (!name || !_.find($scope.gamesWanted, function(gameWanted){ return name.toLowerCase().indexOf(gameWanted) !== -1})
        || _.find($scope.blacklistedWords, function(blacklistedWord){ return name.toLowerCase().indexOf(blacklistedWord) !== -1}));
    }

    $scope.countrySelected = function(game){
        if(game.showDownloads){
            ChartService.clearData();
            game.showDownloads = false;
        }
        $scope.prepareDataForCountry(game, true);
    }

    $scope.prepareDataForCountry = function(game, addToChart, isDownloads){
        var currentCountry = isDownloads ? game.selectedCountry + '_free' : game.selectedCountry;
        var country = _.find(game.countries, function(c){ return c.name === currentCountry});

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

        var years = _(gameData).chain().flatten().pluck('year').unique().value();

        var quarterData = {
            country:country.name,
            // year: year,
            quarters: []
        };
        _.each(years, function(year){
            if(!year){
                return;
            }

            var firstQuarter = _.filter(gameData, function(data) { return data.quarter === 1 && data.year === year});
            var secondQuarter = _.filter(gameData, function(data) { return data.quarter === 2 && data.year === year});
            var thirdQuarter = _.filter(gameData, function(data) { return data.quarter === 3 && data.year === year});
            var fourthQuarter = _.filter(gameData, function(data) { return data.quarter === 4 && data.year === year});
        

            if(firstQuarter.length > 0){
                quarterData.quarters.push(
                    {
                        quarter: 1,
                        data: firstQuarter,
                        average: {value : UtilService.average(_.map(firstQuarter, function(data){return data.placement})), isLowest : false},
                        median: {value: UtilService.median(_.map(firstQuarter, function(data){return data.placement})), isLowest : false},
                        min: {value: _.min(_.pluck(firstQuarter, 'placement')), isLowest : false},
                        max: {value: _.max(_.pluck(firstQuarter, 'placement')), isLowest : false},
                        year: year
                    }
                )
            }

            if(secondQuarter.length > 0){
                quarterData.quarters.push(
                    {
                        quarter: 2,
                        data: secondQuarter,
                        average: {value : UtilService.average(_.map(secondQuarter, function(data){return data.placement})), isLowest : false},
                        median: {value: UtilService.median(_.map(secondQuarter, function(data){return data.placement})), isLowest : false},                        
                        min: {value: _.min(_.pluck(secondQuarter, 'placement')), isLowest : false},
                        max: {value: _.max(_.pluck(secondQuarter, 'placement')), isLowest : false},
                        year: year                        
                    }
                )
            }

            if(thirdQuarter.length > 0){
                quarterData.quarters.push(
                    {
                        quarter: 3,
                        data: thirdQuarter,
                        average: {value : UtilService.average(_.map(thirdQuarter, function(data){return data.placement})), isLowest : false},
                        median: {value: UtilService.median(_.map(thirdQuarter, function(data){return data.placement})), isLowest : false},
                        min: {value: _.min(_.pluck(thirdQuarter, 'placement')), isLowest : false},
                        max: {value: _.max(_.pluck(thirdQuarter, 'placement')), isLowest : false},
                        year: year                        
                    }
                )
            }

            if(fourthQuarter.length > 0){
                quarterData.quarters.push(
                    {
                        quarter: 4,
                        data: fourthQuarter,
                        average: {value : UtilService.average(_.map(fourthQuarter, function(data){return data.placement})), isLowest : false},                        
                        median: {value: UtilService.median(_.map(fourthQuarter, function(data){return data.placement})), isLowest : false},
                        min: {value: _.min(_.pluck(fourthQuarter, 'placement')), isLowest : false},
                        max: {value: _.max(_.pluck(fourthQuarter, 'placement')), isLowest : false},
                        year: year                        
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

        setLowestQuarterFor(game.sortedData);

        if(addToChart){
            game.showChart = true;
            game.allData = null; //hide table displaying averages for all countries
            ChartService.addChart(game, country, $scope);
        }
    }

    function setLowestQuarterFor(sortedData, property){
        var countries = _(sortedData).chain().flatten().pluck('country').unique().value();

        for(var l = 0; l < countries.length; l++){
            var currentCountry = countries[l];
            var dataForCountry = _.filter(sortedData, function(d){return d.country === currentCountry});
            var flattened = _.flatten(_.map(dataForCountry, function(d){return d.quarters}));

            var lowestQuarterAverage = _.min(flattened, function(o){return o.average.value});
            var lowestQuarterMedian = _.min(flattened, function(o){return o.median.value});
            var lowestQuarterMin = _.min(flattened, function(o){return o.min.value});
            var lowestQuarterMax = _.min(flattened, function(o){return o.max.value});

            if(lowestQuarterAverage){
                lowestQuarterAverage.average.isLowest = true;
            }
            if(lowestQuarterMedian){
                lowestQuarterMedian.median.isLowest = true;
            }
            if(lowestQuarterMin){
                lowestQuarterMin.min.isLowest = true;
            }
            if(lowestQuarterMax){
                lowestQuarterMax.max.isLowest = true;
            }
        }
    }

    $scope.showAll = function(game){
        game.allData = [];
        game.countries = _.sortBy(game.countries, function(country){ return country.name});

        _.each(game.countries, function(country){
            game.selectedCountry = country.name;
            $scope.prepareDataForCountry(game);
        });

        game.selectedCountry = '';

        var lowestQuarters = [];
        var years = _(game.sortedData).chain().flatten().pluck('quarters').flatten().pluck('year').unique().value();
        var countries = _(game.sortedData).chain().flatten().pluck('country').unique().value();

        for(var k = 0; k < years.length; k++){
            var year = years[k];

            var sortedDataForCurrentYear = _.filter(game.sortedData, function(data){ return data.year === year});            
            for(var i = 1; i < 5; i++){ //each quarter
                var quarter = {quarter: year + '-' + i, values:[]};

                for(var l = 0; l < countries.length; l++){
                    var currentCountry = countries[l];
                    var dataForCountry = _.filter(game.sortedData, function(d){return d.country === currentCountry});

                    var flattened = _.flatten(_.map(dataForCountry, function(d){return d.quarters}));
                    var lowestQuarterAverage = _.min(flattened, function(o){return o.average.value});
        
                    //if this is the lowest quarter, mark it
                    if(lowestQuarterAverage){
                        lowestQuarterAverage.isLowest = true;
                        lowestQuarters.push(lowestQuarterAverage);
                    }
                
                    var countryQuarters = _(dataForCountry).chain().flatten().pluck('quarters').flatten().unique().value();
                    var quarterData = _.find(countryQuarters, function(q){return q.quarter === i && q.year === year});

                    if(!quarterData){
                        //No data found, means that the value is above 1000
                        quarter.values.push({value: above1000, country: currentCountry, isLowest: false});                        
                        continue;
                    }

                    var foundInLowest = _.find(lowestQuarters, function(q){return q.quarter === i && q.average.value === quarterData.average.value && q.min === quarterData.min && q.max === quarterData.max});

                    if(quarterData){
                        quarter.values.push({value: quarterData.average.value, country: currentCountry, isLowest: foundInLowest != null});
                    }
                }

                var listContainsData = _.any(quarter.values, function(item){ return item.value !== above1000 });
                if(quarter.values.length > 0 && listContainsData){ //only add quarters that have data
                    game.allData.push(quarter);                
                }
            }
        }


        console.log(game.allData);
        game.sortedData = [];
        game.showChart = false; //hide chart
    }
});