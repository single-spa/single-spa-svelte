import singleSpaSvelte from "./single-spa-svelte";
import { vi } from "vitest";
import { mount, unmount } from "svelte";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import TestComponent from "./TestComponent.svelte";

describe(`single-spa-svelte`, () => {
  it("can init, mount, and unmount a svelte application", async () => {
    let props = {
      name: "app1",
      foo: "bar",
    };
    const expectedTarget = document.createElement("div");
    expectedTarget.id = `single-spa-application:${props.name}`;
    expectedTarget.dataset.testId = props.name;

    const lifecycles = singleSpaSvelte({
      mount,
      unmount,
      component: TestComponent,
      props: {
        thing: "value",
      },
    });

    await lifecycles.mount({ name: "test" });
    expect(document.querySelector("#hello")).toBeDefined();
    await lifecycles.unmount({ name: "test" });
    expect(document.querySelector("#hello")).toBe(null);
  });
});
