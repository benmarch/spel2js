(function (exports) {
    'use strict';

    function create(authentication, principal) {
        var context = {};

        context.authentication = authentication || {};
        context.principal = principal || {};

        context.hasRole = function (role) {
            var hasRole = false;

            if (!role) {
                return false;
            }
            if (!context.authentication && !Array.isArray(context.authentication.authorities)) {
                return false;
            }

            context.authentication.authorities.forEach(function (grantedAuthority) {
                if (grantedAuthority.authority.toLowerCase() === role.toLowerCase()) {
                    hasRole = true;
                }
            });

            return hasRole;
        };

        context.hasPermission = function (/*variable arguments*/) {
            var args = Array.prototype.slice.call(arguments);

            if (args.length === 1) {
                return context.hasRole(args[0]);
            }
        };

        return context;
    }

    exports.StandardContext = {
        create: create
    };

}(window || exports));
