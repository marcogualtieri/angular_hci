var WorkOrderStatuses = {
    OPEN: 0,
    COMPLETED: 1,
    FAILED: 2
};

function WorkOrder(sequence, name, description, lat, lng, service) {
    this.sequence = sequence;
    this.name = name;
    this.description = description;
    this.service = service;
    this.lat = lat;
    this.lng = lng;
    this.status = WorkOrderStatuses.OPEN;
}

var workOrders = [
    new WorkOrder(1, "Aviva Stadium", "", 53.335232, -6.228167, 30),
    new WorkOrder(2, "St Patrick", "", 53.339590, -6.272441, 30),
    new WorkOrder(3, "Trinity College", "", 53.344587, -6.259389, 30),
    new WorkOrder(4, "Guinnes Storehouse", "", 53.341874, -6.286725, 30),
    new WorkOrder(5, "Jameson Distillery", "", 53.348463, -6.277975, 30),
    new WorkOrder(6, "Croke Park", "", 53.360963, -6.252282, 30),
    new WorkOrder(7, "National Post Office", "", 53.349450, -6.260210, 30),
    new WorkOrder(8, "Dublin Port", "", 53.349509, -6.207904, 30)
];

var app = angular.module('app', ['ui.bootstrap', 'ngTouch']);

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
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/blue.png',
                origin: new google.maps.Point(0, -5)
            },
            position: new google.maps.LatLng(workOrder.lat, workOrder.lng),
            title: workOrder.name,
            label: workOrder.sequence.toString(),
            sequence: workOrder.sequence
        });
        marker.content = '<a href="geo:' + workOrder.lat + ',' + workOrder.lng + '" target="_blank">Direction</a>' 
            + ' <a href="tel:+12345678">Phone</a>';
        google.maps.event.addListener(marker, 'click', function (e) {
            infoWindow.setContent(marker.title + '<br>' + marker.content);
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