import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const script = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');

function createHarness(distanceValue) {
  const result = {
    value: '',
    get innerHTML() {
      return this.value;
    },
    set innerHTML(value) {
      this.value = value;
    },
    get textContent() {
      return this.value;
    },
    set textContent(value) {
      this.value = value;
    },
  };
  const leaves = Array.from({ length: 6 }, () => ({
    classList: {
      classes: new Set(),
      add(name) {
        this.classes.add(name);
      },
      remove(name) {
        this.classes.delete(name);
      },
      contains(name) {
        return this.classes.has(name);
      },
    },
    style: {
      values: {},
      setProperty(name, value) {
        this.values[name] = value;
      },
    },
  }));
  const newsContent = { textContent: '' };

  const context = {
    console,
    Math,
    document: {
      getElementById(id) {
        if (id === 'distance') {
          return { value: distanceValue };
        }
        if (id === 'result') {
          return result;
        }
        throw new Error(`Unexpected element id: ${id}`);
      },
      querySelectorAll(selector) {
        assert.equal(selector, '.leaf');
        return leaves;
      },
      querySelector(selector) {
        assert.equal(selector, '.news-content');
        return newsContent;
      },
    },
    fetch() {
      return Promise.resolve({
        json: () => Promise.resolve({ articles: [] }),
      });
    },
  };

  vm.createContext(context);
  vm.runInContext(script, context, { filename: 'script.js' });
  return { context, leaves, result };
}

{
  const { context, leaves, result } = createHarness('12abc');
  context.calculateFootprint();

  assert.equal(
    result.textContent,
    'Enter a valid non-negative distance in kilometres.',
    'malformed numeric input should be rejected instead of partially parsed',
  );
  assert.equal(
    leaves.filter((leaf) => leaf.classList.contains('falling')).length,
    0,
    'invalid input should not animate any impact leaves',
  );
}

{
  const { context, result } = createHarness('-3');
  context.calculateFootprint();

  assert.equal(result.textContent, 'Enter a valid non-negative distance in kilometres.');
}

{
  const { context, result } = createHarness('1e3');
  context.calculateFootprint();

  assert.equal(result.textContent, 'Carbon Footprint: 100.00 kg CO2');
}

{
  const { context, result } = createHarness('42');
  context.calculateFootprint();

  assert.equal(result.textContent, 'Carbon Footprint: 4.20 kg CO2');
}
