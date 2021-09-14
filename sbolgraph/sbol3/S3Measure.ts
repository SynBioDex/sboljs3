
import S3Identified from './S3Identified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";

import { triple, Node } from 'rdfoo'

export default class S3Measure extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.Measure.Measure
    }

    get value():number|undefined {
        return this.getFloatProperty(Predicates.Measure.hasNumericalValue)
    }

    set value(v:number|undefined) {

        if(v === undefined)
            this.deleteProperty(Predicates.Measure.hasNumericalValue)
        else
            this.setFloatProperty(Predicates.Measure.hasNumericalValue, v)
    }

    get unit():string|undefined {
        return this.getUriProperty(Predicates.Measure.hasUnit)
    }

    set unit(unit:string|undefined) {
        this.setUriProperty(Predicates.Measure.hasUnit, unit)
    }
}
