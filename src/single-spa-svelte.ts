import { chooseDomElementGetter } from "dom-element-getter-helpers";
import type { SvelteComponent, mount, unmount } from "svelte";

const defaultOpts = {
  // required opts
  component: null,
  mount: null,
  unmount: null,

  // optional opts
  domElementGetter: null,
  props: {},
};

export default function singleSpaSvelte(userOpts) {
  if (typeof userOpts !== "object") {
    throw new Error(`single-spa-svelte requires a configuration object`);
  }

  const opts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (!opts.component) {
    throw new Error("single-spa-svelte must be passed opts.component");
  }
  if (!opts.mount) {
    throw new Error("single-spa-svelte must be passed opts.mount");
  }
  if (!opts.unmount) {
    throw new Error("single-spa-svelte must be passed opts.unmount");
  }

  // Just a shared object to store the mounted object state
  let mountedInstances = {};

  return {
    bootstrap: bootstrap.bind(null, opts, mountedInstances),
    mount: mount.bind(null, opts, mountedInstances),
    unmount: unmount.bind(null, opts, mountedInstances),
    update: update.bind(null, opts, mountedInstances),
  };
}

function bootstrap(opts) {
  return Promise.resolve();
}

function mount(opts, mountedInstances, singleSpaProps) {
  const defaultOptKeys = Object.keys(defaultOpts);

  const svelteOpts = Object.keys(opts).reduce((object, key) => {
    if (!defaultOptKeys.includes(key)) {
      object[key] = opts[key];
    }
    return object;
  }, {});

  return Promise.resolve().then(() => {
    const domElementGetter = chooseDomElementGetter(opts, singleSpaProps);
    const domElement = domElementGetter();
    // See https://svelte.dev/docs#Creating_a_component
    mountedInstances.instance = opts.mount(opts.component, {
      ...svelteOpts,
      target: domElement,
      props: Object.assign({}, singleSpaProps, opts.props),
    });
  });
}

function unmount(opts, mountedInstances) {
  return opts.unmount(mountedInstances.instance);
}

function update(opts, mountedInstances, props) {
  return Promise.resolve().then(() => {
    for (const prop in props) {
      mountedInstances.instance[prop] = props[prop];
    }
  });
}
