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

angular.module('app', ['ui.bootstrap']).controller('appController', function ($scope) {

    $scope.map = new google.maps.Map(
        document.getElementById('map'), 
        {
            zoom: 4,
            center: new google.maps.LatLng(40.0000, -98.0000),
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            } 
        });
    $scope.markers = [];
    var infoWindow = new google.maps.InfoWindow();
     
    var createMarker = function (workOrder) {
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(workOrder.lat, workOrder.lng),
            title: workOrder.name
        });
        marker.content = '<div class="infoWindowContent">' + workOrder.service + '</div>';
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
            $scope.map.setCenter(marker.getPosition());
        });
        $scope.markers.push(marker);
    }  
    
    for (i = 0; i < workOrders.length; i++) {
        createMarker(workOrders[i]);
    }

    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }

});