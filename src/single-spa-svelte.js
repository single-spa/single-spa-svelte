const defaultOpts = {
	// required opts
	component: null,
	domElementGetter: null,
	data: null,
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
	return new Promise((resolve, reject) => {
		mountedInstances.instance = new opts.component({
			target: opts.domElementGetter(),
			data: opts.data || {},
		});
		resolve();
	});
}

function unmount(opts, mountedInstances) {
	return new Promise((resolve, reject) => {
		mountedInstances.instance.teardown();
		resolve();
	});
}
