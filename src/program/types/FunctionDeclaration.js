import Function from './shared/Function.js';

export default class FunctionDeclaration extends Function {
	activate () {
		if ( !this.inited ) {
			// TODO see comments on VariableDeclarator, this is
			// unfortunately. maybe all nodes should be skip: true
			// by default
			this.shouldActivate = true;
			return;
		}

		if ( this.activated ) return;
		this.activated = true;

		this.skip = false;
		super.initialise( this.scope );
	}

	attachScope ( scope ) {
		this.skip = !!scope.parent; // always preserve top-level declarations
		super.attachScope( scope );
	}

	initialise () {
		this.inited = true;

		// see above...
		if ( this.shouldActivate ) {
			this.activate();
		}
	}
}
