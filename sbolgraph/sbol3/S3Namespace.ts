
import SBOL3GraphView from '../SBOL3GraphView';

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import S3Collection from './S3Collection';

export default class S3Namespace extends S3Collection {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL3.Namespace
    }


}




