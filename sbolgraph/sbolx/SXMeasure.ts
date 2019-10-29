
import SXIdentified from './SXIdentified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraphView from "../SBOLXGraphView";

import { triple } from 'rdfoo'

export default class SXMeasure extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)
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
