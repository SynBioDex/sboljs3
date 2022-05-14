import SBOL3GraphView from '../SBOL3GraphView';

import S3Identified from './S3Identified'

import { Types, Predicates, Specifiers } from 'bioterms'

import { triple, Node } from 'rdfoo'
import S3Component from './S3Component';
import S3VariableFeature from './S3VariableFeature';

export default class S3CombinatorialDerivation extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL3.CombinatorialDerivation
    }

    get strategy():string|undefined {
        return this.getUriProperty(Predicates.SBOL3.strategy)
    }

    set strategy(strategy:string|undefined) {

        if(strategy === undefined) {
            this.deleteProperty(Predicates.SBOL3.strategy)
        } else {
            this.setUriProperty(Predicates.SBOL3.strategy, strategy)
        }
    }

    get template():S3Component {

        const subject = this.getProperty(Predicates.SBOL3.template)

        if(!subject) {
            throw new Error('CombinatorialDerivation ' + this.subject.value + ' has no template')
        }

        return new S3Component(this.view, subject)
    }

    set template(def:S3Component) {

        this.setProperty(Predicates.SBOL3.template, def.subject)

    }

    get variableFeatures():Array<S3VariableFeature> {

        return this.getProperties(Predicates.SBOL3.hasVariableFeature)
                   .map((subject:Node) => new S3VariableFeature(this.view, subject))

    }

}

