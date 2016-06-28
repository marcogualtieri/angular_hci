
var app = angular.module('app', ['ui.bootstrap', 'ngTouch']);

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

app.controller('appController', function ($scope) {

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
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue.png',
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

    // questo deve ricevere il workOrder, che deve avere come property il marker
    // così posso accedere al sequence id e aggiornare l'active li
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
    $scope.testSwift = function (sequence) {
        alert(sequence);
    };

});