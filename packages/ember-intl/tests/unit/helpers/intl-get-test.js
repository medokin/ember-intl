/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Translation from 'ember-intl/models/translation';
import intlGetHelper from 'ember-intl/helpers/intl-get';
import { runAppend, runDestroy } from '../../helpers/run-append';
import createRenderer from '../../helpers/create-intl-block';

const { run:emberRun } = Ember;
let view;

moduleFor('helper:intl-get', {
  needs: ['service:intl', 'ember-intl@adapter:default'],
  beforeEach() {
    let registry = this.registry || this.container;

    registry.register('ember-intl@translation:en-us', Translation.extend());
    registry.register('ember-intl@translation:fr-fr', Translation.extend());

    this.container.lookup('ember-intl@translation:en-us').addTranslations({
      greeting: 'Hello'
    });

    this.container.lookup('ember-intl@translation:fr-fr').addTranslations({
      greeting: 'Bonjour'
    });

    this.render = createRenderer.call(this, undefined);
  },
  afterEach() {
    runDestroy(view);
  }
});

test('exists', function(assert) {
  assert.expect(1);
  assert.ok(intlGetHelper);
});

test('should recompute on intl locale change in', function(assert) {
  assert.expect(1);

  const recomputeFn = intlGetHelper.proto().recompute;
  const service = this.container.lookup('service:intl');
  let triggered = 0;

  intlGetHelper.reopen({
    recompute() {
      triggered++;
    }
  });

  view = this.render(hbs`{{intl-get "greeting"}}`, 'en-us');
  runAppend(view);

  emberRun(() => {
    service.setLocale('fr-fr');
    service.setLocale('en-us');
    assert.equal(triggered, 2);
  });

  // restore original function
  intlGetHelper.reopen({ recompute: recomputeFn });
});
