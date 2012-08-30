describe('Reactor', {
    'Should accept a function, and return an object with a dispose callback': function () {
        var reactor = ko.reactor(function () { });
        value_of(typeof reactor).should_be('object');
        value_of(typeof reactor.dispose).should_be('function');
    },

    'Should automatically re-run the supplied function each time one of its dependencies changes, until you call dispose': function() {
        var dependencyA = ko.observable('a1'),
            dependencyB = ko.observable('b1'),
            log = [],
            reactor = ko.reactor(function() {
                log.push('A=' + dependencyA() + ', B=' + dependencyB());
            });

        // Always runs callback once to determine dependencies
        value_of(log.length).should_be(1);
        value_of(log[log.length - 1]).should_be(['A=a1, B=b1']);

        // Reacts to all dependencies
        dependencyA('a2');
        value_of(log.length).should_be(2);
        value_of(log[log.length - 1]).should_be(['A=a2, B=b1']);

        dependencyB('b2');
        value_of(log.length).should_be(3);
        value_of(log[log.length - 1]).should_be(['A=a2, B=b2']);

        // After disposal, stops responding
        reactor.dispose();
        dependencyA('a3');
        value_of(log.length).should_be(3); // Hasn't incremeted
    },

    'Should have the same API even if the function has no dependencies': function() {
        var reactor = ko.reactor(function() {
            // No-op
        });
        reactor.dispose(); // Expect no error here, even though it's a no-op
    },

    'Should be able to specify a \"this\" value for the callback': function() {
        var owner = { a: 123 },
            log = [],
            reactor = ko.reactor(function() {
                log.push(this.a);
            }, owner);

        value_of(log).should_be([123]);
    },

    'Should support disposeWhen': function() {
        var myDependency = ko.observable(),
            shouldDispose = false,
            log = [],
            reactorOptions = { disposeWhen: function() { return shouldDispose; } },
            reactor = ko.reactor(function() {
                log.push(myDependency());
            }, null, reactorOptions);

        // Check initial state, and that modifying the dependency triggers a re-eval
        value_of(log).should_be([undefined]);
        myDependency(1);
        value_of(log).should_be([undefined, 1]);

        // Now cause disposeWhen to become true, and see that subsequent changes don't trigger re-evals
        shouldDispose = true;
        myDependency(2);
        value_of(log).should_be([undefined, 1]);
    },

    'Should support disposeWhenNodeIsRemoved': function() {
        var testNode = document.createElement('div');
        document.body.appendChild(testNode);

        var myDependency = ko.observable(),
            log = [],
            reactorOptions = { disposeWhenNodeIsRemoved: testNode },
            reactor = ko.reactor(function() {
                log.push(myDependency());
            }, null, reactorOptions);

        // Check initial state, and that modifying the dependency triggers a re-eval
        value_of(log).should_be([undefined]);
        myDependency(1);
        value_of(log).should_be([undefined, 1]);

        // Now check that removing the DOM node causes a disposal
        ko.removeNode(testNode);
        myDependency(2);
        value_of(log).should_be([undefined, 1]);
    }
});
