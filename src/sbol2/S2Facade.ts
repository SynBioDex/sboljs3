
import { Node } from 'rdfoo'
import SBOL2GraphView from '../SBOL2GraphView';
import SBOLFacade from '../SBOLFacade';

export default abstract class S2Facade extends SBOLFacade {

    view:SBOL2GraphView

    constructor(view:SBOL2GraphView, subject:Node) {
        super(view.graph, view, subject)
        this.view = view
    }
}
