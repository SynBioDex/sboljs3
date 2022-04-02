
import S3Identified from './S3Identified'

import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'

import { triple, Node, node } from 'rdfoo'
import SBOL3GraphView from '../SBOL3GraphView';
import S3Feature from './S3Feature';
import { S3SubComponent } from '..';

export default class S3ComponentReference extends S3Feature {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Prefixes.sbol3 + 'ComponentReference'
    }

    get inChildOf():S3SubComponent {

        const inChildOf:Node|undefined = this.getProperty(Prefixes.sbol3 + 'inChildOf')

        if(inChildOf === undefined) {
		throw new Error('??')
	}

        let c = this.view.uriToIdentified(inChildOf)

	if(!c) {
		throw new Error('??')
	}

	return c as S3SubComponent

    }

    get refersTo():S3Feature {

        const refersTo:Node|undefined = this.getProperty(Prefixes.sbol3 + 'refersTo')

        if(refersTo === undefined) {
		throw new Error('??')
	}

        let f = this.view.uriToIdentified(refersTo)

	if(!f) {
		throw new Error('??')
	}

	return f as S3Feature

    }

}

