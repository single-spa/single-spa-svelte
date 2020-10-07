import singleSpaSvelte from "./single-spa-svelte";

describe(`single-spa-svelte`, () => {
  it("can bootstrap, mount, and unmount a svelte application", async () => {
    const component = jest.fn();
    let props = {
      name: "app1",
      foo: "bar"
    };
    const $set = jest.fn(
      newProps => (props = Object.assign({}, props, newProps))
    );
    const $destroy = jest.fn();
    component.mockImplementationOnce(function() {
      this.$set = $set;
      this.$destroy = $destroy;
    });
    const lifecycles = singleSpaSvelte({
      component,
      props: {
        thing: "value"
      }
    });
    expect(component).not.toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();
    await lifecycles.bootstrap(props);
    expect(component).not.toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();
    await lifecycles.mount(props);
    expect(component).toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();
    let call = component.mock.calls[0][0];
    expect(call.target).toBeDefined();
    expect(call.props).toEqual({
      thing: "value",
      foo: "bar",
      name: "app1"
    });
    expect($destroy).not.toHaveBeenCalled();
    await lifecycles.update({ foo: "notbar" });
    expect($destroy).not.toHaveBeenCalled();
    expect($set).toHaveBeenCalled();
    expect(props.foo).toEqual("notbar");
    await lifecycles.unmount();
    expect($destroy).toHaveBeenCalled();
  });
});
