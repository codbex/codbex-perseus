angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.PurchaseInvoices.PurchaseInvoicePayment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/PurchaseInvoices/PurchaseInvoicePaymentService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-perseus-custom-action").then(function (response) {
			$scope.pageActions = response.data.filter(e => e.perspective === "PurchaseInvoices" && e.view === "PurchaseInvoicePayment" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === "PurchaseInvoices" && e.view === "PurchaseInvoicePayment" && e.type === "entity");
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
			let PurchaseInvoice = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(PurchaseInvoice).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("PurchaseInvoicePayment", `Unable to count PurchaseInvoicePayment: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `PurchaseInvoice=${PurchaseInvoice}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("PurchaseInvoicePayment", `Unable to list PurchaseInvoicePayment: '${response.message}'`);
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
			messageHub.showDialogWindow("PurchaseInvoicePayment-details", {
				action: "select",
				entity: entity,
				optionsPaymentEntry: $scope.optionsPaymentEntry,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("PurchaseInvoicePayment-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "PurchaseInvoice",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPaymentEntry: $scope.optionsPaymentEntry,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("PurchaseInvoicePayment-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "PurchaseInvoice",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPaymentEntry: $scope.optionsPaymentEntry,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete PurchaseInvoicePayment?',
				`Are you sure you want to delete PurchaseInvoicePayment? This action cannot be undone.`,
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
							messageHub.showAlertError("PurchaseInvoicePayment", `Unable to delete PurchaseInvoicePayment: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsPaymentEntry = [];

		$http.get("/services/ts/codbex-perseus/gen/api/Payments/PaymentEntryService.ts").then(function (response) {
			$scope.optionsPaymentEntry = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsPaymentEntryValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPaymentEntry.length; i++) {
				if ($scope.optionsPaymentEntry[i].value === optionKey) {
					return $scope.optionsPaymentEntry[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
