import singleSpaSvelte from "./single-spa-svelte";

describe(`single-spa-svelte`, () => {
  it("can bootstrap, mount, and unmount a svelte application", async () => {
    const component = jest.fn();
    const $destroy = jest.fn();
    component.mockImplementationOnce(function() {
      this.$destroy = $destroy;
    });
    const lifecycles = singleSpaSvelte({
      component,
      props: {
        thing: "value"
      }
    });
    const props = {
      name: "app1",
      foo: "bar"
    };
    expect(component).not.toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();
    await lifecycles.bootstrap(props);
    expect(component).not.toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();
    await lifecycles.mount(props);
    expect(component).toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();
    const call = component.mock.calls[0][0];
    expect(call.target).toBeDefined();
    expect(call.props).toEqual({
      thing: "value",
      foo: "bar",
      name: "app1"
    });
    expect($destroy).not.toHaveBeenCalled();
    await lifecycles.unmount();
    expect($destroy).toHaveBeenCalled();
  });
});
