
import SBOL1GraphView from '../SBOL1GraphView';
import SBOLFacade from '../SBOLFacade';
import { Node, triple } from 'rdfoo'

export default abstract class S1Facade extends SBOLFacade {

    view:SBOL1GraphView

    constructor(view:SBOL1GraphView, subject:Node) {
        super(view.graph, view, subject)
        this.view = view
    }
    


}
