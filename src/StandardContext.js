/*
 * Copyright 2002-2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @author Ben March
 * @since 0.2.0
 */

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

export var StandardContext = {
    create: create
};
