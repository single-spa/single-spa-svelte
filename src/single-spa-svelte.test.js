import singleSpaSvelte from "./single-spa-svelte";

describe(`single-spa-svelte`, () => {
  it("can bootstrap, mount, and unmount a svelte application", async () => {
    const component = jest.fn();
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
    const $set = jest.fn(
      (newProps) => (props = Object.assign({}, props, newProps))
    );
    const $destroy = jest.fn();
    component.mockImplementationOnce(function () {
      this.$set = $set;
      this.$destroy = $destroy;
    });
    const lifecycles = singleSpaSvelte({
      component,
      props: {
        thing: "value",
      },
    });
    expect(component).not.toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();
    await lifecycles.bootstrap(props);
    expect(component).not.toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();
    await lifecycles.mount(props);
    expect(component).toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();
    const call = component.mock.calls[0][0];
    expect(call.target.dataset.testId).toEqual(props.name);
    expect(call.props).toEqual({ ...props, thing: "value" });
    expect($destroy).not.toHaveBeenCalled();
    await lifecycles.update({ foo: "notbar" });
    expect($destroy).not.toHaveBeenCalled();
    expect($set).toHaveBeenCalled();
    expect(props.foo).toEqual("notbar");
    await lifecycles.unmount();
    expect($destroy).toHaveBeenCalled();
  });
});
