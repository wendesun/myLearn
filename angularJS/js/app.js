/**
 * Created by mmwang on 2016/2/4.
 */
var app = angular.module('app', ['ngRoute'])
app.config(['$routeProvider',function($routeProvider) {
    $routeProvider.when('/site/index', {
        templateUrl: 'template/index.html',
        controller: 'site'
    }).when('/auth/login', {
        templateUrl: 'template/login.html',
        controller: 'auth'
    }).when('/auth/register', {
        templateUrl: 'template/register.html',
        controller: 'auth'
    }).when('/home/shop', {
        templateUrl: 'template/shop.html',
        controller: 'home'
    }).when('/cart/list', {
        templateUrl: 'template/cartlist.html',
        controller: 'cart'
    }).when('/order/before', {
        templateUrl: 'template/orderbefore.html',
        controller: 'beforeOrder'
    }).when('/order/list', {
        templateUrl: 'template/orderlist.html',
        controller: 'orderList'
    }).when('/order/detail/:order_id', {
        templateUrl: 'template/orderdetail.html',
        controller: 'orderDetail'
    }).when('/me', {
        templateUrl: 'template/me.html',
        controller: 'me'
    }).when('/cart/empty', {
        templateUrl: 'template/cartempty.html',
        controller: 'cartEmpty'
    }).when('/order/success/:order_id', {
        templateUrl: 'template/ordersuccess.html',
        controller: 'orderSuccess'
    }).when('/user/address', {
        templateUrl: 'template/address.html',
        controller: 'address'
    }).when('/user/addressadd', {
        templateUrl: 'template/editaddress.html',
        controller: 'addAddress'
    }).otherwise({
        redirectTo: '/site/index'
    });
}
]);