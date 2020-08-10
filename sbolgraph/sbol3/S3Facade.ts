

import SBOL3GraphView from '../SBOL3GraphView';
import SBOLFacade from '../SBOLFacade';

export default abstract class S3Facade extends SBOLFacade {

    view:SBOL3GraphView

    constructor(view:SBOL3GraphView, uri:string) {
        super(view.graph, view, uri)
        this.view = view
    }


}
