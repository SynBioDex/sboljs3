

import { Graph } from 'rdfoo'
import SBOL2GraphView from './SBOL2GraphView';

export default class SBOL2Graph extends SBOL2GraphView {

    graph:Graph

    constructor(otherGraph?:any) {
        if(!otherGraph) {
            super(new Graph())
        } else {
            if(otherGraph instanceof SBOL2GraphView) {
                super(otherGraph.graph)
            } else {
                super(otherGraph)
            }
        }
    }

}




