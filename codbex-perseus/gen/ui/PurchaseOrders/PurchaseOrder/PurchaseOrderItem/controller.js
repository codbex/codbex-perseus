angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.PurchaseOrders.PurchaseOrderItem';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/PurchaseOrders/PurchaseOrderItem.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-perseus.PurchaseOrders.PurchaseOrder.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-perseus.PurchaseOrders.PurchaseOrder.clearDetails", function (msg) {
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
			let PurchaseOrderId = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(PurchaseOrderId).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("PurchaseOrderItem", `Unable to count PurchaseOrderItem: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `PurchaseOrderId=${PurchaseOrderId}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("PurchaseOrderItem", `Unable to list PurchaseOrderItem: '${response.message}'`);
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
			messageHub.showDialogWindow("PurchaseOrderItem-details", {
				action: "select",
				entity: entity,
				optionsPurchaseOrderId: $scope.optionsPurchaseOrderId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("PurchaseOrderItem-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "PurchaseOrderId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPurchaseOrderId: $scope.optionsPurchaseOrderId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("PurchaseOrderItem-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "PurchaseOrderId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPurchaseOrderId: $scope.optionsPurchaseOrderId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete PurchaseOrderItem?',
				`Are you sure you want to delete PurchaseOrderItem? This action cannot be undone.`,
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
							messageHub.showAlertError("PurchaseOrderItem", `Unable to delete PurchaseOrderItem: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsPurchaseOrderId = [];

		$http.get("/services/js/codbex-perseus/gen/api/PurchaseOrders/PurchaseOrder.js").then(function (response) {
			$scope.optionsPurchaseOrderId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsPurchaseOrderIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPurchaseOrderId.length; i++) {
				if ($scope.optionsPurchaseOrderId[i].value === optionKey) {
					return $scope.optionsPurchaseOrderId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);