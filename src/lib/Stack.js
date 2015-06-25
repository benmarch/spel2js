export function Stack(startingElements) {
    this.elements = startingElements || [];
}

Stack.prototype.push = function (el) {
    this.elements.push(el);
    return el;
};

Stack.prototype.pop = function () {
    return this.elements.pop();
};

Stack.prototype.peek = function () {
    return this.elements[this.elements.length - 1];
};

Stack.prototype.empty = function () {
    return this.elements.length > 0;
};

Stack.prototype.search = function (el) {
    return this.elements.length - this.elements.indexOf(el);
};
