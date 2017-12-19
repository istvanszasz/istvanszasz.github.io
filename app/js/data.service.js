
angular.module('G5Data').service('DataService', function() {

    var vm = this;

    vm.getData = function (http, url){
        return http({
        method: 'GET',
        headers: {
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Headers' : 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With',
            'Access-Control-Allow-Methods' : 'GET, PUT, POST',
        },
        url: url
        });
    }
});