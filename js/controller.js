var WorkOrderStatuses = {
    OPEN: 0,
    COMPLETED: 1,
    FAILED: 2
};

function WorkOrder(name, lat, lng, service) {
    this.name = name;
    this.service = service;
    this.lat = lat;
    this.lng = lng;
    this.status = WorkOrderStatuses.OPEN;
}

var workOrders = [
    new WorkOrder("a", 43, 11.1, 30),
    new WorkOrder("b", 43, 11.12, 30)
];


var app = angular.module('app', ['ui.bootstrap']);

app.controller('modalInstanceController', function ($scope, $rootScope, $uibModalInstance) {
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
                controller: 'modalInstanceController'
            });
            $rootScope.orientationModalOpened = true;
        }
    }

});

app.controller('appController', function ($scope) {

    var mapContainer = document.getElementById('map');
    $scope.map = new google.maps.Map(
        mapContainer, 
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
    $scope.markers = [];
    var infoWindow = new google.maps.InfoWindow();

    var createMarker = function (workOrder) {
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(workOrder.lat, workOrder.lng),
            title: workOrder.name
        });
        marker.content = '<div class="infoWindowContent">' + workOrder.service + '</div>';
        google.maps.event.addListener(marker, 'click', function (e) {
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
            $scope.map.setCenter(marker.getPosition());
        });
        $scope.markers.push(marker);
    }  
    
    for (i = 0; i < workOrders.length; i++) {
        createMarker(workOrders[i]);
    }

    centerMap();

    $scope.openInfoWindow = function (e, selectedMarker) {
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
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
        for (var i = 0; i < $scope.markers.length; i++) {
            bounds.extend($scope.markers[i].getPosition());
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

});