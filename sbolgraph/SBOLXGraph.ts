
import { Graph } from 'rdfoo'
import SBOLXGraphView from './SBOLXGraphView';

export default class SBOLXGraph extends SBOLXGraphView {

    graph:Graph

    constructor(otherGraph?:any) {
        if(!otherGraph) {
            super(new Graph())
        } else {
            if(otherGraph instanceof SBOLXGraphView) {
                super(otherGraph.graph)
            } else {
                super(otherGraph)
            }
        }
    }

    clone():SBOLXGraph {
        return new SBOLXGraph(this.graph.clone())
    }

}




