
import SXIdentified from './SXIdentified'
import SXThingWithLocation from './SXThingWithLocation'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'sbolterms'
import SBOLXGraph from "../SBOLXGraph";
import SXModule from "./SXModule";
import SXSubModule from "./SXSubModule";
import SXIdentifiedFactory from './SXIdentifiedFactory';
import SXRange from "./SXRange";

export default class SXSequenceFeature extends SXThingWithLocation {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }


}


