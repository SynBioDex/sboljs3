
import S3Identified from './S3Identified'
import S3Feature from './S3Feature'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";
import S3Component from "./S3Component";
import S3SubComponent from "./S3SubComponent";
import S3IdentifiedFactory from './S3IdentifiedFactory';
import S3Range from "./S3Range";
import extractTerm from '../extractTerm'

export default class S3SequenceFeature extends S3Feature {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)

    }


}


