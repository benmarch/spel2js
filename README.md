# spel2js
[![Build Status][build-image]][build-url]
[![Code GPA][gpa-image]][gpa-url]
[![Test Coverage][coverage-image]][coverage-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Bower Version][bower-image]][bower-url]
[![NPM version][npm-image]][npm-url]
[![IRC Channel][irc-image]][irc-url]
[![Gitter][gitter-image]][gitter-url]
[![GitTip][tip-image]][tip-url]

## About

SpEL2JS is a plugin that will parse Spring Expression Language within a defined context in JavaScript. This is useful
in single-page applications where duplication of authorization expressions for UI purposes can lead to inconsistencies.
Consider the following simple example:

Say you are creating a shared to-do list, and you want to allow only the owner of the list to make changes, but anyone can view: 

```java
//ListController.java

@Controller
@RequestMapping('/todolists')
public class ListController {

  public static final String ADD_LIST_ITEM_PERMISSION = "#toDoList.owner == principal.name";  
  ...
  
  @PreAuthorize(ADD_LIST_ITEM_PERMISSION)
  @RequestMapping(value="/{toDolistId}/items", method=RequestMethod.POST)
  public ResponseEntity<ListItem> addListItem(@MagicAnnotation ToDoList toDoList, @RequestBody ListItem newListItem) {
    //add the item to the list
    return new ResponseEntity<ListItem>(newListItem, HttpStatus.CREATED);
  }

  ...
}
```

```javascript
//list-controller.js

angular.module('ToDo').controller('ListController', ['$http', '$scope', '$window', function ($http, $scope, $window) {
  
  $http.get('/todolists/some-way-to-get-the-permissions').success(function (permissions) {
    angular.forEach(permissions, function (spelExpression, key) {
      $scope.permissions[key] = $window.spelExpressionParser.compile(spelExpression);
    });
  });
  
  $scope.list = {
    name: 'My List',
    owner: 'Ben March',
    items: [
      {
        text: 'List item number 1!'
      }
    ]
  }
  
  $scope.addListItem = function (list, newListItem) {
    if ($scope.permissions.ADD_LIST_ITEM_PERMISSION.eval($scope.context)) {
      $http.post('/todolists/' + list.id + '/items', item).success(function () {...});  
    }
  }
}]);
```

```html
<!--list-controller.html-->

<div ng-controller="ListController">
  ...
  <li ng-repeat="listItem in list.items">
    <p>{{listItem.text}}</p>
  </li>
  <li class="list-actions">
    <input type="text" ng-model="newListItem.text" />
    <button ng-click="addListItem(list, newListItem)" ng-if="permissions.ADD_LIST_ITEM_PERMISSION.eval(context)">Add</button>
  </li>
  ...
</div>
```
(Spring isn't my strength here, sorry.)

Seems like it might be a lot of work for such a simple piece of functionality; however, what happens when you add role-based
permissions as a new feature? If you already have this set up, it's as simple as adding " or hasRole('SuperUser')" to 
the SpEL, and exposing a minimal projection of the Principal (UserDetails most likely) to Angular (which it probably already
has access to.) Now the UI can always stay in sync with the server-side authorities. 

This repository was scaffolded with [generator-microjs](https://github.com/daniellmb/generator-microjs).

## Left to do

This is not currently stable enough to release. The following must be done first:

- [x] Port the tokenizer to JS
- [x] Port the parser to JS
- [ ] Implement the evaluator in JS
  - [x] Primitive Literals
  - [x] Property references
  - [x] Compound expressions
  - [x] Comparisons
  - [x] Method references
  - [x] Local variable reference ("#someVar")
  - [x] Math
  - [x] Ternary operators
  - [x] Safe navigation
  - [ ] Qualified identifiers/Type references
  - [x] Assignment
  - [ ] Complex literals
  - [ ] Projection/selection
  - [ ] Something I probably missed
- [ ] Implement common functions (hasPermission(), hasRole(), isAuthenticated(), etc.)

Then some (probably separate project) follow-up features:

- [ ] AngularJS service
- [ ] AngularJS directives (spelShow, spelHide, spelIf, etc.)

If someone wants to implement a REST-compliant way in Spring to expose the permissions (and maybe the custom
PermissionEvaluators) that would be awesome.


## Install Choices
- `bower install spel2js`
- `npm install spel2js`
- [download the zip](https://github.com/benmarch/spel2js/archive/master.zip)

## Tasks

All tasks can be run by simply running `grunt` or with the `npm test` command, or individually:

  * `grunt lint` will lint source code for syntax errors and anti-patterns.
  * `grunt gpa` will analyze source code against complexity thresholds.
  * `grunt test` will run the jasmine unit tests against the source code.

## License

(The MIT License)

Copyright (c) 2015  

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



[build-url]: https://travis-ci.org/benmarch/spel2js
[build-image]: http://img.shields.io/travis/benmarch/spel2js.png

[gpa-url]: https://codeclimate.com/github/benmarch/spel2js
[gpa-image]: https://codeclimate.com/github/benmarch/spel2js.png

[coverage-url]: https://codeclimate.com/github/benmarch/spel2js/code?sort=covered_percent&sort_direction=desc
[coverage-image]: https://codeclimate.com/github/benmarch/spel2js/coverage.png

[depstat-url]: https://david-dm.org/benmarch/spel2js
[depstat-image]: https://david-dm.org/benmarch/spel2js.png?theme=shields.io

[issues-url]: https://github.com/benmarch/spel2js/issues
[issues-image]: http://img.shields.io/github/issues/benmarch/spel2js.png

[bower-url]: http://bower.io/search/?q=spel2js
[bower-image]: https://badge.fury.io/bo/spel2js.png

[downloads-url]: https://www.npmjs.org/package/spel2js
[downloads-image]: http://img.shields.io/npm/dm/spel2js.png

[npm-url]: https://www.npmjs.org/package/spel2js
[npm-image]: https://badge.fury.io/js/spel2js.png

[irc-url]: http://webchat.freenode.net/?channels=spel2js
[irc-image]: http://img.shields.io/badge/irc-%23spel2js-brightgreen.png

[gitter-url]: https://gitter.im/benmarch/spel2js
[gitter-image]: http://img.shields.io/badge/gitter-benmarch/spel2js-brightgreen.png

[tip-url]: https://www.gittip.com/benmarch
[tip-image]: http://img.shields.io/gittip/benmarch.png
