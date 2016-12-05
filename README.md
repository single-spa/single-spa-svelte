# single-spa-svelte
Generic lifecycle hooks for Svelte applications that are registered as [child applications](https://github.com/CanopyTax/single-spa/blob/master/docs/child-applications.md) of [single-spa](https://github.com/CanopyTax/single-spa).

## Example
In addition to this Readme, example usage of single-spa-vue can be found in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples/blob/master/src/svelte/svelte.app.js) project.

## Quickstart

First, in the child application, run `npm install --save single-spa-svelte` (or `jspm install npm:single-spa-svelte` if your child application is managed by jspm). Then, in your [child app's entry file](https://github.com/CanopyTax/single-spa/blob/docs-1/docs/configuring-child-applications.md#the-entry-file), do the following:

```js
import singleSpaSvelte from 'single-spa-svelte';
import myRootSvelteComponent from 'my-root-svelte-component.js';

const svelteLifecycles = singleSpaSvelte({
	component: myRootSvelteComponent,
	domElementGetter: () => document.getElementById('svelte-app'),
	data: { someData: 'data' }
});

export const bootstrap = [
  svelteLifecycles.bootstrap,
];

export const mount = [
  svelteLifecycles.mount,
];

export const unmount = [
  svelteLifecycles.unmount,
];
```

## Options

All options are passed to single-spa-svelte via the `opts` parameter when calling `singleSpaSvelte(opts)`. The following options are available:

- `component`: (required) The root component that will be rendered. This
	component should be compiled by svelte and **not** an iife.
- `domElementGetter`: (required) A function which will return a dom
	element. The root component will be mounted in this element.
- `data`: (optional) Data passed to the root component.

