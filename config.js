angular.module('G5Data')
.config(function($httpProvider) {
    $httpProvider.interceptors.push('APIInterceptor');
})