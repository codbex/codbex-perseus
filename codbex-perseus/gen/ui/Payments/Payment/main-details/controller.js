angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Payments.Payment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/Payments/Payment.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		$scope.entity = {};
		$scope.formHeaders = {
			select: "Payment Details",
			create: "Create Payment",
			update: "Update Payment"
		};
		$scope.formErrors = {};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-perseus-custom-action").then(function (response) {
			$scope.entityActions = response.data.filter(e => e.perspective === "Payments" && e.view === "Payment" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (actionId, selectedEntity) {
			for (const next of $scope.entityActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-perseus-custom-action", {
						src: `${next.link}?id=${$scope.entity.Id}`,
					});
					break;
				}
			}
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.formErrors = {};
				$scope.optionsCurrency = [];
				$scope.optionsCompany = [];
				$scope.optionsDirection = [];
				$scope.optionsType = [];
				$scope.optionsCustomer = [];
				$scope.optionsSupplier = [];
				$scope.optionsEmployee = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.Date) {
					msg.data.entity.Date = new Date(msg.data.entity.Date);
				}
				if (msg.data.entity.Valor) {
					msg.data.entity.Valor = new Date(msg.data.entity.Valor);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsCurrency = msg.data.optionsCurrency;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.optionsDirection = msg.data.optionsDirection;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.optionsSupplier = msg.data.optionsSupplier;
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsCurrency = msg.data.optionsCurrency;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.optionsDirection = msg.data.optionsDirection;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.optionsSupplier = msg.data.optionsSupplier;
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.action = 'create';
				// Set Errors for required fields only
				$scope.formErrors = {
				};
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.Date) {
					msg.data.entity.Date = new Date(msg.data.entity.Date);
				}
				if (msg.data.entity.Valor) {
					msg.data.entity.Valor = new Date(msg.data.entity.Valor);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsCurrency = msg.data.optionsCurrency;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.optionsDirection = msg.data.optionsDirection;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.optionsSupplier = msg.data.optionsSupplier;
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.action = 'update';
			});
		});
		//-----------------Events-------------------//

		$scope.isValid = function (isValid, property) {
			$scope.formErrors[property] = !isValid ? true : undefined;
			for (let next in $scope.formErrors) {
				if ($scope.formErrors[next] === true) {
					$scope.isFormValid = false;
					return;
				}
			}
			$scope.isFormValid = true;
		};

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Payment", `Unable to create Payment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Payment", "Payment successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Payment", `Unable to update Payment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Payment", "Payment successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);