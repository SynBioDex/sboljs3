
import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'

import S3Feature from './S3Feature'

export default class S3Interface extends S3Feature {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL3.Interface
    }

    get inputs():S3Feature[] {
	return this.getProperties(Predicates.SBOL3.input).map(
		subject => this.view.uriToIdentified(subject)) as S3Feature[]

    }

    get outputs():S3Feature[] {
	return this.getProperties(Predicates.SBOL3.output).map(
		subject => this.view.uriToIdentified(subject)) as S3Feature[]

    }

    get nondirectionals():S3Feature[] {
	return this.getProperties(Predicates.SBOL3.nondirectional).map(
		subject => this.view.uriToIdentified(subject)) as S3Feature[]

    }


}


import SBOL3GraphView from "../SBOL3GraphView";

