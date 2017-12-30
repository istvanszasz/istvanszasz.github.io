
angular.module('G5Data').service('DataService', function() {

    var vm = this;

    vm.getData = function (http, url){
        return http({
        method: 'GET',
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
        },
        url: url
        });
    }
});


angular.module('G5Data').service('APIInterceptor', function() {
    var service = this;
    service.request = function(config) {
        config.url = 'https://cors-anywhere.herokuapp.com/' + config.url;
        return config;
    };
    service.responseError = function(response) {
        console.error(response);
      return response;
    };
});