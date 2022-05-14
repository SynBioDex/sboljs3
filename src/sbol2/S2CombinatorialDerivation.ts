import SBOL2GraphView from '../SBOL2GraphView';

import S2Identified from './S2Identified'

import { Types, Predicates, Specifiers } from 'bioterms'

import { triple, Node } from 'rdfoo'
import S2ComponentDefinition from './S2ComponentDefinition';
import S2VariableComponent from './S2VariableComponent';

export default class S2CombinatorialDerivation extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL2.CombinatorialDerivation
    }

    get strategy():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.strategy)
    }

    set strategy(strategy:string|undefined) {

        if(strategy === undefined) {
            this.deleteProperty(Predicates.SBOL2.strategy)
        } else {
            this.setUriProperty(Predicates.SBOL2.strategy, strategy)
        }
    }

    get template():S2ComponentDefinition {

        const subject = this.getProperty(Predicates.SBOL2.template)

        if(!subject) {
            throw new Error('CombinatorialDerivation ' + this.subject.value + ' has no template')
        }

        return new S2ComponentDefinition(this.view, subject)
    }

    set template(def:S2ComponentDefinition) {

        this.setProperty(Predicates.SBOL2.template, def.subject)

    }

    get variableComponents():Array<S2VariableComponent> {

        return this.getProperties(Predicates.SBOL2.variableComponent)
                   .map((subject:Node) => new S2VariableComponent(this.view, subject))

    }

}

