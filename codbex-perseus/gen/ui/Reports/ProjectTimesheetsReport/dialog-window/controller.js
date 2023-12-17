angular.module('page', ["ideUI", "ideView"])
	.controller('PageController', ['$scope', function ($scope) {

		$scope.entity = {};

		if (window != null && window.frameElement != null && window.frameElement.hasAttribute("data-parameters")) {
			let dataParameters = window.frameElement.getAttribute("data-parameters");
			if (dataParameters) {
				let params = JSON.parse(dataParameters);
				$scope.action = "select";

				if (params.entity.StartDate) {
					params.entity.StartDate = new Date(params.entity.StartDate);
				}
				if (params.entity.EndDate) {
					params.entity.EndDate = new Date(params.entity.EndDate);
				}
				$scope.entity = params.entity;
				$scope.optionsProject = params.optionsProject;
			}
		}

	}]);