import SBOL2GraphView from '../SBOL2GraphView';

import S3Identified from './S3Identified'

import { Types, Predicates, Specifiers } from 'bioterms'

import { triple, Node } from 'rdfoo'
import SBOL3GraphView from '../SBOL3GraphView';
import S3Component from './S3Component';
import S3Collection from './S3Collection';
import S3CombinatorialDerivation from './S3CombinatorialDerivation';
import { S3SubComponent } from '..';

export default class S3VariableFeature extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL3.VariableFeature
    }

    get operator():string {
        return this.getRequiredUriProperty('http://sbols.org/v3#operator')
    }

    set operator(operator:string) {
            this.setUriProperty('http://sbols.org/v3#operator', operator)
    }

    get variants():Array<S3Component> {

        return this.getProperties(Predicates.SBOL3.variant)
                   .map((subject:Node) => new S3Component(this.view, subject))

    }

    get variantCollections():Array<S3Collection> {

        return this.getProperties(Predicates.SBOL3.variantCollection)
                   .map((subject:Node) => new S3Collection(this.view, subject))

    }

    get variantDerivations():Array<S3CombinatorialDerivation> {

        return this.getProperties(Predicates.SBOL3.variantDerivation)
                   .map((subject:Node) => new S3CombinatorialDerivation(this.view, subject))

    }

    get variable():S3SubComponent {

        return new S3SubComponent(this.view, this.getProperty(Predicates.SBOL3.variable)!)

    }

}

