import singleSpaSvelte from "./single-spa-svelte";
import { vi } from "vitest";
import { mount, unmount } from "svelte";
import { svelte } from "@sveltejs/vite-plugin-svelte";

vi.mock("svelte", () => {
  const mount = vi.fn();
  const unmount = vi.fn();

  return { mount, unmount };
});

describe(`single-spa-svelte`, () => {
  it("can bootstrap, mount, and unmount a svelte application", async () => {
    const component = vi.fn();
    const domElementGetter = ({ name }) => {
      const domElement = document.createElement("div");
      domElement.id = `single-spa-application:${name}`;
      domElement.dataset.testId = name;

      return domElement;
    };
    let props = {
      name: "app1",
      foo: "bar",
      domElementGetter,
    };
    const expectedTarget = document.createElement("div");
    expectedTarget.id = `single-spa-application:${props.name}`;
    expectedTarget.dataset.testId = props.name;

    const lifecycles = singleSpaSvelte({
      component,
      props: {
        thing: "value",
      },
    });
    expect(mount).not.toHaveBeenCalled();
    await lifecycles.bootstrap(props);
    expect(unmount).not.toHaveBeenCalled();
    const mountedComponent = {};
    mount.mockReturnValueOnce(mountedComponent);
    await lifecycles.mount(props);
    expect(mount).toHaveBeenCalledWith(component, {
      target: expectedTarget,
      props: {
        thing: "value",
        ...props,
      },
    });
    expect(unmount).not.toHaveBeenCalled();
    await lifecycles.update({ foo: "notbar" });
    expect(unmount).not.toHaveBeenCalled();
    expect(mount).toHaveBeenCalled();
    expect(mountedComponent.foo).toEqual("notbar");
    await lifecycles.unmount();
    expect(unmount).toHaveBeenCalled();
  });
});
