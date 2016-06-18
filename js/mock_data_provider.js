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