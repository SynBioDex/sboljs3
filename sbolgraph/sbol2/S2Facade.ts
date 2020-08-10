
import { Graph } from 'rdfoo'
import SBOL2GraphView from '../SBOL2GraphView';
import SBOLFacade from '../SBOLFacade';

export default abstract class S2Facade extends SBOLFacade {

    view:SBOL2GraphView

    constructor(view:SBOL2GraphView, uri:string) {
        super(view.graph, view, uri)
        this.view = view
    }
}
