angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Payments.PaymentPurchaseInvoice';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/Payments/PaymentPurchaseInvoiceService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-perseus-custom-action").then(function (response) {
			$scope.pageActions = response.data.filter(e => e.perspective === "Payments" && e.view === "PaymentPurchaseInvoice" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === "Payments" && e.view === "PaymentPurchaseInvoice" && e.type === "entity");
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
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entitySearch", function (msg) {
			resetPagination();
			$scope.filter = msg.data.filter;
			$scope.filterEntity = msg.data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber, filter) {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			$scope.dataPage = pageNumber;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("PaymentPurchaseInvoice", `Unable to count PaymentPurchaseInvoice: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = entityApi.search(filter);
				} else {
					request = entityApi.list(offset, limit);
				}
				request.then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("PaymentPurchaseInvoice", `Unable to list/filter PaymentPurchaseInvoice: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.Date) {
							e.Date = new Date(e.Date);
						}
						if (e.Valor) {
							e.Valor = new Date(e.Valor);
						}
					});

					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("PaymentPurchaseInvoice-details", {
				action: "select",
				entity: entity,
				optionsPurchaseInvoice: $scope.optionsPurchaseInvoice,
				optionsCurrency: $scope.optionsCurrency,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("PaymentPurchaseInvoice-filter", {
				entity: $scope.filterEntity,
				optionsPurchaseInvoice: $scope.optionsPurchaseInvoice,
				optionsCurrency: $scope.optionsCurrency,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("PaymentPurchaseInvoice-details", {
				action: "create",
				entity: {},
				optionsPurchaseInvoice: $scope.optionsPurchaseInvoice,
				optionsCurrency: $scope.optionsCurrency,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("PaymentPurchaseInvoice-details", {
				action: "update",
				entity: entity,
				optionsPurchaseInvoice: $scope.optionsPurchaseInvoice,
				optionsCurrency: $scope.optionsCurrency,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete PaymentPurchaseInvoice?',
				`Are you sure you want to delete PaymentPurchaseInvoice? This action cannot be undone.`,
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
							messageHub.showAlertError("PaymentPurchaseInvoice", `Unable to delete PaymentPurchaseInvoice: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsPurchaseInvoice = [];
		$scope.optionsCurrency = [];


		$http.get("/services/ts/codbex-perseus/gen/api/PurchaseInvoices/PurchaseInvoiceService.ts").then(function (response) {
			$scope.optionsPurchaseInvoice = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-perseus/gen/api/Settings/CurrencyService.ts").then(function (response) {
			$scope.optionsCurrency = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsPurchaseInvoiceValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPurchaseInvoice.length; i++) {
				if ($scope.optionsPurchaseInvoice[i].value === optionKey) {
					return $scope.optionsPurchaseInvoice[i].text;
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
