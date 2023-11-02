angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.PurchaseInvoices.PurchaseInvoiceItem';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/PurchaseInvoices/PurchaseInvoiceItem.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-perseus.PurchaseInvoices.PurchaseInvoice.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-perseus.PurchaseInvoices.PurchaseInvoice.clearDetails", function (msg) {
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
			let PurchaseInvoiceId = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(PurchaseInvoiceId).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("PurchaseInvoiceItem", `Unable to count PurchaseInvoiceItem: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `PurchaseInvoiceId=${PurchaseInvoiceId}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("PurchaseInvoiceItem", `Unable to list PurchaseInvoiceItem: '${response.message}'`);
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
			messageHub.showDialogWindow("PurchaseInvoiceItem-details", {
				action: "select",
				entity: entity,
				optionsPurchaseInvoiceId: $scope.optionsPurchaseInvoiceId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("PurchaseInvoiceItem-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "PurchaseInvoiceId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPurchaseInvoiceId: $scope.optionsPurchaseInvoiceId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("PurchaseInvoiceItem-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "PurchaseInvoiceId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPurchaseInvoiceId: $scope.optionsPurchaseInvoiceId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete PurchaseInvoiceItem?',
				`Are you sure you want to delete PurchaseInvoiceItem? This action cannot be undone.`,
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
							messageHub.showAlertError("PurchaseInvoiceItem", `Unable to delete PurchaseInvoiceItem: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsPurchaseInvoiceId = [];

		$http.get("/services/js/codbex-perseus/gen/api/PurchaseInvoices/PurchaseInvoice.js").then(function (response) {
			$scope.optionsPurchaseInvoiceId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsPurchaseInvoiceIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPurchaseInvoiceId.length; i++) {
				if ($scope.optionsPurchaseInvoiceId[i].value === optionKey) {
					return $scope.optionsPurchaseInvoiceId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
