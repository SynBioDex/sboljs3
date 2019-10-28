

import { Graph } from 'rdfoo'
import SBOL1GraphView from './SBOL1GraphView';

export default class SBOL1Graph extends SBOL1GraphView {

    graph:Graph

    constructor(otherGraph?:any) {
        if(!otherGraph) {
            super(new Graph())
        } else {
            if(otherGraph instanceof SBOL1GraphView) {
                super(otherGraph.graph)
            } else {
                super(otherGraph)
            }
        }
    }

}




