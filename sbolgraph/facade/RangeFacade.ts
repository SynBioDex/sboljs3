
import IdentifiedFacade from './IdentifiedFacade'
import OrientedLocationFacade from './OrientedLocationFacade'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'
import SbolGraph from "../SbolGraph";

export default class RangeFacade extends OrientedLocationFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Range
    }

    get start():number|undefined {
        return this.getIntProperty(Predicates.SBOL2.start)
    }

    set start(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOL2.start, n)
        } else {
            this.deleteProperty(Predicates.SBOL2.start)
        }
    }

    get end():number|undefined {
        return this.getIntProperty(Predicates.SBOL2.end)
    }

    set end(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOL2.end, n)
        } else {
            this.deleteProperty(Predicates.SBOL2.end)
        }
    }
}


