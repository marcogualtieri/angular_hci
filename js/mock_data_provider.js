DataProvider = (function() {

    var workOrderStatuses = {
        TODO: 0,
        DONE: 1,
        FAIL: 2
    };
    
    var WorkOrder = function(index, lat, lng, name, description, service) {
        this.index = index;
        this.lat = lat;
        this.lng = lng;
        this.name = name;
        this.description = description;
        this.service = service;
        this.status = workOrderStatuses.TODO;
        this.failureDetails = "";
        this.setTodo = function() {
            this.status = workOrderStatuses.TODO;
        };
        this.setDone = function() {
            this.status = workOrderStatuses.DONE;
        };
        this.setFail = function(failureDetails) {
            this.status = workOrderStatuses.FAIL;
            this.failureDetails = failureDetails;
        };
    };

    var workOrders = [
        new WorkOrder(1, 53.335232, -6.228167, "Aviva Stadium", "Delivery", 10),
        new WorkOrder(2, 53.339590, -6.272441, "St Patrick", "Maintenance", 60),
        new WorkOrder(3, 53.344587, -6.259389, "Trinity College", "Delivery", 40),
        new WorkOrder(4, 53.341874, -6.286725, "Guinnes Storehouse", "Repair", 50),
        new WorkOrder(5, 53.348463, -6.277975, "Jameson Distillery", "Delivery", 10),
        new WorkOrder(6, 53.360963, -6.252282, "Croke Park", "Pickup", 20),
        new WorkOrder(7, 53.349450, -6.260210, "National Post Office", "Pickup", 25),
        new WorkOrder(8, 53.349509, -6.207904, "Dublin Port", "Repair", 30)
    ];

    return {
        WorkOrders: workOrders,
        WorkOrderStatuses: workOrderStatuses
    };

}());