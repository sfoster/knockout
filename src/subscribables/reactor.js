// A "reactor" is a function that is automatically re-run whenever any of the observables that it touches has changed
// Really, it's just a ko.computed that has no return value and the only thing you can do after creating it is 'dispose'

ko.reactor = function(callback, owner, options) {
    var computed = ko.computed(callback, owner, {
        returnNullIfNoDependencies: true,
        disposeWhen: options && options['disposeWhen'],
        disposeWhenNodeIsRemoved: options && options['disposeWhenNodeIsRemoved']
    });

    var result = {
        dispose: function() {
            // computed will be null if its evaluator had no dependencies. In that case, this is a no-op.
            if (computed) {
                computed.dispose();
            }
        },
        extend: function() {
            if (computed) {
                computed = computed.extend.apply(computed, arguments);
            }
        }
    };

    ko.exportProperty(result, 'dispose', result.dispose);
    ko.exportProperty(result, 'extend', result.extend);
    return result;
};

ko.exportSymbol('reactor', ko.reactor);