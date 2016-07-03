
var app = angular.module('app', ['ui.bootstrap', 'ngTouch', 'ngAnimate']);

app.controller('orientationModalController', function ($scope, $rootScope, $uibModalInstance) {
    $scope.dismiss = function() {
        $uibModalInstance.dismiss('cancel');
        $rootScope.orientationModalOpened = false;
    };
});

app.controller('orientationController', function ($scope, $rootScope, $window, $uibModal) {

    $rootScope.orientationModalOpened = false;
    
    checkDeviceOrientation();

    angular.element($window).bind('orientationchange', function () {
        checkDeviceOrientation();
    });

    function checkDeviceOrientation() {
        if($window.orientation && $window.orientation != 0 && !$scope.orientationModalOpened) {
            $scope.orientationModal = $uibModal.open({
                animation: true,
                size: 'sm',
                templateUrl: 'orientationModal.html',
                controller: 'orientationModalController'
            });
            $rootScope.orientationModalOpened = true;
        }
    }

});

app.controller('appController', function ($scope, $uibModal) {

    // map 

    $scope.map = new google.maps.Map(
        document.getElementById('map'), 
        {
            zoom: 4,
            center: new google.maps.LatLng(40.0000, -98.0000),
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_LEFT
            } 
        }
    );

    // map info window

    var infoWindow = new google.maps.InfoWindow();

    var setEventForMarkerClick = function (marker) {
        google.maps.event.addListener(marker, 'click', function (evt) {
            $scope.$apply(function() {
                $scope.selectWorkOrder(evt, marker.index);
            });
        });
    };

    var generateMarkersForWorkOrders = function (workOrders) {
        for (var i = 0; i < workOrders.length; i++) {
            var workOrder = workOrders[i];
            var marker = new google.maps.Marker({
                map: $scope.map,
                icon: {
                    url: 'img/marker_blue.png',
                    origin: new google.maps.Point(0, -5)
                },
                position: new google.maps.LatLng(workOrder.lat, workOrder.lng),
                title: workOrder.name,
                label: workOrder.index.toString(),
                index: workOrder.index
            });
            marker.content = marker.title + '<br>' + '<a href="geo:' + workOrder.lat + ',' + workOrder.lng + '" target="_blank">Direction</a>' 
                + ' <a href="tel:+12345678">Phone</a>';    
            workOrders[i].marker = marker;
            setEventForMarkerClick(workOrders[i].marker);
        }
    };

    // get work orders

    $scope.workOrders = DataProvider.WorkOrders;

    $scope.workOrderStatuses = DataProvider.WorkOrderStatuses;
    
    generateMarkersForWorkOrders($scope.workOrders);

    centerMap();

    // select work orders

    $scope.selectWorkOrder = function (evt, index) {
        $scope.selectedIndex = index;
        var workOrder = $scope.workOrders.filter(function (w) { 
            return w.index == index })[0];
        infoWindow.setContent(workOrder.marker.content);
        infoWindow.open($scope.map, workOrder.marker);
        $scope.map.setCenter(workOrder.marker.getPosition());
    };

    $scope.openInfoWindow = function (evt, selectedWorkOrder) {
        evt.preventDefault();
        google.maps.event.trigger(selectedWorkOrder.marker, 'click');
    }

    google.maps.event.addListener($scope.map, 'click', function (e) {
        infoWindow.close();
    });

    // full screen and center map

    $scope.fullScreenMap = false;

    google.maps.event.addListener($scope.map, 'idle', function(){
        google.maps.event.trigger($scope.map, 'resize'); 
    });

    $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('fullScreenMapBtn'));
    $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('centerMapBtn'));

    function centerMap() {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < $scope.workOrders.length; i++) {
            bounds.extend($scope.workOrders[i].marker.getPosition());
        }   
        $scope.map.fitBounds(bounds);
    }

    $scope.callCenterMap = function() {
        centerMap();
    };
    
    $scope.toggleFullScreenMap = function() {
        $scope.fullScreenMap = !$scope.fullScreenMap;
        google.maps.event.trigger($scope.map, "resize");
        centerMap();
    };

    // additional layers

    $scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('trafficLayerMapBtn'));
    $scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('bikeLayerMapBtn'));

    var trafficLayer = new google.maps.TrafficLayer();
    var bikeLayer = new google.maps.BicyclingLayer();

    $scope.toggleTrafficLayerMap = function() {
        if (trafficLayer.getMap()) {
            trafficLayer.setMap(null);
        } 
        else {
            trafficLayer.setMap($scope.map);
        }
    };

    $scope.toggleBikeLayerMap = function() {
        if (bikeLayer.getMap()) {
            bikeLayer.setMap(null);
        } 
        else {
            bikeLayer.setMap($scope.map);
        }
    };

    // change status

    function updateProgressBar() {
        var workOrdersCount = $scope.workOrders.length;
        var workOrdersTodoCount = $scope.workOrders.filter(function (w) { return w.status == $scope.workOrderStatuses.TODO }).length;
        var workOrdersDoneCount = $scope.workOrders.filter(function (w) { return w.status == $scope.workOrderStatuses.DONE }).length;
        var workOrdersFailCount = $scope.workOrders.filter(function (w) { return w.status == $scope.workOrderStatuses.FAIL }).length;
        $scope.progressBarPercentages = {
            todo: workOrdersTodoCount / workOrdersCount * 100.0,
            done: workOrdersDoneCount / workOrdersCount * 100.0,
            fail: workOrdersFailCount / workOrdersCount * 100.0
        };
    }

    updateProgressBar();

    $scope.setWorkOrderStatus = function (workOrder, statusLabel) {
        if($scope.selectedIndex == workOrder.index) { // to prevent accidental swipe on not selected rows
            if (workOrder.status == $scope.workOrderStatuses.TODO) {
                if(statusLabel == 'done') {
                    workOrder.setDone();
                    workOrder.marker.setIcon({
                        url: 'img/marker_green.png',
                        origin: new google.maps.Point(0, -5)
                    });
                }
                else if(statusLabel == 'fail') {
                    workOrder.setFail();
                    workOrder.marker.setIcon({
                        url: 'img/marker_red.png',
                        origin: new google.maps.Point(0, -5)
                    });
                    $scope.failWorkOrderModal = $uibModal.open({
                        animation: true,
                        size: 'sm',
                        controller: 'setWorkOrderStatusFailController',
                        templateUrl: 'failWorkOrderModal.html',
                        backdrop: 'static', 
                        keyboard: false,
                        resolve: {
                            workOrder: workOrder
                        }
                    });
                }
                updateProgressBar();
            }
        }
    };

    

});

app.controller('setWorkOrderStatusFailController', function ($scope, $uibModalInstance, workOrder) {
    
    $scope.workOrder = workOrder;

    $scope.setWorkOrderStatusFail = function () {
        $uibModalInstance.dismiss('cancel');
    };
});