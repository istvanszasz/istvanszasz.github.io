
angular.module('G5Data').service('UtilService', function() {

    var vm = this;

    vm.encode_utf8 = function (s) {
    return unescape(encodeURIComponent(s));
    }

    vm.decode_utf8 = function (s) {
    return decodeURIComponent(escape(s));
    }

    vm.average = function (array){
        return Math.round(_.reduce(array, function(memo, num) {
            return memo + num;
        }, 0) / (array.length === 0 ? 1 : array.length), 0);
    }

    vm.median = function(values){
        values.sort( function(a,b) {return a - b;} );

        var half = Math.floor(values.length/2);

        if(values.length % 2)
            return values[half];
        else
            return (values[half-1] + values[half]) / 2.0;
    }

    vm.getRandomColor = function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});