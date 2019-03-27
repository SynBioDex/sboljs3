
import S2Identified from './S2Identified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2Graph from "../SBOL2Graph";

import * as triple from '../triple'

export default class S2Measure extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)
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
