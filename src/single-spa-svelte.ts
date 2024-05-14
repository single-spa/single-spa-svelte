import {
  SvelteComponent,
  type ComponentConstructorOptions,
  ComponentType,
} from "svelte";

/**
 * Options type for the `singleSpaSvelte` function, the package's default export.
 */
export type SspaSvelteOptions<TProps extends Record<string, any>> = Omit<
  ComponentConstructorOptions<TProps>,
  "$$inline" | "target" | "context"
> & {
  /**
   * Svelte component to render.
   */
  component: ComponentType<SvelteComponent<TProps>>;
  /**
   * Optional function that returns the HTML element where the Svelte component is to be mounted.
   * @returns The HTML element where the Svelte component will be mounted.
   */
  domElementGetter?: (sspaProps: SingleSpaProps) => HTMLElement;
};

/**
 * Defines the function signature of all single-spa's lifecycle functions.
 *
 * **IMPORTANT**:  This should come from the single-spa package's types.  Remove once referencing
 * single-spa is possible.
 */
export type LifecycleFunction = (sspaProps: SingleSpaProps) => Promise<void>;

/**
 * Defines the single-spa lifecycle functions.
 *
 * **IMPORTANT**:  This should come from the single-spa package's types.  Remove once referencing
 * single-spa is possible.
 */
export type SspaLifeCycles = {
  bootstrap: LifecycleFunction;
  mount: LifecycleFunction;
  unmount: LifecycleFunction;
  update?: LifecycleFunction;
};

/**
 * Defines the properties that single-spa inject to every mounted component.
 *
 * **IMPORTANT**:  This should come from the single-spa package's types.  Remove once referencing
 * single-spa is possible.
 */
export type SingleSpaProps = {
  name: string;
  singleSpa: Record<string, any>;
  mountParcel: (
    configFn: () => Promise<SspaLifeCycles>,
    props: Record<string, any>,
  ) => any;
  [x: string]: any;
};

/**
 * Internal type that defines the shape of the `this` object for lifecycle implementation functions.
 */
type InstanceInfo<TProps extends Record<string, any>> = {
  instance: SvelteComponent<TProps> | null;
};

/**
 * Defines the property keys of the package's options that are known not be Svelte-specific options.
 *
 * This is used to isolate Svelte-specific options during the mounting process.
 */
const nonSvelteOptionKeys = ["component", "domElementGetter"];

/**
 * Creates the lifecycle functions for the Svelte component passed via the `component` property of
 * the `userOptions` parameter.
 * @param userOptions Required options for the creation of the lifecycle functions.
 * @returns An object that carries all four lifecycle functions.
 */
export default function singleSpaSvelte<TProps extends Record<string, any>>(
  userOptions: SspaSvelteOptions<TProps>,
) {
  if (typeof userOptions !== "object") {
    throw new Error("single-spa-svelte requires a configuration object.");
  }
  if (!userOptions.component) {
    throw new Error(
      "single-spa-svelte must be passed the 'component' property.",
    );
  }

  const thisArg: InstanceInfo<TProps> = {
    instance: null,
  };

  return {
    bootstrap: (sspaProps: SingleSpaProps) => Promise.resolve(),
    mount: (mountSspa<TProps>).bind(thisArg, userOptions),
    unmount: (unmountSspa<TProps>).bind(thisArg, userOptions),
    update: (updateSspa<TProps>).bind(thisArg),
  };
}

function mountSspa<TProps extends Record<string, any>>(
  this: InstanceInfo<TProps>,
  options: SspaSvelteOptions<TProps>,
  singleSpaProps: SingleSpaProps,
) {
  // Because of the weird merging of the constructor options with other options, this variable
  // cannot be typed as ComponentConstructorOptions.
  const svelteOptions: Record<string, any> = {};
  for (let [key, val] of Object.entries(options)) {
    if (nonSvelteOptionKeys.includes(key)) {
      continue;
    }
    svelteOptions[key] = val;
  }
  const domElementGetter = chooseDomElementGetter(options, singleSpaProps);
  const domElement = domElementGetter();
  // See https://svelte.dev/docs/client-side-component-api#creating-a-component
  this.instance = new options.component({
    ...svelteOptions,
    target: domElement,
    props: Object.assign({}, singleSpaProps, options.props), // Isn't this passing customProps as an object?
  });
  return Promise.resolve();
}

function unmountSspa<TProps extends Record<string, any>>(
  this: InstanceInfo<TProps>,
  options: SspaSvelteOptions<TProps>,
  sspaProps: SingleSpaProps,
) {
  if (!this.instance) {
    throw new Error(
      "A call to unmount a component was received, but no component has been instantiated yet.",
    );
  }
  this.instance.$destroy ? this.instance.$destroy() : this.instance.destroy();
  this.instance = null;
  return Promise.resolve();
}

function updateSspa<TProps extends Record<string, any>>(
  this: InstanceInfo<TProps>,
  props: TProps,
) {
  if (!this.instance) {
    throw new Error(
      "A call to update a component was received, but no component has been instantiated yet.",
    );
  }
  this.instance.$set ? this.instance.$set(props) : this.instance.set(props);
  return Promise.resolve();
}

function chooseDomElementGetter<TProps extends Record<string, any>>(
  options: SspaSvelteOptions<TProps>,
  sspaProps: SingleSpaProps,
): () => HTMLElement {
  // This one is for parcel mounting.
  if (sspaProps.domElement) {
    return () => sspaProps.domElement;
  }
  // This one may come from customProps (registerApplication).
  if (sspaProps.domElementGetter) {
    return () => sspaProps.domElementGetter(sspaProps);
  }
  // This is the one coming from the call to singleSpaSvelte:
  if (options.domElementGetter) {
    // Ignore reason:  There is no opportunity for options to change between now and the time the
    // delegate is executed.
    // @ts-ignore
    return () => options.domElementGetter(sspaProps);
  }
  return defaultDomElementGetter(sspaProps);
}

function defaultDomElementGetter(sspaProps: SingleSpaProps) {
  // Where is "appName" coming from?  Ignoring the TS error for now.  Must figure out if the type
  // should include "appName" as a property.z
  // @ts-ignore
  const appName = sspaProps.appName || sspaProps.name;
  if (!appName) {
    throw Error(
      `single-spa-svelte was not given an application name as a prop, so it can't make a unique dom element container for the svelte application.`,
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
