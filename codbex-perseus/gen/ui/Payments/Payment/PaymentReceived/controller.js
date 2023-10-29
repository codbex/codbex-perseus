angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Payments.PaymentReceived';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/Payments/PaymentReceived.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-perseus.Payments.Payment.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-perseus.Payments.Payment.clearDetails", function (msg) {
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
			let Payment = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(Payment).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("PaymentReceived", `Unable to count PaymentReceived: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `Payment=${Payment}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("PaymentReceived", `Unable to list PaymentReceived: '${response.message}'`);
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
			messageHub.showDialogWindow("PaymentReceived-details", {
				action: "select",
				entity: entity,
				optionsSalesInvoice: $scope.optionsSalesInvoice,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("PaymentReceived-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "Payment",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsSalesInvoice: $scope.optionsSalesInvoice,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("PaymentReceived-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "Payment",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsSalesInvoice: $scope.optionsSalesInvoice,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete PaymentReceived?',
				`Are you sure you want to delete PaymentReceived? This action cannot be undone.`,
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
							messageHub.showAlertError("PaymentReceived", `Unable to delete PaymentReceived: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsSalesInvoice = [];

		$http.get("/services/js/codbex-perseus/gen/api/SalesInvoices/SalesInvoice.js").then(function (response) {
			$scope.optionsSalesInvoice = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsSalesInvoiceValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsSalesInvoice.length; i++) {
				if ($scope.optionsSalesInvoice[i].value === optionKey) {
					return $scope.optionsSalesInvoice[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
