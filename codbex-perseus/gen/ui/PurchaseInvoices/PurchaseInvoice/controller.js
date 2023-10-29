angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.PurchaseInvoices.PurchaseInvoice';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/PurchaseInvoices/PurchaseInvoice.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			$scope.dataPage = pageNumber;
			entityApi.count().then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("PurchaseInvoice", `Unable to count PurchaseInvoice: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("PurchaseInvoice", `Unable to list PurchaseInvoice: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.Date) {
							e.Date = new Date(e.Date);
						}
					});

					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("PurchaseInvoice-details", {
				action: "select",
				entity: entity,
				optionsSupplier: $scope.optionsSupplier,
				optionsPurchaseOrder: $scope.optionsPurchaseOrder,
				optionsCurrency: $scope.optionsCurrency,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("PurchaseInvoice-details", {
				action: "create",
				entity: {},
				optionsSupplier: $scope.optionsSupplier,
				optionsPurchaseOrder: $scope.optionsPurchaseOrder,
				optionsCurrency: $scope.optionsCurrency,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("PurchaseInvoice-details", {
				action: "update",
				entity: entity,
				optionsSupplier: $scope.optionsSupplier,
				optionsPurchaseOrder: $scope.optionsPurchaseOrder,
				optionsCurrency: $scope.optionsCurrency,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete PurchaseInvoice?',
				`Are you sure you want to delete PurchaseInvoice? This action cannot be undone.`,
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
							messageHub.showAlertError("PurchaseInvoice", `Unable to delete PurchaseInvoice: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsSupplier = [];
		$scope.optionsPurchaseOrder = [];
		$scope.optionsCurrency = [];

		$http.get("/services/js/codbex-perseus/gen/api/Partners/Supplier.js").then(function (response) {
			$scope.optionsSupplier = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-perseus/gen/api/PurchaseOrders/PurchaseOrder.js").then(function (response) {
			$scope.optionsPurchaseOrder = response.data.map(e => {
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
		$scope.optionsSupplierValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsSupplier.length; i++) {
				if ($scope.optionsSupplier[i].value === optionKey) {
					return $scope.optionsSupplier[i].text;
				}
			}
			return null;
		};
		$scope.optionsPurchaseOrderValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPurchaseOrder.length; i++) {
				if ($scope.optionsPurchaseOrder[i].value === optionKey) {
					return $scope.optionsPurchaseOrder[i].text;
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
		//----------------Dropdowns-----------------//

	}]);
