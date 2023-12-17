angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.PurchaseOrders.PurchaseOrderItem';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/PurchaseOrders/PurchaseOrderItem.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-perseus-custom-action").then(function (response) {
			$scope.pageActions = response.data.filter(e => e.perspective === "PurchaseOrders" && e.view === "PurchaseOrderItem" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === "PurchaseOrders" && e.view === "PurchaseOrderItem" && e.type === "entity");
		});

		$scope.triggerPageAction = function (actionId) {
			for (const next of $scope.pageActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-perseus-custom-action", {
						src: next.link,
					});
					break;
				}
			}
		};

		$scope.triggerEntityAction = function (actionId, selectedEntity) {
			for (const next of $scope.entityActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-perseus-custom-action", {
						src: `${next.link}?id=${selectedEntity.Id}`,
					});
					break;
				}
			}
		};
		//-----------------Custom Actions-------------------//

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
			let PurchaseOrder = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(PurchaseOrder).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("PurchaseOrderItem", `Unable to count PurchaseOrderItem: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `PurchaseOrder=${PurchaseOrder}`;
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
				optionsPurchaseOrder: $scope.optionsPurchaseOrder,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("PurchaseOrderItem-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "PurchaseOrder",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPurchaseOrder: $scope.optionsPurchaseOrder,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("PurchaseOrderItem-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "PurchaseOrder",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPurchaseOrder: $scope.optionsPurchaseOrder,
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
		$scope.optionsPurchaseOrder = [];

		$http.get("/services/js/codbex-perseus/gen/api/PurchaseOrders/PurchaseOrder.js").then(function (response) {
			$scope.optionsPurchaseOrder = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsPurchaseOrderValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPurchaseOrder.length; i++) {
				if ($scope.optionsPurchaseOrder[i].value === optionKey) {
					return $scope.optionsPurchaseOrder[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
