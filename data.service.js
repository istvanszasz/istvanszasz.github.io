
angular.module('G5Data').service('DataService', function() {

    var vm = this;

    jQuery.ajaxPrefilter(function(options) {
        if (options.crossDomain && jQuery.support.cors) {
            options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
            console.log(options.url);
        }
    });

    vm.getData = function (http, url){
        // return http({
        // method: 'GET',
        // headers: {
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        // 'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
        // },
        // url: url
        // });

        return $.ajax({
            url: url,
          });
    }
});