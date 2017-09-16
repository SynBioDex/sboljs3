
import IdentifiedFacade from './IdentifiedFacade'
import OrientedLocationFacade from './OrientedLocationFacade'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'terms'
import SbolGraph from "../SbolGraph";

export default class GenericLocationFacade extends OrientedLocationFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.GenericLocation
    }

}


