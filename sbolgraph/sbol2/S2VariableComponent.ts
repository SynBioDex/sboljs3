import SBOL2GraphView from '../SBOL2GraphView';

import S2Identified from './S2Identified'

import { Types, Predicates, Specifiers } from 'bioterms'

import { triple, Node } from 'rdfoo'
import S2ComponentDefinition from './S2ComponentDefinition';
import { S2Collection, S2ComponentInstance } from '..';
import S2CombinatorialDerivation from './S2CombinatorialDerivation';

export default class S2VariableComponent extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL2.VariableComponent
    }

    get operator():string {
        return this.getRequiredUriProperty('http://sbols.org/v2#operator')
    }

    set operator(operator:string) {
            this.setUriProperty('http://sbols.org/v2#operator', operator)
    }

    get variants():Array<S2ComponentDefinition> {

        return this.getProperties(Predicates.SBOL2.variant)
                   .map((subject:Node) => new S2ComponentDefinition(this.view, subject))

    }

    get variantCollections():Array<S2Collection> {

        return this.getProperties(Predicates.SBOL2.variantCollection)
                   .map((subject:Node) => new S2Collection(this.view, subject))

    }

    get variantDerivations():Array<S2CombinatorialDerivation> {

        return this.getProperties(Predicates.SBOL2.variantDerivation)
                   .map((subject:Node) => new S2CombinatorialDerivation(this.view, subject))

    }

    get variable():S2ComponentInstance {

        return new S2ComponentInstance(this.view, this.getProperty(Predicates.SBOL2.variable)!)

    }
}

