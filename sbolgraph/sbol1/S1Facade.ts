
import SBOL1GraphView from '../SBOL1GraphView';
import SBOLFacade from '../SBOLFacade';

export default abstract class S1Facade extends SBOLFacade {

    view:SBOL1GraphView

    constructor(view:SBOL1GraphView, uri:string) {
        super(view.graph, view, uri)
        this.view = view
    }
    


}
