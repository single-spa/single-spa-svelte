const defaultOpts = {
  // required opts
  component: null,
  domElementGetter: null,
}

export default function singleSpaSvelte(userOpts) {
  if (typeof userOpts !== 'object') {
    throw new Error(`single-spa-svelte requires a configuration object`);
  }

  const opts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (!opts.component) {
    throw new Error('single-spa-svelte must be passed opts.component');
  }

  if (!opts.domElementGetter) {
    throw new Error('single-spa-svelte must be passed opts.domElementGetter');
  }

  // Just a shared object to store the mounted object state
  let mountedInstances = {};

  return {
    bootstrap: bootstrap.bind(null, opts, mountedInstances),
    mount: mount.bind(null, opts, mountedInstances),
    unmount: unmount.bind(null, opts, mountedInstances),
  };
}

function bootstrap(opts) {
  return Promise.resolve();
}

function mount(opts, mountedInstances) {
  const defaultOptKeys = Object.keys(defaultOpts);

  const svelteOpts = Object.keys(opts).reduce((object, key) => {
    if (!defaultOptKeys.includes(key)) {
      object[key] = opts[key];
    }
    return object;
  }, {});

  return new Promise((resolve, reject) => {
    mountedInstances.instance = new opts.component({
      ...svelteOpts,
      target: opts.domElementGetter(),
      data: opts.data || {},
    });
    resolve();
  });
}

function unmount(opts, mountedInstances) {
  return new Promise((resolve, reject) => {
    mountedInstances.instance.$destroy
      ? mountedInstances.instance.$destroy()
      : mountedInstances.instance.destroy();
    resolve();
  });
}
