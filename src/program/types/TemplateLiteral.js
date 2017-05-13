import Node from '../Node.js';
import { UNKNOWN, TRUTHY, FALSY } from '../../utils/sentinels.js';
import stringify from '../../utils/stringify.js';

export default class TemplateLiteral extends Node {
	getValue () {
		let values = new Array( this.expressions.length );
		let i;

		for ( i = 0; i < this.expressions.length; i += 1 ) {
			const expression = this.expressions[i];
			const value = expression.getValue();

			if ( value === UNKNOWN || value === TRUTHY || value === FALSY ) return UNKNOWN;

			values[i] = value;
		}

		let result = '';

		for ( i = 0; i < this.expressions.length; i += 1 ) {
			const value = values[i];

			result += this.quasis[i].value.raw;
			result += value;
		}

		result += this.quasis[i].value.raw;

		return result;
	}

	minify ( code ) {
		const value = this.getValue();

		if ( value !== UNKNOWN ) {
			code.overwrite( this.start, this.end, stringify( value ) );
			return;
		}

		let c = this.start;
		let i;
		for ( i = 0; i < this.expressions.length; i += 1 ) {
			const quasi = this.quasis[i];
			const nextQuasi = this.quasis[i+1];
			const expression = this.expressions[i];

			const value = expression.getValue();
			if ( typeof value !== 'object' ) {
				expression.minify( code );

				if ( expression.start > quasi.end + 2 ) {
					code.remove( quasi.end + 2, expression.start );
				}

				c = ( nextQuasi ? nextQuasi.start : this.end ) - 1;
				if ( expression.end < c ) code.remove( expression.end, c );
			} else {
				code.overwrite( quasi.end, expression.end, stringify( value ) );
				c = ( nextQuasi ? nextQuasi.start : this.end - 1 );
				if ( expression.end < c ) code.remove( expression.end, c );
			}
		}

		const lastQuasi = this.quasis[i];

		if ( lastQuasi.start > c + 1 ) {
			code.remove( c, lastQuasi.start - 1 );
		}
	}
}
