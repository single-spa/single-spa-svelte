const defaultOpts = {
  // required opts
  component: null,

  // optional opts
  domElementGetter: null,
  props: {}
};

export default function singleSpaSvelte(userOpts) {
  if (typeof userOpts !== "object") {
    throw new Error(`single-spa-svelte requires a configuration object`);
  }

  const opts = {
    ...defaultOpts,
    ...userOpts
  };

  if (!opts.component) {
    throw new Error("single-spa-svelte must be passed opts.component");
  }

  // Just a shared object to store the mounted object state
  let mountedInstances = {};

  return {
    bootstrap: bootstrap.bind(null, opts, mountedInstances),
    mount: mount.bind(null, opts, mountedInstances),
    unmount: unmount.bind(null, opts, mountedInstances),
    update: update.bind(null, opts, mountedInstances)
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
    mountedInstances.instance = new opts.component({
      ...svelteOpts,
      target: domElement,
      props: Object.assign({}, singleSpaProps, opts.props)
    });
  });
}

function unmount(opts, mountedInstances) {
  return Promise.resolve().then(() => {
    mountedInstances.instance.$destroy
      ? mountedInstances.instance.$destroy()
      : mountedInstances.instance.destroy();
  });
}

function update(opts, mountedInstances, props) {
  return Promise.resolve().then(() => {
    mountedInstances.instance.$set
      ? mountedInstances.instance.$set(props)
      : mountedInstances.instance.set(props);
  });
}

function chooseDomElementGetter(opts, props) {
  props = props && props.customProps ? props.customProps : props;
  if (props.domElement) {
    return () => props.domElement;
  } else if (props.domElementGetter) {
    return props.domElementGetter;
  } else if (opts.domElementGetter) {
    return opts.domElementGetter;
  } else {
    return defaultDomElementGetter(props);
  }
}

function defaultDomElementGetter(props) {
  const appName = props.appName || props.name;
  if (!appName) {
    throw Error(
      `single-spa-svelte was not given an application name as a prop, so it can't make a unique dom element container for the svelte application`
    );
  }
  const htmlId = `single-spa-application:${appName}`;

  return function defaultDomEl() {
    let domElement = document.getElementById(htmlId);
    if (!domElement) {
      domElement = document.createElement("div");
      domElement.id = htmlId;
      document.body.appendChild(domElement);
    }

    return domElement;
  };
}
