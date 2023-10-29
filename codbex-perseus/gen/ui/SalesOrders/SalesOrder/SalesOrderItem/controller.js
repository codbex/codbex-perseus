angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.SalesOrders.SalesOrderItem';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/SalesOrders/SalesOrderItem.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-perseus.SalesOrders.SalesOrder.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-perseus.SalesOrders.SalesOrder.clearDetails", function (msg) {
			$scope.$apply(function () {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}, true);

		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			let SalesOrder = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(SalesOrder).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("SalesOrderItem", `Unable to count SalesOrderItem: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `SalesOrder=${SalesOrder}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("SalesOrderItem", `Unable to list SalesOrderItem: '${response.message}'`);
						return;
					}
					$scope.data = response.data;
				});
			});
		};

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("SalesOrderItem-details", {
				action: "select",
				entity: entity,
				optionsTimesheet: $scope.optionsTimesheet,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("SalesOrderItem-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "SalesOrder",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsTimesheet: $scope.optionsTimesheet,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("SalesOrderItem-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "SalesOrder",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsTimesheet: $scope.optionsTimesheet,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete SalesOrderItem?',
				`Are you sure you want to delete SalesOrderItem? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("SalesOrderItem", `Unable to delete SalesOrderItem: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsTimesheet = [];

		$http.get("/services/js/codbex-perseus/gen/api/Timesheets/Timesheet.js").then(function (response) {
			$scope.optionsTimesheet = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsTimesheetValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsTimesheet.length; i++) {
				if ($scope.optionsTimesheet[i].value === optionKey) {
					return $scope.optionsTimesheet[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
