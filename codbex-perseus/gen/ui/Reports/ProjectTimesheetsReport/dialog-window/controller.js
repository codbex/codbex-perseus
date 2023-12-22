angular.module('page', ["ideUI", "ideView"])
	.controller('PageController', ['$scope', function ($scope) {

		$scope.entity = {};

		if (window != null && window.frameElement != null && window.frameElement.hasAttribute("data-parameters")) {
			let dataParameters = window.frameElement.getAttribute("data-parameters");
			if (dataParameters) {
				let params = JSON.parse(dataParameters);
				$scope.action = "select";

				$scope.entity = params.entity;
			}
		}

	}]);