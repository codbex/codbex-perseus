angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.PurchaseOrders.PurchaseOrder';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/PurchaseOrders/PurchaseOrder.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = "select";

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-perseus-custom-action").then(function (response) {
			$scope.pageActions = response.data.filter(e => e.perspective === "PurchaseOrders" && e.view === "PurchaseOrder" && (e.type === "page" || e.type === undefined));
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
		//-----------------Custom Actions-------------------//

		function refreshData() {
			$scope.dataReset = true;
			$scope.dataPage--;
		}

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.selectedEntity = null;
				$scope.action = "select";
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			refreshData();
			$scope.loadPage();
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			refreshData();
			$scope.loadPage();
		});
		//-----------------Events-------------------//

		$scope.loadPage = function () {
			$scope.selectedEntity = null;
			entityApi.count().then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("PurchaseOrder", `Unable to count PurchaseOrder: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
				let offset = ($scope.dataPage - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				if ($scope.dataReset) {
					offset = 0;
					limit = $scope.dataPage * $scope.dataLimit;
				}
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("PurchaseOrder", `Unable to list PurchaseOrder: '${response.message}'`);
						return;
					}
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}

					response.data.forEach(e => {
						if (e.Date) {
							e.Date = new Date(e.Date);
						}
					});

					$scope.data = $scope.data.concat(response.data);
					$scope.dataPage++;
				});
			});
		};
		$scope.loadPage($scope.dataPage);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.postMessage("entitySelected", {
				entity: entity,
				selectedMainEntityId: entity.Id,
				optionsSupplier: $scope.optionsSupplier,
				optionsCurrency: $scope.optionsCurrency,
				optionsStatus: $scope.optionsStatus,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			$scope.action = "create";

			messageHub.postMessage("createEntity", {
				entity: {},
				optionsSupplier: $scope.optionsSupplier,
				optionsCurrency: $scope.optionsCurrency,
				optionsStatus: $scope.optionsStatus,
			});
		};

		$scope.updateEntity = function () {
			$scope.action = "update";
			messageHub.postMessage("updateEntity", {
				entity: $scope.selectedEntity,
				optionsSupplier: $scope.optionsSupplier,
				optionsCurrency: $scope.optionsCurrency,
				optionsStatus: $scope.optionsStatus,
			});
		};

		$scope.deleteEntity = function () {
			let id = $scope.selectedEntity.Id;
			messageHub.showDialogAsync(
				'Delete PurchaseOrder?',
				`Are you sure you want to delete PurchaseOrder? This action cannot be undone.`,
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
							messageHub.showAlertError("PurchaseOrder", `Unable to delete PurchaseOrder: '${response.message}'`);
							return;
						}
						refreshData();
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsSupplier = [];
		$scope.optionsCurrency = [];
		$scope.optionsStatus = [];

		$http.get("/services/js/codbex-perseus/gen/api/Partners/Supplier.js").then(function (response) {
			$scope.optionsSupplier = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-perseus/gen/api/Settings/Currency.js").then(function (response) {
			$scope.optionsCurrency = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-perseus/gen/api/Settings/PurchaseOrderStatus.js").then(function (response) {
			$scope.optionsStatus = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsSupplierValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsSupplier.length; i++) {
				if ($scope.optionsSupplier[i].value === optionKey) {
					return $scope.optionsSupplier[i].text;
				}
			}
			return null;
		};
		$scope.optionsCurrencyValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCurrency.length; i++) {
				if ($scope.optionsCurrency[i].value === optionKey) {
					return $scope.optionsCurrency[i].text;
				}
			}
			return null;
		};
		$scope.optionsStatusValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsStatus.length; i++) {
				if ($scope.optionsStatus[i].value === optionKey) {
					return $scope.optionsStatus[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
