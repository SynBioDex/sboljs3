
import S3Identified from './S3Identified'
import S3Feature from './S3Feature'
import S3Component from './S3Component'
import S3Constraint from './S3Constraint'
import S3OrientedLocation from './S3OrientedLocation'
import S3IdentifiedFactory from './S3IdentifiedFactory'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";
import S3MapsTo from './S3MapsTo';
import S3Interaction from './S3Interaction'
import S3Location from './S3Location'
import S3Measure from './S3Measure';

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


